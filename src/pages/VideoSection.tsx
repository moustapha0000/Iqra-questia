import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { PlaylistInfo } from '../types'
import { db, auth, handleFirestoreError, OperationType } from '../firebase'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
  where,
  limit,
} from 'firebase/firestore'
import { useAuth } from '../contexts/AuthContext'
import {
  Play,
  ThumbsUp,
  ThumbsDown,
  Share2,
  MessageCircle,
  Send,
  Trash2,
  User,
  ChevronDown,
  ChevronUp,
  Clock,
  Bell,
  CheckCircle,
} from 'lucide-react'
import { getUserProgress, markLessonProgress } from '../utils/progressService'

// ─── Types ────────────────────────────────────────────────────────────────────

interface VideoSectionProps {
  info: PlaylistInfo
  playlistKey: string
}

interface Comment {
  id: string
  uid: string
  displayName: string
  text: string
  createdAt: Date | null
  likes: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(date: Date | null): string {
  if (!date) return ''
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "À l'instant"
  if (mins < 60) return `il y a ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `il y a ${hours} h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `il y a ${days} j`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `il y a ${weeks} sem.`
  const months = Math.floor(days / 30)
  if (months < 12) return `il y a ${months} mois`
  return `il y a ${Math.floor(months / 12)} an(s)`
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// ─── Sub-components ───────────────────────────────────────────────────────────

// Avatar circle with initials fallback
function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const colors = [
    'bg-amber-500',
    'bg-emerald-500',
    'bg-rose-500',
    'bg-violet-500',
    'bg-sky-500',
    'bg-orange-500',
  ]
  const color = colors[(name.charCodeAt(0) || 0) % colors.length]
  return (
    <div
      className={`${color} rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white select-none`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials(name) || <User size={size * 0.5} />}
    </div>
  )
}

// ─── Placeholder when content is not ready ────────────────────────────────────

function ComingSoonPlaceholder({ title }: { title: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 px-6 text-center gap-6"
    >
      {/* Animated hourglass */}
      <motion.div
        animate={{ rotate: [0, 180, 180, 360] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="text-daara-gold"
      >
        <Clock size={72} strokeWidth={1.5} />
      </motion.div>

      {/* Construction dots */}
      <div className="flex gap-2">
        {[0, 0.2, 0.4].map((delay, i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.2, repeat: Infinity, delay }}
            className="w-3 h-3 rounded-full bg-daara-gold"
          />
        ))}
      </div>

      <div className="space-y-2 max-w-md">
        <h2 className="text-2xl font-bold text-daara-text">Contenu en préparation</h2>
        <p className="text-daara-text-muted text-sm leading-relaxed">
          La playlist <span className="text-daara-gold font-semibold">« {title} »</span> est en
          cours de préparation. Revenez bientôt pour découvrir ce contenu exclusif.
        </p>
      </div>

      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-daara-gold/40 text-daara-gold/70 text-sm"
      >
        <Bell size={15} />
        Bientôt disponible
      </motion.div>
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function VideoSection({ info, playlistKey }: VideoSectionProps) {
  const { user, earnXP } = useAuth()

  // Guard: null/undefined info
  if (!info) {
    return (
      <div className="flex items-center justify-center h-64 text-daara-text-muted">
        <p>Aucune playlist sélectionnée.</p>
      </div>
    )
  }

  const isFake = info.id.startsWith('PL_FAKE')

  // ── State ──────────────────────────────────────────────────────────────────
  const [descExpanded, setDescExpanded] = useState(false)
  const [accordionOpen, setAccordionOpen] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')
  const [inputFocused, setInputFocused] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [liked, setLiked] = useState(false)
  const [shareToast, setShareToast] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [updatingProgress, setUpdatingProgress] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Fetch progress on mount or info change
  useEffect(() => {
    if (!user || !playlistKey) return
    getUserProgress(user.uid).then(progress => {
      setCompleted(!!progress[playlistKey]?.completed)
    })
  }, [user, playlistKey])

  const handleToggleComplete = async () => {
    if (!user || !playlistKey || updatingProgress) return
    setUpdatingProgress(true)
    try {
      const nextState = !completed
      await markLessonProgress(user.uid, playlistKey, nextState)
      setCompleted(nextState)
      
      if (nextState && earnXP) {
        await earnXP(20) // Earn 20 XP for completing a playlist!
      }
    } catch (e) {
      console.warn('Failed to update progress:', e)
    } finally {
      setUpdatingProgress(false)
    }
  }

  // ── Firestore listener ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!info.id || isFake) return

    const q = query(
      collection(db, 'comments'),
      where('playlistId', '==', info.id),
      orderBy('createdAt', 'desc'),
      limit(100),
    )

    const unsub = onSnapshot(q, (snap) => {
      const docs: Comment[] = snap.docs.map((d) => {
        const data = d.data()
        return {
          id: d.id,
          uid: data.uid ?? '',
          displayName: data.displayName ?? 'Anonyme',
          text: data.text ?? '',
          createdAt: data.createdAt?.toDate?.() ?? null,
          likes: data.likes ?? 0,
        }
      })
      setComments(docs)
    })

    return () => unsub()
  }, [info.id, isFake])

  // ── Handlers ───────────────────────────────────────────────────────────────
  async function handleSubmitComment() {
    if (!commentText.trim() || !user || submitting) return
    setSubmitting(true)
    try {
      await addDoc(collection(db, 'comments'), {
        playlistId: info.id,
        uid: user.uid,
        displayName: user.displayName || user.email || 'Anonyme',
        text: commentText.trim(),
        createdAt: serverTimestamp(),
        likes: 0,
      })
      setCommentText('')
      setInputFocused(false)
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'comments')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteComment(commentId: string) {
    try {
      await deleteDoc(doc(db, 'comments', commentId))
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `comments/${commentId}`)
    }
  }

  function handleShare() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).catch(() => {})
    setShareToast(true)
    setTimeout(() => setShareToast(false), 2500)
  }

  // ── Playlist URL ───────────────────────────────────────────────────────────
  const playlistSrc = `https://www.youtube.com/embed/videoseries?list=${info.id}&rel=0&modestbranding=1`
  const playlistUrl = `https://www.youtube.com/playlist?list=${info.id}`

  // ── Tags extracted from desc (words starting with #) ──────────────────────
  const tags = info.desc.match(/#[\w\u00C0-\u017F]+/g) ?? []
  const cleanDesc = info.desc.replace(/#[\w\u00C0-\u017F]+/g, '').trim()
  const shortDesc = cleanDesc.length > 180 ? cleanDesc.slice(0, 180) + '…' : cleanDesc

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-daara-bg text-daara-text">
      {/* ══════════════════════════════════════════════════════════════════════
          1. CHANNEL HEADER
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden">
        {/* Gradient banner */}
        <div className="absolute inset-0 bg-gradient-to-b from-daara-gold/5 via-daara-gold/[0.02] to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Thumbnail / playlist art */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-daara-gold/30 relative">
                {isFake ? (
                  <div className="w-full h-full bg-gradient-to-br from-daara-gold/20 via-daara-surface to-daara-gold/10 flex items-center justify-center">
                    <Clock size={48} className="text-daara-gold/50" />
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-daara-gold/20 via-daara-surface to-daara-gold/10 flex items-center justify-center">
                    <Play size={48} className="text-daara-gold/70 fill-daara-gold/40" />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-3">
              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl sm:text-4xl font-serif font-bold text-daara-text leading-tight"
              >
                {info.title}
              </motion.h1>

              {/* Stats row */}
              <div className="flex items-center gap-3 text-sm text-daara-text-muted flex-wrap">
                <span className="flex items-center gap-1.5">
                  <MessageCircle size={14} />
                  <span>{comments.length} commentaire{comments.length !== 1 ? 's' : ''}</span>
                </span>
                <span className="text-daara-gold/40">·</span>
                <span>Playlist YouTube</span>
              </div>

              {/* Description with expand */}
              {cleanDesc && (
                <div className="text-sm text-daara-text-muted leading-relaxed max-w-2xl">
                  <span>{descExpanded ? cleanDesc : shortDesc}</span>
                  {cleanDesc.length > 180 && (
                    <button
                      onClick={() => setDescExpanded((v) => !v)}
                      className="ml-2 text-daara-gold font-medium hover:underline focus:outline-none"
                    >
                      {descExpanded ? 'Voir moins' : 'Voir plus'}
                    </button>
                  )}
                </div>
              )}

              {/* CTA button */}
              {!isFake && (
                <motion.button
                  onClick={() => {
                    document.getElementById('player-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-daara-gold text-black font-semibold rounded-full text-sm shadow-lg hover:brightness-110 transition-all cursor-pointer"
                >
                  <Play size={16} fill="black" />
                  Regarder la Playlist
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/5" />

      {/* ══════════════════════════════════════════════════════════════════════
          CONTENT AREA
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

        {/* ── COMING SOON or PLAYER ─────────────────────────────────────── */}
        {isFake ? (
          <ComingSoonPlaceholder title={info.title} />
        ) : (
          <>
            {/* ══════════════════════════════════════════════════════════════
                2. VIDEO PLAYER CARD
            ══════════════════════════════════════════════════════════════ */}
             <motion.div
              id="player-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl overflow-hidden shadow-2xl border border-daara-gold/20 bg-daara-surface relative"
              style={{
                boxShadow: '0 0 40px -8px rgba(212,175,55,0.25), 0 20px 60px -20px rgba(0,0,0,0.7)',
              }}
            >
              {/* Gold glow strip */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-daara-gold/60 to-transparent" />

              {/* 16:9 iframe */}
              <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                <iframe
                  src={playlistSrc}
                  title={info.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0"
                  loading="lazy"
                />
              </div>

              {/* Below player: title + actions */}
              <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-semibold text-daara-text text-lg truncate">{info.title}</h2>
                  <p className="text-xs text-daara-text-muted mt-0.5">Playlist · YouTube</p>
                </div>

                {/* Like / share */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {user && !isFake && (
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      onClick={handleToggleComplete}
                      disabled={updatingProgress}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-semibold transition-all ${
                        completed
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400'
                          : 'border-daara-gold/30 text-daara-gold hover:bg-daara-gold/10'
                      }`}
                    >
                      {completed ? (
                        <>
                          <CheckCircle size={14} className="text-emerald-400" />
                          <span>Terminé</span>
                        </>
                      ) : (
                        <>
                          <Clock size={14} className="text-daara-gold" />
                          <span>Marquer comme vu</span>
                        </>
                      )}
                    </motion.button>
                  )}
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={() => setLiked((v) => !v)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
                      liked
                        ? 'bg-daara-gold/15 border-daara-gold text-daara-gold'
                        : 'border-white/10 text-daara-text-muted hover:border-white/20'
                    }`}
                  >
                    <ThumbsUp size={15} className={liked ? 'fill-daara-gold' : ''} />
                    J'aime
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 text-daara-text-muted hover:border-white/20 text-sm font-medium transition-all"
                  >
                    <ThumbsDown size={15} />
                  </motion.button>

                  {/* Share with toast */}
                  <div className="relative">
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      onClick={handleShare}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 text-daara-text-muted hover:border-white/20 text-sm font-medium transition-all"
                    >
                      <Share2 size={15} />
                      Partager
                    </motion.button>
                    <AnimatePresence>
                      {shareToast && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-daara-gold text-black text-xs font-semibold px-3 py-1 rounded-full shadow-lg"
                        >
                          Lien copié !
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ══════════════════════════════════════════════════════════════
                3. DESCRIPTION ACCORDION
            ══════════════════════════════════════════════════════════════ */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border border-white/8 bg-daara-surface overflow-hidden"
            >
              <button
                onClick={() => setAccordionOpen((v) => !v)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors text-left"
              >
                <span className="font-semibold text-daara-text">Description</span>
                <motion.span
                  animate={{ rotate: accordionOpen ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                  className="text-daara-text-muted"
                >
                  <ChevronDown size={18} />
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {accordionOpen && (
                  <motion.div
                    key="accordion-body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 space-y-4 border-t border-white/5">
                      {cleanDesc && (
                        <p className="text-sm text-daara-text-muted leading-relaxed whitespace-pre-wrap pt-4">
                          {cleanDesc}
                        </p>
                      )}

                      {/* Category tags */}
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 rounded-full bg-daara-gold/10 border border-daara-gold/20 text-daara-gold text-xs font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* ══════════════════════════════════════════════════════════════
                4. COMMENTS SECTION
            ══════════════════════════════════════════════════════════════ */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="space-y-6"
            >
              {/* Section header */}
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-bold text-daara-text">
                  {comments.length} commentaire{comments.length !== 1 ? 's' : ''}
                </h3>
                {/* Sort indicator */}
                <span className="text-xs text-daara-text-muted border border-white/10 rounded-full px-3 py-1">
                  Plus récents
                </span>
              </div>

              {/* Comment input */}
              <div className="flex gap-3">
                {user ? (
                  <Avatar name={user.displayName || user.email || 'A'} />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-daara-surface border border-white/10 flex items-center justify-center flex-shrink-0">
                    <User size={18} className="text-daara-text-muted" />
                  </div>
                )}

                <div className="flex-1 space-y-2">
                  <textarea
                    ref={inputRef}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onFocus={() => setInputFocused(true)}
                    placeholder="Ajouter un commentaire public…"
                    rows={inputFocused ? 3 : 1}
                    disabled={!user}
                    className="w-full bg-transparent border-b border-white/15 focus:border-daara-gold/60 text-daara-text placeholder:text-daara-text-muted text-sm resize-none outline-none transition-all py-2 leading-relaxed"
                  />

                  <AnimatePresence>
                    {inputFocused && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="flex items-center justify-end gap-3"
                      >
                        <button
                          onClick={() => {
                            setInputFocused(false)
                            setCommentText('')
                          }}
                          className="text-sm text-daara-text-muted hover:text-daara-text px-4 py-1.5 rounded-full hover:bg-white/5 transition-colors"
                        >
                          Annuler
                        </button>
                        <motion.button
                          whileTap={{ scale: 0.93 }}
                          onClick={handleSubmitComment}
                          disabled={!commentText.trim() || submitting}
                          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-daara-gold text-black text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition-all"
                        >
                          {submitting ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                              className="w-4 h-4 border-2 border-black border-t-transparent rounded-full"
                            />
                          ) : (
                            <Send size={14} />
                          )}
                          Commenter
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!user && (
                    <p className="text-xs text-daara-text-muted">
                      Connectez-vous pour laisser un commentaire.
                    </p>
                  )}
                </div>
              </div>

              {/* Comments list */}
              <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                  {comments.length === 0 ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center gap-3 py-12 text-daara-text-muted"
                    >
                      <MessageCircle size={40} strokeWidth={1} className="opacity-30" />
                      <p className="text-sm">Soyez le premier à commenter.</p>
                    </motion.div>
                  ) : (
                    comments.map((c) => (
                      <motion.div
                        key={c.id}
                        layout
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 12 }}
                        transition={{ duration: 0.25 }}
                        className="flex gap-3 group"
                      >
                        {/* Avatar */}
                        <Avatar name={c.displayName} />

                        {/* Body */}
                        <div className="flex-1 min-w-0 space-y-1">
                          {/* Name + time */}
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-daara-text">
                              {c.displayName}
                            </span>
                            <span className="text-xs text-daara-text-muted">
                              {relativeTime(c.createdAt)}
                            </span>
                          </div>

                          {/* Text */}
                          <p className="text-sm text-daara-text leading-relaxed whitespace-pre-wrap break-words">
                            {c.text}
                          </p>

                          {/* Actions */}
                          <div className="flex items-center gap-4 pt-1">
                            {/* Thumbs up */}
                            <button className="flex items-center gap-1.5 text-daara-text-muted hover:text-daara-text transition-colors text-xs">
                              <ThumbsUp size={13} />
                              {c.likes > 0 && <span>{c.likes}</span>}
                            </button>

                            {/* Thumbs down */}
                            <button className="text-daara-text-muted hover:text-daara-text transition-colors">
                              <ThumbsDown size={13} />
                            </button>

                            {/* Reply (UI only) */}
                            <button className="text-xs text-daara-text-muted hover:text-daara-text font-medium transition-colors">
                              Répondre
                            </button>

                            {/* Delete (own comments) */}
                            {user && user.uid === c.uid && (
                              <motion.button
                                whileTap={{ scale: 0.85 }}
                                onClick={() => handleDeleteComment(c.id)}
                                className="ml-auto text-daara-text-muted hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                title="Supprimer le commentaire"
                              >
                                <Trash2 size={13} />
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}

export default VideoSection
