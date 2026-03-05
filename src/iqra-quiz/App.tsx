import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Unit, Question, UserState, Language } from './types';
import { getUnitsForLanguage } from './data';
import { getT } from './translations';

// --- HOOKS & UTILS ---

const useWindowSize = () => {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return size;
};

// Système Audio
let audioCtx: AudioContext | null = null;
const getAudioContext = () => {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  return audioCtx;
};

const playSound = (type: 'CORRECT' | 'WRONG' | 'COMPLETE' | 'BUY', enabled: boolean) => {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx || ctx.state === 'suspended') ctx?.resume().catch(() => {});
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  const now = ctx.currentTime;

  if (type === 'CORRECT') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.exponentialRampToValueAtTime(1000, now + 0.1);
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    osc.start(now);
    osc.stop(now + 0.4);
  } else if (type === 'WRONG') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(100, now + 0.3);
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.linearRampToValueAtTime(0.01, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
  } else if (type === 'COMPLETE') {
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'triangle';
        o.frequency.value = freq;
        o.connect(g);
        g.connect(ctx.destination);
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.1, now + i * 0.1 + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.8);
        o.start(now + i * 0.1);
        o.stop(now + i * 0.1 + 0.8);
    });
  } else if (type === 'BUY') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, now);
    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
  }
};

// --- CONFETTI ---
const Confetti = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    let particles: any[] = [];
    const colors = ['#059669', '#2b70c9', '#ff9600', '#ff4b4b', '#f7cd1f'];
    
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        speedX: (Math.random() - 0.5) * 15,
        speedY: (Math.random() - 0.5) * 15,
        gravity: 0.5,
        drag: 0.95,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 10 - 5
      });
    }

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles = particles.filter(p => p.size > 0.1);
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.speedY += p.gravity;
        p.speedX *= p.drag;
        p.speedY *= p.drag;
        p.rotation += p.rotationSpeed;
        p.size *= 0.96; 
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });
      if (particles.length > 0) requestAnimationFrame(animate);
    };
    animate();
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 z-[100] pointer-events-none" />;
};

// --- ICONS ---
const Icons = {
  Heart: ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" /></svg>,
  Gem: ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-2.625 6c-.54 0-.828.419-.936.634a1.96 1.96 0 00-.189.866c0 .298.059.605.189.866.108.215.395.634.936.634.54 0 .828-.419.936-.634.13-.26.189-.568.189-.866 0-.298-.059-.605-.189-.866-.108-.215-.395-.634-.936-.634zm4.314.634c.108-.215.395-.634.936-.634.54 0 .828.419.936.634.13.26.189.568.189.866 0 .298-.059.605-.189.866-.108.215-.395.634-.936.634-.54 0-.828-.419-.936-.634a1.96 1.96 0 01-.189-.866c0-.298.059-.605.189-.866zm2.023 6.828a.75.75 0 10-1.06-1.06 3.75 3.75 0 01-5.304 0 .75.75 0 00-1.06 1.06 5.25 5.25 0 007.424 0z" clipRule="evenodd" /></svg>,
  Star: ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" /></svg>,
  Check: ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>,
  X: ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
  Home: ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M11.47 3.84a.75.75 0 011.06 0l8.635 8.635a.75.75 0 11-1.06 1.06l-.31-.31V20.25a.75.75 0 01-.75.75H16.5V15a1.5 1.5 0 00-1.5-1.5h-6A1.5 1.5 0 007.5 15v6H4.5a.75.75 0 01-.75-.75V13.225l-.31.31a.75.75 0 11-1.06-1.06l8.635-8.635z" /></svg>,
  Profile: ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" /></svg>,
  Fire: ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177 7.547 7.547 0 01-1.705-1.715.75.75 0 00-1.152-.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" /></svg>,
  SoundOn: ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" /><path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" /></svg>,
  SoundOff: ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM17.78 9.22a.75.75 0 10-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 101.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 101.06-1.06L20.56 12l1.72-1.72a.75.75 0 10-1.06-1.06l-1.72 1.72-1.72-1.72z" /></svg>,
  Book: ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M11.25 4.533A9.707 9.707 0 006 3.75c-2.389 0-4.285.815-5.636 2.171a1.5 1.5 0 01-.364 1.03V18c0 .414.336.75.75.75.75.27 0 .524-.099.715-.27A14.717 14.717 0 006 17.25c2.476 0 4.73.962 6.375 2.535a.75.75 0 001.25-.53V4.533zM12.75 19.785a14.715 14.715 0 016.375-2.535 9.708 9.708 0 003.543-1.217.75.75 0 00.715.27c.414 0 .75-.336.75-.75V6.951a1.5 1.5 0 00-.364-1.03C22.285 4.565 20.389 3.75 18 3.75c-2.51 0-4.814.869-6.529 2.378-.475.417-.721.998-.721 1.63v12.027z" /></svg>,
  Lock: ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" /></svg>,
  Avatar: ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><circle cx="12" cy="12" r="10" className="text-white fill-white"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" className="text-green-500 fill-green-500"/></svg>,
  Refresh: ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z" clipRule="evenodd" /></svg>,
  Bolt: ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" /></svg>,
  Ice: ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M12 2.25a.75.75 0 01.75.75v2.25l2.165-1.25a.75.75 0 01.75 1.3l-2.165 1.25 2.165 1.25a.75.75 0 01-.75 1.3l-2.165-1.25V10.5h2.25a.75.75 0 010 1.5h-2.25v2.25l2.165-1.25a.75.75 0 01.75 1.3l-2.165 1.25 2.165 1.25a.75.75 0 01-.75-1.3l2.165-1.25-2.165-1.25a.75.75 0 01.75-1.3l2.165 1.25V21a.75.75 0 01-1.5 0v-2.25l-2.165 1.25a.75.75 0 01-.75-1.3l2.165-1.25-2.165-1.25a.75.75 0 01.75-1.3l2.165 1.25V12h-2.25a.75.75 0 010-1.5h2.25V8.25L7.835 9.5a.75.75 0 01-.75-1.3l2.165-1.25-2.165-1.25a.75.75 0 01.75-1.3l2.165 1.25V3a.75.75 0 01.75-.75z" clipRule="evenodd" /></svg>,
  Crown: ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M12 2.25c.605 0 1.137.332 1.408.83l1.832 3.398 3.737.495c.535.07.973.447 1.127.962.155.516-.07.989-.475 1.284l-2.738 2.016.715 3.336c.105.49-.107.994-.528 1.272a1.605 1.605 0 01-1.57.067L12 14.172l-3.508 1.738a1.605 1.605 0 01-1.57-.067c-.42-.278-.633-.782-.528-1.272l.715-3.336-2.738-2.016c-.405-.295-.63-.768-.475-1.284.154-.515.592-.892 1.127-.962l3.737-.495 1.832-3.398c.271-.498.803-.83 1.408-.83zM12 2.25a.75.75 0 01.75.75v.006c0 .194.156.352.35.356l.006.002h.002c.002 0 .004 0 .007 0 .204.015.356.19.356.394v.006c0 .194.156.352.35.356l.006.002h.002c.002 0 .004 0 .007 0 .204.015.356.19.356.394z" clipRule="evenodd" /></svg>,
  Construction: ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" /></svg>,
  FileText: ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 013.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 013.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 01-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875zM12.75 1.5v3a2.25 2.25 0 01-2.25 2.25h-3" clipRule="evenodd" /></svg>
};

