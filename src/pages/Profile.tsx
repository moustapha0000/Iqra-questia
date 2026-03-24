import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Leaderboard } from '../components/Leaderboard';
import { LogIn, User, BookOpen, Trophy, Flame, Star } from 'lucide-react';
import { motion } from 'motion/react';

export function Profile() {
  const { user, signInWithGoogle } = useAuth();
  const [quizStats, setQuizStats] = useState({
    level: 1,
    xp: 0,
    streak: 0,
    gems: 0,
    completedUnits: 0
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('iqraQuestState');
      if (saved) {
        const parsed = JSON.parse(saved);
        setQuizStats({
          level: parsed.level || 1,
          xp: parsed.xp || 0,
          streak: parsed.streak || 0,
          gems: parsed.gems || 0,
          completedUnits: parsed.completedUnits?.length || 0
        });
      }
    } catch (e) {
      console.error("Failed to load quiz stats", e);
    }
  }, []);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="bg-daara-surface p-8 rounded-3xl shadow-xl border border-daara-gold/20 max-w-md w-full">
          <div className="w-20 h-20 bg-daara-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-daara-gold" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-daara-text mb-4">Espace Membre</h2>
          <p className="text-daara-text-muted mb-8">
            Connectez-vous pour suivre votre progression, sauvegarder vos scores au quiz et participer au classement global.
          </p>
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-2 bg-daara-gold text-white px-6 py-3 rounded-xl font-bold hover:bg-daara-gold/90 transition-colors"
          >
            <LogIn className="w-5 h-5" />
            Se connecter avec Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 max-w-6xl mx-auto space-y-12">
      {/* Profil Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-daara-surface rounded-3xl p-8 shadow-xl border border-daara-gold/20 flex flex-col md:flex-row items-center gap-8"
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt={user.displayName || 'User'} className="w-32 h-32 rounded-full border-4 border-daara-gold/30 shadow-lg" />
        ) : (
          <div className="w-32 h-32 rounded-full bg-daara-gold/20 flex items-center justify-center text-daara-gold font-bold text-4xl shadow-lg border-4 border-daara-gold/30">
            {user.displayName?.charAt(0).toUpperCase() || 'U'}
          </div>
        )}
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-daara-text mb-2">{user.displayName}</h1>
          <p className="text-daara-text-muted text-lg">{user.email}</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-daara-gold/10 text-daara-gold px-4 py-2 rounded-full text-sm font-bold">
            <User className="w-4 h-4" />
            Membre Iqra Quest
          </div>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Progression (Placeholder for now, can be expanded later) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-daara-surface rounded-3xl p-8 shadow-xl border border-daara-gold/20"
        >
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-8 h-8 text-daara-gold" />
            <h2 className="text-2xl font-serif font-bold text-daara-text">Ma Progression</h2>
          </div>
          <div className="space-y-6">
            <p className="text-daara-text-muted">
              Votre progression dans le quiz Iqra Quest.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-daara-bg rounded-2xl border border-daara-gold/10 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-daara-gold/20 rounded-full flex items-center justify-center mb-2">
                  <Star className="w-6 h-6 text-daara-gold fill-daara-gold" />
                </div>
                <p className="text-sm text-daara-text-muted">Niveau</p>
                <p className="font-bold text-2xl text-daara-text">{quizStats.level}</p>
              </div>
              
              <div className="p-4 bg-daara-bg rounded-2xl border border-daara-gold/10 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mb-2">
                  <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
                </div>
                <p className="text-sm text-daara-text-muted">Série (Jours)</p>
                <p className="font-bold text-2xl text-daara-text">{quizStats.streak}</p>
              </div>
              
              <div className="p-4 bg-daara-bg rounded-2xl border border-daara-gold/10 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-2">
                  <Trophy className="w-6 h-6 text-blue-500" />
                </div>
                <p className="text-sm text-daara-text-muted">Unités Complétées</p>
                <p className="font-bold text-2xl text-daara-text">{quizStats.completedUnits}</p>
              </div>
              
              <div className="p-4 bg-daara-bg rounded-2xl border border-daara-gold/10 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mb-2">
                  <BookOpen className="w-6 h-6 text-emerald-500" />
                </div>
                <p className="text-sm text-daara-text-muted">XP Total</p>
                <p className="font-bold text-2xl text-daara-text">{quizStats.xp}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Leaderboard */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Leaderboard />
        </motion.div>
      </div>
    </div>
  );
}
