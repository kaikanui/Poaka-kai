import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, RotateCcw, ArrowLeft, Hand } from 'lucide-react';
import HandTracker from './HandTracker';
import { KAI_LIST, FoodItem } from '../constants';

interface CameraGameProps {
  onExit: () => void;
}

const SELECTION_THRESHOLD_MS = 800; // Reduced for a snappier feel

export default function CameraGame({ onExit }: CameraGameProps) {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [options, setOptions] = useState<FoodItem[]>([]);
  const [targetIndex, setTargetIndex] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'feedback'>('playing');
  const [feedbackType, setFeedbackType] = useState<'success' | 'fail' | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hoverProgress, setHoverProgress] = useState(0);
  const [score, setScore] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: 0.5, y: 0.5 });
  const [handDetected, setHandDetected] = useState(false);

  const boxRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Initialize a new round
  const generateLevel = useCallback(() => {
    const shuffled = [...KAI_LIST].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4);
    setOptions(selected);
    setTargetIndex(Math.floor(Math.random() * 4));
    setGameState('playing');
    setFeedbackType(null);
    setHoverProgress(0);
    setHoverIndex(null);
  }, []);

  useEffect(() => {
    generateLevel();
  }, [generateLevel]);

  const targetItem = options[targetIndex];

  // Logic to handle hand updates
  const handleHandUpdate = useCallback((landmarks: any[]) => {
    if (landmarks.length === 0) {
      setHandDetected(false);
      if (gameState === 'playing') {
        setHoverIndex(null);
        setHoverProgress(0);
      }
      return;
    }

    setHandDetected(true);
    const hand = landmarks[0];
    const indexFingerTip = hand[8]; // Index finger tip
    
    // MediaPipe coordinates are 0-1 relative to the video feed.
    // Since visibility is mirrored via CSS, we mirror the X here to match the cursor position.
    const x = 1 - indexFingerTip.x;
    const y = indexFingerTip.y;

    setCursorPos({ x, y });

    if (gameState !== 'playing') return;

    // Convert normalized coordinates to screen pixel coordinates
    const px = x * window.innerWidth;
    const py = y * window.innerHeight;

    let currentHover: number | null = null;

    // Precisely check if the hand point is within any of the box bounding rectangles
    boxRefs.current.forEach((ref, idx) => {
      if (!ref) return;
      const rect = ref.getBoundingClientRect();
      
      // Expand the hit area slightly for better usability
      const padding = 10;
      if (
        px >= rect.left - padding && 
        px <= rect.right + padding && 
        py >= rect.top - padding && 
        py <= rect.bottom + padding
      ) {
        currentHover = idx;
      }
    });

    setHoverIndex(currentHover);
  }, [gameState]);

  // Handle hover timer
  useEffect(() => {
    let interval: number;
    if (hoverIndex !== null && gameState === 'playing') {
      const startTime = Date.now();
      interval = window.setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / SELECTION_THRESHOLD_MS, 1);
        setHoverProgress(progress);

        if (progress >= 1) {
          clearInterval(interval);
          checkAnswer(hoverIndex);
        }
      }, 30);
    } else {
      setHoverProgress(0);
    }
    return () => clearInterval(interval);
  }, [hoverIndex, gameState]);

  const checkAnswer = (index: number) => {
    if (index === targetIndex) {
      setScore(s => s + 1);
      setFeedbackType('success');
    } else {
      setFeedbackType('fail');
    }
    setGameState('feedback');
  };

  const nextLevel = useCallback(() => {
    generateLevel();
  }, [generateLevel]);

  // Handle auto-advance timer for feedback
  useEffect(() => {
    let timeout: number;
    if (gameState === 'feedback') {
      timeout = window.setTimeout(() => {
        nextLevel();
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [gameState, nextLevel]);

  return (
    <div className="fixed inset-0 bg-black flex flex-col font-sans overflow-hidden">
      
      {/* Background Camera Layer */}
      <div className="absolute inset-0 opacity-70">
        <HandTracker onHandUpdate={handleHandUpdate} isPaused={gameState === 'feedback'} />
      </div>

      {/* Hand Cursor Overlay */}
      <AnimatePresence>
        {handDetected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              left: `${cursorPos.x * 100}%`,
              top: `${cursorPos.y * 100}%`
            }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute z-50 pointer-events-none -translate-x-1/2 -translate-y-1/2"
            transition={{ type: "spring", damping: 20, stiffness: 300, mass: 0.5 }}
          >
            <div className="relative">
              {/* Outer Glow */}
              <div className="absolute inset-0 scale-150 blur-xl bg-white/40 rounded-full" />
              {/* Main Dot */}
              <div className="w-8 h-8 bg-art-orange border-4 border-white rounded-full shadow-[0_0_20px_rgba(217,108,79,0.8)]" />
              {/* Ripple Effect */}
              {hoverProgress > 0 && (
                <div 
                  className="absolute inset-0 border-4 border-white rounded-full animate-ping opacity-75"
                  style={{ animationDuration: '1s' }}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UI Overlay */}
      <div className="relative h-full flex flex-col z-10 pointer-events-none">
        
        {/* Top Header - The Word */}
        <header className="p-6 flex items-center justify-between pointer-events-auto">
          <button 
            onClick={onExit}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-full text-white transition-colors"
          >
            <ArrowLeft size={24} />
          </button>

          <div className="flex flex-col items-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white/90 backdrop-blur-md py-4 px-12 rounded-3xl shadow-2xl border-2 border-art-green flex flex-col items-center"
            >
              <p className="text-xl font-bold text-art-orange uppercase tracking-widest mb-1">Kimihia tēnei (Find this):</p>
              <h2 className="text-6xl font-black text-art-green tracking-tight">
                {targetItem?.maori}
              </h2>
            </motion.div>
          </div>

          <div className="bg-art-gold text-white px-6 py-2 rounded-full font-bold shadow-lg">
            Score: {score}
          </div>
        </header>

        {/* The 4 Corners Layout */}
        <div className="flex-1 grid grid-cols-2 grid-rows-2 p-6 gap-4">
          {options.map((item, idx) => (
            <div 
              key={`${item.id}-${idx}`}
              className={`relative flex items-center justify-center p-4 ${
                idx === 0 || idx === 2 ? 'justify-start' : 'justify-end'
              } ${
                idx < 2 ? 'items-start' : 'items-end'
              }`}
            >
              <motion.div
                ref={el => boxRefs.current[idx] = el}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                tabIndex={0}
                className={`
                  w-48 h-48 sm:w-64 sm:h-64 bg-white/90 backdrop-blur-md rounded-[2rem] shadow-xl border-4
                  flex flex-col items-center justify-center relative overflow-hidden transition-all
                  ${hoverIndex === idx ? 'border-art-orange scale-105 shadow-art-orange/20' : 'border-white'}
                `}
              >
                {/* Visual Feedback on selection */}
                {hoverIndex === idx && (
                  <div 
                    className="absolute bottom-0 left-0 h-2 bg-art-orange transition-all duration-75"
                    style={{ width: `${hoverProgress * 100}%` }}
                  />
                )}

                <div className="flex items-center justify-center flex-1 w-full overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-32 h-32 sm:w-48 sm:h-48 object-contain" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="text-8xl sm:text-9xl mb-2">{item.emoji}</span>
                  )}
                </div>
                <span className="font-bold text-lg opacity-40 uppercase tracking-tighter">{item.name}</span>
              </motion.div>
            </div>
          ))}
        </div>

        {/* Feedback Overlay */}
        <AnimatePresence>
          {gameState === 'feedback' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-8 pointer-events-auto"
            >
              <motion.div 
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className={`max-w-md w-full p-8 rounded-[3rem] text-center shadow-2xl border-4 ${
                  feedbackType === 'success' ? 'bg-white border-art-green' : 'bg-white border-art-orange'
                }`}
              >
                <div className="flex justify-center mb-6">
                  {feedbackType === 'success' ? (
                    <CheckCircle2 size={120} className="text-art-green fill-art-green/10" />
                  ) : (
                    <XCircle size={120} className="text-art-orange fill-art-orange/10" />
                  )}
                </div>
                
                <h3 className="text-5xl font-black mb-2 text-art-text">
                  {feedbackType === 'success' ? 'Ka Rawe!' : 'Kia Mau!'}
                </h3>
                <p className="text-xl text-art-text/60 mb-8 italic">
                  {feedbackType === 'success' 
                    ? `Great job! You found the ${targetItem.maori}.` 
                    : `That was the ${options[hoverIndex!]?.maori}. Try again!`}
                </p>

                <button 
                  onClick={nextLevel}
                  className="w-full bg-art-green hover:bg-art-green/90 text-white py-5 rounded-2xl font-black text-2xl shadow-lg transition-all flex items-center justify-center gap-3 active:scale-95 relative overflow-hidden"
                >
                  <motion.div 
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 3, ease: "linear" }}
                    className="absolute bottom-0 left-0 h-1.5 bg-white/30"
                  />
                  <RotateCcw size={28} />
                  <span>Haere tonu (Continue)</span>
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Hover Helper */}
        {gameState === 'playing' && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md p-4 rounded-full flex items-center gap-4 text-white">
            <Hand className="animate-bounce" size={24} />
            <p className="font-bold">Wave your hand over the answer!</p>
          </div>
        )}
      </div>
    </div>
  );
}