// --- COMPONENTS UTILS ---

const Button3D = ({ children, onClick, variant = 'primary', className = '', disabled = false, fullWidth = false }: any) => {
  const styles: any = {
    primary: 'bg-[#059669] border-[#047857] text-white hover:bg-[#047857]',
    secondary: 'bg-white border-[#e5e5e5] text-[#afafaf] hover:bg-[#f7f7f7] border-2',
    danger: 'bg-red-500 border-red-700 text-white hover:bg-red-600',
    outline: 'bg-transparent border-[#e5e5e5] border-2 text-gray-500 hover:bg-gray-100',
    disabled: 'bg-[#e5e5e5] border-[#cecece] text-[#afafaf] cursor-not-allowed',
  };
  return (
    <button
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={`uppercase font-extrabold tracking-wider py-3 px-6 rounded-2xl transition-all duration-100 border-b-4 ${styles[variant === 'disabled' || disabled ? 'disabled' : variant]} ${variant !== 'disabled' && !disabled ? 'active:border-b-0 active:translate-y-[4px]' : ''} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

const SectionHeader = ({ title, description, color, yPos, isArabic }: any) => (
    <div className={`absolute left-0 right-0 h-32 p-4 text-white ${color} flex items-center justify-between z-0 shadow-sm pointer-events-none`} style={{ top: `${yPos}px` }}>
        <div className="container mx-auto max-w-2xl px-4 flex justify-between items-center relative">
            <div>
                <h3 className={`font-extrabold text-2xl uppercase tracking-widest drop-shadow-md rtl:tracking-normal ${isArabic ? 'font-arabic' : ''}`}>{title}</h3>
                <p className="opacity-90 text-lg font-bold drop-shadow-sm">{description}</p>
            </div>
             <div className="absolute -top-6 -right-2 opacity-20">
                <Icons.Star className="w-32 h-32" />
            </div>
        </div>
    </div>
);

// --- COMPOSANT UNITNODE (LE BOUTON ROND) ---
const UnitNode = ({ unit, onClick, status, x, y, startText, isArabic }: any) => {
  const nodeColor = status === 'LOCKED'
    ? 'bg-[#e5e5e5] border-[#afafaf]' 
    : status === 'COMPLETED'
      ? 'bg-[#ffc800] border-[#b08d00]'
      : `${unit.color.replace('bg-', 'bg-').replace('500', '500')} ${unit.color.replace('bg-', 'border-').replace('500', '700')}`;

  const isActive = status === 'ACTIVE';

  return (
    <div 
        className="absolute flex flex-col items-center z-10 group cursor-pointer" 
        style={{ left: `calc(50% + ${x}px)`, top: `${y}px`, transform: 'translate(-50%, -50%)' }}
        onClick={status === 'LOCKED' ? undefined : onClick}
    >
      {/* Tooltip 'START' if active */}
      {isActive && (
        <div className="absolute -top-24 animate-bounce z-30 pointer-events-none">
             <div className="bg-white px-4 py-3 rounded-xl border-2 border-gray-200 text-sm font-extrabold mb-1 text-center shadow-xl text-[#059669] uppercase tracking-wide">
                {startText}
             </div>
             <div className="w-4 h-4 bg-white border-b-2 border-r-2 border-gray-200 rotate-45 mx-auto -mt-3 shadow-sm"></div>
        </div>
      )}
      
      {/* Crown for completed */}
      {status === 'COMPLETED' && (
        <div className="absolute -top-8 -right-4 animate-pulse z-20 pointer-events-none">
           <Icons.Crown className="w-10 h-10 text-yellow-400 drop-shadow-md" />
        </div>
      )}

      {/* The 3D Button */}
      <div 
        className={`w-20 h-20 rounded-full flex items-center justify-center border-b-[6px] border-x-[3px] border-t-[3px] transition-all duration-150 shadow-sm ${nodeColor} ${status !== 'LOCKED' ? 'active:border-b-0 active:translate-y-[6px] hover:scale-105 hover:brightness-110' : ''} relative`}
      >
        {status !== 'LOCKED' && <div className="absolute top-2 left-3 w-6 h-3 bg-white/30 rounded-full rotate-[-45deg]" />}
        
        {status === 'LOCKED' ? <Icons.Lock className="w-8 h-8 text-[#afafaf]" /> 
        : status === 'COMPLETED' ? <Icons.Check className="w-10 h-10 text-white stroke-[4]" /> 
        : <span className="text-3xl font-extrabold text-white drop-shadow-md">{unit.id}</span>}
      </div>

      {/* UNIT TITLE DISPLAY - SAFE & SECURE */}
      <div className={`mt-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl border-2 border-gray-200 text-center shadow-sm max-w-[120px] z-20 transition-opacity ${status === 'LOCKED' ? 'opacity-60' : 'opacity-100'}`}>
          <span className={`text-[11px] leading-tight font-extrabold text-gray-600 block break-words line-clamp-2 ${isArabic ? 'font-arabic' : ''}`} dir="auto">
              {unit.title}
          </span>
      </div>
    </div>
  );
};

// --- ECRAN PRINCIPAL DU CHEMIN ---
const PathScreen = ({ units, userState, onSelectUnit, onOpenShop, t, onBack }: any) => {
  const windowSize = useWindowSize();
  const spacing = 160; 
  const startPadding = 150; 
  
  // Responsive Amplitude: Reduces significantly on mobile to keep everything inside screen
  const amplitude = Math.min(windowSize.width * 0.25, 100); 
  
  const containerHeight = units.length * spacing + 400; 
  const isArabic = userState.language === 'ar';
  
  const mascots = [
     { i: 1.5, side: -1, char: '🕌' }, 
     { i: 4.5, side: 1, char: '🐪' },  
     { i: 7.5, side: -1, char: '🌴' }, 
     { i: 10.5, side: 1, char: '📖' }  
  ];

  const getPosition = (index: number) => {
      const angle = index * 0.6; 
      const x = Math.sin(angle) * amplitude;
      const y = index * spacing + startPadding;
      return { x, y };
  };

  const pathData = useMemo(() => {
    let d = `M ${Math.sin(0) * amplitude + (windowSize.width/2)} ${startPadding} `;
    for (let i = 0; i < units.length; i++) {
        const current = getPosition(i);
        const next = getPosition(i + 1);
        const cx = windowSize.width / 2;
        const x1 = current.x + cx;
        const y1 = current.y;
        const x2 = next.x + cx;
        const y2 = next.y;
        const cp1x = x1;
        const cp1y = y1 + (spacing / 2);
        const cp2x = x2;
        const cp2y = y2 - (spacing / 2);
        d += `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2} `;
    }
    return d;
  }, [units.length, windowSize.width]);

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden pb-24 bg-white relative no-scrollbar">
       
       <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-gray-100 px-4 py-3 flex justify-between items-center shadow-sm">
           <div className="flex gap-2 sm:gap-4 items-center">
               {onBack && (
                 <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-1">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-gray-500">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                   </svg>
                 </button>
               )}
               <button onClick={onOpenShop} className="flex items-center gap-1 sm:gap-2 hover:bg-gray-50 rounded-xl px-2 sm:px-3 py-1.5 transition-colors border border-transparent hover:border-gray-200">
                   <Icons.Heart className="hidden" />
                   <span className="hidden">{userState.isPremium ? '∞' : userState.hearts}</span>
               </button>
               <button onClick={onOpenShop} className="flex items-center gap-1 sm:gap-2 hover:bg-gray-50 rounded-xl px-2 sm:px-3 py-1.5 transition-colors border border-transparent hover:border-gray-200">
                   <Icons.Gem className="w-6 h-6 sm:w-7 sm:h-7 text-amber-500 drop-shadow-sm" />
                   <span className="font-extrabold text-amber-500 text-base sm:text-lg">{userState.gems}</span>
               </button>
           </div>
           <div className="flex gap-2">
                <div className="flex items-center gap-1 text-orange-500 font-bold px-3 py-1 bg-orange-50 rounded-xl border border-orange-100">
                    <Icons.Fire className="w-5 h-5" />
                    <span>{userState.streak}</span>
                </div>
           </div>
       </div>

       <div className="relative w-full" style={{ height: `${containerHeight}px` }}>
           
           <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
              <path d={pathData} fill="none" stroke="#e5e5e5" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
              <path d={pathData} fill="none" stroke="#cecece" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="15 25" />
           </svg>
           
           {mascots.map((m, idx) => {
               const angle = m.i * 0.6;
               const baseX = Math.sin(angle) * amplitude;
               const baseY = m.i * spacing + startPadding;
               // Safe offset for mobile: reduced from 80 to 65
               const finalX = baseX + (m.side * 65); 
               
               return (
                   <div key={idx} className="absolute text-5xl transform hover:scale-125 transition-transform cursor-default select-none animate-pulse-slow" 
                        style={{ left: `calc(50% + ${finalX}px)`, top: `${baseY}px`, transform: 'translate(-50%, -50%)' }}>
                       {m.char}
                   </div>
               )
           })}

           {units.map((unit: any, index: number) => {
               const pos = getPosition(index);
               const isCompleted = userState.completedUnits.includes(unit.id);
               const isLocked = unit.id > 1 && !userState.completedUnits.includes(unit.id - 1);
               let status = 'LOCKED';
               if (isCompleted) status = 'COMPLETED';
               else if (!isLocked) status = 'ACTIVE';

               return (
                   <React.Fragment key={unit.id}>
                       {index % 4 === 0 && (
                           <SectionHeader 
                                title={`Section ${Math.floor(index/4) + 1}`} 
                                description={unit.description} 
                                color={unit.color} 
                                yPos={pos.y - 130} 
                                isArabic={isArabic} 
                            />
                       )}
                        <UnitNode 
                            unit={unit} 
                            onClick={() => onSelectUnit(unit)} 
                            status={status}
                            startText={t('start')} 
                            x={pos.x} 
                            y={pos.y}
                            isArabic={isArabic}
                        />
                   </React.Fragment>
               );
           })}

           {/* GRAND FINALE NODE */}
           {(() => {
               const finalIndex = units.length;
               const pos = getPosition(finalIndex);
               const isAllCompleted = userState.completedUnits.length >= units.length;
               
               return (
                   <div 
                       className="absolute z-10 flex flex-col items-center"
                       style={{ left: `calc(50% + ${pos.x}px)`, top: `${pos.y}px`, transform: 'translate(-50%, -50%)' }}
                   >
                       <div 
                           className={`w-24 h-24 rounded-full flex items-center justify-center border-b-[6px] border-x-[3px] border-t-[3px] transition-all duration-150 shadow-sm relative cursor-pointer hover:scale-105 ${isAllCompleted ? 'border-yellow-600 bg-gradient-to-br from-yellow-300 to-yellow-500' : 'border-gray-300 bg-gray-200 opacity-80'}`}
                           onClick={() => {
                               if (isAllCompleted) {
                                   alert(isArabic ? 'مبروك! لقد أكملت الأساسيات. مستويات جديدة قريباً إن شاء الله!' : 'Félicitations ! Vous avez complété les fondements. De nouveaux niveaux arriveront bientôt insha\'Allah !');
                               } else {
                                   alert(isArabic ? 'أكمل جميع الدروس للوصول إلى هنا!' : 'Complétez toutes les leçons pour atteindre ce niveau !');
                               }
                           }}
                       >
                           <Icons.Crown className={`w-12 h-12 ${isAllCompleted ? 'text-white drop-shadow-md' : 'text-gray-400'}`} />
                       </div>
                       <div className="mt-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl border-2 border-gray-200 text-center shadow-sm max-w-[120px] z-20">
                           <span className="text-[11px] leading-tight font-extrabold text-gray-600 block break-words line-clamp-2">
                               {isArabic ? 'مستويات جديدة قريباً' : 'Nouveaux niveaux à venir'}
                           </span>
                       </div>
                   </div>
               );
           })()}
       </div>
    </div>
  );
};

// --- SCREENS SECONDAIRES ---

const SuccessScreen = ({ onContinue, gemsEarned, t, unitTitle }: any) => {
    const handleShare = () => {
        const text = `MashaAllah! I just completed "${unitTitle}" on Iqra Quest and earned ${gemsEarned} gems! Can you beat my score? 🕌✨\n\nPlay now: ${window.location.origin}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#059669] flex flex-col items-center justify-center animate-fade-in text-white p-6 overflow-hidden">
            <Confetti />
            <div className="text-center mb-10 z-10 relative">
                <h1 className="text-5xl font-extrabold mb-4 animate-bounce text-yellow-300 drop-shadow-md">MashaAllah!</h1>
                <p className="text-2xl font-bold opacity-90">{t('correct')}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 mb-10 w-full max-w-xs border-4 border-white/30 shadow-2xl flex flex-col items-center gap-4 z-10 relative">
                <div className="flex flex-col items-center">
                    <span className="text-sm font-bold uppercase tracking-widest opacity-80">Total Gems</span>
                    <div className="flex items-center gap-3 text-4xl font-extrabold">
                        <Icons.Gem className="w-10 h-10 text-blue-300 fill-current" />
                        <span>+{gemsEarned}</span>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-4 w-full max-w-xs z-10 relative">
                <Button3D variant="secondary" onClick={onContinue} className="w-full py-4 text-[#059669] text-xl">
                    {t('continue')}
                </Button3D>
                <button onClick={handleShare} className="w-full py-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/></svg>
                    Share on WhatsApp
                </button>
            </div>
        </div>
    );
}

