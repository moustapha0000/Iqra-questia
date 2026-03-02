import React from 'react';
import { motion } from 'motion/react';
import { Heart, BookOpen, Users, Mail } from 'lucide-react';

export function About() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-3xl mx-auto py-16"
    >
      <div className="text-center mb-16">
        <h1 className="text-5xl font-serif font-bold text-daara-gold mb-6">
          À propos d'Iqra Quest
        </h1>
        <p className="text-xl text-daara-text-muted leading-relaxed">
          Notre mission est de rendre l'apprentissage de l'Islam accessible, moderne et authentique. 
          Nous combinons la sagesse traditionnelle avec les technologies d'aujourd'hui pour vous accompagner dans votre cheminement spirituel.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {[
          { icon: BookOpen, title: "Savoir Authentique", desc: "Des enseignements basés strictement sur le Coran et la Sunnah." },
          { icon: Users, title: "Pour Tous Niveaux", desc: "Des ressources adaptées aux débutants comme aux étudiants avancés." },
          { icon: Heart, title: "Fait avec Passion", desc: "Une équipe dévouée à la transmission de la lumière de l'Islam." }
        ].map((item, i) => (
          <div key={i} className="bg-daara-surface p-8 rounded-3xl text-center shadow-lg border border-daara-gold/10 hover:border-daara-gold/30 transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 mx-auto bg-daara-bg border border-daara-gold/20 rounded-full flex items-center justify-center text-daara-gold mb-6">
              <item.icon className="w-7 h-7" />
            </div>
            <h3 className="font-serif font-bold text-xl text-daara-text mb-3">{item.title}</h3>
            <p className="text-sm text-daara-text-muted leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-daara-surface border border-daara-gold/20 p-10 rounded-3xl text-center relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-daara-gold/10 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-3xl font-serif font-bold text-daara-gold mb-4">Besoin d'un accompagnement ?</h2>
          <p className="mb-8 text-daara-text-muted text-lg max-w-xl mx-auto">
            Vous avez des questions spécifiques ou vous souhaitez des cours particuliers ? Notre équipe est à votre disposition.
          </p>
          <a 
            href="mailto:contact@iqraquest.com" 
            className="inline-flex items-center gap-3 bg-gradient-to-r from-daara-gold to-daara-gold-light text-daara-bg px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform shadow-lg shadow-daara-gold/20"
          >
            <Mail className="w-6 h-6" />
            Nous envoyer un email
          </a>
        </div>
      </div>
    </motion.div>
  );
}
