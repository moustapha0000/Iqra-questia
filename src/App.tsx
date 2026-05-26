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

import { playlists } from './data';
import { AnimatePresence } from 'motion/react';
import { MessageCircle, Loader2 } from 'lucide-react';
import { seedPlaylistsIfEmpty, onPlaylistsChanged, playlistsToMap } from './utils/playlistService';

const IqraQuiz = React.lazy(() => import('./iqra-quiz/App'));

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [dynamicPlaylists, setDynamicPlaylists] = useState<Record<string, PlaylistInfo>>(playlists);

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
      <div className="h-screen w-full overflow-hidden font-sans selection:bg-daara-gold/30 selection:text-daara-bg relative bg-white sm:bg-gray-100">
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
      
      <main className="flex-grow px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {renderPage()}
        </AnimatePresence>
      </main>

      <Footer />

      {/* Chatbot Oustaz */}
      <Chatbot />
    </div>
  );
}
