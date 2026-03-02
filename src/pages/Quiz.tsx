import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { quizData } from '../data';
import { PageType } from '../types';
import { CheckCircle2, XCircle, RotateCcw, Home } from 'lucide-react';

interface QuizProps {
  setPage: (page: PageType) => void;
}

export function Quiz({ setPage }: QuizProps) {
  const [level, setLevel] = useState<'facile' | 'moyen' | 'difficile' | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const startQuiz = (lvl: 'facile' | 'moyen' | 'difficile') => {
    setLevel(lvl);
    setCurrentQ(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
  };

  const handleAnswer = (idx: number) => {
    if (selectedAnswer !== null) return; // Prevent multiple clicks
    
    setSelectedAnswer(idx);
    setShowExplanation(true);
    
    if (idx === quizData[level!][currentQ].answer) {
      setScore(s => s + 1);
    }

    setTimeout(() => {
      if (currentQ < quizData[level!].length - 1) {
        setCurrentQ(q => q + 1);
        setSelectedAnswer(null);
        setShowExplanation(false);
      } else {
        // End of quiz
        setCurrentQ(q => q + 1);
      }
    }, 2500);
  };

  if (!level) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto py-16 text-center"
      >
        <h1 className="text-5xl font-serif font-bold text-daara-gold mb-6">Quiz Islamique</h1>
        <p className="text-xl text-daara-text-muted mb-12">Testez vos connaissances et apprenez de nouvelles choses insha'Allah.</p>
        
        <div className="bg-daara-surface p-10 rounded-3xl shadow-xl border border-daara-gold/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-daara-gold/5 to-transparent pointer-events-none" />
          <h2 className="text-3xl font-serif font-bold text-daara-text mb-8 relative z-10">Choisissez votre niveau</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
            <button
              onClick={() => startQuiz('facile')}
              className="bg-daara-surface border border-daara-gold/30 hover:bg-daara-gold/10 text-daara-text px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-lg shadow-daara-gold/5"
            >
              Niveau Facile
            </button>
            <button
              onClick={() => startQuiz('moyen')}
              className="bg-gradient-to-r from-daara-gold to-daara-gold-light text-daara-bg px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-lg shadow-daara-gold/20"
            >
              Niveau Moyen
            </button>
            <button
              onClick={() => startQuiz('difficile')}
              className="bg-daara-text hover:bg-daara-text/90 text-daara-bg px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-lg shadow-daara-gold/5"
            >
              Niveau Difficile
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  const isFinished = currentQ >= quizData[level].length;

  if (isFinished) {
    const percentage = Math.round((score / quizData[level].length) * 100);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto py-16 text-center"
      >
        <div className="bg-daara-surface p-12 rounded-3xl shadow-xl border border-daara-gold/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-daara-gold/5 to-transparent pointer-events-none" />
          <h2 className="text-5xl font-serif font-bold text-daara-gold mb-6 relative z-10">Quiz Terminé !</h2>
          
          <div className="text-7xl font-bold text-daara-text mb-8 relative z-10">
            {score} <span className="text-4xl text-daara-text-muted">/ {quizData[level].length}</span>
          </div>
          
          <p className="text-2xl text-daara-gold-light mb-12 font-serif relative z-10">
            {percentage === 100 ? "Masha'Allah ! Parfait !" :
             percentage >= 60 ? "Alhamdulillah, bon résultat !" :
             "Continuez à apprendre, qu'Allah vous facilite."}
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
            <button
              onClick={() => startQuiz(level)}
              className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-daara-gold to-daara-gold-light text-daara-bg px-8 py-4 rounded-full font-bold transition-all hover:scale-105 shadow-lg"
            >
              <RotateCcw className="w-5 h-5" />
              Rejouer
            </button>
            <button
              onClick={() => setPage('home')}
              className="inline-flex items-center justify-center gap-3 bg-transparent hover:bg-daara-surface-hover text-daara-gold px-8 py-4 rounded-full font-bold transition-all border border-daara-gold/30"
            >
              <Home className="w-5 h-5" />
              Retour à l'accueil
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  const q = quizData[level][currentQ];

  return (
    <motion.div
      key={currentQ}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-3xl mx-auto py-12"
    >
      <div className="mb-8 flex justify-between items-center">
        <span className="bg-daara-surface border border-daara-gold/20 text-daara-gold px-5 py-2 rounded-full font-bold text-sm tracking-widest uppercase shadow-sm">
          Niveau {level}
        </span>
        <span className="text-daara-gold-light font-bold text-lg">
          Question {currentQ + 1} / {quizData[level].length}
        </span>
      </div>

      <div className="bg-daara-surface p-8 md:p-12 rounded-3xl shadow-xl border border-daara-gold/20 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-daara-gold/5 to-transparent pointer-events-none" />
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-daara-text mb-10 leading-relaxed relative z-10">
          {q.question}
        </h2>

        <div className="grid gap-4 relative z-10">
          {q.options.map((opt, idx) => {
            let btnClass = "bg-daara-bg hover:bg-daara-surface-hover text-daara-text border-daara-gold/20";
            let Icon = null;

            if (selectedAnswer !== null) {
              if (idx === q.answer) {
                btnClass = "bg-emerald-900/30 border-emerald-500 text-emerald-400";
                Icon = CheckCircle2;
              } else if (idx === selectedAnswer) {
                btnClass = "bg-red-900/30 border-red-500 text-red-400";
                Icon = XCircle;
              } else {
                btnClass = "bg-daara-bg border-daara-gold/10 text-daara-text-muted opacity-50";
              }
            }

            return (
              <button
                key={idx}
                disabled={selectedAnswer !== null}
                onClick={() => handleAnswer(idx)}
                className={`relative w-full text-left px-8 py-5 rounded-2xl border font-medium text-lg transition-all duration-300 flex items-center justify-between ${btnClass}`}
              >
                <span>{opt}</span>
                {Icon && <Icon className="w-6 h-6" />}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className={`p-6 rounded-2xl border backdrop-blur-sm ${
              selectedAnswer === q.answer 
                ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-100' 
                : 'bg-red-900/20 border-red-500/30 text-red-100'
            }`}
          >
            <p className="font-bold mb-2 text-lg flex items-center gap-2">
              {selectedAnswer === q.answer ? <><CheckCircle2 className="w-5 h-5 text-emerald-400"/> Bonne réponse !</> : <><XCircle className="w-5 h-5 text-red-400"/> Mauvaise réponse !</>}
            </p>
            <p className="italic text-daara-text-muted/90">{q.explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
