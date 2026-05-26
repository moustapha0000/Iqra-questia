import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import {
  collection, onSnapshot, doc, updateDoc, deleteDoc,
  query, orderBy, limit, getCountFromServer, getDocs, where
} from 'firebase/firestore';
import {
  LayoutDashboard, Video, Users, MessageSquare, Settings,
  Trash2, Edit, Plus, Search, ShieldAlert, CheckCircle,
  Save, X, Server, TrendingUp, Eye, Clock, Activity,
  ToggleLeft, ToggleRight, LogOut, ChevronRight, BarChart2,
  Youtube, Image, Link2, FileText, Crown, Ban, RefreshCw,
  ArrowUpRight, ArrowDownRight, Sliders
} from 'lucide-react';
import {
  savePlaylist,
  deletePlaylistDoc,
  onPlaylistsChanged,
  fetchPlaylists as fetchPlaylistsFromFirestore
} from '../utils/playlistService';

// ─── Types ─────────────────────────────────────────────────────────────────
interface Playlist {
  key: string;
  id: string;
  title: string;
  desc: string;
  thumbnail?: string;
}

interface UserDoc {
  uid: string;
  displayName: string;
  photoURL?: string;
  email: string;
  role: 'user' | 'admin';
  xp: number;
  streak: number;
  createdAt?: any;
}

interface AnalyticsDay {
  date: string;
  count: number;
}

type AdminTab = 'overview' | 'playlists' | 'users' | 'moderation' | 'settings';

// ─── Sidebar nav items ─────────────────────────────────────────────────────
const NAV_ITEMS: { id: AdminTab; label: string; icon: React.ElementType }[] = [
  { id: 'overview',    label: 'Vue d\'ensemble', icon: LayoutDashboard },
  { id: 'playlists',  label: 'Playlists & Leçons', icon: Video },
  { id: 'users',      label: 'Utilisateurs',    icon: Users },
  { id: 'moderation', label: 'Modération',       icon: MessageSquare },
  { id: 'settings',   label: 'Paramètres',       icon: Settings },
];

// ─── Helper: format relative time ─────────────────────────────────────────
function formatRelative(ts: any): string {
  if (!ts) return '—';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return 'À l\'instant';
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  return `Il y a ${Math.floor(diff / 86400)} j`;
}