const KnowledgeCard = ({ isOpen, isCorrect, correctAnswer, explanation, dalil, onContinue, t, isArabic }: any) => {
  if (!isOpen) return null;
  return (
    <div className={`fixed bottom-0 left-0 w-full z-50 animate-slide-up border-t-2 ${isCorrect ? 'bg-[#d7ffb8] border-[#b8f28b]' : 'bg-[#ffdfe0] border-[#ffc1c1]'} shadow-[0_-10px_40px_rgba(0,0,0,0.1)]`} style={{ maxHeight: '90vh' }}>
      <div className="p-6 overflow-y-auto pb-safe" style={{ maxHeight: '85vh' }}>
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
            <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 border-b-4 shadow-sm ${isCorrect ? 'bg-emerald-500 border-emerald-700' : 'bg-red-500 border-red-700'}`}>
                    {isCorrect ? <Icons.Check className="w-8 h-8 text-white" /> : <Icons.X className="w-8 h-8 text-white" />}
                </div>
                <div className="flex-1 pt-2 min-w-0">
                    <h2 className={`font-extrabold text-2xl mb-2 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                    {isCorrect ? t('correct') : t('wrong')}
                    </h2>
                    {!isCorrect && (
                    <p className="text-red-600 font-bold mb-4 bg-red-50 p-3 rounded-lg border border-red-100 break-words">{t('correctAnswer')} <span className={`block mt-1 text-lg text-red-800 ${isArabic ? 'font-arabic' : ''}`}>{correctAnswer}</span></p>
                    )}
                    <div className="bg-white p-6 rounded-2xl border-2 border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                            <span className="text-2xl">🎓</span>
                            <p className="font-extrabold text-gray-400 text-xs uppercase tracking-widest">
                                {t('explanationTitle')}
                            </p>
                        </div>
                        <div className={`text-gray-700 text-lg leading-relaxed font-medium text-justify whitespace-pre-line mb-6 relative z-10 break-words ${isArabic ? 'font-arabic' : ''}`}>
                            {explanation}
                        </div>
                        {dalil && dalil !== "-" && (
                            <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-xl rtl:border-l-0 rtl:border-r-4 rtl:rounded-r-none rtl:rounded-l-xl relative">
                                <div className="flex items-center gap-2 mb-2">
                                    <Icons.Book className="w-4 h-4 text-yellow-600" />
                                    <span className="text-xs font-bold text-yellow-700 uppercase tracking-wide">{t('dalilTitle')}</span>
                                </div>
                                <p className={`text-xl text-gray-800 italic font-serif leading-relaxed text-right break-words ${isArabic ? 'font-arabic' : ''}`}>"{dalil}"</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Button3D fullWidth variant={isCorrect ? 'primary' : 'danger'} onClick={onContinue} className="text-lg py-4">
            {t('continue')}
            </Button3D>
        </div>
      </div>
    </div>
  );
};

const GameOverModal = ({ onRetry, onQuit, t }: any) => (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl text-center border-b-8 border-gray-200 relative overflow-hidden">
         <div className="relative z-10">
            <div className="mb-6 flex justify-center">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-red-100">
                    <Icons.Heart className="w-12 h-12 text-red-500 animate-pulse" />
                </div>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-800 mb-2">{t('gameOverTitle')}</h2>
            <p className="text-gray-500 font-medium mb-8 leading-relaxed">{t('gameOverDesc')}</p>
            <div className="flex flex-col gap-3">
                <Button3D variant="primary" onClick={onRetry} fullWidth className="text-lg">{t('retry')}</Button3D>
                <Button3D variant="outline" onClick={onQuit} fullWidth>{t('quit')}</Button3D>
            </div>
         </div>
      </div>
    </div>
);

const LessonScreen = ({ unit, onClose, onFinishLesson, onWrongAnswer, onRefillHearts, soundEnabled, isPremium, t, isArabic }: any) => {
  const [questionsQueue, setQuestionsQueue] = useState<Question[]>(() => unit.lessons[0]?.questions ? [...unit.lessons[0].questions] : []);
  const [initialTotal] = useState(() => unit.lessons[0]?.questions?.length || 0);
  const [completedCount, setCompletedCount] = useState(0);
  const [status, setStatus] = useState<'IDLE' | 'CHECKING' | 'RESULT'>('IDLE');
  const [isCorrect, setIsCorrect] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [isLessonComplete, setIsLessonComplete] = useState(false);
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [bubbleOrder, setBubbleOrder] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]); 
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(true);

  const currentQ = questionsQueue[0];

  useEffect(() => { const timer = setTimeout(() => setIsStarting(false), 2000); return () => clearTimeout(timer); }, []);

  const allMatchingItems = useMemo(() => {
       if(!currentQ || currentQ.type !== 'MATCHING' || !currentQ.pairs) return [];
       const list = [...currentQ.pairs.map((p: any) => ({ val: p.left, id: p.left + 'L' })), ...currentQ.pairs.map((p: any) => ({ val: p.right, id: p.right + 'R' }))];
       return list.sort(() => Math.random() - 0.5); 
  }, [currentQ]);

  useEffect(() => {
    setSelectedOption(null);
    setStatus('IDLE');
    setBubbleOrder([]);
    setMatchedPairs([]);
    setSelectedMatch(null);
  }, [currentQ]);

  const handleCheck = () => {
    if (status !== 'IDLE' || !currentQ) return;
    let correct = false;
    if (currentQ.type === 'MCQ' || currentQ.type === 'TRUE_FALSE') {
      correct = selectedOption === currentQ.correctAnswer;
    } else if (currentQ.type === 'BUBBLE') {
       correct = JSON.stringify(bubbleOrder) === JSON.stringify(currentQ.correctAnswer);
    } else if (currentQ.type === 'MATCHING') {
       correct = matchedPairs.length === (currentQ.pairs?.length || 0) * 2;
    }
    setIsCorrect(correct);
    playSound(correct ? 'CORRECT' : 'WRONG', soundEnabled);
    if (!correct) onWrongAnswer(); 
    setStatus('RESULT');
  };

  const handleContinue = () => {
    if (isCorrect) {
        setCompletedCount(prev => prev + 1);
        const nextQueue = questionsQueue.slice(1);
        if (nextQueue.length === 0) {
             playSound('COMPLETE', soundEnabled);
             setIsLessonComplete(true);
        } else {
             setQuestionsQueue(nextQueue);
        }
    } else {
        setQuestionsQueue(prev => { const [first, ...rest] = prev; return [...rest, first]; });
    }
    setStatus('IDLE');
  };
  
  const handleRetry = () => { setShowGameOver(false); if (onRefillHearts) onRefillHearts(); };

  if (isStarting) return <div className="fixed inset-0 z-50 bg-[#059669] flex items-center justify-center flex-col animate-fade-out pointer-events-none"><h2 className={`text-5xl font-bold text-white mb-4 animate-bounce ${isArabic ? 'font-arabic' : ''}`}>{unit.title}</h2></div>;
  if (isLessonComplete) return <SuccessScreen gemsEarned={15} onContinue={() => onFinishLesson(15)} t={t} unitTitle={unit.title} />;
  if (!currentQ) return <div className="p-10 text-center">Loading...</div>;

  const renderQuestionContent = () => {
    switch (currentQ.type) {
      case 'MCQ':
      case 'TRUE_FALSE':
        return (
          <div className="grid grid-cols-1 gap-4 w-full">
            {currentQ.options.map((opt: string, idx: number) => (
              <div key={idx} onClick={() => status === 'IDLE' && setSelectedOption(opt)} className={`p-5 rounded-2xl border-2 border-b-4 cursor-pointer active:scale-95 active:border-b-2 transition-all shadow-sm text-lg break-words hyphens-auto ${isArabic ? 'font-arabic' : ''} ${selectedOption === opt ? 'bg-blue-100 border-blue-400 text-blue-700 font-bold' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700 font-medium'}`}>{opt}</div>
            ))}
          </div>
        );
      case 'BUBBLE':
        // CORRECTION MAJEURE: Gestion des doublons (ex: "une" présent 2 fois).
        // On calcule les mots restants en retirant ceux déjà sélectionnés du pool un par un.
        const remainingOptions = [...currentQ.options];
        bubbleOrder.forEach(selectedWord => {
            const index = remainingOptions.indexOf(selectedWord);
            if (index > -1) {
                remainingOptions.splice(index, 1);
            }
        });

        return (
          <div className="w-full flex flex-col gap-8">
             <div className="min-h-[120px] flex flex-wrap gap-2 border-b-2 border-gray-100 pb-6 justify-center items-center bg-gray-50 rounded-2xl p-4 shadow-inner">
                {bubbleOrder.map((word, i) => (
                    <button 
                        key={i} 
                        onClick={() => status === 'IDLE' && setBubbleOrder(prev => prev.filter((_, idx) => idx !== i))} 
                        className={`bg-white border-2 border-gray-200 border-b-4 px-4 py-3 rounded-xl shadow-sm text-lg font-bold animate-pop-in text-gray-700 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors ${isArabic ? 'font-arabic' : ''}`}
                    >
                        {word}
                    </button>
                ))}
             </div>
             <div className="flex flex-wrap gap-3 justify-center">
                {remainingOptions.map((word, i) => (
                    // Clé unique composite pour éviter les conflits React
                    <button 
                        key={`${word}-${i}`} 
                        onClick={() => status === 'IDLE' && setBubbleOrder(prev => [...prev, word])} 
                        className={`bg-white border-2 border-b-4 border-gray-200 px-4 py-3 rounded-xl text-lg font-medium active:border-b-2 active:translate-y-1 hover:bg-gray-50 transition-all text-gray-600 ${isArabic ? 'font-arabic' : ''}`}
                    >
                        {word}
                    </button>
                ))}
             </div>
          </div>
        );
      case 'MATCHING':
        const handleMatchClick = (item: string) => {
            if(status !== 'IDLE' || matchedPairs.includes(item)) return;
            if (!selectedMatch) {
                setSelectedMatch(item);
            } else {
                const isPair = currentQ.pairs?.some((p: any) => (p.left === selectedMatch && p.right === item) || (p.right === selectedMatch && p.left === item));
                if (isPair) {
                    const newMatched = [...matchedPairs, selectedMatch, item];
                    setMatchedPairs(newMatched);
                    setSelectedMatch(null);
                    playSound('CORRECT', soundEnabled); 
                    if (newMatched.length === allMatchingItems.length) {
                         setTimeout(() => setSelectedOption("MATCH_ALL"), 50); 
                    }
                } else {
                    setSelectedMatch(null);
                    playSound('WRONG', soundEnabled);
                }
            }
        };
        return (
            <div className="grid grid-cols-2 gap-4 w-full">
                {allMatchingItems.map((item, idx) => {
                    const isMatched = matchedPairs.includes(item.val);
                    const isSelected = selectedMatch === item.val;
                    return (
                        <button key={idx} disabled={isMatched} onClick={() => handleMatchClick(item.val)} className={`min-h-[80px] rounded-2xl border-2 border-b-4 flex items-center justify-center font-bold text-center p-3 text-sm transition-all duration-200 shadow-sm leading-snug break-words hyphens-auto ${isArabic ? 'font-arabic' : ''} ${isMatched ? 'opacity-0 scale-0' : 'opacity-100 scale-100'} ${isSelected ? 'border-amber-400 bg-amber-50 text-amber-600' : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600'}`}>{item.val}</button>
                    )
                })}
            </div>
        )
      default: return null;
    }
  };

  const isCheckDisabled = () => {
      if (currentQ.type === 'MCQ' || currentQ.type === 'TRUE_FALSE') return !selectedOption;
      if (currentQ.type === 'BUBBLE') return bubbleOrder.length === 0;
      if (currentQ.type === 'MATCHING') return matchedPairs.length !== (currentQ.pairs?.length || 0) * 2;
      return true;
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col h-full w-full overflow-hidden">
      {showGameOver && <GameOverModal onRetry={handleRetry} onQuit={onClose} t={t} />}
      
      <div className="px-6 py-6 flex items-center gap-4 shrink-0">
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><Icons.X className="w-6 h-6 text-gray-400 hover:text-gray-600" /></button>
        <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-[#059669] transition-all duration-500 ease-out rounded-full" style={{ width: `${(completedCount / initialTotal) * 100}%` }}></div></div>
      </div>

      <div className="flex-1 flex flex-col justify-start px-6 max-w-2xl mx-auto w-full overflow-y-auto pb-32 pt-4">
        <h1 className={`text-2xl md:text-3xl font-bold text-gray-700 mb-8 text-center leading-relaxed break-words ${isArabic ? 'font-arabic' : ''}`} dir="auto">{currentQ.question}</h1>
        {renderQuestionContent()}
      </div>

      <div className="border-t-2 border-gray-100 p-6 pb-8 w-full bg-white shrink-0 pb-safe">
          <div className="max-w-2xl mx-auto">
              <Button3D fullWidth variant={isCheckDisabled() ? 'disabled' : 'primary'} disabled={isCheckDisabled()} onClick={handleCheck} className="text-lg py-4">{t('check')}</Button3D>
          </div>
      </div>

      <KnowledgeCard isOpen={status === 'RESULT' && !showGameOver} isCorrect={isCorrect} correctAnswer={typeof currentQ.correctAnswer === 'string' ? currentQ.correctAnswer : Array.isArray(currentQ.correctAnswer) ? currentQ.correctAnswer.join(' ') : ''} explanation={currentQ.explanation} dalil={currentQ.dalil} onContinue={handleContinue} t={t} isArabic={isArabic} />
    </div>
  );
};

const ProfileScreen = ({ userState, toggleSound, setLanguage, t, onOpenLegal, onBackup, onRestore, onReset, onBack }: any) => {
  const handleShare = () => {
      const text = `I'm learning Islam on Iqra Quest! I'm on Level ${userState.level} with a ${userState.streak} day streak 🔥. Join me! 🕌✨\n\nPlay now: ${window.location.origin}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-stone-50 pb-24 no-scrollbar relative">
      {onBack && (
        <button onClick={onBack} className="absolute top-4 left-4 p-2 bg-white hover:bg-gray-50 rounded-full shadow-sm border border-gray-200 transition-colors z-10">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-gray-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
      )}
      <div className="bg-white border-b-2 border-gray-200 pb-8 pt-12 px-6 flex flex-col items-center">
         <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-4xl font-bold text-gray-300 border-4 border-dashed border-gray-300 mb-4 relative overflow-hidden">
             <Icons.Avatar className="w-20 h-20 text-gray-300" />
         </div>
         <h1 className="text-2xl font-extrabold text-gray-800 mb-1">{t('student')}</h1>
         <p className="text-gray-400 font-medium text-sm mb-6">Level {userState.level}</p>
         <div className="w-full h-[1px] bg-gray-100 mb-6"></div>
         <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
             <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 flex flex-col items-center shadow-sm">
                 <div className="flex items-center gap-2 mb-1">
                     <Icons.Fire className="w-6 h-6 text-orange-500" />
                     <span className="font-extrabold text-xl text-gray-700">{userState.streak}</span>
                 </div>
                 <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{t('streak')}</span>
             </div>
             <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 flex flex-col items-center shadow-sm">
                 <div className="flex items-center gap-2 mb-1">
                     <Icons.Bolt className="w-6 h-6 text-yellow-500" />
                     <span className="font-extrabold text-xl text-gray-700">{userState.xp}</span>
                 </div>
                 <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{t('xp')}</span>
             </div>
         </div>
      </div>

      <div className="p-6 max-w-md mx-auto space-y-6">
          <div className="space-y-4">
              <h2 className="font-bold text-xl text-gray-800">{t('settings')}</h2>
              
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-center justify-between">
                  <span className="font-bold text-gray-700">{t('sound')}</span>
                  <button onClick={toggleSound} className={`w-14 h-8 rounded-full p-1 transition-colors ${userState.settings.soundEnabled ? 'bg-[#059669]' : 'bg-gray-200'}`}>
                      <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${userState.settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </button>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-2xl p-4">
                  <span className="font-bold text-gray-700 block mb-3">{t('language')}</span>
                  <div className="grid grid-cols-3 gap-2">
                      {(['fr', 'en', 'ar'] as Language[]).map((lang) => (
                          <button 
                            key={lang}
                            onClick={() => setLanguage(lang)}
                            className={`py-2 rounded-xl font-bold uppercase text-sm border-b-4 active:border-b-0 active:translate-y-1 transition-all ${userState.language === lang ? 'bg-amber-500 border-amber-700 text-white' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                          >
                              {lang}
                          </button>
                      ))}
                  </div>
              </div>

              {/* SHARE SECTION */}
               <div className="bg-white border-2 border-gray-200 rounded-2xl p-4">
                  <span className="font-bold text-gray-700 block mb-3">Invite Friends</span>
                  <button onClick={handleShare} className="w-full py-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/></svg>
                      Share on WhatsApp
                  </button>
              </div>

              {/* BACKUP & RESTORE SECTION */}
               <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 space-y-3">
                  <span className="font-bold text-gray-700 block">{t('backup')}</span>
                  <div className="flex gap-2">
                      <Button3D variant="secondary" onClick={onBackup} fullWidth className="text-xs py-2">{t('backupDesc')}</Button3D>
                      <label className="w-full">
                           <input type="file" accept=".json" onChange={onRestore} className="hidden" />
                           <div className="uppercase font-extrabold tracking-wider py-2 px-4 rounded-2xl transition-all duration-100 border-b-4 bg-white border-[#e5e5e5] text-[#afafaf] hover:bg-[#f7f7f7] border-2 text-center cursor-pointer text-xs h-full flex items-center justify-center">
                               {t('restoreDesc')}
                           </div>
                      </label>
                  </div>
              </div>
              
               <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-4">
                  <span className="font-bold text-red-700 block mb-3">{t('dangerZone')}</span>
                  <Button3D variant="danger" onClick={onReset} fullWidth className="text-sm py-3">{t('resetProgress')}</Button3D>
              </div>

              <button onClick={onOpenLegal} className="w-full text-center text-gray-400 text-sm font-bold hover:underline py-4 flex items-center justify-center gap-2">
                  <Icons.FileText className="w-4 h-4" /> About & Support
              </button>
          </div>
      </div>
    </div>
  );
};

