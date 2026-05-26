import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Target, Sparkles, X, ChevronRight, Check } from 'lucide-react';

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('iq_onboarding_done');
    if (!hasSeenOnboarding) {
      // Small delay to not overwhelm immediately on load
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const closeOnboarding = () => {
    localStorage.setItem('iq_onboarding_done', 'true');
    setIsOpen(false);
  };

  const nextStep = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      closeOnboarding();
    }
  };

  const steps = [
    {
      icon: BookOpen,
      title: "Bienvenue sur Iqra Quest",
      desc: "Découvrez une nouvelle façon d'apprendre l'Islam. Nos modules interactifs couvrent le Coran, les Hadiths, le Fiqh et bien plus encore.",
      color: "text-blue-400"
    },
    {
      icon: Target,
      title: "Gagnez de l'Expérience",
      desc: "Chaque action compte ! Répondez aux quiz, lisez les leçons et maintenez votre série quotidienne pour gagner de l'XP et débloquer des badges exclusifs.",
      color: "text-daara-gold"
    },
    {
      icon: Sparkles,
      title: "Votre Guide IA Personnel",
      desc: "Une question ? Cliquez sur le bouton en bas à droite pour interroger notre Chatbot Oustaz. Il vous assistera dans toutes vos recherches.",
      color: "text-emerald-400"
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-daara-surface border border-daara-gold/20 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header progress */}
            <div className="flex gap-1 p-4 bg-daara-bg/50">
              {[0, 1, 2].map(i => (
                <div 
                  key={i} 
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-daara-gold' : 'bg-daara-gold/10'}`} 
                />
              ))}
            </div>

            <div className="p-8 flex flex-col items-center text-center space-y-6 relative">
              <button 
                onClick={closeOnboarding}
                className="absolute top-4 right-4 p-2 text-daara-text-muted hover:text-daara-text bg-daara-bg/50 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col items-center"
                >
                  {(() => {
                    const CurrentIcon = steps[step].icon;
                    return (
                      <div className={`w-20 h-20 rounded-full bg-daara-bg border border-daara-gold/20 flex items-center justify-center mb-6 shadow-inner ${steps[step].color}`}>
                        <CurrentIcon className="w-10 h-10" />
                      </div>
                    );
                  })()}
                  
                  <h3 className="text-2xl font-serif font-bold text-daara-text mb-4">
                    {steps[step].title}
                  </h3>
                  
                  <p className="text-daara-text-muted leading-relaxed">
                    {steps[step].desc}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="p-6 bg-daara-bg/50 border-t border-daara-gold/10 flex justify-between items-center mt-auto">
              <button
                onClick={closeOnboarding}
                className="text-sm font-bold text-daara-text-muted hover:text-daara-text transition-colors"
              >
                Passer
              </button>
              
              <button
                onClick={nextStep}
                className="flex items-center gap-2 bg-daara-gold text-daara-bg px-6 py-3 rounded-xl font-bold hover:bg-yellow-500 transition-all shadow-md hover:shadow-daara-gold/20"
              >
                {step < 2 ? (
                  <>Suivant <ChevronRight className="w-4 h-4" /></>
                ) : (
                  <>Commencer <Check className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
