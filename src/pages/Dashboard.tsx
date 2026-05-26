import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { Flame, Trophy, Award, BookOpen, Trash2, Plus, Edit, Save, X, Calendar, ClipboardList, Target, Check, Star, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Leaderboard } from '../components/Leaderboard';
interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

const BADGES_LIST = [
  { id: 'welcome', name: 'Première Étape', desc: 'Création de votre compte sur Iqra Quest.', icon: BookOpen, color: 'from-blue-500 to-teal-500' },
  { id: 'streak_3', name: 'Apprenant Fidèle', desc: 'Atteindre une série d\'apprentissage de 3 jours consécutifs.', icon: Flame, color: 'from-orange-500 to-red-500' },
  { id: 'streak_7', name: 'Pilier de Discipline', desc: 'Atteindre une série de 7 jours consécutifs.', icon: Flame, color: 'from-purple-500 to-pink-500' },
  { id: 'xp_500', name: 'Compagnon du Savoir', desc: 'Accumuler plus de 500 points d\'expérience.', icon: Trophy, color: 'from-yellow-500 to-amber-500' },
  { id: 'xp_1000', name: 'Puits de Sagesse', desc: 'Accumuler plus de 1000 points d\'expérience.', icon: Award, color: 'from-indigo-500 to-purple-500' },
  { id: 'quiz_perfect', name: 'Savant', desc: 'Obtenir un score parfait à un quiz.', icon: Trophy, color: 'from-emerald-500 to-teal-500' },
  { id: 'note_master', name: 'Scribe de la Daara', desc: 'Prendre sa première note d\'étude.', icon: ClipboardList, color: 'from-pink-500 to-rose-500' }
];

const OFFERS_LIST = [
  {
    id: 'free',
    name: 'Apprenant',
    price: '0 €',
    period: '/ mois',
    desc: 'Accès complet aux modules de base pour débuter sereinement.',
    features: [
      'Accès aux 6 modules de leçons',
      'Quiz du jour illimités',
      'Accès au forum public',
      'Tableau de bord standard'
    ],
    cta: 'Plan actuel',
    popular: false,
    gradient: 'from-neutral-500/10 to-neutral-600/15 border-white/10 text-neutral-400'
  },
  {
    id: 'etudiant',
    name: 'Étudiant du Savoir',
    price: '4,99 €',
    period: '/ mois',
    desc: 'Renforcez votre apprentissage avec des fonctionnalités d\'IA avancées.',
    features: [
      'Toutes les fonctionnalités gratuites',
      'Accès prioritaire illimité au Guide IA',
      'Statistiques d\'étude détaillées',
      'Badge doré exclusif sur le profil',
      'Zéro publicité (soutien Daara)'
    ],
    cta: 'Soutenir la Daara',
    popular: true,
    gradient: 'from-daara-gold/20 to-amber-500/10 border-daara-gold/40 text-daara-gold'
  },
  {
    id: 'protecteur',
    name: 'Protecteur de la Daara',
    price: '14,99 €',
    period: '/ mois',
    desc: 'Devenez un pilier actif de notre mission de transmission du savoir.',
    features: [
      'Tous les avantages d\'Étudiant du Savoir',
      'Sponsor officiel de la plateforme',
      'Rapports d\'activité mensuels',
      'Invitation aux webinaires privés',
      'Mentorat académique'
    ],
    cta: 'Devenir Mécène',
    popular: false,
    gradient: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400'
  }
];

const getTodayDateKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

