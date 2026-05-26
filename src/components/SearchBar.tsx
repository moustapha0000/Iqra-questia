import React, { useState, useEffect, useRef } from 'react';
import { Search, X, BookOpen, HelpCircle, MessageSquare, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PageType, PlaylistInfo } from '../types';
import { fetchPlaylists } from '../utils/playlistService';

// We import these static titles to let users search quiz units
const QUIZ_UNITS = [
  { id: 1, title: "Le Tawhid", desc: "L'Unicité d'Allah" },
  { id: 2, title: "Les 5 Piliers", desc: "L'architecture de l'Islam" },
  { id: 3, title: "La Foi (Iman)", desc: "Les 6 piliers" },
  { id: 4, title: "Le Coran", desc: "La parole incréée" },
  { id: 5, title: "Le Prophète (SWS)", desc: "Notre exemple parfait" },
  { id: 6, title: "La Pureté (Tahara)", desc: "Wudu et Ghusl" },
  { id: 7, title: "L'Adhan", desc: "L'appel au succès" },
  { id: 8, title: "La Prière (Salat)", desc: "Les bases" },
  { id: 9, title: "La Prière en détail", desc: "Positions et erreurs" },
  { id: 10, title: "La Zakat", desc: "Purifier ses biens" },
  { id: 11, title: "Le Jeûne (Sawm)", desc: "L'école de la piété" },
  { id: 12, title: "Le Hajj", desc: "Le voyage d'une vie" },
  { id: 13, title: "Les Parents", desc: "La porte du Paradis" },
  { id: 14, title: "La Langue", desc: "Dangers et mérites" },
  { id: 15, title: "Le Voisin", desc: "Droits et devoirs" },
  { id: 16, title: "La Sincérité (Ikhlas)", desc: "Le secret de l'acceptation" },
  { id: 17, title: "La Patience (Sabr)", desc: "La clé de la délivrance" },
  { id: 18, title: "Le Dhikr", desc: "L'invocation d'Allah" },
  { id: 19, title: "Adam & Hawwa", desc: "Le commencement" },
  { id: 20, title: "Nuh & Ibrahim", desc: "Les messagers de la patience" },
  { id: 21, title: "Moussa & Issa", desc: "Face à l'adversité" },
  { id: 22, title: "Les Femmes Illustres", desc: "Maryam, Khadija..." },
  { id: 23, title: "Les Compagnons", desc: "Les étoiles guidantes" },
  { id: 24, title: "La Mort & La Tombe", desc: "La première étape" },
  { id: 25, title: "Le Jour du Jugement", desc: "50 000 ans d'attente" },
  { id: 26, title: "La Balance", desc: "Le poids des actes" },
  { id: 27, title: "Le Pont (Sirat)", desc: "Plus fin qu'un cheveu" },
  { id: 28, title: "Le Paradis", desc: "La demeure éternelle" },
  { id: 29, title: "L'Enfer", desc: "Le châtiment" },
  { id: 30, title: "La Vision d'Allah", desc: "La récompense ultime" }
];

const FORUM_CHANNELS = [
  { name: "Général", desc: "Discussions générales de la communauté" },
  { name: "Fiqh", desc: "Questions de jurisprudence" },
  { name: "Hadiths", desc: "Paroles du Prophète ﷺ" },
  { name: "Coran", desc: "Étude et méditation du Coran" },
  { name: "Burdah", desc: "Poésie et spiritualité" },
  { name: "Prophètes", desc: "Histoires des prophètes" }
];

interface SearchBarProps {
  setPage: (page: PageType) => void;
}