const ShopModal = ({ isOpen, onClose, userState, onBuyHearts, onBuyFreeze, onOpenPremium, t }: any) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in p-4">
             <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 h-[85vh] flex flex-col shadow-2xl">
                 <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                     <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">{t('shop')}</h2>
                     <button onClick={onClose} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors"><Icons.X className="w-6 h-6 text-gray-500" /></button>
                 </div>
                  <div className="flex-1 overflow-y-auto space-y-4 p-1">
                      <div className="flex items-center gap-4 p-5 border-2 border-gray-100 rounded-2xl hover:border-gray-200 transition-colors group">
                          <div className="w-16 h-16 bg-amber-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Icons.Ice className="w-8 h-8 text-amber-400" />
                          </div>
                          <div className="flex-1">
                              <h3 className="font-bold text-lg text-gray-800">{t('freeze')}</h3>
                              <p className="text-gray-400 text-sm font-medium">{t('freezeDesc')}</p>
                          </div>
                          <Button3D variant="secondary" onClick={onBuyFreeze} disabled={userState.gems < 200} className="text-sm px-4 py-3 min-w-[100px]">
                             <div className="flex items-center gap-1 justify-center"><Icons.Gem className="w-4 h-4 text-amber-500" /> 200</div>
                          </Button3D>
                      </div>
                 </div>
             </div>
        </div>
    );
};

