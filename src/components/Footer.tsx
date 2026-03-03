import React from 'react';
import { Mail, Heart } from 'lucide-react';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="bg-daara-surface border-t border-daara-gold/10 py-12 mt-12">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="mb-10 flex flex-col items-center">
          <Logo className="w-16 h-16 mb-6 opacity-80" />
          <h3 className="text-2xl font-serif font-bold text-daara-gold mb-4">Soutenir Iqra Quest</h3>
          <p className="text-daara-text-muted max-w-xl mx-auto mb-6">
            Notre plateforme est gratuite et le restera. Si vous souhaitez nous aider à maintenir les serveurs et à créer plus de contenu, vous pouvez faire un don (Sadaqah Jariyah).
          </p>
          <button className="inline-flex items-center gap-2 bg-daara-text hover:bg-daara-text/90 text-daara-bg px-8 py-3 rounded-full font-bold transition-all hover:scale-105 shadow-lg shadow-daara-gold/5">
            <Heart className="w-5 h-5 text-daara-gold" />
            Faire un don
          </button>
        </div>

        <div className="border-t border-daara-gold/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-daara-text-muted font-medium">
            &copy; {new Date().getFullYear()} Iqra Quest – Plateforme islamique d’apprentissage
          </p>
          <a 
            href="mailto:contact@iqraquest.com" 
            className="inline-flex items-center gap-2 text-daara-gold hover:text-daara-gold-light transition-colors font-bold bg-daara-bg px-6 py-2 rounded-full border border-daara-gold/20 shadow-sm"
          >
            <Mail className="w-4 h-4" />
            contact@iqraquest.com
          </a>
        </div>
      </div>
    </footer>
  );
}
