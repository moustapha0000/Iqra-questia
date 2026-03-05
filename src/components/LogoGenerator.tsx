import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Sparkles, Loader2, Image as ImageIcon } from 'lucide-react';

export function LogoGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      // Check for API key selection (required for gemini-3.1-flash-image-preview)
      // @ts-ignore
      if (window.aistudio && !await window.aistudio.hasSelectedApiKey()) {
        // @ts-ignore
        await window.aistudio.openSelectKey();
      }

      // Create a fresh instance to pick up the newly selected key
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY });

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: {
          parts: [
            {
              text: 'A beautiful, elegant, and highly detailed Islamic logo for an app named "Iqra Quest". The logo features a crescent moon, an 8-pointed star, and a stylized open Quran. The color palette is dark with rich gold accents. High quality, vector style, flat design, clean background.',
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: "1K"
          }
        },
      });

      let base64Image = null;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          base64Image = part.inlineData.data;
          break;
        }
      }

      if (base64Image) {
        const imageUrl = `data:image/png;base64,${base64Image}`;
        localStorage.setItem('iqra-generated-logo', imageUrl);
        // Dispatch a custom event to notify the Logo component to re-render
        window.dispatchEvent(new Event('logo-updated'));
      } else {
        throw new Error("Aucune image n'a été générée.");
      }
    } catch (err: any) {
      console.error('Error generating logo:', err);
      setError(err.message || "Une erreur s'est produite lors de la génération.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    localStorage.removeItem('iqra-generated-logo');
    window.dispatchEvent(new Event('logo-updated'));
  };

  const hasCustomLogo = !!localStorage.getItem('iqra-generated-logo');

  return (
    <div className="mt-8 p-6 bg-daara-surface/50 rounded-2xl border border-daara-gold/10 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="w-6 h-6 text-daara-gold" />
        <h3 className="text-xl font-serif font-bold text-daara-gold">Générateur de Logo IA</h3>
      </div>
      <p className="text-daara-text/80 text-sm mb-6">
        Pas convaincu par le logo actuel ? Utilisez l'IA (Nanobanana 2) pour générer un nouveau logo unique pour Iqra Quest.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-4">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-daara-gold to-daara-gold-light text-daara-dark font-bold rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              <ImageIcon className="w-5 h-5" />
              Générer avec Nanobanana 2
            </>
          )}
        </button>

        {hasCustomLogo && (
          <button
            onClick={handleReset}
            disabled={isGenerating}
            className="px-6 py-3 bg-daara-surface text-daara-text border border-daara-gold/20 rounded-xl hover:bg-daara-gold/10 transition-colors"
          >
            Restaurer le logo par défaut
          </button>
        )}
      </div>
    </div>
  );
}
