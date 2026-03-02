import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Loader2, User, Bot, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: "As-salamu alaykum ! Je suis le Guide Iqra. Je suis là pour répondre à toutes vos questions concernant l'Islam, le Coran, les Hadiths et la jurisprudence (Fiqh). Comment puis-je vous aider aujourd'hui ?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Gemini API
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Ne scroller automatiquement que lorsqu'un NOUVEAU message est ajouté,
  // pas à chaque mise à jour du texte (pendant le streaming).
  // Cela permet à l'utilisateur de lire depuis le début de la réponse.
  useEffect(() => {
    scrollToBottom();
  }, [messages.length, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (!navigator.onLine) {
      setMessages((prev) => [
        ...prev,
        { role: 'user', text: input.trim() },
        { role: 'model', text: "Désolé, je ne peux pas me connecter au réseau. Veuillez vérifier votre connexion internet pour continuer à discuter avec moi." },
      ]);
      setInput('');
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const historyMessages = messages.slice(1);
      const historyContents: any[] = [];
      let lastRole = '';
      
      for (const m of historyMessages) {
        if (m.text.trim() === '') continue;
        if (historyContents.length === 0 && m.role === 'model') continue;
        
        if (m.role !== lastRole) {
          historyContents.push({ role: m.role, parts: [{ text: m.text }] });
          lastRole = m.role;
        } else {
          historyContents[historyContents.length - 1].parts[0].text += '\n\n' + m.text;
        }
      }
      
      if (lastRole === 'user') {
        historyContents[historyContents.length - 1].parts[0].text += '\n\n' + userMessage;
      } else {
        historyContents.push({ role: 'user', parts: [{ text: userMessage }] });
      }

      const response = await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: historyContents,
        config: {
          systemInstruction: `Tu es "L'Oustaz", un enseignant et érudit bienveillant, sage et très compétent en Islam. 
Ton rôle est d'accompagner les utilisateurs dans leur apprentissage de la religion.

RÈGLES IMPORTANTES :
1. DOMAINE D'EXPERTISE : Réponds UNIQUEMENT aux questions sur l'Islam (Coran, Hadiths, Fiqh, Seerah, spiritualité, comportement). Si on te pose une question hors sujet, excuse-toi poliment et recadre sur l'Islam.
2. SOURCES : Base toujours tes réponses sur le Coran et la Sunnah authentique. Cite les références quand c'est possible.
3. TON ET STYLE : Sois chaleureux, encourageant, apaisant et respectueux. Utilise des formules de politesse islamiques (As-salamu alaykum, Insha'Allah, BarakAllahu feek).
4. LANGUE : Réponds toujours dans la langue utilisée par l'utilisateur. S'il te parle en français, réponds en français clair et universel. S'il te parle en wolof, réponds en wolof. N'utilise pas de termes wolofs si l'utilisateur s'exprime en français, afin de rester compréhensible pour tous.
5. FORMATAGE : Utilise le Markdown pour structurer tes réponses. Fais des paragraphes courts, utilise des listes à puces, et mets en gras les termes importants pour faciliter la lecture sur téléphone. Sois concis mais complet.`,
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
        }
      });

      // We don't set isLoading(false) here so the loader stays until the first chunk arrives
      let isFirstChunk = true;

      let fullText = '';
      for await (const chunk of response) {
        if (isFirstChunk) {
          setIsLoading(false);
          setMessages((prev) => [...prev, { role: 'model', text: '' }]);
          isFirstChunk = false;
        }
        if (chunk.text) {
          fullText += chunk.text;
          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].text = fullText;
            return newMessages;
          });
        }
      }
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages((prev) => [
        ...prev,
        { role: 'model', text: "Désolé, une erreur s'est produite. Veuillez vérifier votre connexion ou réessayer plus tard." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 sm:bottom-8 right-4 sm:right-8 w-14 h-14 bg-gradient-to-r from-daara-gold to-daara-gold-light text-daara-bg rounded-full shadow-lg shadow-daara-gold/30 hover:scale-110 hover:shadow-xl hover:shadow-daara-gold/40 transition-all z-50 flex items-center justify-center group ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
        aria-label="Ouvrir le Guide Iqra"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="absolute right-full mr-4 bg-daara-surface text-daara-gold px-3 py-1.5 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden sm:block border border-daara-gold/20">
          Guide IA
        </span>
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed z-[60] flex flex-col overflow-hidden bg-daara-surface border border-daara-gold/20 shadow-2xl transition-all duration-300 ${
              isExpanded 
                ? 'inset-4 sm:inset-10 rounded-3xl' 
                : 'bottom-6 right-6 w-[90vw] sm:w-[450px] h-[600px] max-h-[85vh] rounded-2xl'
            }`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-daara-bg to-daara-surface p-4 border-b border-daara-gold/10 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-daara-gold/20 flex items-center justify-center text-daara-gold border border-daara-gold/30">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-daara-text">Guide Iqra</h3>
                  <p className="text-sm text-daara-gold">En ligne</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-daara-text-muted hover:text-daara-gold transition-colors p-2 hidden sm:block"
                  title={isExpanded ? "Réduire" : "Agrandir"}
                >
                  {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-daara-text-muted hover:text-daara-gold transition-colors p-2"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-daara-bg/50">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 ${
                      msg.role === 'user' ? 'bg-daara-surface border border-daara-gold/20 text-daara-text' : 'bg-daara-gold text-daara-bg'
                    }`}>
                      {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
                    </div>
                    <div
                      className={`p-4 rounded-2xl ${
                        msg.role === 'user'
                          ? 'bg-daara-surface border border-daara-gold/20 text-daara-text rounded-tr-sm'
                          : 'bg-daara-gold/10 border border-daara-gold/30 text-daara-text rounded-tl-sm'
                      }`}
                    >
                      <div className="text-base leading-relaxed max-w-none [&>p]:mb-3 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:ml-5 [&>ul]:mb-3 [&>ol]:list-decimal [&>ol]:ml-5 [&>ol]:mb-3 [&>strong]:text-daara-gold-light">
                        <Markdown>{msg.text}</Markdown>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-2 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-daara-gold text-daara-bg flex-shrink-0 flex items-center justify-center mt-1">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="p-4 rounded-2xl bg-daara-gold/10 border border-daara-gold/30 rounded-tl-sm flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-daara-gold animate-spin" />
                      <span className="text-xs text-daara-gold">L'Oustaz écrit...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-daara-surface border-t border-daara-gold/10">
              <div className="relative flex items-center">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Posez votre question sur l'Islam..."
                  className="w-full bg-daara-bg border border-daara-gold/20 rounded-xl pl-4 pr-12 py-4 text-base text-daara-text placeholder-daara-text-muted focus:outline-none focus:border-daara-gold focus:ring-1 focus:ring-daara-gold resize-none scrollbar-hide"
                  rows={1}
                  style={{ minHeight: '56px', maxHeight: '150px' }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 p-2 text-daara-gold hover:text-daara-gold-light disabled:opacity-50 disabled:hover:text-daara-gold transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[10px] text-center text-daara-text-muted mt-2">
                L'Oustaz IA peut faire des erreurs. Consultez un savant pour les questions complexes.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
