import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { PlaylistInfo } from '../types';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, where, limit } from 'firebase/firestore';
import { MessageCircle, Send, Trash2, User } from 'lucide-react';

interface VideoSectionProps {
  info: PlaylistInfo;
}

import { useAuth } from '../contexts/AuthContext';

function PlaylistComments({ playlistId }: { playlistId: string }) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const q = query(
      collection(db, 'playlist_comments'),
      where('playlistId', '==', playlistId),
      limit(100)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allComments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      // Sort client-side to avoid needing a composite index in Firestore
      allComments.sort((a, b) => {
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA;
      });
      setComments(allComments);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'playlist_comments');
    });
    return () => unsubscribe();
  }, [playlistId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'playlist_comments'), {
        playlistId,
        userId: user.uid,
        userName: user.displayName || 'Anonyme',
        userPhoto: user.photoURL || null,
        content: newComment.trim(),
        createdAt: serverTimestamp()
      });
      setNewComment('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'playlist_comments');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce commentaire ?')) return;
    try {
      await deleteDoc(doc(db, 'playlist_comments', commentId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `playlist_comments/${commentId}`);
    }
  };

  return (
    <div className="mt-12 bg-daara-surface rounded-3xl p-6 md:p-8 shadow-xl border border-daara-gold/10">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-daara-gold/10 rounded-xl">
          <MessageCircle className="w-6 h-6 text-daara-gold" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-daara-text">Discussions</h2>
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-10">
          <div className="flex gap-4">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || 'User'} className="w-12 h-12 rounded-full object-cover border-2 border-daara-gold/20" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-daara-surface flex items-center justify-center border-2 border-daara-gold/20">
                <User className="w-6 h-6 text-daara-gold" />
              </div>
            )}
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Partagez vos réflexions ou posez une question..."
                className="w-full p-4 rounded-2xl bg-daara-surface border border-daara-gold/20 focus:border-daara-gold focus:ring-2 focus:ring-daara-gold/20 resize-none transition-all"
                rows={3}
                maxLength={1000}
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className="px-6 py-2.5 bg-daara-gold text-daara-bg font-bold rounded-xl hover:bg-yellow-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? 'Envoi...' : (
                    <>
                      <Send className="w-4 h-4" />
                      Publier
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-daara-surface rounded-2xl p-6 text-center mb-10 border border-daara-gold/20">
          <p className="text-daara-text-muted mb-4">Connectez-vous pour participer à la discussion.</p>
        </div>
      )}

      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-10">
            <MessageCircle className="w-12 h-12 text-daara-gold/30 mx-auto mb-3" />
            <p className="text-daara-text-muted">Soyez le premier à commenter cette playlist !</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 p-5 rounded-2xl bg-daara-surface/50 border border-daara-gold/10 hover:border-daara-gold/30 transition-colors">
              {comment.userPhoto ? (
                <img src={comment.userPhoto} alt={comment.userName} className="w-10 h-10 rounded-full object-cover border border-daara-gold/20" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-daara-bg flex items-center justify-center border border-daara-gold/20">
                  <User className="w-5 h-5 text-daara-gold" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-daara-text">{comment.userName}</span>
                  <span className="text-xs text-daara-text-muted">
                    {comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    }) : 'À l\'instant'}
                  </span>
                </div>
                <p className="text-daara-text-muted whitespace-pre-wrap text-sm leading-relaxed">{comment.content}</p>
              </div>
              {user && user.uid === comment.userId && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors h-fit"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function VideoSection({ info }: VideoSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto py-12"
    >
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-daara-text mb-6">
          {info.title}
        </h1>
        <p className="text-xl text-daara-text-muted max-w-2xl mx-auto">
          {info.desc}
        </p>
      </div>

      <div className="bg-daara-surface p-3 md:p-6 rounded-3xl shadow-xl border border-daara-gold/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-daara-gold/5 to-transparent pointer-events-none" />
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-daara-bg shadow-inner">
          {info.id.startsWith('PL_FAKE') ? (
            <div className="absolute inset-0 flex items-center justify-center flex-col text-daara-text-muted">
              <p className="text-xl font-serif mb-2 font-bold">Vidéos en cours de préparation</p>
              <p className="text-sm font-medium">Revenez bientôt insha'Allah</p>
            </div>
          ) : (
            <iframe
              className="absolute top-0 left-0 w-full h-full border-0"
              src={`https://www.youtube.com/embed/videoseries?list=${info.id}&rel=0`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={info.title}
            ></iframe>
          )}
        </div>
      </div>

      <PlaylistComments playlistId={info.id} />
    </motion.div>
  );
}