const AboutModal = ({ isOpen, onClose, t }: any) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
             <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[80vh]">
                <h2 className="text-2xl font-extrabold mb-4">About & Support</h2>
                <div className="prose prose-sm text-gray-600 mb-6 space-y-4">
                    <div>
                        <h3 className="font-bold text-lg text-gray-800">About Iqra Quest</h3>
                        <p>Iqra Quest is a gamified Islamic learning platform designed to make learning about Islam engaging, accessible, and fun for everyone. Built with ❤️ in Senegal.</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-800">Support & Contact</h3>
                        <p>Need help or want to report an issue? Have suggestions for new content? We'd love to hear from you!</p>
                        <a href="mailto:support@iqraquest.com" className="text-[#059669] font-bold hover:underline block mt-1">support@iqraquest.com</a>
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="font-bold text-lg text-gray-800">Legal</h3>
                        <p className="mt-1"><strong>Privacy Policy:</strong> This application does not collect any personal data. All progress is stored locally on your device. We use no cookies for tracking purposes.</p>
                        <p className="mt-2"><strong>Terms of Use:</strong> This app is for educational purposes. While we strive for accuracy in religious content, please consult scholars for fatwas.</p>
                    </div>
                    <p className="mt-4 text-xs text-gray-400 text-center">Version 1.0.0 - Iqra Quest</p>
                </div>
                <Button3D variant="primary" onClick={onClose} fullWidth>Close</Button3D>
             </div>
        </div>
    );
};

