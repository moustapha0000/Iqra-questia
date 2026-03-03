import React, { useState, useEffect } from 'react';
import { Menu, X, BookOpen, Home, Star, BookText, MessageCircle, Heart, Info, ArrowRight, Download, Sun, Moon } from 'lucide-react';
import { PageType } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  currentPage: PageType;
  setPage: (page: PageType) => void;
}

export function Header({ currentPage, setPage }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    // Check local storage or system preference on mount
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      setTheme('light');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const navItems: { id: PageType; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: 'Accueil', icon: Home },
    { id: 'fondements', label: 'Fondements', icon: BookOpen },
    { id: 'piliers', label: 'Piliers', icon: Star },
    { id: 'fiqh', label: 'Fiqh', icon: BookText },
    { id: 'hadiths', label: 'Hadiths', icon: MessageCircle },
    { id: 'burdah', label: 'Burdah', icon: Heart },
    { id: 'apropos', label: 'À propos', icon: Info },
  ];

  const handleNav = (id: PageType) => {
    setPage(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-daara-bg/80 backdrop-blur-lg shadow-sm border-b border-daara-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => handleNav('home')}
            >
              <BookOpen className="w-7 h-7 text-daara-gold group-hover:text-daara-gold-light transition-colors" />
              <span className="font-serif text-3xl font-bold text-daara-text group-hover:text-daara-gold transition-colors">
                Iqra Quest
              </span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    currentPage === item.id
                      ? 'bg-daara-gold text-daara-bg shadow-lg shadow-daara-gold/20'
                      : 'text-daara-text-muted hover:bg-daara-surface-hover hover:text-daara-gold-light'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              {deferredPrompt && (
                <button
                  onClick={handleInstall}
                  className="ml-2 flex items-center gap-2 bg-gradient-to-r from-daara-gold to-daara-gold-light text-daara-bg px-4 py-2 rounded-full text-sm font-bold transition-all hover:scale-105 shadow-md shadow-daara-gold/20"
                  title="Installer l'application"
                >
                  <Download className="w-4 h-4" />
                  Installer
                </button>
              )}
              <button
                onClick={toggleTheme}
                className="ml-2 p-2 text-daara-text-muted hover:text-daara-gold hover:bg-daara-surface-hover rounded-full transition-colors"
                title={theme === 'dark' ? "Passer au mode clair" : "Passer au mode sombre"}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={toggleTheme}
                className="p-2 text-daara-text-muted hover:text-daara-gold hover:bg-daara-surface rounded-xl transition-colors"
                aria-label="Changer le thème"
              >
                {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              </button>
              {deferredPrompt && (
                <button
                  onClick={handleInstall}
                  className="p-2 text-daara-bg bg-daara-gold hover:bg-daara-gold-light rounded-xl transition-colors shadow-md"
                  aria-label="Installer l'application"
                >
                  <Download className="w-5 h-5" />
                </button>
              )}
              <button
                className="p-2 text-daara-gold hover:bg-daara-surface rounded-xl transition-colors"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="w-7 h-7" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Nav - Full Screen Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] flex flex-col bg-gradient-to-br from-daara-surface to-daara-bg"
          >
            {/* Decorative Background Element */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-daara-gold/5 rounded-full blur-[100px] pointer-events-none translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-daara-gold/5 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 translate-y-1/2" />

            {/* Top Bar inside Menu */}
            <div className="flex-none flex justify-between items-center px-4 sm:px-6 py-4 sm:py-6 relative z-10">
              <div 
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => handleNav('home')}
              >
                <BookOpen className="w-6 h-6 text-daara-gold" />
                <span className="font-serif text-2xl font-bold text-white tracking-wide">
                  Iqra Quest
                </span>
              </div>
              
              <button
                className="p-2 sm:p-3 text-white hover:text-daara-gold transition-colors bg-white/5 rounded-full backdrop-blur-sm border border-white/10"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X className="w-6 h-6" strokeWidth={2} />
              </button>
            </div>

            {/* Menu Items - Scrollable */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 relative z-10 pb-6 scrollbar-hide">
              <div className="flex flex-col gap-2 sm:gap-4 mt-2">
                {navItems.map((item, idx) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + idx * 0.05 }}
                      onClick={() => handleNav(item.id)}
                      className={`group flex items-center justify-between w-full p-3 sm:p-4 rounded-2xl transition-all duration-300 ${
                        isActive
                          ? 'bg-daara-gold/10 border border-daara-gold/30'
                          : 'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-4 sm:gap-5">
                        <div className={`p-2 sm:p-3 rounded-xl transition-colors ${
                          isActive ? 'bg-daara-gold text-daara-bg' : 'bg-white/5 text-daara-text-muted group-hover:text-white group-hover:bg-white/10'
                        }`}>
                          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <span className={`text-xl sm:text-2xl md:text-3xl font-serif font-medium tracking-wide transition-colors ${
                          isActive ? 'text-daara-gold' : 'text-white group-hover:text-daara-gold-light'
                        }`}>
                          {item.label}
                        </span>
                      </div>
                      {isActive && (
                        <motion.div layoutId="activeIndicator" className="w-2 h-2 rounded-full bg-daara-gold" />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Contact Button - Fixed at bottom */}
            <div className="flex-none p-4 sm:p-6 relative z-10 bg-gradient-to-t from-daara-bg to-transparent flex flex-col gap-3">
              {deferredPrompt && (
                <motion.button 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  onClick={handleInstall}
                  className="w-full flex items-center justify-center gap-2 sm:gap-3 px-6 py-4 rounded-2xl bg-white/10 text-white font-sans font-bold text-base sm:text-lg hover:bg-white/20 transition-colors border border-white/20 backdrop-blur-md"
                >
                  <Download className="w-5 h-5" />
                  <span>Installer l'application</span>
                </motion.button>
              )}
              <motion.button 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                onClick={() => handleNav('apropos')}
                className="w-full flex items-center justify-center gap-2 sm:gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-daara-gold to-daara-gold-light text-daara-bg font-sans font-bold text-base sm:text-lg hover:scale-[1.02] transition-transform shadow-lg shadow-daara-gold/20"
              >
                <span>Contactez-nous</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