// ─── SVG Mini Bar Chart ────────────────────────────────────────────────────
function BarChart({ data }: { data: AnalyticsDay[] }) {
  if (!data.length) return null;
  const max = Math.max(...data.map(d => d.count), 1);
  const labels = data.map(d => d.date.slice(5)); // MM-DD
  const barW = 100 / data.length;

  return (
    <div className="mt-4">
      <svg viewBox={`0 0 100 40`} className="w-full h-32" preserveAspectRatio="none">
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e5b85c" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#e5b85c" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        {data.map((d, i) => {
          const h = (d.count / max) * 35;
          const x = i * barW + barW * 0.1;
          const w = barW * 0.8;
          return (
            <g key={d.date}>
              <rect x={x} y={40 - h} width={w} height={h} rx="1" fill="url(#barGrad)" />
            </g>
          );
        })}
      </svg>
      <div className="flex justify-between text-[9px] text-daara-text-muted mt-1 px-1">
        {labels.map(l => <span key={l}>{l}</span>)}
      </div>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────
interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}
function KpiCard({ label, value, sub, icon: Icon, trend = 'neutral', color = 'text-daara-gold' }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-daara-surface border border-daara-gold/10 rounded-2xl p-5 flex items-start gap-4 hover:border-daara-gold/30 transition-colors"
    >
      <div className={`p-3 rounded-xl bg-daara-bg/60 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-daara-text-muted uppercase tracking-wider font-semibold mb-1">{label}</p>
        <p className="text-2xl font-bold text-daara-text">{value}</p>
        {sub && (
          <p className={`text-xs mt-1 flex items-center gap-1 ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-daara-text-muted'}`}>
            {trend === 'up' && <ArrowUpRight className="w-3 h-3" />}
            {trend === 'down' && <ArrowDownRight className="w-3 h-3" />}
            {sub}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN ADMIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export function Admin() {
  const { user, isAdmin, logout, signInWithGoogle } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ── Playlists state ──────────────────────────────────────────────
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [playlistForm, setPlaylistForm] = useState({ key: '', id: '', title: '', desc: '', thumbnail: '' });
  const [playlistSaving, setPlaylistSaving] = useState(false);

  // ── Users state ──────────────────────────────────────────────────
  const [usersList, setUsersList] = useState<UserDoc[]>([]);
  const [userSearch, setUserSearch] = useState('');

  // ── Moderation state ─────────────────────────────────────────────
  const [forumPosts, setForumPosts] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);

  // ── Analytics state ──────────────────────────────────────────────
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [sessionData, setSessionData] = useState<AnalyticsDay[]>([]);
  const [weekSessions, setWeekSessions] = useState(0);
  const [pageViews, setPageViews] = useState<any[]>([]);

  // ── Settings state ───────────────────────────────────────────────
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // ── All hooks before any conditional ────────────────────────────
  const fetchPlaylists = useCallback(() => {
    fetchPlaylistsFromFirestore()
      .then(data => { if (data) setPlaylists(data); })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!user || !isAdmin) return;

    // Real-time playlists sync
    const unsubPlaylists = onPlaylistsChanged((docs) => {
      setPlaylists(docs);
    });

    // Users
    const unsubUsers = onSnapshot(collection(db, 'users'), snap => {
      setUsersList(snap.docs.map(d => d.data() as UserDoc));
      setTotalUsers(snap.docs.length);
    });

    // Forum posts
    const qPosts = query(collection(db, 'forum_posts'), orderBy('createdAt', 'desc'), limit(50));
    const unsubPosts = onSnapshot(qPosts, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setForumPosts(data);
      setTotalPosts(data.length);
    });

    // Comments
    const qComments = query(collection(db, 'playlist_comments'), orderBy('createdAt', 'desc'), limit(50));
    const unsubComments = onSnapshot(qComments, snap => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Analytics sessions — last 7 days
    const loadAnalytics = async () => {
      try {
        const snap = await getDocs(collection(db, 'analytics_sessions'));
        const allDays: AnalyticsDay[] = snap.docs.map(d => d.data() as AnalyticsDay);
        // Sort and take last 7
        allDays.sort((a, b) => a.date.localeCompare(b.date));
        const last7 = allDays.slice(-7);
        setSessionData(last7);
        setWeekSessions(last7.reduce((s, d) => s + (d.count || 0), 0));

        // Page views
        const pvSnap = await getDocs(collection(db, 'analytics_pageviews'));
        const pvData = pvSnap.docs.map(d => d.data());
        pvData.sort((a: any, b: any) => (b.views || 0) - (a.views || 0));
        setPageViews(pvData.slice(0, 8));
      } catch (e) { /* analytics tables may not exist yet */ }
    };
    loadAnalytics();

    return () => { unsubPlaylists(); unsubUsers(); unsubPosts(); unsubComments(); };
  }, [user, isAdmin]);

  // ─────────────────────────────────────────────────────────────────
  // Access denied screen (AFTER all hooks)
  // ─────────────────────────────────────────────────────────────────
  if (!user || !isAdmin) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 py-8 space-y-6">
        <ShieldAlert className="w-16 h-16 text-red-500 animate-bounce" />
        <h2 className="text-3xl font-serif font-bold text-daara-text">Accès Refusé</h2>
        <div className="bg-daara-surface border border-daara-gold/20 p-6 rounded-3xl max-w-sm w-full shadow-xl">
          {user ? (
            <div className="space-y-4">
              <p className="text-sm text-daara-text">Connecté en tant que :</p>
              <p className="text-sm font-bold text-daara-gold bg-daara-bg/50 py-2 px-4 rounded-xl border border-daara-gold/10 select-all">{user.email}</p>
              <p className="text-xs text-daara-text-muted">Compte non administrateur. Attendez ou changez de compte.</p>
              <button onClick={async () => { await logout(); await signInWithGoogle(); }}
                className="w-full bg-daara-gold text-daara-bg py-3 rounded-xl text-sm font-bold hover:bg-yellow-500 transition-colors">
                Changer de compte
              </button>
            </div>
          ) : (
            <button onClick={signInWithGoogle}
              className="w-full bg-daara-gold text-daara-bg py-3 rounded-xl text-sm font-bold hover:bg-yellow-500 transition-colors">
              Se connecter
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // Playlist CRUD
  // ─────────────────────────────────────────────────────────────────
  const handleSavePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistForm.key || !playlistForm.id || !playlistForm.title) return;
    setPlaylistSaving(true);
    try {
      const payload = {
        key: playlistForm.key.trim().toLowerCase(),
        id: playlistForm.id.trim(),
        title: playlistForm.title.trim(),
        desc: playlistForm.desc.trim(),
        thumbnail: playlistForm.thumbnail.trim(),
        order: editingPlaylist ? (editingPlaylist as any).order : playlists.length
      };
      await savePlaylist(payload);
      setPlaylistForm({ key: '', id: '', title: '', desc: '', thumbnail: '' });
      setEditingPlaylist(null);
    } catch (e) { console.error(e); }
    setPlaylistSaving(false);
  };

  const handleEditPlaylist = (p: Playlist) => {
    setEditingPlaylist(p);
    setPlaylistForm({ key: p.key, id: p.id, title: p.title, desc: p.desc || '', thumbnail: p.thumbnail || '' });
    setActiveTab('playlists');
  };

  const handleDeletePlaylist = async (key: string) => {
    if (!confirm(`Supprimer la playlist "${key}" ?`)) return;
    try {
      await deletePlaylistDoc(key);
    } catch (e) { console.error(e); }
  };

  // ─────────────────────────────────────────────────────────────────
  // User management
  // ─────────────────────────────────────────────────────────────────
  const handleToggleRole = async (uid: string, currentRole: string) => {
    if (uid === user.uid) return alert('Vous ne pouvez pas modifier votre propre rôle.');
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`Changer le rôle en "${newRole}" ?`)) return;
    try { await updateDoc(doc(db, 'users', uid), { role: newRole }); }
    catch (e) { console.error(e); }
  };

  const handleDeleteUser = async (uid: string) => {
    if (uid === user.uid) return;
    if (!confirm('Supprimer ce profil utilisateur ?')) return;
    try { await deleteDoc(doc(db, 'users', uid)); }
    catch (e) { console.error(e); }
  };

  // ─────────────────────────────────────────────────────────────────
  // Moderation
  // ─────────────────────────────────────────────────────────────────
  const handleDeletePost = async (id: string) => {
    if (!confirm('Supprimer ce message ?')) return;
    try { await deleteDoc(doc(db, 'forum_posts', id)); } catch (e) { console.error(e); }
  };

  const handleDeleteComment = async (id: string) => {
    if (!confirm('Supprimer ce commentaire ?')) return;
    try { await deleteDoc(doc(db, 'playlist_comments', id)); } catch (e) { console.error(e); }
  };

  const filteredUsers = usersList.filter(u =>
    u.displayName?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  // ─────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-daara-bg -mx-4 sm:-mx-6 lg:-mx-8">

      {/* ── SIDEBAR ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="w-64 shrink-0 bg-[#060f0a] border-r border-daara-gold/10 flex flex-col z-20 sticky top-0 h-screen overflow-y-auto"
          >
            {/* Logo */}
            <div className="p-6 border-b border-daara-gold/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-daara-gold/10 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-daara-gold" />
                </div>
                <div>
                  <p className="font-serif font-bold text-daara-text text-sm">Iqra Quest</p>
                  <p className="text-[10px] text-daara-text-muted">Admin Console</p>
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-4 space-y-1">
              {NAV_ITEMS.map(item => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                      active
                        ? 'bg-daara-gold text-daara-bg shadow-lg shadow-daara-gold/20'
                        : 'text-daara-text-muted hover:text-daara-text hover:bg-daara-surface/50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {item.label}
                    {active && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </button>
                );
              })}
            </nav>

            {/* Admin user */}
            <div className="p-4 border-t border-daara-gold/10">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-daara-surface/50">
                {user.photoURL
                  ? <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full border border-daara-gold/30" />
                  : <div className="w-8 h-8 rounded-full bg-daara-gold/20 flex items-center justify-center text-daara-gold text-xs font-bold">{user.displayName?.charAt(0)}</div>
                }
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-daara-text truncate">{user.displayName}</p>
                  <p className="text-[10px] text-daara-gold">Administrateur</p>
                </div>
                <button onClick={logout} className="p-1.5 text-daara-text-muted hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT ────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-daara-bg/80 backdrop-blur border-b border-daara-gold/10 flex items-center gap-4 px-6 py-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-daara-text-muted hover:text-daara-gold hover:bg-daara-surface rounded-xl transition-colors"
          >
            <Sliders className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-serif font-bold text-daara-text">
              {NAV_ITEMS.find(n => n.id === activeTab)?.label}
            </h1>
            <p className="text-xs text-daara-text-muted">Console d'administration Iqra Quest</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={fetchPlaylists}
              className="p-2 text-daara-text-muted hover:text-daara-gold hover:bg-daara-surface rounded-xl transition-colors"
              title="Actualiser"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18 }}
            >

              {/* ══ OVERVIEW ══════════════════════════════════════ */}
              {activeTab === 'overview' && (
                <div className="space-y-6">

                  {/* KPI row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiCard label="Utilisateurs" value={totalUsers} sub="inscrits au total" icon={Users} trend="up" color="text-blue-400" />
                    <KpiCard label="Sessions (7j)" value={weekSessions} sub="visites cette semaine" icon={Activity} trend="up" color="text-emerald-400" />
                    <KpiCard label="Messages Forum" value={totalPosts} sub="tous les messages" icon={MessageSquare} trend="neutral" color="text-purple-400" />
                    <KpiCard label="Playlists" value={playlists.length} sub="cours disponibles" icon={Video} trend="neutral" color="text-daara-gold" />
                  </div>

                  {/* Charts row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Sessions chart */}
                    <div className="bg-daara-surface border border-daara-gold/10 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-daara-text flex items-center gap-2">
                          <BarChart2 className="w-4 h-4 text-daara-gold" />
                          Sessions quotidiennes
                        </h3>
                        <span className="text-xs text-daara-text-muted">7 derniers jours</span>
                      </div>
                      {sessionData.length > 0
                        ? <BarChart data={sessionData} />
                        : <div className="h-32 flex items-center justify-center text-daara-text-muted text-sm">
                            Aucune donnée encore. Le tracker démarre à la première visite.
                          </div>
                      }
                    </div>

                    {/* Top pages */}
                    <div className="bg-daara-surface border border-daara-gold/10 rounded-2xl p-6">
                      <h3 className="font-bold text-daara-text flex items-center gap-2 mb-4">
                        <Eye className="w-4 h-4 text-daara-gold" />
                        Pages les plus visitées
                      </h3>
                      {pageViews.length > 0 ? (
                        <div className="space-y-3">
                          {pageViews.map((pv: any) => (
                            <div key={`${pv.date}-${pv.page}`} className="flex items-center gap-3">
                              <span className="text-sm font-mono text-daara-gold w-24 truncate">/{pv.page}</span>
                              <div className="flex-1 bg-daara-bg/60 rounded-full h-2 overflow-hidden">
                                <div
                                  className="h-2 bg-gradient-to-r from-daara-gold to-yellow-400 rounded-full"
                                  style={{ width: `${Math.min(100, (pv.views / (pageViews[0]?.views || 1)) * 100)}%` }}
                                />
                              </div>
                              <span className="text-xs text-daara-text-muted w-8 text-right">{pv.views}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-daara-text-muted text-sm">Les statistiques s'affichent après les premières visites.</p>
                      )}
                    </div>
                  </div>

                  {/* Recent activity */}
                  <div className="bg-daara-surface border border-daara-gold/10 rounded-2xl p-6">
                    <h3 className="font-bold text-daara-text flex items-center gap-2 mb-4">
                      <Activity className="w-4 h-4 text-daara-gold" />
                      Activité récente
                    </h3>
                    <div className="space-y-3">
                      {[...forumPosts.slice(0, 5)].map(post => (
                        <div key={post.id} className="flex items-center gap-4 p-3 rounded-xl bg-daara-bg/40 hover:bg-daara-bg/60 transition-colors">
                          {post.userPhoto
                            ? <img src={post.userPhoto} alt="" className="w-8 h-8 rounded-full" />
                            : <div className="w-8 h-8 rounded-full bg-daara-gold/10 flex items-center justify-center text-daara-gold text-xs">{post.userName?.charAt(0)}</div>
                          }
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-daara-text truncate">{post.userName}</p>
                            <p className="text-xs text-daara-text-muted truncate">{post.content}</p>
                          </div>
                          <span className="text-xs text-daara-text-muted shrink-0">{formatRelative(post.createdAt)}</span>
                        </div>
                      ))}
                      {forumPosts.length === 0 && <p className="text-daara-text-muted text-sm">Aucune activité récente.</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* ══ PLAYLISTS ════════════════════════════════════ */}
              {activeTab === 'playlists' && (
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

                  {/* Form */}
                  <div className="xl:col-span-2">
                    <div className="bg-daara-surface border border-daara-gold/10 rounded-2xl p-6 sticky top-24">
                      <h2 className="text-lg font-bold text-daara-text mb-5 flex items-center gap-2">
                        {editingPlaylist ? <Edit className="w-5 h-5 text-daara-gold" /> : <Plus className="w-5 h-5 text-daara-gold" />}
                        {editingPlaylist ? 'Modifier' : 'Nouvelle playlist'}
                      </h2>
                      <form onSubmit={handleSavePlaylist} className="space-y-4">
                        {[
                          { field: 'key', label: 'Clé URL', placeholder: 'ex: fiqh, prophetes...', disabled: !!editingPlaylist, icon: Link2 },
                          { field: 'id', label: 'ID Playlist YouTube', placeholder: 'PLxxx...', icon: Youtube },
                          { field: 'title', label: 'Titre', placeholder: 'Jurisprudence (Fiqh)', icon: FileText },
                          { field: 'thumbnail', label: 'Vignette URL (optionnel)', placeholder: 'https://...', icon: Image },
                        ].map(({ field, label, placeholder, disabled, icon: FieldIcon }) => (
                          <div key={field}>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-daara-text-muted mb-1.5">{label}</label>
                            <div className="relative">
                              <FieldIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-daara-text-muted" />
                              <input
                                type="text"
                                value={(playlistForm as any)[field]}
                                onChange={e => setPlaylistForm(f => ({ ...f, [field]: e.target.value }))}
                                placeholder={placeholder}
                                disabled={disabled}
                                className="w-full pl-10 pr-4 py-2.5 bg-daara-bg border border-daara-gold/15 rounded-xl text-daara-text text-sm focus:outline-none focus:border-daara-gold disabled:opacity-40"
                                required={field !== 'thumbnail'}
                              />
                            </div>
                          </div>
                        ))}
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-daara-text-muted mb-1.5">Description</label>
                          <textarea
                            value={playlistForm.desc}
                            onChange={e => setPlaylistForm(f => ({ ...f, desc: e.target.value }))}
                            placeholder="Description courte du cours..."
                            className="w-full px-4 py-2.5 bg-daara-bg border border-daara-gold/15 rounded-xl text-daara-text text-sm focus:outline-none focus:border-daara-gold resize-none min-h-[90px]"
                          />
                        </div>

                        {/* Preview thumbnail */}
                        {playlistForm.id && !playlistForm.id.startsWith('PL_FAKE') && (
                          <div className="rounded-xl overflow-hidden border border-daara-gold/10">
                            <img
                              src={`https://img.youtube.com/vi/${playlistForm.id}/mqdefault.jpg`}
                              alt="Aperçu"
                              className="w-full h-28 object-cover"
                              onError={e => (e.currentTarget.style.display = 'none')}
                            />
                          </div>
                        )}

                        <div className="flex gap-3 pt-2">
                          {editingPlaylist && (
                            <button type="button" onClick={() => { setEditingPlaylist(null); setPlaylistForm({ key: '', id: '', title: '', desc: '', thumbnail: '' }); }}
                              className="flex-1 py-2.5 border border-daara-gold/20 text-daara-text-muted rounded-xl text-sm font-semibold hover:bg-daara-surface transition-colors">
                              Annuler
                            </button>
                          )}
                          <button type="submit" disabled={playlistSaving}
                            className="flex-1 py-2.5 bg-daara-gold text-daara-bg rounded-xl text-sm font-bold hover:bg-yellow-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                            <Save className="w-4 h-4" />
                            {playlistSaving ? 'Enregistrement...' : editingPlaylist ? 'Sauvegarder' : 'Créer'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>

                  {/* List */}
                  <div className="xl:col-span-3 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold text-daara-text">{playlists.length} playlist{playlists.length > 1 ? 's' : ''}</h2>
                    </div>
                    {playlists.map(p => (
                      <motion.div
                        key={p.key}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-daara-surface border border-daara-gold/10 rounded-2xl overflow-hidden hover:border-daara-gold/30 transition-colors group"
                      >
                        <div className="flex items-stretch">
                          {/* Thumbnail */}
                          <div className="w-28 sm:w-36 shrink-0 bg-daara-bg/50 overflow-hidden">
                            {p.id && !p.id.startsWith('PL_FAKE')
                              ? <img src={`https://img.youtube.com/vi/${p.id}/mqdefault.jpg`} alt={p.title} className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                              : <div className="w-full h-full flex items-center justify-center text-daara-gold/20"><Video className="w-10 h-10" /></div>
                            }
                          </div>
                          {/* Info */}
                          <div className="flex-1 p-4">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-bold text-daara-text">{p.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] bg-daara-gold/10 text-daara-gold px-2 py-0.5 rounded font-bold uppercase tracking-wider">{p.key}</span>
                                  <span className="text-xs text-daara-text-muted font-mono truncate max-w-[120px]">{p.id}</span>
                                </div>
                                <p className="text-xs text-daara-text-muted mt-2 line-clamp-2">{p.desc}</p>
                              </div>
                              <div className="flex gap-1 shrink-0">
                                <button onClick={() => handleEditPlaylist(p)}
                                  className="p-2 text-daara-text-muted hover:text-daara-gold hover:bg-daara-gold/10 rounded-xl transition-colors">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDeletePlaylist(p.key)}
                                  className="p-2 text-daara-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {playlists.length === 0 && (
                      <div className="text-center py-16 bg-daara-surface border border-daara-gold/10 rounded-2xl">
                        <Video className="w-12 h-12 text-daara-gold/20 mx-auto mb-3" />
                        <p className="text-daara-text-muted">Aucune playlist. Créez-en une avec le formulaire.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ══ USERS ═══════════════════════════════════════ */}
              {activeTab === 'users' && (
                <div className="space-y-4">
                  {/* Search */}
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-daara-text-muted" />
                      <input
                        type="text"
                        placeholder="Rechercher un utilisateur..."
                        value={userSearch}
                        onChange={e => setUserSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-daara-surface border border-daara-gold/15 rounded-xl text-daara-text text-sm focus:outline-none focus:border-daara-gold"
                      />
                    </div>
                    <span className="text-sm text-daara-text-muted">{filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''}</span>
                  </div>

                  {/* Table */}
                  <div className="bg-daara-surface border border-daara-gold/10 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-daara-gold/10 bg-daara-bg/30">
                            <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-daara-text-muted">Utilisateur</th>
                            <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-daara-text-muted">Email</th>
                            <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-daara-text-muted">Rôle</th>
                            <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-daara-text-muted">XP</th>
                            <th className="text-right px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-daara-text-muted">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-daara-gold/5">
                          {filteredUsers.map(u => (
                            <tr key={u.uid} className="hover:bg-daara-bg/30 transition-colors">
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-3">
                                  {u.photoURL
                                    ? <img src={u.photoURL} alt="" className="w-8 h-8 rounded-full border border-daara-gold/20" />
                                    : <div className="w-8 h-8 rounded-full bg-daara-gold/10 flex items-center justify-center text-daara-gold text-xs font-bold border border-daara-gold/20">{u.displayName?.charAt(0)}</div>
                                  }
                                  <span className="font-semibold text-daara-text text-sm">{u.displayName || '—'}</span>
                                </div>
                              </td>
                              <td className="px-5 py-3.5 text-sm text-daara-text-muted">{u.email}</td>
                              <td className="px-5 py-3.5">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${
                                  u.role === 'admin' ? 'bg-daara-gold/15 text-daara-gold' : 'bg-blue-500/10 text-blue-400'
                                }`}>
                                  {u.role === 'admin' && <Crown className="w-3 h-3" />}
                                  {u.role}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-sm font-semibold text-daara-text">{u.xp || 0} XP</td>
                              <td className="px-5 py-3.5 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleToggleRole(u.uid, u.role)}
                                    disabled={u.uid === user.uid}
                                    className="p-2 text-daara-text-muted hover:text-daara-gold hover:bg-daara-gold/10 rounded-xl transition-colors disabled:opacity-30"
                                    title="Changer le rôle"
                                  >
                                    <Crown className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(u.uid)}
                                    disabled={u.uid === user.uid}
                                    className="p-2 text-daara-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors disabled:opacity-30"
                                    title="Supprimer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {filteredUsers.length === 0 && (
                      <div className="text-center py-12">
                        <Users className="w-10 h-10 text-daara-gold/20 mx-auto mb-3" />
                        <p className="text-daara-text-muted text-sm">Aucun utilisateur trouvé.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ══ MODERATION ═══════════════════════════════════ */}
              {activeTab === 'moderation' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Forum posts */}
                  <div className="space-y-3">
                    <h2 className="text-lg font-bold text-daara-text flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-daara-gold" />
                      Messages Forum ({forumPosts.length})
                    </h2>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                      {forumPosts.map(post => (
                        <div key={post.id} className="bg-daara-surface border border-daara-gold/10 rounded-2xl p-4 hover:border-daara-gold/25 transition-colors">
                          <div className="flex items-start gap-3">
                            {post.userPhoto
                              ? <img src={post.userPhoto} alt="" className="w-8 h-8 rounded-full shrink-0" />
                              : <div className="w-8 h-8 rounded-full bg-daara-gold/10 flex items-center justify-center text-daara-gold text-xs shrink-0">{post.userName?.charAt(0)}</div>
                            }
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-daara-text text-sm">{post.userName}</span>
                                <span className="text-[10px] bg-daara-gold/10 text-daara-gold px-1.5 py-0.5 rounded font-bold">{post.category}</span>
                                <span className="text-[10px] text-daara-text-muted ml-auto">{formatRelative(post.createdAt)}</span>
                              </div>
                              <p className="text-xs text-daara-text-muted line-clamp-3 leading-relaxed">{post.content}</p>
                            </div>
                            <button onClick={() => handleDeletePost(post.id)}
                              className="p-2 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors shrink-0">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {forumPosts.length === 0 && <p className="text-daara-text-muted text-sm py-8 text-center">Aucun message.</p>}
                    </div>
                  </div>

                  {/* Comments */}
                  <div className="space-y-3">
                    <h2 className="text-lg font-bold text-daara-text flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-purple-400" />
                      Commentaires Playlists ({comments.length})
                    </h2>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                      {comments.map(c => (
                        <div key={c.id} className="bg-daara-surface border border-daara-gold/10 rounded-2xl p-4 hover:border-daara-gold/25 transition-colors">
                          <div className="flex items-start gap-3">
                            {c.userPhoto
                              ? <img src={c.userPhoto} alt="" className="w-8 h-8 rounded-full shrink-0" />
                              : <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 text-xs shrink-0">{c.userName?.charAt(0)}</div>
                            }
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-daara-text text-sm">{c.userName}</span>
                                <span className="text-[10px] text-daara-text-muted ml-auto">{formatRelative(c.createdAt)}</span>
                              </div>
                              <p className="text-xs text-daara-text-muted line-clamp-3 leading-relaxed">{c.content}</p>
                            </div>
                            <button onClick={() => handleDeleteComment(c.id)}
                              className="p-2 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors shrink-0">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {comments.length === 0 && <p className="text-daara-text-muted text-sm py-8 text-center">Aucun commentaire.</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* ══ SETTINGS ═════════════════════════════════════ */}
              {activeTab === 'settings' && (
                <div className="max-w-xl space-y-6">
                  <div className="bg-daara-surface border border-daara-gold/10 rounded-2xl p-6 space-y-5">
                    <h2 className="text-lg font-bold text-daara-text">Paramètres du site</h2>

                    {/* Maintenance toggle */}
                    <div className="flex items-center justify-between p-4 bg-daara-bg/50 rounded-xl border border-daara-gold/10">
                      <div>
                        <p className="font-semibold text-daara-text text-sm">Mode Maintenance</p>
                        <p className="text-xs text-daara-text-muted mt-0.5">Affiche un message aux visiteurs pendant les mises à jour</p>
                      </div>
                      <button onClick={() => setMaintenanceMode(!maintenanceMode)}>
                        {maintenanceMode
                          ? <ToggleRight className="w-8 h-8 text-daara-gold" />
                          : <ToggleLeft className="w-8 h-8 text-daara-text-muted" />
                        }
                      </button>
                    </div>

                    <div className="p-4 bg-daara-bg/50 rounded-xl border border-daara-gold/10">
                      <p className="font-semibold text-daara-text text-sm mb-1">Version du site</p>
                      <p className="text-xs text-daara-text-muted">Iqra Quest v2.0 — React + Vite + Firebase</p>
                    </div>

                    <div className="p-4 bg-daara-bg/50 rounded-xl border border-daara-gold/10">
                      <p className="font-semibold text-daara-text text-sm mb-1">Compte Admin</p>
                      <p className="text-xs text-daara-text-muted">{user.email}</p>
                      <p className="text-xs text-daara-gold mt-1">✓ Compte administrateur vérifié</p>
                    </div>

                    <button onClick={logout}
                      className="w-full py-3 border border-red-500/20 text-red-400 rounded-xl text-sm font-bold hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2">
                      <LogOut className="w-4 h-4" />
                      Déconnexion
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
