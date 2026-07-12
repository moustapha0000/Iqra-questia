import React from 'react';
import { motion } from 'motion/react';
import { PlaylistInfo } from '../types';

interface VideoSectionProps {
  info: PlaylistInfo;
}

export function VideoSection({ info }: VideoSectionProps) {
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
    </motion.div>
  );
}
