import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { Flame, Trophy, Award, BookOpen, Trash2, Plus, Edit, Save, X, Calendar, ClipboardList } from 'lucide-react';

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

export function Dashboard() {
  const { user, profile, earnXP, unlockBadge } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [isEditingNote, setIsEditingNote] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Load notes from localStorage
  useEffect(() => {
    if (user) {
      const savedNotes = localStorage.getItem(`iqra_notes_${user.uid}`);
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      } else {
        setNotes([]);
      }
    }
  }, [user]);

  // Save notes to localStorage
  const saveNotes = (updatedNotes: Note[]) => {
    if (user) {
      localStorage.setItem(`iqra_notes_${user.uid}`, JSON.stringify(updatedNotes));
      setNotes(updatedNotes);
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim() || !user) return;

    const newNote: Note = {
      id: Date.now().toString(),
      title: noteTitle.trim(),
      content: noteContent.trim(),
      createdAt: new Date().toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    };

    const updatedNotes = [newNote, ...notes];
    saveNotes(updatedNotes);
    
    setNoteTitle('');
    setNoteContent('');
    setShowAddForm(false);

    // XP & Badge Rewards for writing first note
    earnXP(15);
    if (profile && !profile.badges.includes('note_master')) {
      unlockBadge('note_master');
    }
  };

  const handleDeleteNote = (id: string) => {
    if (confirm('Voulez-vous supprimer cette note ?')) {
      const updatedNotes = notes.filter(n => n.id !== id);
      saveNotes(updatedNotes);
    }
  };

  const startEditing = (note: Note) => {
    setIsEditingNote(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const handleSaveEdit = (id: string) => {
    if (!editTitle.trim() || !editContent.trim()) return;

    const updatedNotes = notes.map(n => {
      if (n.id === id) {
        return { ...n, title: editTitle.trim(), content: editContent.trim() };
      }
      return n;
    });

    saveNotes(updatedNotes);
    setIsEditingNote(null);
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
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-daara-text">{profile.displayName}</h1>
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

      </div>
    </div>
  );
}