export function Dashboard() {
  const { user, profile, earnXP, unlockBadge, updateUserProfile } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [isEditingNote, setIsEditingNote] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Offers and Goals State
  const [activePlan, setActivePlan] = useState<string>(() => localStorage.getItem('iq_membership_plan') || 'free');
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [selectedPlanName, setSelectedPlanName] = useState('');
  const [dailyGoal, setDailyGoal] = useState<number>(() => {
    return Number(localStorage.getItem('iq_daily_goal_xp') || '30');
  });
  const [xpToday, setXpToday] = useState<number>(0);

  // Profile Edit State
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editPhotoURL, setEditPhotoURL] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Monitor real-time XP gains today
  useEffect(() => {
    if (!profile) return;
    const dateKey = getTodayDateKey();
    const storedDate = localStorage.getItem('iq_xp_today_date');
    const storedXp = Number(localStorage.getItem('iq_xp_today_value') || '0');
    
    const prevCumulativeXp = Number(localStorage.getItem('iq_xp_cumulative_prev') || String(profile.xp || 0));
    localStorage.setItem('iq_xp_cumulative_prev', String(profile.xp || 0));

    if (storedDate !== dateKey) {
      localStorage.setItem('iq_xp_today_date', dateKey);
      localStorage.setItem('iq_xp_today_value', '0');
      setXpToday(0);
    } else {
      const diff = (profile.xp || 0) - prevCumulativeXp;
      if (diff > 0) {
        const newValue = storedXp + diff;
        localStorage.setItem('iq_xp_today_value', String(newValue));
        setXpToday(newValue);
      } else {
        setXpToday(storedXp);
      }
    }
  }, [profile?.xp, profile]);

  const handleSupportPlan = (planId: string, planName: string) => {
    if (planId === 'free') {
      localStorage.setItem('iq_membership_plan', 'free');
      setActivePlan('free');
      return;
    }
    localStorage.setItem('iq_membership_plan', planId);
    setActivePlan(planId);
    setSelectedPlanName(planName);
    setShowSupportModal(true);
  };

  const openEditProfile = () => {
    if (profile) {
      setEditDisplayName(profile.displayName || '');
      setEditPhotoURL(profile.photoURL || '');
      setShowEditProfile(true);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDisplayName.trim()) return;
    setIsSavingProfile(true);
    try {
      await updateUserProfile(editDisplayName.trim(), editPhotoURL.trim());
      setShowEditProfile(false);
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Load notes from Firestore
  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, 'user_notes'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedNotes: Note[] = snapshot.docs.map(d => {
        const data = d.data();
        const dateObj = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
        return {
          id: d.id,
          title: data.title || '',
          content: data.content || '',
          createdAt: dateObj.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })
        };
      });
      setNotes(loadedNotes);
    }, (error) => {
      console.error("Error loading notes from Firestore:", error);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim() || !user) return;

    try {
      await addDoc(collection(db, 'user_notes'), {
        userId: user.uid,
        title: noteTitle.trim(),
        content: noteContent.trim(),
        createdAt: serverTimestamp()
      });

      setNoteTitle('');
      setNoteContent('');
      setShowAddForm(false);

      // XP & Badge Rewards for writing first note
      earnXP(15);
      if (profile && !profile.badges?.includes('note_master')) {
        unlockBadge('note_master');
      }
    } catch (e) {
      console.error("Error saving note to Firestore:", e);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (confirm('Voulez-vous supprimer cette note ?')) {
      try {
        await deleteDoc(doc(db, 'user_notes', id));
      } catch (e) {
        console.error("Error deleting note from Firestore:", e);
      }
    }
  };

  const startEditing = (note: Note) => {
    setIsEditingNote(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editTitle.trim() || !editContent.trim()) return;

    try {
      await updateDoc(doc(db, 'user_notes', id), {
        title: editTitle.trim(),
        content: editContent.trim()
      });
      setIsEditingNote(null);
    } catch (e) {
      console.error("Error updating note in Firestore:", e);
    }
  };

  if (!user || !profile) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <Trophy className="w-16 h-16 text-daara-gold/40 mb-6 animate-pulse" />
        <h2 className="text-3xl font-serif font-bold text-daara-text mb-4">Tableau de Bord Personnel</h2>
        <p className="text-daara-text-muted max-w-md mb-8">
          Veuillez vous connecter avec votre compte Google pour suivre votre progression, gagner de l'XP, maintenir votre série et prendre des notes.
        </p>
      </div>
    );
  }

  // Calculate Level based on XP
  const xp = profile.xp || 0;
  let level = 1;
  let xpForNextLevel = 100;
  let xpForPrevLevel = 0;

  if (xp > 1000) {
    level = 5;
    xpForNextLevel = 5000; // Cap
    xpForPrevLevel = 1000;
  } else if (xp > 500) {
    level = 4;
    xpForNextLevel = 1000;
    xpForPrevLevel = 500;
  } else if (xp > 250) {
    level = 3;
    xpForNextLevel = 500;
    xpForPrevLevel = 250;
  } else if (xp > 100) {
    level = 2;
    xpForNextLevel = 250;
    xpForPrevLevel = 100;
  }

  const levelProgress = ((xp - xpForPrevLevel) / (xpForNextLevel - xpForPrevLevel)) * 100;

  return (
    <div className="min-h-screen bg-daara-bg py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Profile Header Stats */}
        <div className="bg-daara-surface rounded-3xl p-8 border border-daara-gold/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-80 aspect-square bg-daara-gold/5 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              {profile.photoURL ? (
                <img src={profile.photoURL} alt={profile.displayName} className="w-24 h-24 rounded-full border-4 border-daara-gold/50 shadow-lg object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-daara-gold/20 flex items-center justify-center border-4 border-daara-gold/50 text-daara-gold text-4xl font-bold">
                  {profile.displayName?.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl md:text-4xl font-serif font-bold text-daara-text">{profile.displayName}</h1>
                  <button 
                    onClick={openEditProfile}
                    className="p-1.5 bg-daara-gold/10 hover:bg-daara-gold/20 text-daara-gold rounded-full transition-colors"
                    title="Modifier le profil"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-daara-text-muted mt-1">{profile.email}</p>
                <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="bg-daara-gold/15 text-daara-gold border border-daara-gold/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    Niveau {level}
                  </span>
                  {profile.role === 'admin' && (
                    <span className="bg-red-500/15 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      Administrateur
                    </span>
                  )}
                  {activePlan !== 'free' && (
                    <span className="bg-gradient-to-r from-daara-gold to-yellow-500 text-daara-bg border border-daara-gold/30 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-md animate-pulse">
                      ★ {activePlan === 'etudiant' ? 'Étudiant du Savoir' : 'Protecteur de la Daara'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-6 sm:gap-12 shrink-0 bg-daara-bg/50 border border-daara-gold/10 p-6 rounded-2xl">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Flame className="w-8 h-8 text-orange-500 fill-orange-500/20" />
                  <span className="text-3xl font-bold text-daara-text">{profile.streak || 0}</span>
                </div>
                <p className="text-xs text-daara-text-muted uppercase tracking-wider mt-1">Série Jours</p>
              </div>
              <div className="w-[1px] bg-daara-gold/20" />
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="w-8 h-8 text-daara-gold fill-daara-gold/15" />
                  <span className="text-3xl font-bold text-daara-text">{xp}</span>
                </div>
                <p className="text-xs text-daara-text-muted uppercase tracking-wider mt-1">Total XP</p>
              </div>
              <div className="w-[1px] bg-daara-gold/20" />
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Award className="w-8 h-8 text-pink-500" />
                  <span className="text-3xl font-bold text-daara-text">{profile.badges?.length || 0}</span>
                </div>
                <p className="text-xs text-daara-text-muted uppercase tracking-wider mt-1">Badges</p>
              </div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="mt-8 pt-6 border-t border-daara-gold/10 relative z-10">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-daara-text-muted">Niveau {level}</span>
              <span className="font-bold text-daara-gold">{xp} / {xpForNextLevel} XP</span>
              <span className="text-daara-text-muted">Niveau {level + 1}</span>
            </div>
            <div className="w-full h-4 bg-daara-bg border border-daara-gold/20 rounded-full overflow-hidden p-[2px]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${levelProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-daara-gold to-daara-gold-light rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Dashboard Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Badges / Trophies */}
          <div className="lg:col-span-1 space-y-6">
            {/* Objectif Quotidien Widget */}
            <div className="bg-daara-surface rounded-3xl p-6 border border-daara-gold/20 shadow-xl space-y-5">
              <h2 className="text-2xl font-serif font-bold text-daara-text flex items-center gap-3">
                <Target className="w-6 h-6 text-daara-gold" />
                Objectif Quotidien
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-daara-text-muted">Aujourd'hui :</span>
                  <span className="font-bold text-daara-gold">{xpToday} / {dailyGoal} XP</span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full h-3 bg-daara-bg border border-daara-gold/15 rounded-full overflow-hidden p-[1px]">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (xpToday / dailyGoal) * 100)}%` }}
                    className="h-full bg-gradient-to-r from-daara-gold to-amber-500 rounded-full"
                    transition={{ type: 'spring', damping: 20 }}
                  />
                </div>

                {/* Speed Selector */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {[
                    { val: 15, label: 'Tranquille' },
                    { val: 30, label: 'Régulier' },
                    { val: 60, label: 'Intense' }
                  ].map(g => (
                    <button
                      key={g.val}
                      onClick={() => {
                        localStorage.setItem('iq_daily_goal_xp', String(g.val));
                        setDailyGoal(g.val);
                      }}
                      className={`py-2 px-1 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${
                        dailyGoal === g.val 
                          ? 'bg-daara-gold text-daara-bg border-daara-gold shadow-md shadow-daara-gold/10' 
                          : 'bg-daara-bg/50 border-daara-gold/10 text-daara-text-muted hover:border-daara-gold/25'
                      }`}
                    >
                      {g.label} ({g.val} XP)
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-daara-surface rounded-3xl p-6 border border-daara-gold/20 shadow-xl">
              <h2 className="text-2xl font-serif font-bold text-daara-text mb-6 flex items-center gap-3">
                <Award className="w-6 h-6 text-daara-gold" />
                Vos Badges
              </h2>
              <div className="space-y-4">
                {BADGES_LIST.map(badge => {
                  const isUnlocked = profile.badges?.includes(badge.id);
                  const Icon = badge.icon;
                  return (
                    <div 
                      key={badge.id}
                      className={`flex gap-4 p-4 rounded-2xl border transition-all duration-300 ${
                        isUnlocked 
                          ? 'bg-daara-bg/30 border-daara-gold/30 opacity-100' 
                          : 'bg-daara-surface-hover/30 border-transparent opacity-40'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${isUnlocked ? badge.color : 'from-gray-700 to-gray-800'} flex items-center justify-center text-white shrink-0 shadow-md`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-daara-text text-sm sm:text-base">{badge.name}</h4>
                        <p className="text-xs text-daara-text-muted leading-relaxed mt-1">{badge.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Personal Notes */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-daara-surface rounded-3xl p-6 md:p-8 border border-daara-gold/20 shadow-xl">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-serif font-bold text-daara-text flex items-center gap-3">
                  <ClipboardList className="w-6 h-6 text-daara-gold" />
                  Notes d'Étude Personnelles
                </h2>
                {!showAddForm && (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="inline-flex items-center gap-2 bg-daara-gold text-daara-bg px-4 py-2 rounded-xl text-sm font-bold hover:scale-105 transition-transform shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    Nouvelle Note
                  </button>
                )}
              </div>

              {/* Add Note Form */}
              <AnimatePresence>
                {showAddForm && (
                  <motion.form 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleAddNote}
                    className="bg-daara-bg/50 border border-daara-gold/20 p-5 rounded-2xl mb-8 space-y-4 overflow-hidden"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-daara-gold text-sm uppercase tracking-wider">Ajouter une note</h3>
                      <button 
                        type="button" 
                        onClick={() => setShowAddForm(false)}
                        className="p-1 text-daara-text-muted hover:text-daara-text hover:bg-daara-surface rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <input 
                      type="text"
                      placeholder="Sujet de la note (ex: Les ablutions majeures)"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      className="w-full px-4 py-2.5 bg-daara-surface border border-daara-gold/20 rounded-xl text-daara-text placeholder-daara-text-muted focus:outline-none focus:border-daara-gold"
                      required
                    />
                    <textarea 
                      placeholder="Notez ici les enseignements clés, les versets ou hadiths importants..."
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      className="w-full p-4 bg-daara-surface border border-daara-gold/20 rounded-xl text-daara-text placeholder-daara-text-muted focus:outline-none focus:border-daara-gold resize-none min-h-[120px]"
                      required
                    />
                    <div className="flex justify-end gap-2">
                      <button 
                        type="button" 
                        onClick={() => setShowAddForm(false)}
                        className="px-4 py-2 bg-transparent text-daara-text-muted hover:text-daara-text font-bold text-sm"
                      >
                        Annuler
                      </button>
                      <button 
                        type="submit"
                        className="px-6 py-2 bg-daara-gold text-daara-bg font-bold rounded-xl text-sm hover:bg-yellow-600 transition-colors shadow-md"
                      >
                        Sauvegarder
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Notes List */}
              <div className="space-y-6">
                {notes.map(note => (
                  <div 
                    key={note.id}
                    className="p-6 rounded-2xl bg-daara-surface/50 border border-daara-gold/10 hover:border-daara-gold/30 transition-all shadow-sm"
                  >
                    {isEditingNote === note.id ? (
                      <div className="space-y-4">
                        <input 
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full px-3 py-2 bg-daara-bg border border-daara-gold/20 rounded-lg text-daara-text text-sm font-bold focus:outline-none focus:border-daara-gold"
                        />
                        <textarea 
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full p-3 bg-daara-bg border border-daara-gold/20 rounded-lg text-daara-text text-sm focus:outline-none focus:border-daara-gold resize-none min-h-[100px]"
                        />
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setIsEditingNote(null)}
                            className="p-2 text-daara-text-muted hover:text-daara-text rounded-xl"
                            title="Annuler"
                          >
                            <X className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleSaveEdit(note.id)}
                            className="p-2 bg-daara-gold text-daara-bg rounded-xl hover:bg-yellow-600"
                            title="Sauvegarder"
                          >
                            <Save className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between items-start gap-4 mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-daara-text font-serif">{note.title}</h3>
                            <span className="flex items-center gap-1.5 text-xs text-daara-text-muted mt-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {note.createdAt}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => startEditing(note)}
                              className="p-2 text-daara-text-muted hover:text-daara-gold hover:bg-daara-gold/10 rounded-xl transition-colors"
                              title="Modifier cette note"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-500/10 rounded-xl transition-colors"
                              title="Supprimer cette note"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-daara-text-muted text-sm leading-relaxed whitespace-pre-wrap mt-3">
                          {note.content}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {notes.length === 0 && (
                  <div className="text-center py-16">
                    <ClipboardList className="w-16 h-16 text-daara-gold/30 mx-auto mb-4" />
                    <p className="text-daara-text-muted text-lg">Vous n'avez pas encore pris de notes.</p>
                    <p className="text-daara-text-muted/70 mt-1">Cliquez sur « Nouvelle Note » ci-dessus pour enregistrer vos premiers enseignements !</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* ══ SECTION CLASSEMENT (LEADERBOARD) ════════════════════ */}
        <div className="mb-12">
          <Leaderboard />
        </div>

        {/* ══ SECTION MEMBRES & OFFRES DE SOUTIEN ════════════════════ */}
        <div className="bg-daara-surface rounded-3xl p-6 md:p-8 border border-daara-gold/20 shadow-xl space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="text-3xl font-serif font-bold text-daara-text">Soutenir Iqra Quest</h2>
            <p className="text-sm text-daara-text-muted leading-relaxed">
              Iqra Quest est une plateforme gratuite. Vos contributions aident à financer le serveur, l'API d'IA et le développement de cours interactifs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {OFFERS_LIST.map((plan) => {
              const isActive = activePlan === plan.id;
              return (
                <div 
                  key={plan.id}
                  className={`bg-daara-bg/40 border rounded-3xl p-6 flex flex-col justify-between relative transition-all duration-300 hover:-translate-y-1 ${
                    plan.popular ? 'ring-2 ring-daara-gold' : ''
                  }`}
                  style={{
                    borderColor: isActive ? 'rgba(229,184,92,0.6)' : 'rgba(229,184,92,0.1)'
                  }}
                >
                  {plan.popular && (
                    <span className="absolute top-0 right-6 -translate-y-1/2 bg-daara-gold text-daara-bg text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                      Le plus populaire
                    </span>
                  )}
                  
                  <div className="space-y-4">
                    <h3 className="text-xl font-serif font-bold text-daara-text">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-daara-gold">{plan.price}</span>
                      <span className="text-xs text-daara-text-muted">{plan.period}</span>
                    </div>
                    <p className="text-xs text-daara-text-muted leading-relaxed min-h-[40px]">{plan.desc}</p>
                    
                    <div className="w-full h-px bg-daara-gold/10 my-2" />
                    
                    <ul className="space-y-2.5 text-xs text-daara-text">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-daara-gold shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleSupportPlan(plan.id, plan.name)}
                    disabled={isActive && plan.id === 'free'}
                    className={`w-full py-3 rounded-xl text-xs font-bold transition-all mt-6 ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : plan.popular
                        ? 'bg-daara-gold text-daara-bg hover:bg-yellow-500 shadow-lg shadow-daara-gold/15'
                        : 'bg-daara-surface border border-daara-gold/20 text-daara-gold hover:bg-daara-gold/10'
                    } disabled:opacity-50`}
                  >
                    {isActive ? '✓ Plan Actif' : plan.cta}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* modal de remerciement simulation */}
      <AnimatePresence>
        {showSupportModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSupportModal(false)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-daara-surface border border-daara-gold/20 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl relative"
            >
              <div className="w-16 h-16 bg-gradient-to-tr from-daara-gold to-yellow-500 rounded-full flex items-center justify-center text-daara-bg mx-auto shadow-lg shadow-daara-gold/20 animate-bounce">
                <Sparkles className="w-8 h-8 fill-current" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-serif font-bold text-daara-text">BarakAllahu Feek ! 🤲</h3>
                <p className="text-xs text-daara-gold font-bold uppercase tracking-widest">
                  Abonnement activé : {selectedPlanName}
                </p>
                <p className="text-sm text-daara-text-muted leading-relaxed">
                  Merci infiniment pour votre soutien à Iqra Quest. Votre contribution permet de maintenir nos services et de propager le savoir bénéfique. Que Dieu vous récompense !
                </p>
              </div>

              <button
                onClick={() => setShowSupportModal(false)}
                className="w-full py-3 bg-daara-gold text-daara-bg rounded-xl text-xs font-bold hover:bg-yellow-500 transition-colors shadow-md"
              >
                Fermer & Continuer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditProfile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-daara-surface border border-daara-gold/20 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-serif font-bold text-daara-text">Modifier votre profil</h3>
                <button 
                  onClick={() => setShowEditProfile(false)}
                  className="p-2 text-daara-text-muted hover:text-daara-text bg-daara-bg/50 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-daara-text-muted mb-1">Pseudo</label>
                  <input
                    type="text"
                    value={editDisplayName}
                    onChange={e => setEditDisplayName(e.target.value)}
                    className="w-full px-4 py-3 bg-daara-bg border border-daara-gold/20 rounded-xl text-daara-text focus:outline-none focus:border-daara-gold transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-daara-text-muted mb-1">URL de votre photo (Avatar)</label>
                  <input
                    type="url"
                    value={editPhotoURL}
                    onChange={e => setEditPhotoURL(e.target.value)}
                    placeholder="https://exemple.com/photo.jpg"
                    className="w-full px-4 py-3 bg-daara-bg border border-daara-gold/20 rounded-xl text-daara-text focus:outline-none focus:border-daara-gold transition-colors"
                  />
                  <p className="text-xs text-daara-text-muted mt-1">Laissez vide ou modifiez le lien pour utiliser un avatar personnalisé.</p>
                </div>
                
                {editPhotoURL && (
                  <div className="flex justify-center my-4">
                    <img src={editPhotoURL} alt="Aperçu" className="w-20 h-20 rounded-full border-2 border-daara-gold/50 object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  </div>
                )}

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEditProfile(false)}
                    className="flex-1 py-3 bg-daara-bg border border-daara-gold/20 text-daara-text rounded-xl font-bold hover:bg-daara-surface transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="flex-1 py-3 bg-daara-gold text-daara-bg rounded-xl font-bold hover:bg-yellow-500 transition-colors shadow-md disabled:opacity-50"
                  >
                    {isSavingProfile ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
