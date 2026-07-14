import React from 'react';
import { motion } from 'motion/react';
import { PlaylistInfo, PageType } from '../types';
import { Lock, Crown, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { hasAccess } from '../data';

interface VideoSectionProps {
  info: PlaylistInfo;
  setPage?: (page: PageType) => void;
}

function getPlanLabel(plan: string | undefined) {
  switch (plan) {
    case 'basic': return 'Basique';
    case 'standard': return 'Standard';
    case 'premium': return 'Premium';
    default: return 'Gratuit';
  }
}

export function VideoSection({ info, setPage }: VideoSectionProps) {
  const { subscription } = useAuth();
  const requiredPlan = info.requiredPlan || 'free';
  const userHasAccess = hasAccess(subscription, requiredPlan);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto py-12"
    >
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-daara-text mb-6">
          {info.title}
        </h1>
        <p className="text-xl text-daara-text-muted max-w-2xl mx-auto">
          {info.desc}
        </p>
      </div>

      {!userHasAccess ? (
        /* Access Denied - Elegant Lock Screen */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-daara-surface p-8 md:p-16 rounded-3xl shadow-2xl border border-daara-gold/20 text-center relative overflow-hidden"
        >
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[400px] aspect-square bg-daara-gold/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10">
            {/* Lock Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-daara-gold/20 to-daara-gold/5 border border-daara-gold/20 mb-8">
              <Lock className="w-10 h-10 text-daara-gold" />
            </div>

            <h2 className="text-3xl font-serif font-bold text-daara-text mb-4">
              Contenu réservé aux abonnés
            </h2>
            <p className="text-daara-text-muted text-lg mb-3 max-w-md mx-auto">
              Ce module nécessite un abonnement <span className="text-daara-gold font-bold">{getPlanLabel(requiredPlan)}</span> ou supérieur.
            </p>
            <p className="text-daara-text-muted text-sm mb-10 max-w-md mx-auto">
              Investissez dans votre savoir islamique et accédez à tout le contenu de la plateforme.
            </p>

            {/* Preview Blur Effect */}
            <div className="relative mb-10 rounded-2xl overflow-hidden">
              <div className="w-full aspect-video bg-daara-bg/80 rounded-2xl flex items-center justify-center">
                <div className="text-daara-text-muted opacity-30 text-6xl font-serif">بسم الله</div>
              </div>
              <div className="absolute inset-0 backdrop-blur-md bg-daara-bg/40 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <Crown className="w-12 h-12 text-daara-gold mx-auto mb-3" />
                  <p className="text-daara-gold font-bold text-sm">Aperçu verrouillé</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            {setPage ? (
              <button
                onClick={() => setPage('abonnement')}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-daara-gold to-daara-gold-light hover:from-daara-gold-light hover:to-daara-gold text-daara-bg px-10 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-lg shadow-daara-gold/20"
              >
                <Crown className="w-5 h-5" />
                Voir les offres d'abonnement
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <a
                href="#abonnement"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-daara-gold to-daara-gold-light hover:from-daara-gold-light hover:to-daara-gold text-daara-bg px-10 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-lg shadow-daara-gold/20"
              >
                <Crown className="w-5 h-5" />
                Voir les offres d'abonnement
                <ArrowRight className="w-5 h-5" />
              </a>
            )}
          </div>
        </motion.div>
      ) : (
        /* Content Available */
        <div className="bg-daara-surface p-3 md:p-6 rounded-3xl shadow-xl border border-daara-gold/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-daara-gold/5 to-transparent pointer-events-none" />
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-daara-bg shadow-inner">
            {info.id.startsWith('PL_FAKE') ? (
              <div className="absolute inset-0 flex items-center justify-center flex-col text-daara-text-muted">
                <p className="text-xl font-serif mb-2 font-bold">Vidéos en cours de préparation</p>
                <p className="text-sm font-medium">Revenez bientôt insha'Allah</p>
              </div>
            ) : (
              <iframe
                className="absolute top-0 left-0 w-full h-full border-0"
                src={`https://www.youtube.com/embed/videoseries?list=${info.id}&rel=0`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={info.title}
              ></iframe>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
