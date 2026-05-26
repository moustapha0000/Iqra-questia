import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '../contexts/AuthContext'
import { db, handleFirestoreError, OperationType } from '../firebase'
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  limit,
  where,
} from 'firebase/firestore'
import {
  MessageCircle,
  Send,
  Hash,
  Search,
  Users,
  ChevronDown,
  Smile,
  Trash2,
  LogIn,
  Menu,
  X,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ForumPost {
  id: string
  userId: string
  userName: string
  userPhoto: string
  content: string
  category: string
  createdAt: { toDate: () => Date } | null
}

interface Reaction {
  emoji: string
  count: number
  reactedByMe: boolean
}

type ReactionMap = Record<string, Reaction[]>

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ['Tout', 'Général', 'Fiqh', 'Hadiths', 'Coran', 'Burdah', 'Prophètes']
const REACTION_EMOJIS = ['👍', '❤️', '🤲']
const MAX_CHARS = 500
const GAP_MINUTES = 30

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(date: Date): string {
  const now = new Date()
  const diff = (now.getTime() - date.getTime()) / 1000
  if (diff < 60) return 'maintenant'
  if (diff < 3600) return `${Math.floor(diff / 60)} min`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  if (diff < 172800) return 'hier'
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

function formatSeparator(date: Date): string {
  const now = new Date()
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  const prefix = isToday ? "Aujourd'hui" : date.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })
  const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  return `${prefix} ${time}`
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface AvatarProps {
  src: string
  name: string
  size?: number
}
function Avatar({ src, name, size = 32 }: AvatarProps) {
  const [errored, setErrored] = useState(false)
  const style = { width: size, height: size, minWidth: size, minHeight: size }
  if (src && !errored) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setErrored(true)}
        className="rounded-full object-cover"
        style={style}
      />
    )
  }
  return (
    <div
      className="rounded-full bg-daara-gold/20 flex items-center justify-center text-daara-gold font-bold"
      style={{ ...style, fontSize: size * 0.38 }}
    >
      {getInitials(name)}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Forum() {
  const { user: currentUser } = useAuth()

  // UI state
  const [activeChannel, setActiveChannel] = useState('Tout')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ postId: string; x: number; y: number } | null>(null)
  const [reactions, setReactions] = useState<ReactionMap>({})
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null)
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})

  // Data state
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [loading, setLoading] = useState(true)

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // ── Firestore subscription ────────────────────────────────────────────────

  useEffect(() => {
    setLoading(true)
    const col = collection(db, 'forum_posts')
    let q =
      activeChannel === 'Tout'
        ? query(col, orderBy('createdAt', 'asc'), limit(200))
        : query(col, where('category', '==', activeChannel), orderBy('createdAt', 'asc'), limit(200))

    const unsub = onSnapshot(
      q,
      (snap) => {
        const data: ForumPost[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ForumPost, 'id'>) }))
        setPosts(data)
        setLoading(false)
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'forum_posts')
        setLoading(false)
      }
    )
    return () => unsub()
  }, [activeChannel])

  // ── Category counts ───────────────────────────────────────────────────────

  useEffect(() => {
    const col = collection(db, 'forum_posts')
    const q = query(col, orderBy('createdAt', 'asc'), limit(500))
    const unsub = onSnapshot(q, (snap) => {
      const counts: Record<string, number> = { Tout: snap.size }
      snap.docs.forEach((d) => {
        const cat = (d.data() as ForumPost).category
        if (cat) counts[cat] = (counts[cat] ?? 0) + 1
      })
      setCategoryCounts(counts)
    })
    return () => unsub()
  }, [])

  // ── Auto-scroll ───────────────────────────────────────────────────────────

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [posts])

  // ── Close context menu on outside click ───────────────────────────────────

  useEffect(() => {
    const handler = () => setContextMenu(null)
    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [])

  // ── Filtered posts ────────────────────────────────────────────────────────

  const filteredPosts = searchQuery.trim()
    ? posts.filter(
        (p) =>
          p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.userName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : posts

  // ── Send message ──────────────────────────────────────────────────────────

  const handleSend = useCallback(async () => {
    if (!currentUser || !messageText.trim() || sending) return
    const text = messageText.trim().slice(0, MAX_CHARS)
    setMessageText('')
    setSending(true)
    try {
      await addDoc(collection(db, 'forum_posts'), {
        userId: currentUser.uid,
        userName: currentUser.displayName ?? 'Anonyme',
        userPhoto: currentUser.photoURL ?? '',
        content: text,
        category: activeChannel === 'Tout' ? 'Général' : activeChannel,
        createdAt: serverTimestamp(),
      })
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, 'forum_posts')
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }, [currentUser, messageText, sending, activeChannel])

  // ── Delete message ────────────────────────────────────────────────────────

  const handleDelete = useCallback(async (postId: string) => {
    try {
      await deleteDoc(doc(db, 'forum_posts', postId))
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, `forum_posts/${postId}`)
    }
    setContextMenu(null)
  }, [])

  // ── Reaction toggle ───────────────────────────────────────────────────────

  const toggleReaction = useCallback((postId: string, emoji: string) => {
    setReactions((prev) => {
      const current: Reaction[] = prev[postId] ?? REACTION_EMOJIS.map((e) => ({ emoji: e, count: 0, reactedByMe: false }))
      const updated = current.map((r) =>
        r.emoji === emoji
          ? { ...r, count: r.reactedByMe ? r.count - 1 : r.count + 1, reactedByMe: !r.reactedByMe }
          : r
      )
      return { ...prev, [postId]: updated }
    })
    setShowReactionPicker(null)
  }, [])

  const getReactions = (postId: string): Reaction[] =>
    reactions[postId] ?? REACTION_EMOJIS.map((e) => ({ emoji: e, count: 0, reactedByMe: false }))

  // ── Key handler ───────────────────────────────────────────────────────────

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // ── Channel change ────────────────────────────────────────────────────────

  const selectChannel = (ch: string) => {
    setActiveChannel(ch)
    setSidebarOpen(false)
    setSearchQuery('')
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render helpers
  // ─────────────────────────────────────────────────────────────────────────

  const renderSidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
        <div className="w-9 h-9 rounded-xl bg-daara-gold/20 flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-daara-gold" />
        </div>
        <div>
          <p className="font-bold text-daara-text leading-none">Iqra Questia</p>
          <p className="text-xs text-daara-text-muted mt-0.5">Forum communautaire</p>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-3">
        <div className="flex items-center gap-2 bg-daara-surface rounded-xl px-3 py-2">
          <Search className="w-4 h-4 text-daara-text-muted flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher..."
            className="bg-transparent text-sm text-daara-text placeholder-daara-text-muted outline-none w-full"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-daara-text-muted hover:text-daara-text">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Channel label */}
      <div className="px-4 py-1">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-daara-text-muted">Canaux</p>
      </div>

      {/* Channel list */}
      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {CATEGORIES.map((cat) => {
          const isActive = activeChannel === cat
          const count = categoryCounts[cat] ?? 0
          return (
            <button
              key={cat}
              onClick={() => selectChannel(cat)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-all text-left group relative
                ${isActive
                  ? 'bg-daara-gold/10 text-daara-gold border-l-2 border-daara-gold pl-[10px]'
                  : 'text-daara-text-muted hover:bg-white/5 hover:text-daara-text border-l-2 border-transparent'
                }`}
            >
              <Hash className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-daara-gold' : 'text-daara-text-muted group-hover:text-daara-text'}`} />
              <span className="flex-1 text-sm font-medium truncate">{cat}</span>
              {count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold
                  ${isActive ? 'bg-daara-gold/20 text-daara-gold' : 'bg-white/10 text-daara-text-muted'}`}>
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* User footer */}
      {currentUser && (
        <div className="border-t border-white/5 px-3 py-3 flex items-center gap-3">
          <Avatar src={currentUser.photoURL ?? ''} name={currentUser.displayName ?? 'Moi'} size={34} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-daara-text truncate">{currentUser.displayName ?? 'Anonyme'}</p>
            <p className="text-[11px] text-daara-text-muted">En ligne</p>
          </div>
        </div>
      )}
    </>
  )

  // ─────────────────────────────────────────────────────────────────────────
  // Messages rendering
  // ─────────────────────────────────────────────────────────────────────────

  const renderMessages = () => {
    if (loading) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-daara-gold/30 border-t-daara-gold rounded-full animate-spin" />
            <p className="text-daara-text-muted text-sm">Chargement...</p>
          </div>
        </div>
      )
    }

    if (filteredPosts.length === 0) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageCircle className="w-14 h-14 text-daara-gold/20 mx-auto mb-3" />
            <p className="text-daara-text-muted text-sm">
              {searchQuery ? 'Aucun message trouvé.' : 'Soyez le premier à écrire dans ce canal !'}
            </p>
          </div>
        </div>
      )
    }

    const items: React.ReactNode[] = []
    let lastDate: Date | null = null
    let lastUserId: string | null = null
    let lastTs: number | null = null

    filteredPosts.forEach((post, idx) => {
      const date = post.createdAt ? post.createdAt.toDate() : new Date()
      const isOwn = currentUser?.uid === post.userId
      const isSameUser = lastUserId === post.userId
      const timeDiff = lastTs ? (date.getTime() - lastTs) / 60000 : Infinity
      const showGroup = isSameUser && timeDiff < GAP_MINUTES

      // Date separator
      if (!lastDate || timeDiff >= GAP_MINUTES) {
        items.push(
          <div key={`sep-${idx}`} className="flex items-center gap-3 my-4 px-4">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-[11px] text-daara-text-muted bg-daara-surface px-3 py-1 rounded-full font-medium whitespace-nowrap">
              {formatSeparator(date)}
            </span>
            <div className="flex-1 h-px bg-white/5" />
          </div>
        )
      }

      lastDate = date
      lastUserId = post.userId
      lastTs = date.getTime()

      const postReactions = getReactions(post.id)
      const hasReactions = postReactions.some((r) => r.count > 0)

      items.push(
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`flex items-end gap-2 px-4 ${showGroup ? 'mt-0.5' : 'mt-4'} ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
          onContextMenu={(e) => {
            if (isOwn) {
              e.preventDefault()
              setContextMenu({ postId: post.id, x: e.clientX, y: e.clientY })
            }
          }}
        >
          {/* Avatar (left side or right side spacer) */}
          <div className="w-8 flex-shrink-0 self-end mb-1">
            {!showGroup && !isOwn && (
              <Avatar src={post.userPhoto} name={post.userName} size={32} />
            )}
            {!showGroup && isOwn && (
              <Avatar src={currentUser?.photoURL ?? ''} name={currentUser?.displayName ?? 'Moi'} size={32} />
            )}
          </div>

          {/* Bubble column */}
          <div className={`flex flex-col max-w-[72%] sm:max-w-[60%] ${isOwn ? 'items-end' : 'items-start'}`}>
            {/* Username */}
            {!showGroup && (
              <p className={`text-[11px] font-semibold mb-1 px-1 ${isOwn ? 'text-daara-gold' : 'text-daara-text-muted'}`}>
                {isOwn ? 'Vous' : post.userName}
              </p>
            )}

            {/* Bubble */}
            <div
              className={`relative rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm
                ${isOwn
                  ? 'bg-gradient-to-br from-daara-gold to-amber-600 text-white rounded-br-sm'
                  : 'bg-daara-surface text-daara-text rounded-bl-sm'
                }`}
            >
              <p className="whitespace-pre-wrap break-words">{post.content}</p>
              <p className={`text-[10px] mt-1 text-right ${isOwn ? 'text-white/60' : 'text-daara-text-muted'}`}>
                {relativeTime(date)}
                {post.category && activeChannel === 'Tout' && (
                  <span className="ml-2 opacity-60">#{post.category}</span>
                )}
              </p>

              {/* Reaction picker trigger */}
              <button
                className={`absolute -bottom-3 ${isOwn ? 'left-2' : 'right-2'} opacity-0 group-hover:opacity-100 
                  focus:opacity-100 transition-opacity text-daara-text-muted hover:text-daara-gold`}
                onClick={(e) => { e.stopPropagation(); setShowReactionPicker(showReactionPicker === post.id ? null : post.id) }}
              >
                <Smile className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Reaction picker */}
            <AnimatePresence>
              {showReactionPicker === post.id && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -4 }}
                  className="flex gap-1 mt-1 bg-daara-surface border border-white/10 rounded-full px-3 py-1.5 shadow-xl z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  {REACTION_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => toggleReaction(post.id, emoji)}
                      className="text-lg hover:scale-125 transition-transform active:scale-95"
                    >
                      {emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Reaction bar */}
            {hasReactions && (
              <div className={`flex flex-wrap gap-1 mt-1.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                {postReactions
                  .filter((r) => r.count > 0)
                  .map((r) => (
                    <button
                      key={r.emoji}
                      onClick={() => toggleReaction(post.id, r.emoji)}
                      className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition-all
                        ${r.reactedByMe
                          ? 'bg-daara-gold/20 border-daara-gold/40 text-daara-gold'
                          : 'bg-daara-surface border-white/10 text-daara-text-muted hover:border-daara-gold/30'
                        }`}
                    >
                      <span>{r.emoji}</span>
                      <span className="font-medium">{r.count}</span>
                    </button>
                  ))}
                <button
                  onClick={(e) => { e.stopPropagation(); setShowReactionPicker(showReactionPicker === post.id ? null : post.id) }}
                  className="flex items-center px-1.5 py-0.5 rounded-full border border-white/10 text-daara-text-muted hover:border-daara-gold/30 transition-all"
                >
                  <Smile className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Show reaction button if no reactions yet */}
            {!hasReactions && (
              <button
                onClick={(e) => { e.stopPropagation(); setShowReactionPicker(showReactionPicker === post.id ? null : post.id) }}
                className="mt-1 text-daara-text-muted hover:text-daara-gold transition-colors"
              >
                <Smile className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </motion.div>
      )
    })

    return <>{items}</>
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Main render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div
      className="flex min-h-screen bg-daara-bg text-daara-text overflow-hidden"
      style={{ height: '100dvh' }}
      onClick={() => { setContextMenu(null); setShowReactionPicker(null) }}
    >
      {/* ── Desktop Sidebar ─────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-72 bg-daara-bg border-r border-white/5 flex-shrink-0">
        {renderSidebarContent()}
      </aside>

      {/* ── Mobile Sidebar Overlay ───────────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-30 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              key="mobile-sidebar"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-daara-bg border-r border-white/5 flex flex-col z-40 md:hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-3 text-daara-text-muted hover:text-daara-text"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
              {renderSidebarContent()}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Right Chat Area ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile horizontal channel scroll */}
        <div className="md:hidden flex items-center border-b border-white/5 bg-daara-bg overflow-x-auto no-scrollbar py-2 px-2 gap-1.5 flex-shrink-0">
          <button
            className="p-2 rounded-lg text-daara-text-muted hover:text-daara-text hover:bg-white/5 flex-shrink-0"
            onClick={(e) => { e.stopPropagation(); setSidebarOpen(true) }}
          >
            <Menu className="w-5 h-5" />
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => selectChannel(cat)}
              className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                ${activeChannel === cat
                  ? 'bg-daara-gold/20 text-daara-gold border border-daara-gold/30'
                  : 'bg-daara-surface text-daara-text-muted border border-white/5 hover:border-daara-gold/20'
                }`}
            >
              <Hash className="w-3 h-3" />
              {cat}
            </button>
          ))}
        </div>

        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-daara-bg/80 backdrop-blur-sm flex-shrink-0">
          <button
            className="md:hidden p-1.5 rounded-lg text-daara-text-muted hover:text-daara-text hover:bg-white/5"
            onClick={(e) => { e.stopPropagation(); setSidebarOpen(true) }}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-daara-gold/10 flex items-center justify-center flex-shrink-0">
            <Hash className="w-4 h-4 text-daara-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-daara-text leading-none">{activeChannel}</h2>
            <p className="text-xs text-daara-text-muted mt-0.5 flex items-center gap-1">
              <Users className="w-3 h-3" />
              {categoryCounts[activeChannel] ?? 0} messages
            </p>
          </div>
          {searchQuery && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-daara-gold bg-daara-gold/10 px-2.5 py-1 rounded-full border border-daara-gold/20">
              <Search className="w-3 h-3" />
              {filteredPosts.length} résultat{filteredPosts.length !== 1 ? 's' : ''}
            </div>
          )}
        </header>

        {/* Messages area */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto py-2 flex flex-col"
          style={{ scrollBehavior: 'smooth' }}
          onClick={() => setShowReactionPicker(null)}
        >
          {renderMessages()}
          <div ref={messagesEndRef} className="h-2" />
        </div>

        {/* Context menu */}
        <AnimatePresence>
          {contextMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed z-50 bg-daara-surface border border-white/10 rounded-xl shadow-2xl overflow-hidden"
              style={{ top: contextMenu.y, left: contextMenu.x }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => handleDelete(contextMenu.postId)}
                className="flex items-center gap-2.5 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 w-full text-left transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer le message
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input bar or login banner */}
        {currentUser ? (
          <div className="border-t border-white/5 bg-daara-bg px-3 py-3 flex-shrink-0">
            <div className="flex items-end gap-2 bg-daara-surface rounded-2xl px-4 py-2 border border-white/5 focus-within:border-daara-gold/30 transition-colors">
              <textarea
                ref={inputRef}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value.slice(0, MAX_CHARS))}
                onKeyDown={handleKeyDown}
                placeholder={`Message #${activeChannel}...`}
                rows={1}
                className="flex-1 bg-transparent text-sm text-daara-text placeholder-daara-text-muted outline-none resize-none leading-relaxed max-h-32 py-1"
                style={{ scrollbarWidth: 'none' }}
              />
              <div className="flex items-center gap-2 pb-1 flex-shrink-0">
                {messageText.length > 400 && (
                  <span className={`text-[11px] font-medium ${messageText.length >= MAX_CHARS ? 'text-red-400' : 'text-daara-text-muted'}`}>
                    {MAX_CHARS - messageText.length}
                  </span>
                )}
                <motion.button
                  onClick={handleSend}
                  disabled={!messageText.trim() || sending}
                  whileTap={{ scale: 0.9 }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all
                    ${messageText.trim() && !sending
                      ? 'bg-daara-gold text-white shadow-md hover:bg-amber-500'
                      : 'bg-white/5 text-daara-text-muted cursor-not-allowed'
                    }`}
                >
                  <Send className="w-4 h-4" style={{ transform: 'rotate(-40deg) translateX(1px)' }} />
                </motion.button>
              </div>
            </div>
            <p className="text-[10px] text-daara-text-muted text-center mt-1.5">
              Entrée pour envoyer · Shift+Entrée pour saut de ligne
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t border-white/5 bg-daara-bg px-4 py-4 flex-shrink-0"
          >
            <div className="flex items-center justify-between bg-daara-surface rounded-2xl px-4 py-3 border border-daara-gold/20">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-daara-gold/10 flex items-center justify-center">
                  <LogIn className="w-4 h-4 text-daara-gold" />
                </div>
                <div>
                  <p className="text-sm font-medium text-daara-text">Rejoins la conversation</p>
                  <p className="text-xs text-daara-text-muted">Connecte-toi pour participer au forum</p>
                </div>
              </div>
              <a
                href="/login"
                className="flex-shrink-0 px-4 py-2 bg-daara-gold text-white text-sm font-semibold rounded-xl hover:bg-amber-500 transition-colors shadow-md"
              >
                Se connecter
              </a>
            </div>
          </motion.div>
        )}
      </div>

      {/* Global style for hiding scrollbar on mobile channel row */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}
