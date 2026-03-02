import React from 'react';
import { motion } from 'motion/react';
import { PageType } from '../types';
import { BookOpen, PlayCircle, BookText, Heart, Star, HelpCircle, Info, MessageCircle } from 'lucide-react';

interface HomeProps {
  setPage: (page: PageType) => void;
}

export function Home({ setPage }: HomeProps) {
  const cards = [
    { id: 'fondements', title: 'Fondements', icon: BookOpen, desc: 'Tafsiroul Quràn' },
    { id: 'piliers', title: 'Piliers', icon: Star, desc: 'Al Akhdari (Pratique)' },
    { id: 'fiqh', title: 'Fiqh', icon: BookText, desc: 'Fiqh Tariqha Tidiàn' },
    { id: 'hadiths', title: 'Hadiths', icon: MessageCircle, desc: 'Biographie du Prophète ﷺ' },
    { id: 'burdah', title: 'Burdah', icon: Heart, desc: 'Cheikh Ahmed Tidiàn Cherif' },
    { id: 'apropos', title: 'À propos', icon: Info, desc: 'Notre mission' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-5xl mx-auto"
    >
      <div className="text-center mb-16 pt-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-daara-gold/5 rounded-full blur-[100px] pointer-events-none" />
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-block mb-6 px-6 py-2 rounded-full border border-daara-gold/30 bg-daara-surface/50 text-daara-gold font-medium text-sm tracking-widest uppercase"
        >
          Bienvenue sur Iqra Quest
        </motion.div>
        
        <h1 className="text-5xl md:text-7xl font-serif font-bold text-daara-text mb-6 leading-tight relative z-10">
          La plateforme islamique <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-daara-gold to-daara-gold-light">
            d’apprentissage pour tous
          </span>
        </h1>
        
        <p className="text-3xl md:text-4xl font-serif text-daara-gold-light mb-10 opacity-90" dir="rtl">
          بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </p>

        <div className="relative max-w-2xl mx-auto p-8 rounded-2xl bg-daara-surface/80 backdrop-blur-sm shadow-2xl border border-daara-gold/20 mb-12">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              onClick={() => setPage(card.id as PageType)}
              className="group cursor-pointer bg-daara-surface p-8 rounded-2xl shadow-lg border border-daara-gold/10 hover:border-daara-gold/40 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-daara-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-14 h-14 rounded-xl bg-daara-bg/50 border border-daara-gold/20 flex items-center justify-center mb-6 group-hover:bg-daara-gold group-hover:border-daara-gold text-daara-gold group-hover:text-daara-bg transition-all duration-500 relative z-10">
                <Icon className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-daara-text mb-3 group-hover:text-daara-gold-light transition-colors relative z-10">
                {card.title}
              </h3>
              <p className="text-daara-text-muted text-sm leading-relaxed relative z-10">
                {card.desc}
              </p>
            </motion.div>
          );
        })}
      </div>

      <div className="text-center bg-daara-surface rounded-3xl p-8 md:p-16 shadow-2xl border border-daara-gold/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-daara-gold/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-daara-gold/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
        
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
