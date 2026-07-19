import React from 'react';
import { motion } from 'motion/react';
import { Shield, FileText } from 'lucide-react';

export function Legal() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto py-16 px-4"
    >
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-daara-gold mb-6">
          Mentions Légales & Confidentialité
        </h1>
        <p className="text-xl text-daara-text-muted leading-relaxed">
          Transparence et sécurité pour nos utilisateurs.
        </p>
      </div>

      <div className="space-y-12">
        <section className="bg-daara-surface p-8 rounded-3xl border border-daara-gold/10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-daara-bg border border-daara-gold/20 flex items-center justify-center text-daara-gold">
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-daara-text">Mentions Légales</h2>
          </div>
          <div className="text-daara-text-muted space-y-4">
            <p><strong>Éditeur du site :</strong> Iqra Quest</p>
            <p><strong>Hébergement :</strong> Le site est hébergé par Netlify, Inc., situé au 44 Montgomery Street, Suite 300, San Francisco, California 94104.</p>
            <p><strong>Propriété Intellectuelle :</strong> Tous les contenus présents sur la plateforme (vidéos, quiz, textes) sont la propriété d'Iqra Quest ou utilisés avec autorisation. Toute reproduction sans accord est interdite.</p>
          </div>
        </section>

        <section className="bg-daara-surface p-8 rounded-3xl border border-daara-gold/10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-daara-bg border border-daara-gold/20 flex items-center justify-center text-daara-gold">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-daara-text">Politique de Confidentialité</h2>
          </div>
          <div className="text-daara-text-muted space-y-4">
            <p><strong>Collecte des données :</strong> Nous collectons votre adresse e-mail, nom et prénom lors de votre inscription pour sécuriser votre compte et vous fournir une expérience personnalisée.</p>
            <p><strong>Utilisation :</strong> Vos données servent uniquement au fonctionnement de l'application (sauvegarde de la progression, forum, accès aux cours) et ne sont en aucun cas vendues à des tiers.</p>
            <p><strong>Sécurité :</strong> Les données sont sécurisées via la technologie Firebase (Google). Les mots de passe sont cryptés et inaccessibles par les administrateurs.</p>
            <p><strong>Suppression des données :</strong> Vous pouvez demander la suppression complète de vos données et de votre compte à tout moment en nous contactant à iqraquest2.0@gmail.com.</p>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
