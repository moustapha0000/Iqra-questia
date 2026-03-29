import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc, doc, limit } from 'firebase/firestore';
import { MessageSquare, Send, User, Clock, Trash2, Hash, Filter, Search } from 'lucide-react';

interface ForumPost {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  content: string;
  category: string;
  createdAt: any;
}

const CATEGORIES = ['Général', 'Fiqh', 'Hadiths', 'Coran', 'Burdah', 'Prophètes'];

export function Forum() {
  const { user, signInWithGoogle } = useAuth();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [newPost, setNewPost] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Général');
  const [filterCategory, setFilterCategory] = useState<string>('Tous');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'forum_posts'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ForumPost[];
      setPosts(postsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'forum_posts');
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPost.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'forum_posts'), {
        userId: user.uid,
        userName: user.displayName || 'Anonyme',
        userPhoto: user.photoURL || null,
        content: newPost.trim(),
        category: selectedCategory,
        createdAt: serverTimestamp()
      });
      setNewPost('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'forum_posts');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce message ?')) return;
    try {
      await deleteDoc(doc(db, 'forum_posts', postId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `forum_posts/${postId}`);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'À l\'instant';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const filteredPosts = posts.filter(post => {
    const matchesCategory = filterCategory === 'Tous' || post.category === filterCategory;
    const matchesSearch = searchTerm.trim() === '' || 
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.userName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-daara-bg py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-4 mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-daara-surface border border-daara-gold/30 shadow-lg shadow-daara-gold/10 mb-4"
          >
            <MessageSquare className="w-10 h-10 text-daara-gold" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-daara-text">
            Forum de <span className="text-daara-gold">Discussion</span>
          </h1>
          <p className="text-xl text-daara-text-muted max-w-2xl mx-auto">
            Échangez, posez vos questions et partagez vos connaissances avec la communauté Iqra Quest.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Categories */}
          <div className="lg:w-64 flex-shrink-0 space-y-6">
            <div className="bg-daara-surface rounded-3xl p-6 border border-daara-gold/20 shadow-xl sticky top-24">
              <div className="mb-6 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-daara-text-muted" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-daara-bg border border-daara-gold/30 rounded-xl focus:border-daara-gold focus:outline-none focus:ring-2 focus:ring-daara-gold/20 transition-colors text-daara-text text-sm"
                />
              </div>

              <h2 className="font-bold text-daara-text mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5 text-daara-gold" />
                Catégories
              </h2>
              <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 no-scrollbar">
                <button
                  onClick={() => setFilterCategory('Tous')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${
                    filterCategory === 'Tous' 
                      ? 'bg-daara-gold text-daara-bg font-bold shadow-md' 
                      : 'text-daara-text-muted hover:bg-daara-gold/10 hover:text-daara-gold'
                  }`}
                >
                  <Hash className="w-4 h-4" />
                  Tous les sujets
                </button>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${
                      filterCategory === cat 
                        ? 'bg-daara-gold text-daara-bg font-bold shadow-md' 
                        : 'text-daara-text-muted hover:bg-daara-gold/10 hover:text-daara-gold'
                    }`}
                  >
                    <Hash className="w-4 h-4" />
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {/* Formulaire de nouveau message */}
            <div className="bg-daara-surface rounded-3xl p-6 md:p-8 border border-daara-gold/20 shadow-xl">
              {!user ? (
                <div className="text-center py-8">
                  <p className="text-daara-text-muted mb-6">Connectez-vous pour participer aux discussions.</p>
                  <button
                    onClick={signInWithGoogle}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-daara-gold text-daara-bg font-bold rounded-full hover:bg-daara-gold-light transition-all shadow-lg"
                  >
                    <User className="w-5 h-5" />
                    Se connecter avec Google
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-start gap-4">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || ''} className="w-12 h-12 rounded-full border-2 border-daara-gold/30" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-daara-gold/10 flex items-center justify-center text-daara-gold">
                        <User className="w-6 h-6" />
                      </div>
                    )}
                    <div className="flex-1 space-y-4">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full md:w-auto bg-daara-bg border border-daara-gold/20 rounded-xl px-4 py-2 text-daara-text focus:outline-none focus:border-daara-gold focus:ring-1 focus:ring-daara-gold"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <textarea
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        placeholder="Partagez une réflexion, posez une question..."
                        className="w-full bg-daara-bg border border-daara-gold/20 rounded-2xl p-4 text-daara-text placeholder-daara-text-muted focus:outline-none focus:border-daara-gold focus:ring-1 focus:ring-daara-gold resize-none min-h-[120px]"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting || !newPost.trim()}
                      className="inline-flex items-center gap-2 px-8 py-3 bg-daara-gold text-daara-bg font-bold rounded-full hover:bg-daara-gold-light transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                      {isSubmitting ? 'Envoi...' : 'Publier'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Liste des messages */}
            <div className="space-y-6">
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-daara-surface rounded-2xl p-6 border border-daara-gold/10 shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      {post.userPhoto ? (
                        <img src={post.userPhoto} alt={post.userName} className="w-12 h-12 rounded-full border-2 border-daara-gold/20" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-daara-gold/10 flex items-center justify-center text-daara-gold">
                          <User className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-daara-text text-lg">{post.userName}</h3>
                        <div className="flex items-center gap-3 text-xs text-daara-text-muted mt-1">
                          <span className="flex items-center gap-1 bg-daara-gold/10 text-daara-gold px-2 py-1 rounded-md font-medium">
                            <Hash className="w-3 h-3" />
                            {post.category || 'Général'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(post.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {user && user.uid === post.userId && (
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-red-400 hover:text-red-300 p-2 rounded-full hover:bg-red-400/10 transition-colors"
                        title="Supprimer ce message"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <p className="text-daara-text-muted whitespace-pre-wrap leading-relaxed text-lg mt-4">
                    {post.content}
                  </p>
                </motion.div>
              ))}
              
              {filteredPosts.length === 0 && (
                <div className="text-center py-16 bg-daara-surface rounded-3xl border border-daara-gold/10 shadow-sm">
                  <MessageSquare className="w-16 h-16 text-daara-gold/30 mx-auto mb-4" />
                  <p className="text-daara-text-muted text-lg">Aucun message dans cette catégorie pour le moment.</p>
                  <p className="text-daara-text-muted/70 mt-2">Soyez le premier à lancer la discussion !</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
