import React, { useState, useEffect, Suspense } from 'react';
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

const IqraQuiz = React.lazy(() => import('./iqra-quiz/App'));

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [dynamicPlaylists, setDynamicPlaylists] = useState<Record<string, PlaylistInfo>>(playlists);

  // Fetch dynamic playlists from API on mount
  useEffect(() => {
    fetch('/api/playlists')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const map: Record<string, PlaylistInfo> = {};
          data.forEach((p: any) => {
            map[p.key] = { id: p.id, title: p.title, desc: p.desc };
          });
          setDynamicPlaylists(map);
        }
      })
      .catch((err) => console.warn('Could not load dynamic playlists, using local fallback:', err));
  }, []);

  // Handle hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as PageType;
      const validPages = [
        'home', 'fondements', 'piliers', 'fiqh', 'hadiths', 'burdah', 'prophetes', 
        'apropos', 'quiz', 'forum', 'dashboard', 'admin'
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
        return <Home setPage={setPage} />;
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
          return <VideoSection info={dynamicPlaylists[currentPage]} />;
        }
        return <Home setPage={setPage} />;
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

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-daara-gold/30 selection:text-daara-bg">
      <Header currentPage={currentPage} setPage={setPage} />
      
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