const WelcomeScreen = ({ onStart, t, setLanguage }: any) => {
    return (
        <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 text-center animate-fade-in">
             <h1 className="text-4xl font-extrabold text-gray-800 mb-2 font-arabic">Iqra Quest</h1>
             <p className="text-gray-500 text-lg mb-10 max-w-xs">{t('welcomeDesc')}</p>

             <div className="flex gap-4 mb-8">
                {['fr', 'en', 'ar'].map((lang: any) => (
                    <button key={lang} onClick={() => setLanguage(lang)} className="text-2xl hover:scale-125 transition-transform p-2">
                        {lang === 'fr' ? '🇫🇷' : lang === 'en' ? '🇬🇧' : '🇸🇦'}
                    </button>
                ))}
             </div>

             <Button3D variant="primary" onClick={onStart} className="text-xl py-4 px-10 shadow-xl" fullWidth>
                {t('getStarted')}
             </Button3D>
             <p className="mt-6 text-xs text-gray-400">By continuing, you accept our Terms.</p>
        </div>
    );
};

// --- APP COMPONENT ---

export default function App({ onBack }: { onBack?: () => void }) {
  const [currentScreen, setCurrentScreen] = useState<'PATH' | 'LESSON' | 'PROFILE'>('PATH');
  const [activeUnit, setActiveUnit] = useState<Unit | null>(null);
  const [showShop, setShowShop] = useState(false);
  const [showLegal, setShowLegal] = useState(false);
  
  const defaultState: UserState = {
        hearts: 5, gems: 100, xp: 0, level: 1, completedUnits: [], completedLessons: [], currentUnitId: 1, streak: 1, streakFreeze: 0, isPremium: false, language: 'fr', lastLoginDate: new Date().toISOString().split('T')[0], hasSeenOnboarding: false,
        dailyQuests: [{ id: 'q1', title: "Finir une leçon", target: 1, progress: 0, reward: 10, completed: false, type: 'LESSON' }],
        settings: { soundEnabled: true }
  };

  const [userState, setUserState] = useState<UserState>(() => {
    try {
        const saved = localStorage.getItem('iqraQuestState');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Migration check
            if (typeof parsed.hasSeenOnboarding === 'undefined') parsed.hasSeenOnboarding = false;
            if(parsed.currentUnitId > 30) parsed.currentUnitId = 30;
            return parsed;
        }
    } catch (e) {}
    return defaultState;
  });

  const t = getT(userState.language);
  const isArabic = userState.language === 'ar';

  useEffect(() => {
     document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
  }, [isArabic]);
  
  useEffect(() => { localStorage.setItem('iqraQuestState', JSON.stringify(userState)); }, [userState]);
  const currentUnits = useMemo(() => getUnitsForLanguage(userState.language), [userState.language]);
  
  const handleUnitSelect = (unit: Unit) => { 
      if (unit.id > 30) return;
      setActiveUnit(unit); 
      setCurrentScreen('LESSON'); 
  };

  const handleFinishLesson = (gemsEarned: number) => {
    if (activeUnit) {
        const nextId = activeUnit.id + 1;
        const effectiveNextId = nextId > 30 ? 30 : nextId;
        let questGems = 0;
        const updatedQuests = userState.dailyQuests.map(q => {
            if (q.completed) return q;
            let newProgress = q.progress;
            if (q.type === 'LESSON') newProgress += 1;
            if (q.type === 'XP') newProgress += 10;
            if (newProgress >= q.target) { questGems += q.reward; return { ...q, progress: q.target, completed: true }; }
            return { ...q, progress: newProgress };
        });
        setUserState(prev => ({ ...prev, gems: prev.gems + gemsEarned + questGems, xp: prev.xp + 10, level: Math.floor((prev.xp + 10) / 100) + 1, completedUnits: prev.completedUnits.includes(activeUnit.id) ? prev.completedUnits : [...prev.completedUnits, activeUnit.id], currentUnitId: Math.max(prev.currentUnitId, effectiveNextId), dailyQuests: updatedQuests }));
    }
    setActiveUnit(null); setCurrentScreen('PATH');
  };

  const handleBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(userState));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "iqra_backup_" + new Date().toISOString() + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleRestore = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const obj = JSON.parse(event.target?.result as string);
              if (obj && typeof obj.hearts === 'number') {
                  setUserState(obj);
                  alert(t('correct')); // "Excellent!" as confirmation
              }
          } catch(err) { alert(t('wrong')); }
      };
      reader.readAsText(file);
  };

  const handleReset = () => {
      if(confirm(t('resetConfirm'))) {
          setUserState({...defaultState, hasSeenOnboarding: true, language: userState.language});
      }
  };

  // ROUTING
  if (!userState.hasSeenOnboarding) {
      return <WelcomeScreen 
        onStart={() => setUserState(p => ({ ...p, hasSeenOnboarding: true }))} 
        t={t} 
        setLanguage={(l: Language) => setUserState(p => ({ ...p, language: l }))} 
      />;
  }

  return (
    <div className="h-full w-full bg-stone-50 sm:bg-stone-100 flex flex-col font-sans text-gray-900">
      {currentScreen === 'PATH' && <PathScreen units={currentUnits} userState={userState} onSelectUnit={handleUnitSelect} onOpenShop={() => setShowShop(true)} t={t} onBack={onBack} />}
      {currentScreen === 'PROFILE' && <ProfileScreen userState={userState} toggleSound={() => setUserState(p => ({...p, settings: { ...p.settings, soundEnabled: !p.settings.soundEnabled }}))} setLanguage={(l: Language) => setUserState(p => ({ ...p, language: l }))} t={t} onOpenLegal={() => setShowLegal(true)} onBackup={handleBackup} onRestore={handleRestore} onReset={handleReset} onBack={onBack} />}
      {(currentScreen === 'PATH' || currentScreen === 'PROFILE') && (
            <div className="fixed bottom-0 left-0 w-full bg-white border-t-2 border-gray-200 py-3 z-40 shadow-lg pb-safe">
                <div className="max-w-md mx-auto flex justify-around">
                     <button className="flex flex-col items-center gap-1 group" onClick={() => setCurrentScreen('PATH')}>
                        <div className={`p-1 rounded-xl transition-all ${currentScreen === 'PATH' ? 'bg-emerald-50' : ''}`}>
                            <Icons.Home className={`w-8 h-8 transition-transform group-hover:scale-110 ${currentScreen === 'PATH' ? 'text-[#059669]' : 'text-gray-400'}`} />
                        </div>
                        <span className={`text-[10px] font-extrabold tracking-wide ${currentScreen === 'PATH' ? 'text-[#059669]' : 'text-gray-400'}`}>{t('home')}</span>
                     </button>
                     <button className="flex flex-col items-center gap-1 group" onClick={() => setCurrentScreen('PROFILE')}>
                        <div className={`p-1 rounded-xl transition-all ${currentScreen === 'PROFILE' ? 'bg-amber-50' : ''}`}>
                            <Icons.Profile className={`w-8 h-8 transition-transform group-hover:scale-110 ${currentScreen === 'PROFILE' ? 'text-amber-500' : 'text-gray-400'}`} />
                        </div>
                        <span className={`text-[10px] font-extrabold tracking-wide ${currentScreen === 'PROFILE' ? 'text-amber-500' : 'text-gray-400'}`}>{t('profile')}</span>
                     </button>
                </div>
            </div>
      )}
      {currentScreen === 'PATH' && <ShopModal isOpen={showShop} onClose={() => setShowShop(false)} userState={userState} onBuyFreeze={() => { if(userState.gems>=200){setUserState(p=>({...p,gems:p.gems-200,streakFreeze:p.streakFreeze+1}));playSound('BUY',true);} }} onOpenPremium={() => {}} t={t} />}
      <AboutModal isOpen={showLegal} onClose={() => setShowLegal(false)} t={t} />
      {currentScreen === 'LESSON' && activeUnit && <LessonScreen unit={activeUnit} onClose={() => setCurrentScreen('PATH')} onFinishLesson={handleFinishLesson} onWrongAnswer={() => {}} soundEnabled={userState.settings.soundEnabled} isPremium={userState.isPremium} t={t} isArabic={isArabic} />}
    </div>
  );
}