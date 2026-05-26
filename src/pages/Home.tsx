import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { PageType, PlaylistInfo } from '../types';
import { 
  BookOpen, PlayCircle, BookText, Heart, Star, 
  HelpCircle, Info, MessageSquare, Users, CheckCircle, 
  Trophy, BookOpenCheck, ArrowRight, Activity, Clock 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserProgress, UserProgressMap } from '../utils/progressService';

interface HomeProps {
  setPage: (page: PageType) => void;
  playlists: Record<string, PlaylistInfo>;
}

const ICON_MAP: Record<string, React.ElementType> = {
  fondements: BookOpen,
  piliers: Star,
  fiqh: BookText,
  hadiths: MessageSquare,
  prophetes: Users,
  burdah: Heart,
  apropos: Info,
};

const COLOR_MAP: Record<string, string> = {
  fondements: 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30',
  piliers: 'from-amber-500/20 to-yellow-500/20 text-amber-400 border-amber-500/30',
  fiqh: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
  hadiths: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30',
  prophetes: 'from-sky-500/20 to-blue-500/20 text-sky-400 border-sky-500/30',
  burdah: 'from-rose-500/20 to-red-500/20 text-rose-400 border-rose-500/30',
};

export function Home({ setPage, playlists }: HomeProps) {
  const { user } = useAuth();
  const [userProgress, setUserProgress] = useState<UserProgressMap>({});
  const [learnerCount, setLearnerCount] = useState(1482);

  // Animate learner count slightly to simulate active users
  useEffect(() => {
    const interval = setInterval(() => {
      setLearnerCount(prev => prev + Math.floor(Math.random() * 2));
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Fetch progress if user logged in
  useEffect(() => {
    if (user) {
      getUserProgress(user.uid).then(progress => {
        setUserProgress(progress);
      });
    }
  }, [user]);

  const getCardIcon = (key: string) => ICON_MAP[key] || PlayCircle;
  const getCardColor = (key: string) => COLOR_MAP[key] || 'from-daara-gold/15 to-amber-500/15 text-daara-gold border-daara-gold/20';

  // Build dynamic cards list
  const dynamicCards = Object.entries(playlists).map(([key, info]) => ({
    id: key,
    title: info.title,
    desc: info.desc,
    icon: getCardIcon(key),
    color: getCardColor(key),
    isStatic: false
  }));

  // Append static About page
  dynamicCards.push({
    id: 'apropos',
    title: 'À propos',
    desc: 'Notre mission et notre vision pour la transmission du savoir.',
    icon: Info,
    color: 'from-neutral-500/20 to-neutral-600/20 text-neutral-400 border-neutral-500/20',
    isStatic: true
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-5xl mx-auto"
    >
      {/* Hero section */}
      <div className="text-center mb-16 pt-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] aspect-square bg-daara-gold/5 rounded-full blur-[100px] pointer-events-none" />

        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-block mb-6 px-6 py-2 rounded-full border border-daara-gold/30 bg-daara-surface/50 text-daara-gold font-medium text-sm tracking-widest uppercase relative z-10"
        >
          Bienvenue sur Iqra Quest
        </motion.div>
        
        <h1 className="text-5xl md:text-7xl font-serif font-bold text-daara-text mb-6 leading-tight relative z-10">
          La plateforme islamique <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-daara-gold to-daara-gold-light">
            d’apprentissage pour tous
          </span>
        </h1>
        
        <p className="text-3xl md:text-4xl font-serif text-daara-gold-light mb-8 opacity-90" dir="rtl">
          بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </p>

        {/* Learner Counter Widget */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-2 text-daara-text-muted text-xs font-semibold uppercase tracking-wider mb-8 bg-daara-surface/40 border border-daara-gold/10 px-4 py-2 rounded-full w-fit mx-auto backdrop-blur-sm relative z-10"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span>{learnerCount} étudiants en ligne aujourd'hui</span>
        </motion.div>

        <div className="relative max-w-2xl mx-auto p-8 rounded-3xl bg-daara-surface/80 backdrop-blur-sm shadow-2xl border border-daara-gold/20 mb-12">
          <div className="absolute -top-6 -left-2 text-7xl text-daara-gold/10 font-serif">"</div>
          <p className="text-xl md:text-2xl font-serif italic text-daara-text mb-6 relative z-10 leading-relaxed">
            La recherche du savoir est une obligation pour chaque musulman.
          </p>
          <p className="text-sm font-medium text-daara-gold uppercase tracking-widest">
            — Prophète Muhammad ﷺ <span className="lowercase normal-case text-daara-text-muted">(Sunan Ibn Mājah, 224)</span>
          </p>
        </div>

        <button
          onClick={() => setPage('fondements')}
          className="relative z-10 inline-flex items-center gap-3 bg-gradient-to-r from-daara-gold to-daara-gold-light hover:from-daara-gold-light hover:to-daara-gold text-daara-bg px-10 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-lg shadow-daara-gold/20"
        >
          <PlayCircle className="w-6 h-6" />
          Commencer l'apprentissage
        </button>
      </div>

      {/* Quiz du Jour Widget */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onClick={() => setPage('quiz')}
        className="cursor-pointer bg-gradient-to-r from-daara-surface to-[#0e2718] border border-daara-gold/30 rounded-3xl p-6 mb-12 shadow-xl hover:border-daara-gold transition-all duration-300 group relative overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-daara-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-daara-gold/10 border border-daara-gold/20 flex items-center justify-center text-daara-gold shrink-0">
              <Trophy className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg text-daara-text">Le Quiz du Jour</h3>
                <span className="text-[10px] bg-daara-gold/20 text-daara-gold font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  +15 XP
                </span>
              </div>
              <p className="text-xs text-daara-text-muted mt-0.5">
                Renforcez votre foi aujourd'hui avec 3 questions rapides sur la croyance et la pratique.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-daara-gold font-bold group-hover:translate-x-1 transition-transform shrink-0">
            <span>Relever le défi</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </motion.div>

      {/* Learning Modules / Playlists */}
      <div className="mb-8">
        <h2 className="text-2xl font-serif font-bold text-daara-text mb-6 flex items-center gap-2">
          <BookOpenCheck className="w-5 h-5 text-daara-gold" />
          Modules d'Apprentissage
        </h2>
      </div>

      <div id="learning-categories" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
        {dynamicCards.map((card, idx) => {
          const Icon = card.icon;
          const isCompleted = !card.isStatic && !!userProgress[card.id]?.completed;
          
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx }}
              onClick={() => setPage(card.id as PageType)}
              className="group cursor-pointer bg-daara-surface p-8 rounded-3xl shadow-lg border border-daara-gold/10 hover:border-daara-gold/40 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
            >
              {/* Highlight background */}
              <div className="absolute inset-0 bg-gradient-to-br from-daara-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              {/* Completed checkmark badge */}
              {isCompleted && (
                <div className="absolute top-4 right-4 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 p-1.5 rounded-full" title="Module complété">
                  <CheckCircle className="w-4 h-4" />
                </div>
              )}

              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} border flex items-center justify-center mb-6 group-hover:brightness-110 transition-all duration-500 relative z-10`}>
                <Icon className="w-7 h-7" />
              </div>
              
              <h3 className="text-2xl font-serif font-bold text-daara-text mb-3 group-hover:text-daara-gold-light transition-colors relative z-10">
                {card.title}
              </h3>
              
              <p className="text-daara-text-muted text-sm leading-relaxed relative z-10 mb-4 line-clamp-3">
                {card.desc}
              </p>

              {/* Progress Bar */}
              {user && !card.isStatic && (
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-daara-bg/50">
                  <div 
                    className={`h-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-transparent'}`}
                    style={{ width: isCompleted ? '100%' : '0%' }}
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div id="quiz-section" className="text-center bg-daara-surface rounded-3xl p-8 md:p-16 shadow-2xl border border-daara-gold/20 relative overflow-hidden mb-20">
        <div className="absolute top-0 right-0 w-full max-w-96 aspect-square bg-daara-gold/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-full max-w-96 aspect-square bg-daara-gold/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <HelpCircle className="w-16 h-16 text-daara-gold mx-auto mb-8" />
          <h2 className="text-4xl font-serif font-bold text-daara-text mb-6">Testez vos connaissances</h2>
          <p className="text-daara-text-muted mb-10 max-w-xl mx-auto text-lg">
            Évaluez votre compréhension de l'Islam à travers notre quiz interactif conçu pour tous les niveaux.
          </p>
          <button
            onClick={() => setPage('quiz')}
            className="inline-flex items-center gap-3 bg-transparent border-2 border-daara-gold hover:bg-daara-gold text-daara-gold hover:text-daara-bg px-10 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-lg"
          >
            <BookOpen className="w-6 h-6" />
            Lancer le Quiz Islamique
          </button>
        </div>
      </div>
    </motion.div>
  );
}
