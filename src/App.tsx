import React, { useState, useEffect, Suspense } from 'react';
import { recordSession, recordPageView, recordPageDuration } from './utils/analytics';
import { PageType, PlaylistInfo } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { VideoSection } from './pages/VideoSection';
import { About } from './pages/About';
import { Forum } from './pages/Forum';
import { Dashboard } from './pages/Dashboard';
import { Admin } from './pages/Admin';
import { Chatbot } from './components/Chatbot';
import { OnboardingModal } from './components/OnboardingModal';
import { useAuth } from './contexts/AuthContext';

import { playlists } from './data';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, Loader2, X, Check } from 'lucide-react';
import { seedPlaylistsIfEmpty, onPlaylistsChanged, playlistsToMap } from './utils/playlistService';

const IqraQuiz = React.lazy(() => import('./iqra-quiz/App'));

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [dynamicPlaylists, setDynamicPlaylists] = useState<Record<string, PlaylistInfo>>(playlists);

  const { user, profile, updateUserProfile } = useAuth();
  const [showPhonePrompt, setShowPhonePrompt] = useState(false);
  const [phoneNumberInput, setPhoneNumberInput] = useState('');
  const [savingPhone, setSavingPhone] = useState(false);

  // Monitor if user needs to register their phone number (e.g. upon signup/registration)
  useEffect(() => {
    if (user && profile && !profile.phoneNumber) {
      const skipped = sessionStorage.getItem('iq_phone_prompt_skipped');
      if (!skipped) {
        // Delay popup slightly to not clash with onboarding tour
        const timer = setTimeout(() => {
          setShowPhonePrompt(true);
        }, 3500);
        return () => clearTimeout(timer);
      }
    } else {
      setShowPhonePrompt(false);
    }
  }, [user, profile]);

  // Fetch dynamic playlists from Firestore on mount
  useEffect(() => {
    let unsub: (() => void) | undefined;

    const initPlaylists = async () => {
      await seedPlaylistsIfEmpty();
      unsub = onPlaylistsChanged((docs) => {
        if (docs.length > 0) {
          // Only update if Firestore actually has playlists
          setDynamicPlaylists(playlistsToMap(docs));
        }
        // If docs is empty, keep the hardcoded defaults
      });
    };

    initPlaylists().catch((err) =>
      console.warn('Could not load dynamic playlists from Firestore, using local fallback:', err)
    );

    return () => {
      if (unsub) unsub();
    };
  }, []);

  // Analytics — record session once and track page views
  useEffect(() => { recordSession(); }, []);
  useEffect(() => { recordPageView(currentPage); }, [currentPage]);

  // Track duration spent on each page
  useEffect(() => {
    const startTime = Date.now();
    const activePage = currentPage;

    return () => {
      const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);
      if (elapsedSeconds > 0) {
        recordPageDuration(activePage, elapsedSeconds);
      }
    };
  }, [currentPage]);

  // Handle hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as PageType;
      const validPages = [
        'home', 'apropos', 'quiz', 'forum', 'dashboard', 'admin'
      ];
      if (hash && (validPages.includes(hash) || dynamicPlaylists[hash])) {
        setCurrentPage(hash);
      } else {
        setCurrentPage('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial check

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [dynamicPlaylists]);

  const setPage = (page: PageType) => {
    window.location.hash = page;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home setPage={setPage} playlists={dynamicPlaylists} />;
      case 'apropos':
        return <About />;
      case 'forum':
        return <Forum />;
      case 'dashboard':
        return <Dashboard />;
      case 'admin':
        return <Admin />;
      case 'quiz':
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-full w-full py-20"><Loader2 className="w-8 h-8 animate-spin text-daara-gold" /></div>}>
            <IqraQuiz onBack={() => setPage('home')} />
          </Suspense>
        );
      default:
        if (dynamicPlaylists[currentPage]) {
          return <VideoSection info={dynamicPlaylists[currentPage]} playlistKey={currentPage} />;
        }
        return <Home setPage={setPage} playlists={dynamicPlaylists} />;
    }
  };

  if (currentPage === 'quiz') {
    return (
      <div className="h-screen w-full overflow-hidden font-sans selection:bg-daara-gold/30 selection:text-daara-bg relative bg-daara-bg text-daara-text transition-colors duration-300">
        <Suspense fallback={<div className="flex items-center justify-center h-full w-full"><Loader2 className="w-10 h-10 animate-spin text-daara-gold" /></div>}>
          <IqraQuiz onBack={() => setPage('home')} />
        </Suspense>
        {/* Chatbot Oustaz */}
        <Chatbot />
      </div>
    );
  }

  // Admin needs full-width layout without the constrained main container
  if (currentPage === 'admin') {
    return (
      <div className="min-h-screen flex flex-col font-sans selection:bg-daara-gold/30 selection:text-daara-bg">
        <Admin />
        <Chatbot />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-daara-gold/30 selection:text-daara-bg">
      <Header currentPage={currentPage} setPage={setPage} playlists={dynamicPlaylists} />
      
      <main className="flex-grow px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto flex flex-col justify-stretch">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="w-full flex-grow flex flex-col"
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />

      {/* Chatbot Oustaz */}
      <Chatbot />
      
      {/* Onboarding Modal */}
      <OnboardingModal />

      {/* Phone Number Registration Modal */}
      <AnimatePresence>
        {showPhonePrompt && (
          <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="bg-daara-surface border border-daara-gold/20 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-daara-gold/10 border border-daara-gold/30 rounded-full flex items-center justify-center text-daara-gold mx-auto">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="text-2xl font-serif font-bold text-daara-text">Finalisez votre inscription</h3>
                <p className="text-xs text-daara-text-muted">
                  Veuillez renseigner votre numéro de téléphone pour compléter la création de votre compte sur Iqra Quest.
                </p>
              </div>

              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!phoneNumberInput.trim()) return;
                  setSavingPhone(true);
                  try {
                    await updateUserProfile(profile?.displayName || user?.displayName || 'Anonyme', profile?.photoURL || user?.photoURL || '', phoneNumberInput.trim());
                    setShowPhonePrompt(false);
                  } catch (err) {
                    console.error("Failed to save phone number:", err);
                  } finally {
                    setSavingPhone(false);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-daara-text-muted mb-1.5 font-bold">Numéro de téléphone</label>
                  <input
                    type="tel"
                    value={phoneNumberInput}
                    onChange={e => setPhoneNumberInput(e.target.value)}
                    placeholder="ex: +221 77 123 45 67"
                    className="w-full px-4 py-3 bg-daara-bg border border-daara-gold/20 rounded-xl text-daara-text focus:outline-none focus:border-daara-gold transition-colors text-center font-bold tracking-wide"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      sessionStorage.setItem('iq_phone_prompt_skipped', 'true');
                      setShowPhonePrompt(false);
                    }}
                    className="flex-1 py-3 bg-daara-bg border border-daara-gold/20 text-daara-text-muted rounded-xl text-xs font-bold hover:text-daara-text transition-colors"
                  >
                    Plus tard
                  </button>
                  <button
                    type="submit"
                    disabled={savingPhone}
                    className="flex-1 py-3 bg-daara-gold text-daara-bg rounded-xl text-xs font-bold hover:bg-yellow-500 transition-colors shadow-md disabled:opacity-50"
                  >
                    {savingPhone ? 'Enregistrement...' : 'Valider'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
