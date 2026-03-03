import React, { useState, useEffect, Suspense } from 'react';
import { PageType } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { VideoSection } from './pages/VideoSection';
import { About } from './pages/About';
import { Chatbot } from './components/Chatbot';
import { Tutorial } from './components/Tutorial';
import { playlists } from './data';
import { AnimatePresence } from 'motion/react';
import { MessageCircle, Loader2 } from 'lucide-react';

const IqraQuiz = React.lazy(() => import('./iqra-quiz/App'));

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [runTutorial, setRunTutorial] = useState(false);

  useEffect(() => {
    // Auto-start tutorial if not completed
    const tutorialCompleted = localStorage.getItem('tutorialCompleted');
    if (!tutorialCompleted) {
      // Small delay to ensure components are mounted
      setTimeout(() => {
        setRunTutorial(true);
      }, 1000);
    }
  }, []);

  // Handle hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as PageType;
      if (hash && ['home', 'fondements', 'piliers', 'fiqh', 'hadiths', 'burdah', 'apropos', 'quiz'].includes(hash)) {
        setCurrentPage(hash);
      } else {
        setCurrentPage('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial check

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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
      case 'quiz':
        return (
          <Suspense fallback={<div className="flex items-center justify-center h-full w-full py-20"><Loader2 className="w-8 h-8 animate-spin text-daara-gold" /></div>}>
            <IqraQuiz onBack={() => setPage('home')} />
          </Suspense>
        );
      default:
        if (playlists[currentPage]) {
          return <VideoSection info={playlists[currentPage]} />;
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
    <div className="min-h-screen flex flex-col font-sans selection:bg-daara-gold/30 selection:text-daara-bg overflow-x-hidden">
      <Tutorial run={runTutorial} setRun={setRunTutorial} />
      <Header currentPage={currentPage} setPage={setPage} startTutorial={() => setRunTutorial(true)} />
      
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
