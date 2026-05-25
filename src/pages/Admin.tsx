import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy, limit } from 'firebase/firestore';
import { Sliders, Users, MessageSquare, Trash2, Edit, Plus, Search, ShieldAlert, Video, CheckCircle, Save, X, Server } from 'lucide-react';

interface Playlist {
  key: string;
  id: string;
  title: string;
  desc: string;
}

interface UserDoc {
  uid: string;
  displayName: string;
  photoURL?: string;
  email: string;
  role: 'user' | 'admin';
  xp: number;
  streak: number;
}

export function Admin() {
  const { user, profile, isAdmin, logout, signInWithGoogle } = useAuth();
  const [activeTab, setActiveTab] = useState<'playlists' | 'users' | 'activity'>('playlists');
  
  // Playlists State
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playlistKey, setPlaylistKey] = useState('');
  const [playlistId, setPlaylistId] = useState('');
  const [playlistTitle, setPlaylistTitle] = useState('');
  const [playlistDesc, setPlaylistDesc] = useState('');
  const [isEditingKey, setIsEditingKey] = useState<string | null>(null);
  
  // Users State
  const [usersList, setUsersList] = useState<UserDoc[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  
  // Activity State
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [recentComments, setRecentComments] = useState<any[]>([]);

  // Fetch Playlists from SQLite API
  const fetchPlaylists = () => {
    fetch('/api/playlists')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPlaylists(data);
      })
      .catch(err => console.error("Error fetching playlists:", err));
  };

  useEffect(() => {
    if (!user || !isAdmin) return;

    fetchPlaylists();

    // Query Users from Firestore (Admins only)
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => doc.data() as UserDoc);
      setUsersList(usersData);
    });

    // Query Recent Posts for monitoring
    const qPosts = query(collection(db, 'forum_posts'), orderBy('createdAt', 'desc'), limit(15));
    const unsubscribePosts = onSnapshot(qPosts, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentPosts(postsData);
    });

    // Query Recent Playlist Comments
    const qComments = query(collection(db, 'playlist_comments'), orderBy('createdAt', 'desc'), limit(15));
    const unsubscribeComments = onSnapshot(qComments, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentComments(commentsData);
    });

    return () => {
      unsubscribeUsers();
      unsubscribePosts();
      unsubscribeComments();
    };
  }, [user, isAdmin]);

  // Check admin authorization
  if (!user || !isAdmin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-8 space-y-6">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-2 animate-bounce" />
        <h2 className="text-3xl font-serif font-bold text-daara-text">Accès Refusé</h2>
        
        <div className="bg-daara-surface border border-daara-gold/20 p-6 rounded-3xl max-w-md w-full shadow-xl">
          {user ? (
            <div className="space-y-4">
              <p className="text-sm text-daara-text">
                Vous êtes actuellement connecté avec l'adresse :
              </p>
              <p className="text-sm font-bold text-daara-gold bg-daara-bg/50 py-3 px-4 rounded-xl border border-daara-gold/10 truncate select-all">
                {user.email}
              </p>
              <p className="text-xs text-daara-text-muted leading-relaxed">
                Cette adresse n'est pas reconnue comme administrateur. L'accès requiert l'adresse : <span className="font-semibold text-daara-text">seckmoustapha6002@gmail.com</span>.
              </p>
              <button
                onClick={async () => {
                  try {
                    await logout();
                    await signInWithGoogle();
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="w-full mt-4 bg-daara-gold text-daara-bg py-3 px-6 rounded-xl text-sm font-bold shadow-md hover:bg-yellow-600 transition-colors"
              >
                Changer de compte
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-daara-text-muted">
                Vous n'êtes pas connecté à votre compte.
              </p>
              <button
                onClick={signInWithGoogle}
                className="w-full bg-daara-gold text-daara-bg py-3 px-6 rounded-xl text-sm font-bold shadow-md hover:bg-yellow-600 transition-colors"
              >
                Se connecter
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // CRUD Playlists
  const handleSavePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistKey.trim() || !playlistId.trim() || !playlistTitle.trim()) return;

    const payload = {
      key: playlistKey.trim().toLowerCase(),
      id: playlistId.trim(),
      title: playlistTitle.trim(),
      desc: playlistDesc.trim()
    };

    fetch('/api/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(resData => {
        if (resData.status === 'success') {
          fetchPlaylists();
          setPlaylistKey('');
          setPlaylistId('');
          setPlaylistTitle('');
          setPlaylistDesc('');
          setIsEditingKey(null);
        }
      })
      .catch(err => console.error("Error saving playlist:", err));
  };

  const handleEditPlaylist = (p: Playlist) => {
    setIsEditingKey(p.key);
    setPlaylistKey(p.key);
    setPlaylistId(p.id);
    setPlaylistTitle(p.title);
    setPlaylistDesc(p.desc);
  };

  const handleDeletePlaylist = (key: string) => {
    if (!confirm(`Voulez-vous supprimer la playlist "${key}" ?`)) return;

    fetch(`/api/playlists/${key}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(resData => {
        if (resData.status === 'success') {
          fetchPlaylists();
        }
      })
      .catch(err => console.error("Error deleting playlist:", err));
  };

  // User Management
  const handleToggleUserRole = async (userId: string, currentRole: 'user' | 'admin') => {
    if (userId === user.uid) {
      alert("Vous ne pouvez pas révoquer votre propre rôle d'administrateur !");
      return;
    }
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`Changer le rôle de cet utilisateur en "${newRole}" ?`)) return;

    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { role: newRole });
    } catch (err) {
      console.error("Error updating user role:", err);
    }
  };

  const handleDeleteUserDoc = async (userId: string) => {
    if (userId === user.uid) return;
    if (!confirm("Voulez-vous supprimer définitivement la fiche de cet utilisateur ?")) return;

    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (err) {
      console.error("Error deleting user document:", err);
    }
  };

  // Moderation
  const handleDeletePost = async (postId: string) => {
    if (confirm("Supprimer ce message du forum ?")) {
      try {
        await deleteDoc(doc(db, 'forum_posts', postId));
      } catch (err) {
        console.error("Error deleting post:", err);
      }
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (confirm("Supprimer ce commentaire ?")) {
      try {
        await deleteDoc(doc(db, 'playlist_comments', commentId));
      } catch (err) {
        console.error("Error deleting comment:", err);
      }
    }
  };

  const filteredUsers = usersList.filter(u => 
    u.displayName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-daara-bg py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Title */}
        <div className="text-center space-y-4 mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-daara-surface border border-daara-gold/30 shadow-lg shadow-daara-gold/10 mb-4"
          >
            <Sliders className="w-10 h-10 text-daara-gold" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-daara-text">
            Panneau d' <span className="text-daara-gold">Administration</span>
          </h1>
          <p className="text-xl text-daara-text-muted max-w-2xl mx-auto">
            Gérez les leçons, modérez les contributions de la communauté et supervisez les profils utilisateurs.
          </p>
        </div>

        {/* Admin Tabs */}
        <div className="flex justify-center border-b border-daara-gold/20 pb-4 gap-6">
          {[
            { id: 'playlists', label: 'Gestion Playlists', icon: Video },
            { id: 'users', label: 'Contrôle Utilisateurs', icon: Users },
            { id: 'activity', label: 'Surveillance & Moderation', icon: MessageSquare }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-daara-gold text-daara-bg shadow-lg shadow-daara-gold/20' 
                  : 'text-daara-text-muted hover:text-daara-gold hover:bg-daara-gold/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
          >
            
            {/* Playlists Management Tab */}
            {activeTab === 'playlists' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Form to Add/Edit Playlist */}
                <div className="lg:col-span-1 bg-daara-surface p-6 rounded-3xl border border-daara-gold/20 shadow-xl h-fit">
                  <h3 className="text-xl font-bold text-daara-text border-b border-daara-gold/10 pb-3 mb-6">
                    {isEditingKey ? 'Modifier la Playlist' : 'Ajouter une Playlist'}
                  </h3>
                  <form onSubmit={handleSavePlaylist} className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase text-daara-text-muted font-bold tracking-wider mb-1.5">Clé unique (URL hash)</label>
                      <input 
                        type="text" 
                        placeholder="ex: fiqh, prophetes..."
                        value={playlistKey}
                        onChange={(e) => setPlaylistKey(e.target.value)}
                        disabled={isEditingKey !== null}
                        className="w-full px-4 py-2.5 bg-daara-bg border border-daara-gold/20 rounded-xl text-daara-text focus:outline-none focus:border-daara-gold text-sm disabled:opacity-50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase text-daara-text-muted font-bold tracking-wider mb-1.5">ID Playlist YouTube</label>
                      <input 
                        type="text" 
                        placeholder="ex: PLIGduk3xgf..."
                        value={playlistId}
                        onChange={(e) => setPlaylistId(e.target.value)}
                        className="w-full px-4 py-2.5 bg-daara-bg border border-daara-gold/20 rounded-xl text-daara-text focus:outline-none focus:border-daara-gold text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase text-daara-text-muted font-bold tracking-wider mb-1.5">Titre descriptif</label>
                      <input 
                        type="text" 
                        placeholder="ex: Jurisprudence (Fiqh)"
                        value={playlistTitle}
                        onChange={(e) => setPlaylistTitle(e.target.value)}
                        className="w-full px-4 py-2.5 bg-daara-bg border border-daara-gold/20 rounded-xl text-daara-text focus:outline-none focus:border-daara-gold text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase text-daara-text-muted font-bold tracking-wider mb-1.5">Description</label>
                      <textarea 
                        placeholder="Courte description de ce que contient ce cours..."
                        value={playlistDesc}
                        onChange={(e) => setPlaylistDesc(e.target.value)}
                        className="w-full p-4 bg-daara-bg border border-daara-gold/20 rounded-xl text-daara-text focus:outline-none focus:border-daara-gold text-sm resize-none min-h-[100px]"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      {isEditingKey && (
                        <button 
                          type="button" 
                          onClick={() => {
                            setIsEditingKey(null);
                            setPlaylistKey('');
                            setPlaylistId('');
                            setPlaylistTitle('');
                            setPlaylistDesc('');
                          }}
                          className="w-1/3 px-4 py-3 bg-transparent text-daara-text-muted hover:text-daara-text text-sm font-bold"
                        >
                          Annuler
                        </button>
                      )}
                      <button 
                        type="submit" 
                        className={`font-bold text-sm rounded-xl py-3 shadow-md transition-colors flex-1 flex items-center justify-center gap-2 ${
                          isEditingKey ? 'bg-daara-gold text-daara-bg hover:bg-yellow-600' : 'bg-daara-gold text-daara-bg hover:bg-yellow-600'
                        }`}
                      >
                        <Save className="w-4 h-4" />
                        Enregistrer
                      </button>
                    </div>
                  </form>
                </div>

                {/* Playlist Directory */}
                <div className="lg:col-span-2 bg-daara-surface p-6 rounded-3xl border border-daara-gold/20 shadow-xl space-y-6">
                  <h3 className="text-xl font-bold text-daara-text border-b border-daara-gold/10 pb-3 mb-2 flex items-center gap-2">
                    <Server className="w-5 h-5 text-daara-gold" />
                    Playlists actives dans SQLite
                  </h3>
                  <div className="space-y-4">
                    {playlists.map(p => (
                      <div key={p.key} className="p-5 bg-daara-bg/50 border border-daara-gold/15 rounded-2xl flex justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="text-lg font-serif font-bold text-daara-text">{p.title}</h4>
                            <span className="bg-daara-gold/10 text-daara-gold px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">{p.key}</span>
                          </div>
                          <p className="text-xs text-daara-text-muted truncate max-w-lg">ID YouTube: {p.id}</p>
                          <p className="text-sm text-daara-text-muted leading-relaxed">{p.desc}</p>
                        </div>
                        <div className="flex flex-col gap-1 shrink-0 justify-center">
                          <button
                            onClick={() => handleEditPlaylist(p)}
                            className="p-2 text-daara-text-muted hover:text-daara-gold hover:bg-daara-gold/10 rounded-xl transition-colors text-xs font-bold flex items-center gap-1.5"
                          >
                            <Edit className="w-4 h-4" />
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDeletePlaylist(p.key)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-500/10 rounded-xl transition-colors text-xs font-bold flex items-center gap-1.5"
                          >
                            <Trash2 className="w-4 h-4" />
                            Supprimer
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Users Controller Tab */}
            {activeTab === 'users' && (
              <div className="bg-daara-surface p-6 md:p-8 rounded-3xl border border-daara-gold/20 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <h3 className="text-xl font-bold text-daara-text">Supervision des Utilisateurs</h3>
                  <div className="relative w-full sm:w-80">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-daara-text-muted" />
                    </div>
                    <input 
                      type="text"
                      placeholder="Filtrer par nom ou email..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-daara-bg border border-daara-gold/20 rounded-xl text-daara-text text-sm focus:outline-none focus:border-daara-gold"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-daara-gold/15">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-daara-text-muted uppercase tracking-wider">Utilisateur</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-daara-text-muted uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-daara-text-muted uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-daara-text-muted uppercase tracking-wider">XP</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-daara-text-muted uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-daara-gold/10">
                      {filteredUsers.map(u => (
                        <tr key={u.uid} className="hover:bg-daara-bg/25">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {u.photoURL ? (
                                <img src={u.photoURL} alt="" className="w-8 h-8 rounded-full object-cover" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-daara-gold/20 flex items-center justify-center text-daara-gold text-xs font-bold">{u.displayName?.charAt(0)}</div>
                              )}
                              <span className="font-bold text-daara-text text-sm">{u.displayName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-daara-text-muted">{u.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-red-500/15 text-red-400' : 'bg-daara-gold/10 text-daara-gold'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-daara-text font-medium">{u.xp || 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-xs space-x-2">
                            <button
                              onClick={() => handleToggleUserRole(u.uid, u.role)}
                              disabled={u.uid === user.uid}
                              className="px-3 py-1.5 bg-daara-bg border border-daara-gold/20 hover:border-daara-gold text-daara-gold rounded-lg transition-colors font-semibold disabled:opacity-50"
                            >
                              Changer Rôle
                            </button>
                            <button
                              onClick={() => handleDeleteUserDoc(u.uid)}
                              disabled={u.uid === user.uid}
                              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/25 text-red-400 rounded-lg transition-colors font-semibold disabled:opacity-50"
                            >
                              Retirer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Moderation / Activity Tab */}
            {activeTab === 'activity' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Forum Monitoring */}
                <div className="bg-daara-surface p-6 rounded-3xl border border-daara-gold/20 shadow-xl space-y-6">
                  <h3 className="text-xl font-bold text-daara-text border-b border-daara-gold/10 pb-3 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-daara-gold" />
                    Messages récents sur le Forum
                  </h3>
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
                    {recentPosts.map(post => (
                      <div key={post.id} className="p-4 bg-daara-bg/50 border border-daara-gold/15 rounded-2xl flex justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-daara-text">{post.userName}</span>
                            <span className="text-[10px] bg-daara-gold/10 text-daara-gold px-1.5 py-0.5 rounded font-bold uppercase">{post.category}</span>
                          </div>
                          <p className="text-xs text-daara-text-muted mt-2 leading-relaxed">{post.content}</p>
                        </div>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-500/10 rounded-xl transition-colors h-fit"
                          title="Supprimer le post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {recentPosts.length === 0 && (
                      <p className="text-center text-daara-text-muted py-6">Aucun message trouvé.</p>
                    )}
                  </div>
                </div>

                {/* Video Comments Monitoring */}
                <div className="bg-daara-surface p-6 rounded-3xl border border-daara-gold/20 shadow-xl space-y-6">
                  <h3 className="text-xl font-bold text-daara-text border-b border-daara-gold/10 pb-3 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-daara-gold" />
                    Commentaires sous les playlists
                  </h3>
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
                    {recentComments.map(comment => (
                      <div key={comment.id} className="p-4 bg-daara-bg/50 border border-daara-gold/15 rounded-2xl flex justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-daara-text">{comment.userName}</span>
                            <span className="text-[10px] bg-daara-gold/15 text-daara-gold px-1.5 py-0.5 rounded font-bold tracking-wider">{comment.playlistId}</span>
                          </div>
                          <p className="text-xs text-daara-text-muted mt-2 leading-relaxed">{comment.content}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-500/10 rounded-xl transition-colors h-fit"
                          title="Supprimer le commentaire"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {recentComments.length === 0 && (
                      <p className="text-center text-daara-text-muted py-6">Aucun commentaire trouvé.</p>
                    )}
                  </div>
                </div>

              </div>
            )}

          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}
