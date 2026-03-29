import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Trophy, Medal, Star, Search } from 'lucide-react';
import { motion } from 'motion/react';

interface Score {
  id: string;
  playerName: string;
  playerPhoto: string;
  score: number;
  difficulty: string;
}

export function Leaderboard() {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLoading(true);
    let q;
    if (searchTerm.trim() === '') {
      q = query(
        collection(db, 'quiz_scores'),
        orderBy('score', 'desc'),
        limit(50)
      );
    } else {
      q = query(
        collection(db, 'quiz_scores'),
        where('playerName', '>=', searchTerm),
        where('playerName', '<=', searchTerm + '\uf8ff'),
        limit(50)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newScores: Score[] = [];
      snapshot.forEach((doc) => {
        newScores.push({ id: doc.id, ...doc.data() } as Score);
      });
      
      if (searchTerm.trim() !== '') {
        newScores.sort((a, b) => b.score - a.score);
      }
      
      setScores(newScores);
      setLoading(false);
    }, (error) => {
      setLoading(false);
      handleFirestoreError(error, OperationType.LIST, 'quiz_scores');
    });

    return () => unsubscribe();
  }, [searchTerm]);

  if (loading && scores.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-daara-gold"></div>
      </div>
    );
  }

  return (
    <div className="bg-daara-surface rounded-3xl p-6 md:p-8 shadow-xl border border-daara-gold/20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-daara-gold" />
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-daara-text">Classement Global</h2>
        </div>
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-daara-text-muted" />
          </div>
          <input
            type="text"
            placeholder="Rechercher un joueur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-daara-bg border border-daara-gold/30 rounded-xl focus:border-daara-gold focus:outline-none focus:ring-2 focus:ring-daara-gold/20 transition-colors text-daara-text"
          />
        </div>
      </div>

      {scores.length === 0 ? (
        <p className="text-daara-text-muted text-center py-8">Aucun score trouvé.</p>
      ) : (
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {scores.map((score, index) => (
            <motion.div
              key={score.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center justify-between p-4 rounded-2xl border ${
                index === 0 ? 'bg-daara-gold/10 border-daara-gold/50' :
                index === 1 ? 'bg-gray-300/10 border-gray-400/30' :
                index === 2 ? 'bg-amber-700/10 border-amber-700/30' :
                'bg-daara-bg border-daara-gold/10'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8 font-bold text-lg">
                  {index === 0 ? <Medal className="w-8 h-8 text-daara-gold" /> :
                   index === 1 ? <Medal className="w-8 h-8 text-gray-400" /> :
                   index === 2 ? <Medal className="w-8 h-8 text-amber-700" /> :
                   <span className="text-daara-text-muted">{index + 1}</span>}
                </div>
                <div className="flex items-center gap-3">
                  {score.playerPhoto ? (
                    <img src={score.playerPhoto} alt={score.playerName} className="w-10 h-10 rounded-full border border-daara-gold/30" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-daara-gold/20 flex items-center justify-center text-daara-gold font-bold">
                      {score.playerName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-daara-text">{score.playerName}</p>
                    <p className="text-xs text-daara-text-muted capitalize">Niveau {Math.floor(score.score / 100) + 1}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl text-daara-gold">{score.score} XP</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
