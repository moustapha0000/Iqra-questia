import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Trophy, Medal, Star } from 'lucide-react';
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

  useEffect(() => {
    const q = query(
      collection(db, 'quiz_scores'),
      orderBy('score', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newScores: Score[] = [];
      snapshot.forEach((doc) => {
        newScores.push({ id: doc.id, ...doc.data() } as Score);
      });
      setScores(newScores);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'quiz_scores');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-daara-gold"></div>
      </div>
    );
  }

  return (
    <div className="bg-daara-surface rounded-3xl p-6 md:p-8 shadow-xl border border-daara-gold/20">
      <div className="flex items-center gap-3 mb-8">
        <Trophy className="w-8 h-8 text-daara-gold" />
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-daara-text">Classement Global</h2>
      </div>

      {scores.length === 0 ? (
        <p className="text-daara-text-muted text-center py-8">Aucun score pour le moment. Soyez le premier !</p>
      ) : (
        <div className="space-y-4">
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
                    <p className="text-xs text-daara-text-muted capitalize">{score.difficulty}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl text-daara-gold">{score.score}</span>
                <Star className="w-5 h-5 text-daara-gold fill-daara-gold" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