export function SearchBar({ setPage }: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load playlists for local search
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchPlaylists()
        .then(data => {
          setPlaylists(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen]);

  // Open with Cmd/Ctrl + K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter lists
  const searchResults: Array<{
    type: 'playlist' | 'quiz' | 'forum';
    title: string;
    desc: string;
    target: PageType;
  }> = [];

  const cleanQuery = query.toLowerCase().trim();

  if (cleanQuery.length >= 2) {
    // Search playlists
    playlists.forEach(p => {
      if (p.title.toLowerCase().includes(cleanQuery) || p.desc?.toLowerCase().includes(cleanQuery) || p.key.toLowerCase().includes(cleanQuery)) {
        searchResults.push({
          type: 'playlist',
          title: p.title,
          desc: p.desc || 'Cours en vidéo',
          target: p.key as PageType
        });
      }
    });

    // Search quiz units
    QUIZ_UNITS.forEach(q => {
      if (q.title.toLowerCase().includes(cleanQuery) || q.desc.toLowerCase().includes(cleanQuery)) {
        searchResults.push({
          type: 'quiz',
          title: `Quiz : ${q.title}`,
          desc: q.desc,
          target: 'quiz'
        });
      }
    });

    // Search forum channels
    FORUM_CHANNELS.forEach(f => {
      if (f.name.toLowerCase().includes(cleanQuery) || f.desc.toLowerCase().includes(cleanQuery)) {
        searchResults.push({
          type: 'forum',
          title: `Forum : #${f.name}`,
          desc: f.desc,
          target: 'forum'
        });
      }
    });
  }

  // Keyboard navigation inside search results
  useEffect(() => {
    if (!isOpen || searchResults.length === 0) return;

    const handleNav = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % searchResults.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + searchResults.length) % searchResults.length);
      } else if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        selectResult(searchResults[activeIndex]);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleNav);
    return () => window.removeEventListener('keydown', handleNav);
  }, [isOpen, searchResults, activeIndex]);

  const selectResult = (result: typeof searchResults[0]) => {
    setPage(result.target);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <>
      {/* Search trigger button */}
      <button
        onClick={() => { setIsOpen(true); setActiveIndex(-1); }}
        className="flex items-center gap-2 px-4 py-2 bg-daara-surface border border-daara-gold/20 hover:border-daara-gold/40 text-daara-text-muted hover:text-daara-gold rounded-full text-xs font-semibold transition-all duration-300 shadow-sm"
        title="Rechercher (Ctrl+K)"
      >
        <Search className="w-4 h-4" />
        <span className="hidden md:inline">Rechercher...</span>
        <kbd className="hidden lg:inline-flex items-center bg-daara-bg/50 px-1.5 py-0.5 rounded text-[9px] font-mono border border-daara-gold/10 ml-1 select-none">
          Ctrl K
        </kbd>
      </button>

      {/* Full-screen Backdrop Search Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-daara-bg/95 backdrop-blur-xl flex justify-center p-4 sm:p-6 md:p-20 overflow-y-auto"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="w-full max-w-2xl bg-daara-surface border border-daara-gold/20 rounded-3xl shadow-2xl overflow-hidden h-fit flex flex-col mt-4"
              onClick={e => e.stopPropagation()}
            >
              {/* Header input bar */}
              <div className="flex items-center gap-3 px-6 py-5 border-b border-daara-gold/10 relative">
                <Search className="w-6 h-6 text-daara-gold shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Rechercher un hadith, un cours, un quiz, le forum..."
                  value={query}
                  onChange={e => { setQuery(e.target.value); setActiveIndex(-1); }}
                  autoFocus
                  className="w-full bg-transparent border-none text-daara-text placeholder-daara-text-muted text-base focus:outline-none"
                />
                {loading && <Loader2 className="w-5 h-5 text-daara-gold animate-spin mr-8" />}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-daara-bg/50 text-daara-text-muted hover:text-daara-gold rounded-xl transition-colors absolute right-4 top-1/2 -translate-y-1/2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body search results list */}
              <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
                {query.trim().length < 2 ? (
                  <div className="text-center py-10 space-y-2">
                    <p className="text-sm text-daara-text-muted font-medium">Saisissez au moins 2 caractères pour rechercher</p>
                    <div className="flex justify-center gap-2 flex-wrap">
                      {['Tawhid', 'Prière', 'Hadiths', 'Forum'].map(s => (
                        <button
                          key={s}
                          onClick={() => { setQuery(s); inputRef.current?.focus(); }}
                          className="px-3 py-1 bg-daara-bg hover:bg-daara-gold/10 border border-daara-gold/10 hover:border-daara-gold/30 text-daara-text-muted hover:text-daara-gold text-xs rounded-full transition-all"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-1.5">
                    {searchResults.map((res, i) => {
                      const isHighlighted = i === activeIndex;
                      return (
                        <div
                          key={i}
                          onClick={() => selectResult(res)}
                          onMouseEnter={() => setActiveIndex(i)}
                          className={`flex items-start gap-4 p-4 rounded-2xl cursor-pointer border transition-all duration-200 ${
                            isHighlighted
                              ? 'bg-daara-gold/15 border-daara-gold/30 shadow-md shadow-daara-gold/5'
                              : 'bg-daara-bg/20 border-transparent hover:bg-daara-bg/40'
                          }`}
                        >
                          <div className={`p-2.5 rounded-xl border shrink-0 ${
                            isHighlighted ? 'bg-daara-gold text-daara-bg border-daara-gold/20' : 'bg-daara-surface text-daara-gold border-daara-gold/10'
                          }`}>
                            {res.type === 'playlist' && <BookOpen className="w-5 h-5" />}
                            {res.type === 'quiz' && <HelpCircle className="w-5 h-5" />}
                            {res.type === 'forum' && <MessageSquare className="w-5 h-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-serif font-bold text-sm text-daara-text truncate">{res.title}</h4>
                            <p className="text-xs text-daara-text-muted mt-1 line-clamp-1">{res.desc}</p>
                          </div>
                          <ArrowRight className={`w-4 h-4 self-center transition-transform ${isHighlighted ? 'text-daara-gold translate-x-1' : 'text-daara-text-muted opacity-0 group-hover:opacity-100'}`} />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 space-y-2">
                    <p className="text-sm font-semibold text-daara-text-muted">Aucun résultat trouvé pour « {query} »</p>
                    <p className="text-xs text-daara-text-muted">Essayez d'autres mots clés comme Coran, Tahara ou prière.</p>
                  </div>
                )}
              </div>

              {/* Footer shortcut tips */}
              <div className="px-6 py-4 bg-daara-bg/40 border-t border-daara-gold/5 flex justify-between text-[11px] text-daara-text-muted select-none">
                <span>Sélectionner avec <kbd className="bg-daara-surface px-1 py-0.5 rounded border border-daara-gold/10">↵</kbd></span>
                <span>Naviguer avec <kbd className="bg-daara-surface px-1 py-0.5 rounded border border-daara-gold/10">↑</kbd> <kbd className="bg-daara-surface px-1 py-0.5 rounded border border-daara-gold/10">↓</kbd></span>
                <span>Fermer avec <kbd className="bg-daara-surface px-1 py-0.5 rounded border border-daara-gold/10">esc</kbd></span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
