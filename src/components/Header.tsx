import React, { useState, useEffect } from 'react';
import { Menu, X, BookOpen, Home, Star, BookText, MessageCircle, Heart, Info, ArrowRight, Download, Sun, Moon, HelpCircle, Users, LogIn, LogOut, Trophy, User, Bell, Sliders, ClipboardList } from 'lucide-react';
import { PageType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './Logo';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  currentPage: PageType;
  setPage: (page: PageType) => void;
  startTutorial?: () => void;
}

export function Header({ currentPage, setPage, startTutorial }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const { user, profile, authError, signInWithGoogle, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  const [notifications, setNotifications] = useState<any[]>([
    { id: '1', text: "Bienvenue sur la plateforme Iqra Quest ! Explorez nos modules d'apprentissage.", read: false },
    { id: '2', text: "Nouveau sujet sur le Forum : 'Les conditions de validité de la prière'.", read: false },
  ]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
      if (!target.closest('.notif-container')) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Listen to custom event when a user unlocks a badge
  useEffect(() => {
    const handleBadgeNotif = (e: Event) => {
      const customEvent = e as CustomEvent;
      const badgeId = customEvent.detail.badgeId;
      let badgeName = "Nouveau badge";
      if (badgeId === 'note_master') badgeName = "Scribe de la Daara";
      else if (badgeId === 'streak_3') badgeName = "Apprenant Fidèle (3 jours)";
      else if (badgeId === 'streak_7') badgeName = "Pilier de Discipline (7 jours)";
      else if (badgeId === 'xp_500') badgeName = "Compagnon du Savoir";
      else if (badgeId === 'xp_1000') badgeName = "Puits de Sagesse";
      else if (badgeId === 'quiz_perfect') badgeName = "Savant (100% Quiz)";

      const newNotif = {
        id: Date.now().toString(),
        text: `Félicitations ! Vous avez débloqué le badge : ${badgeName} ! 🏆`,
        read: false
      };
      setNotifications(prev => [newNotif, ...prev]);
      setIsNotifOpen(true);
    };

    window.addEventListener('show-badge-notification', handleBadgeNotif);
    return () => window.removeEventListener('show-badge-notification', handleBadgeNotif);
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
    { id: 'prophetes', label: 'Prophètes', icon: Users },
    { id: 'quiz', label: 'Quiz', icon: HelpCircle },
    { id: 'forum', label: 'Forum', icon: MessageCircle },
    { id: 'apropos', label: 'À propos', icon: Info },
  ];

  const handleNav = (id: PageType) => {
    setPage(id);
    setIsMobileMenuOpen(false);
  };

  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  const markAllNotifsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
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
              <Logo className="w-10 h-10 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-serif text-3xl font-bold text-daara-text group-hover:text-daara-gold transition-colors">
                Iqra Quest
              </span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden xl:flex items-center gap-1.5">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`px-3 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ${
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
                  className="ml-2 flex items-center gap-2 bg-gradient-to-r from-daara-gold to-daara-gold-light text-daara-bg px-4 py-2 rounded-full text-xs font-bold transition-all hover:scale-105 shadow-md shadow-daara-gold/20"
                  title="Installer l'application"
                >
                  <Download className="w-4 h-4" />
                  Installer
                </button>
              )}
              <button
                onClick={toggleTheme}
                className="theme-toggle-btn ml-2 p-2 text-daara-text-muted hover:text-daara-gold hover:bg-daara-surface-hover rounded-full transition-colors"
                title={theme === 'dark' ? "Passer au mode clair" : "Passer au mode sombre"}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              {startTutorial && (
                <button
                  onClick={startTutorial}
                  className="ml-2 p-2 text-daara-text-muted hover:text-daara-gold hover:bg-daara-surface-hover rounded-full transition-colors"
                  title="Lancer le tutoriel"
                >
                  <HelpCircle className="w-5 h-5" />
                </button>
              )}

              {/* Notification Center Bell */}
              {user && (
                <div className="relative ml-2 notif-container">
                  <button
                    onClick={() => {
                      setIsNotifOpen(!isNotifOpen);
                      if (!isNotifOpen) markAllNotifsAsRead();
                    }}
                    className="p-2 text-daara-text-muted hover:text-daara-gold hover:bg-daara-surface-hover rounded-full transition-colors relative"
                    title="Centre de notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadNotifsCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-orange-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center border border-daara-bg">
                        {unreadNotifsCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {isNotifOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-3 w-80 bg-daara-surface border border-daara-gold/20 rounded-2xl shadow-xl overflow-hidden z-50 p-4"
                      >
                        <h4 className="font-serif font-bold text-daara-text border-b border-daara-gold/10 pb-2 mb-3">Notifications</h4>
                        <div className="space-y-3 max-h-64 overflow-y-auto no-scrollbar">
                          {notifications.map(n => (
                            <div key={n.id} className={`p-3 rounded-xl text-xs leading-relaxed border ${n.read ? 'bg-daara-bg/25 border-transparent text-daara-text-muted' : 'bg-daara-gold/5 border-daara-gold/20 text-daara-text font-medium'}`}>
                              {n.text}
                            </div>
                          ))}
                          {notifications.length === 0 && (
                            <p className="text-center text-daara-text-muted py-4">Aucune notification.</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {user ? (
                <div className="relative ml-4 pl-4 border-l border-daara-gold/20 user-menu-container">
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none"
                    title="Menu Utilisateur"
                  >
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full border-2 border-daara-gold/50 shadow-sm" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-daara-gold/20 flex items-center justify-center text-daara-gold font-bold text-sm border-2 border-daara-gold/50 shadow-sm">
                        {user.displayName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-3 w-56 bg-daara-surface border border-daara-gold/20 rounded-2xl shadow-xl overflow-hidden z-50"
                      >
                        <div className="p-4 border-b border-daara-gold/10 bg-daara-bg/50">
                          <p className="text-sm font-bold text-daara-text truncate">{user.displayName}</p>
                          <p className="text-xs text-daara-text-muted truncate">{user.email}</p>
                        </div>
                        <div className="p-2 space-y-1">
                          <button
                            onClick={() => {
                              setPage('dashboard');
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-daara-text hover:text-daara-gold hover:bg-daara-gold/10 rounded-xl transition-colors"
                          >
                            <ClipboardList className="w-4 h-4" />
                            Tableau de bord
                          </button>
                          <button
                            onClick={() => {
                              setPage('quiz');
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-daara-text hover:text-daara-gold hover:bg-daara-gold/10 rounded-xl transition-colors"
                          >
                            <User className="w-4 h-4" />
                            Profil Quiz
                          </button>
                          <button
                            onClick={() => {
                              setPage('quiz');
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-daara-text hover:text-daara-gold hover:bg-daara-gold/10 rounded-xl transition-colors"
                          >
                            <Trophy className="w-4 h-4" />
                            Classement Quiz
                          </button>
                          {profile?.role === 'admin' && (
                            <button
                              onClick={() => {
                                setPage('admin');
                                setIsUserMenuOpen(false);
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-daara-gold hover:bg-daara-gold/10 rounded-xl transition-colors"
                            >
                              <Sliders className="w-4 h-4" />
                              Administration
                            </button>
                          )}
                        </div>
                        <div className="p-2 border-t border-daara-gold/10">
                          <button
                            onClick={() => {
                              logout();
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Se déconnecter
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={signInWithGoogle}
                  className="ml-4 flex items-center gap-2 bg-daara-surface border border-daara-gold/30 text-daara-gold px-4 py-2 rounded-full text-sm font-medium transition-all hover:bg-daara-gold hover:text-daara-bg"
                >
                  <LogIn className="w-4 h-4" />
                  Connexion
                </button>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 xl:hidden">
              {startTutorial && (
                <button
                  onClick={startTutorial}
                  className="p-2 text-daara-text-muted hover:text-daara-gold hover:bg-daara-surface rounded-xl transition-colors"
                  aria-label="Lancer le tutoriel"
                >
                  <HelpCircle className="w-6 h-6" />
                </button>
              )}
              <button
                onClick={toggleTheme}
                className="theme-toggle-btn p-2 text-daara-text-muted hover:text-daara-gold hover:bg-daara-surface rounded-xl transition-colors"
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

      {/* Auth Error Banner */}
      {authError && (
        <div className="fixed top-20 left-0 right-0 z-[99] px-4 sm:px-6">
          <div className="max-w-2xl mx-auto bg-red-500/15 border border-red-500/40 text-red-400 px-6 py-4 rounded-2xl backdrop-blur-lg shadow-xl flex items-start gap-3 animate-pulse">
            <span className="text-red-500 text-xl shrink-0">⚠️</span>
            <div className="flex-1">
              <p className="font-bold text-sm mb-1">Erreur de connexion</p>
              <p className="text-xs leading-relaxed opacity-90">{authError}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="shrink-0 text-xs bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 px-3 py-1.5 rounded-lg transition-colors font-bold"
            >
              Réessayer
            </button>
          </div>
        </div>
      )}

      {/* Mobile Nav - Full Screen Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] flex flex-col bg-gradient-to-br from-daara-surface to-daara-bg overflow-hidden"
          >
            {/* Decorative Background Element */}
            <div className="absolute top-0 right-0 w-full max-w-[500px] aspect-square bg-daara-gold/5 rounded-full blur-[100px] pointer-events-none translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-full max-w-[500px] aspect-square bg-daara-gold/5 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 translate-y-1/2" />

            {/* Top Bar inside Menu */}
            <div className="flex-none flex justify-between items-center px-4 sm:px-6 py-4 sm:py-6 relative z-10">
              <div 
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => handleNav('home')}
              >
                <BookOpen className="w-6 h-6 text-daara-gold" />
                <span className="font-serif text-2xl font-bold text-daara-text tracking-wide">
                  Iqra Quest
                </span>
              </div>
              
              <button
                className="p-2 sm:p-3 text-daara-text hover:text-daara-gold transition-colors bg-daara-text/5 rounded-full backdrop-blur-sm border border-daara-text/10"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X className="w-6 h-6" strokeWidth={2} />
              </button>
            </div>

            {/* Menu Items - Scrollable */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 relative z-10 pb-6 scrollbar-hide">
              <div className="flex flex-col gap-2 sm:gap-4 mt-2">
                {user ? (
                  <div className="bg-daara-surface rounded-2xl border border-daara-gold/20 mb-2 overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-daara-gold/10">
                      <div className="flex items-center gap-3 text-left">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full border border-daara-gold/50" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-daara-gold/20 flex items-center justify-center text-daara-gold font-bold text-lg border border-daara-gold/50">
                            {user.displayName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-daara-text">{user.displayName}</p>
                          <p className="text-xs text-daara-text-muted">{user.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-full transition-colors"
                        title="Se déconnecter"
                      >
                        <LogOut className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="p-2 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => { setPage('dashboard'); setIsMobileMenuOpen(false); }}
                        className="flex items-center justify-center gap-2 p-3 rounded-xl bg-daara-bg/50 hover:bg-daara-gold/10 text-daara-text hover:text-daara-gold transition-colors font-medium text-sm"
                      >
                        <ClipboardList className="w-4 h-4" />
                        Tableau de bord
                      </button>
                      <button
                        onClick={() => { setPage('quiz'); setIsMobileMenuOpen(false); }}
                        className="flex items-center justify-center gap-2 p-3 rounded-xl bg-daara-bg/50 hover:bg-daara-gold/10 text-daara-text hover:text-daara-gold transition-colors font-medium text-sm"
                      >
                        <User className="w-4 h-4" />
                        Profil Quiz
                      </button>
                      <button
                        onClick={() => { setPage('quiz'); setIsMobileMenuOpen(false); }}
                        className="flex items-center justify-center gap-2 p-3 rounded-xl bg-daara-bg/50 hover:bg-daara-gold/10 text-daara-text hover:text-daara-gold transition-colors font-medium text-sm"
                      >
                        <Trophy className="w-4 h-4" />
                        Classement
                      </button>
                      {profile?.role === 'admin' && (
                        <button
                          onClick={() => { setPage('admin'); setIsMobileMenuOpen(false); }}
                          className="col-span-2 flex items-center justify-center gap-2 p-3 rounded-xl bg-daara-bg/50 hover:bg-daara-gold/10 text-daara-gold transition-colors font-medium text-sm"
                        >
                          <Sliders className="w-4 h-4" />
                          Administration
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { signInWithGoogle(); setIsMobileMenuOpen(false); }}
                    className="flex items-center justify-center gap-2 w-full bg-daara-surface border border-daara-gold/30 text-daara-gold p-4 rounded-2xl font-medium mb-2"
                  >
                    <LogIn className="w-5 h-5" />
                    Se connecter
                  </button>
                )}
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
                          : 'hover:bg-daara-text/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-4 sm:gap-5">
                        <div className={`p-2 sm:p-3 rounded-xl transition-colors ${
                          isActive ? 'bg-daara-gold text-daara-bg' : 'bg-daara-text/5 text-daara-text-muted group-hover:text-daara-text group-hover:bg-daara-text/10'
                        }`}>
                          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <span className={`text-xl sm:text-2xl md:text-3xl font-serif font-medium tracking-wide transition-colors ${
                          isActive ? 'text-daara-gold' : 'text-daara-text group-hover:text-daara-gold-light'
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
                  className="w-full flex items-center justify-center gap-2 sm:gap-3 px-6 py-4 rounded-2xl bg-daara-text/5 text-daara-text font-sans font-bold text-base sm:text-lg hover:bg-daara-text/10 transition-colors border border-daara-text/10 backdrop-blur-md"
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
