import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Loader2, User, Bot, Maximize2, Minimize2, Paperclip, ScanEye, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';

interface AttachedFile {
  name: string;
  mimeType: string;
  data: string; // base64
  url: string; // object URL for preview
}

interface Message {
  role: 'user' | 'model';
  text: string;
  files?: AttachedFile[];
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
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [pageContext, setPageContext] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Gemini API
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const systemInstruction = `Tu es "Guide Iqra", un enseignant et érudit bienveillant, sage et très compétent en Islam. 
Ton rôle est d'accompagner les utilisateurs dans leur apprentissage de la religion.

RÈGLES IMPORTANTES :
1. DOMAINE D'EXPERTISE : Réponds UNIQUEMENT aux questions sur l'Islam (Coran, Hadiths, Fiqh, Seerah, spiritualité, comportement). Si on te pose une question hors sujet, excuse-toi poliment et recadre sur l'Islam.
2. SOURCES : Base toujours tes réponses sur le Coran et la Sunnah authentique. Cite les références quand c'est possible.
3. TON ET STYLE : Sois chaleureux, encourageant, apaisant et respectueux. Utilise des formules de politesse islamiques (As-salamu alaykum, Insha'Allah, BarakAllahu feek).
4. LANGUE : Réponds toujours dans la langue utilisée par l'utilisateur. S'il te parle en français, réponds en français clair et universel. S'il te parle en wolof, réponds en wolof. N'utilise pas de termes wolofs si l'utilisateur s'exprime en français, afin de rester compréhensible pour tous.
5. FORMATAGE : Utilise le Markdown pour structurer tes réponses. Fais des paragraphes courts, utilise des listes à puces, et mets en gras les termes importants pour faciliter la lecture sur téléphone. Sois concis mais complet.
6. ANALYSE DE FICHIERS/CONTEXTE : Si l'utilisateur te fournit le contexte d'une page, une image ou un fichier, analyse-le attentivement pour répondre à sa question de manière précise et contextualisée.`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Ne scroller automatiquement que lorsqu'un NOUVEAU message est ajouté,
  // pas à chaque mise à jour du texte (pendant le streaming).
  // Cela permet à l'utilisateur de lire depuis le début de la réponse.
  useEffect(() => {
    scrollToBottom();
  }, [messages.length, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    Promise.all(files.map(file => new Promise<AttachedFile>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve({
          name: file.name,
          mimeType: file.type,
          data: base64,
          url: URL.createObjectURL(file)
        });
      };
      reader.readAsDataURL(file);
    }))).then(newFiles => {
      setAttachedFiles(prev => [...prev, ...newFiles]);
    });
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].url);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const attachPageContext = () => {
    if (pageContext) {
      setPageContext(null); // Toggle off
      return;
    }
    // Extract text from the main content area, fallback to body
    const mainContent = document.querySelector('main')?.innerText || document.body.innerText;
    // Limit to ~15000 characters to avoid huge payloads
    setPageContext(mainContent.substring(0, 15000));
  };

  const handleSend = async () => {
    if ((!input.trim() && attachedFiles.length === 0 && !pageContext) || isLoading) return;

    if (!navigator.onLine) {
      setMessages((prev) => [
        ...prev,
        { role: 'user', text: input.trim() || 'Fichier(s) joint(s)' },
        { role: 'model', text: "Désolé, je ne peux pas me connecter au réseau. Veuillez vérifier votre connexion internet pour continuer à discuter avec moi." },
      ]);
      setInput('');
      return;
    }

    const userMessage = input.trim();
    const currentFiles = [...attachedFiles];
    const currentPageContext = pageContext;
    
    setInput('');
    setAttachedFiles([]);
    setPageContext(null);
    
    setMessages((prev) => [...prev, { role: 'user', text: userMessage, files: currentFiles }]);
    setIsLoading(true);

    try {
      // Build history for generateContentStream
      const historyContents: any[] = [];
      let lastRole = '';
      
      const historyMessages = messages.slice(1); // Skip initial greeting
      
      for (const m of historyMessages) {
        if (m.text.trim() === '' && (!m.files || m.files.length === 0)) continue;
        if (historyContents.length === 0 && m.role === 'model') continue;
        
        const parts: any[] = [];
        if (m.text) parts.push({ text: m.text });
        if (m.files) {
          m.files.forEach(f => parts.push({ inlineData: { data: f.data, mimeType: f.mimeType } }));
        }
        
        if (m.role !== lastRole) {
          historyContents.push({ role: m.role, parts });
          lastRole = m.role;
        } else {
          historyContents[historyContents.length - 1].parts.push(...parts);
        }
      }
      
      // Add current message
      const currentParts: any[] = [];
      if (currentPageContext) {
        currentParts.push({ text: `[CONTEXTE DE LA PAGE ACTUELLE FOURNI PAR L'UTILISATEUR]\n${currentPageContext}\n[FIN DU CONTEXTE]\n\n` });
      }
      if (userMessage) currentParts.push({ text: userMessage });
      currentFiles.forEach(f => currentParts.push({ inlineData: { data: f.data, mimeType: f.mimeType } }));
      
      if (currentParts.length === 0) currentParts.push({ text: "Pouvez-vous analyser ceci ?" });

      if (lastRole === 'user') {
        historyContents[historyContents.length - 1].parts.push(...currentParts);
      } else {
        historyContents.push({ role: 'user', parts: currentParts });
      }

      let response;
      let retries = 3;
      let delay = 1000;

      while (retries > 0) {
        try {
          response = await ai.models.generateContentStream({
            model: 'gemini-3-flash-preview', // Use flash for multimodal capabilities
            contents: historyContents,
            config: {
              systemInstruction,
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
            }
          });
          break; // Success, exit retry loop
        } catch (error: any) {
          if (error?.status === 503 || error?.message?.includes('503') || error?.message?.includes('UNAVAILABLE')) {
            retries--;
            if (retries === 0) throw error;
            console.warn(`API overloaded, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // Exponential backoff
          } else {
            throw error;
          }
        }
      }

      if (!response) {
        throw new Error("Impossible d'obtenir une réponse après plusieurs tentatives.");
      }

      // We don't set isLoading(false) here so the loader stays until the first chunk arrives
      let isFirstChunk = true;

      let fullText = '';
      for await (const chunk of response) {
        const c = chunk as any;
        if (isFirstChunk) {
          setIsLoading(false);
          setMessages((prev) => [...prev, { role: 'model', text: '' }]);
          isFirstChunk = false;
        }
        if (c.text) {
          fullText += c.text;
          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].text = fullText;
            return newMessages;
          });
        }
      }
    } catch (error: any) {
      console.error("Chatbot error:", error);
      let errorMessage = "Désolé, une erreur s'est produite. Veuillez vérifier votre connexion ou réessayer plus tard.";
      
      if (error?.status === 503 || error?.message?.includes('503') || error?.message?.includes('UNAVAILABLE')) {
        errorMessage = "Désolé, je suis actuellement très sollicité. Veuillez patienter quelques instants et réessayer.";
      } else if (error?.message) {
        // Try to parse JSON error message if it's a stringified JSON
        try {
          const parsed = JSON.parse(error.message);
          if (parsed.error && parsed.error.message) {
            const innerParsed = JSON.parse(parsed.error.message);
            if (innerParsed.error && innerParsed.error.message) {
               errorMessage = `Erreur: ${innerParsed.error.message}`;
            }
          }
        } catch (e) {
          errorMessage = `Erreur: ${error.message}`;
        }
      }

      setMessages((prev) => [
        ...prev,
        { role: 'model', text: errorMessage },
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
        id="chatbot-toggle"
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
                      {msg.files && msg.files.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {msg.files.map((file, i) => (
                            <div key={i} className="relative group rounded-lg overflow-hidden border border-daara-gold/20">
                              {file.mimeType.startsWith('image/') ? (
                                <img src={file.url} alt={file.name} className="h-20 w-auto object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="h-20 w-20 flex flex-col items-center justify-center bg-daara-bg p-2 text-center">
                                  <Paperclip className="w-6 h-6 text-daara-gold mb-1" />
                                  <span className="text-[10px] text-daara-text truncate w-full">{file.name}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {msg.text && (
                        <div className="text-base leading-relaxed max-w-none [&>p]:mb-3 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:ml-5 [&>ul]:mb-3 [&>ol]:list-decimal [&>ol]:ml-5 [&>ol]:mb-3 [&>strong]:text-daara-gold-light">
                          <Markdown>{msg.text}</Markdown>
                        </div>
                      )}
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
                      <span className="text-xs text-daara-gold">Guide Iqra écrit...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-daara-surface border-t border-daara-gold/10">
              
              {/* Attachments Preview */}
              {(attachedFiles.length > 0 || pageContext) && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {pageContext && (
                    <div className="flex items-center gap-2 bg-daara-gold/10 border border-daara-gold/30 text-daara-gold px-3 py-1.5 rounded-lg text-sm">
                      <ScanEye className="w-4 h-4" />
                      <span>Contexte de la page inclus</span>
                      <button onClick={() => setPageContext(null)} className="hover:text-daara-gold-light ml-1">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {attachedFiles.map((file, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border border-daara-gold/30 bg-daara-bg">
                      {file.mimeType.startsWith('image/') ? (
                        <img src={file.url} alt={file.name} className="h-12 w-auto object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="h-12 px-3 flex items-center gap-2">
                          <Paperclip className="w-4 h-4 text-daara-gold" />
                          <span className="text-xs text-daara-text max-w-[100px] truncate">{file.name}</span>
                        </div>
                      )}
                      <button 
                        onClick={() => removeFile(idx)}
                        className="absolute top-0 right-0 bg-daara-text/50 text-daara-bg p-1 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="relative flex items-center gap-2">
                <div className="flex gap-1">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    multiple 
                    accept="image/*,audio/*,video/*,application/pdf"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-daara-text-muted hover:text-daara-gold hover:bg-daara-gold/10 rounded-xl transition-colors"
                    title="Joindre un fichier (Image, Audio, Vidéo)"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button
                    onClick={attachPageContext}
                    className={`p-2 rounded-xl transition-colors ${pageContext ? 'text-daara-gold bg-daara-gold/10' : 'text-daara-text-muted hover:text-daara-gold hover:bg-daara-gold/10'}`}
                    title="Analyser le contenu de cette page"
                  >
                    <ScanEye className="w-5 h-5" />
                  </button>
                </div>

                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Posez votre question..."
                  className="flex-1 bg-daara-bg border border-daara-gold/20 rounded-xl pl-4 pr-12 py-3 text-base text-daara-text placeholder-daara-text-muted focus:outline-none focus:border-daara-gold focus:ring-1 focus:ring-daara-gold resize-none scrollbar-hide"
                  rows={1}
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                />
                <button
                  onClick={handleSend}
                  disabled={(!input.trim() && attachedFiles.length === 0 && !pageContext) || isLoading}
                  className="absolute right-2 p-2 text-daara-gold hover:text-daara-gold-light disabled:opacity-50 disabled:hover:text-daara-gold transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[10px] text-center text-daara-text-muted mt-2">
                Guide Iqra peut faire des erreurs. Consultez un savant pour les questions complexes.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
