import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBasket, 
  Trash2, 
  BookOpen, 
  Gamepad2, 
  Info, 
  UtensilsCrossed, 
  Briefcase,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Camera
} from 'lucide-react';
import { KAI_LIST, CONTAINERS, LOCATIONS, FoodItem } from './constants';
import CameraGame from './components/CameraGame';

type GameMode = 'explore' | 'quiz' | 'camera';
type ContainerType = 'lunchbox' | 'plate';

export default function App() {
  const [mode, setMode] = useState<GameMode>('camera');
  const [container, setContainer] = useState<ContainerType>('lunchbox');
  const [items, setItems] = useState<FoodItem[]>([]);
  const [quizTarget, setQuizTarget] = useState<{ items: string[], container: ContainerType } | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<'success' | 'fail' | null>(null);

  // Sound effects would go here in a real app, 
  // for now we'll use visual feedback

  const currentContainerInfo = CONTAINERS[container];

  const handleAddItem = (item: FoodItem) => {
    if (items.length >= 6) return; // Limit for visual clarity
    setItems([...items, item]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const clearItems = () => {
    setItems([]);
    setQuizFeedback(null);
  };

  const sentence = useMemo(() => {
    if (items.length === 0) return '';
    
    const count = items.length;
    if (count === 1) {
      return `He ${items[0].maori} tēnei.`;
    }

    const start = items.slice(0, -1).map(item => `he ${item.maori}`).join(', ');
    const last = `he ${items[count - 1].maori} hoki.`;
    
    return `He ${start}, ${last}`;
  }, [items]);

  // Quiz Logic
  const startNewQuiz = () => {
    const randomCount = Math.floor(Math.random() * 2) + 2; // 2-3 items
    const shuffled = [...KAI_LIST].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, randomCount);
    const targetContainer = Math.random() > 0.5 ? 'lunchbox' : 'plate';
    
    setQuizTarget({
      items: selected.map(i => i.maori),
      container: targetContainer
    });
    setMode('quiz');
    setItems([]);
    setQuizFeedback(null);
  };

  const checkQuiz = () => {
    if (!quizTarget) return;

    const currentMaoriItems = items.map(i => i.maori);
    const isContainerMatch = container === quizTarget.container;
    
    // Sort both to compare content regardless of order
    const isItemsMatch = JSON.stringify([...currentMaoriItems].sort()) === 
                        JSON.stringify([...quizTarget.items].sort());

    if (isItemsMatch && isContainerMatch) {
      setQuizFeedback('success');
    } else {
      setQuizFeedback('fail');
    }
  };

  if (mode === 'camera') {
    return <CameraGame onExit={() => setMode('explore')} />;
  }

  return (
    <div className="min-h-screen bg-art-bg text-art-text font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header - Navigation */}
        <header className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-5xl font-extrabold tracking-tight text-art-green mb-1">Ngā Kupu Kai</h1>
            <p className="text-xl font-medium opacity-70 italic">He aha kei roto i tō pouaka kai?</p>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            <div className="bg-art-orange text-white px-6 py-2 rounded-full font-bold text-lg shadow-lg rotate-2 mb-2">
              Lesson 2: Pouaka Kai
            </div>
            <div className="flex bg-white/50 p-1 rounded-2xl shadow-sm border border-art-green/20 backdrop-blur-sm">
              <button 
                onClick={() => { setMode('explore'); clearItems(); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${mode === 'explore' ? 'bg-art-green text-white shadow-md' : 'text-art-green hover:bg-art-green/10'}`}
                id="btn-explore"
              >
                <BookOpen size={18} />
                <span>Tūhura</span>
              </button>
              <button 
                onClick={startNewQuiz}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${mode === 'quiz' ? 'bg-art-green text-white shadow-md' : 'text-art-green hover:bg-art-green/10'}`}
                id="btn-quiz"
              >
                <Gamepad2 size={18} />
                <span>Kēmu</span>
              </button>
              <button 
                onClick={() => setMode('camera')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${mode === 'camera' ? 'bg-art-green text-white shadow-md' : 'text-art-green hover:bg-art-green/10'}`}
                id="btn-camera"
              >
                <Camera size={18} />
                <span>Ringaringa</span>
              </button>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-12 gap-8">
          
          {/* Left Column: Selection Sidebar */}
          <aside className="col-span-12 lg:col-span-3 space-y-6 order-2 lg:order-1">
            <div className="bg-transparent">
              <h3 className="text-xs uppercase tracking-widest font-bold text-art-orange mb-4 flex items-center gap-2">
                Whiriwhiria (Select)
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                {KAI_LIST.map((item) => (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAddItem(item)}
                    className="group bg-white border-2 border-art-green p-3 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-art-green hover:text-white transition-colors text-left"
                    id={`kai-${item.id}`}
                  >
                    <div className="w-10 h-10 aspect-square rounded-lg flex items-center justify-center text-2xl bg-art-bg group-hover:bg-white/20 transition-colors overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
                      ) : (
                        item.emoji
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm leading-none truncate">{item.maori}</p>
                      <p className="text-[10px] opacity-60 truncate">{item.name}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </aside>

          {/* Right Column: Interaction & Display */}
          <div className="col-span-12 lg:col-span-9 space-y-6 order-1 lg:order-2">
            
            <div className="flex flex-col md:flex-row gap-6">
              {/* Quiz Target (If active) */}
              <AnimatePresence mode="wait">
                {mode === 'quiz' && quizTarget && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex-1 bg-white p-6 rounded-3xl border-2 border-art-orange shadow-xl relative overflow-hidden flex flex-col justify-center"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-art-orange/10 p-2 rounded-full text-art-orange">
                        <ShoppingBasket size={20} />
                      </div>
                      <h2 className="text-lg font-bold text-art-orange">Mahi:</h2>
                    </div>
                    
                    <div className="text-lg">
                      <p className="font-medium text-art-text">
                        Put <span className="text-art-orange font-bold underline underline-offset-4">{quizTarget.items.join(', ')}</span> 
                        <br />
                        {quizTarget.container === 'lunchbox' ? 'in' : 'on'} the {CONTAINERS[quizTarget.container].english}.
                      </p>
                    </div>

                    {quizFeedback === 'success' && (
                      <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-art-green flex flex-col items-center justify-center text-white p-4 text-center z-20"
                      >
                        <CheckCircle2 size={48} className="mb-2" />
                        <h3 className="text-xl font-bold mb-1">Ka Rawe!</h3>
                        <button 
                          onClick={startNewQuiz}
                          className="mt-2 bg-white text-art-green px-4 py-1.5 rounded-full font-bold text-sm shadow-lg"
                        >
                          Next Challenge
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Toggles */}
              <div className="flex flex-1 gap-4">
                <button 
                  onClick={() => setContainer('lunchbox')}
                  className={`flex-1 p-5 rounded-[30px] border-4 transition-all flex flex-col items-center justify-center gap-1 ${container === 'lunchbox' ? 'bg-art-gold-dark border-art-gold-dark text-white shadow-xl scale-105 z-10' : 'bg-white border-art-green/10 text-art-green hover:border-art-green/30'}`}
                  id="select-lunchbox"
                >
                  <Briefcase size={24} />
                  <div className="text-center">
                    <div className="font-black text-lg uppercase leading-none">Roto</div>
                    <div className="text-[10px] font-bold opacity-70">LUNCHBOX</div>
                  </div>
                </button>
                <button 
                  onClick={() => setContainer('plate')}
                  className={`flex-1 p-5 rounded-[30px] border-4 transition-all flex flex-col items-center justify-center gap-1 ${container === 'plate' ? 'bg-white border-slate-200 text-art-green shadow-xl scale-105 z-10' : 'bg-white border-art-green/10 text-art-green hover:border-art-green/30'}`}
                  id="select-plate"
                >
                  <UtensilsCrossed size={24} />
                  <div className="text-center">
                    <div className="font-black text-lg uppercase leading-none">Runga</div>
                    <div className="text-[10px] font-bold opacity-70">PLATE</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Canvas Area */}
            <div className={`relative h-[380px] rounded-[50px] shadow-2xl overflow-hidden flex items-center justify-center transition-all duration-500 border-8 ${container === 'lunchbox' ? 'bg-art-gold border-art-gold-dark' : 'bg-white border-slate-100'}`}>
              
              {/* Context Label */}
              {container === 'lunchbox' ? (
                <>
                  <div className="absolute top-0 left-0 w-full h-12 bg-art-gold-dark opacity-30"></div>
                  <div className="absolute bottom-6 right-8 text-white font-black text-4xl uppercase opacity-20 pointer-events-none">Pouaka Kai</div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[320px] h-[320px] rounded-full border-8 border-slate-50 flex items-center justify-center">
                    <span className="text-slate-100 font-black text-4xl uppercase tracking-[1em] rotate-12">Pereti</span>
                  </div>
                </div>
              )}

              {/* Items Container */}
              <div className="relative z-10 grid grid-cols-3 gap-6 p-10 w-full max-w-md">
                <AnimatePresence>
                  {items.map((item, idx) => (
                    <motion.div
                      key={`${item.id}-${idx}`}
                      initial={{ scale: 0, y: -50, rotate: idx * 15 }}
                      animate={{ scale: 1, y: 0, rotate: 0 }}
                      exit={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="group relative cursor-pointer"
                      onClick={() => handleRemoveItem(idx)}
                      id={`active-item-${idx}`}
                    >
                      <div className={`aspect-square flex items-center justify-center text-5xl p-4 rounded-3xl shadow-xl border-4 border-white transition-all bg-white overflow-hidden`}>
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-20 h-20 object-contain" referrerPolicy="no-referrer" />
                        ) : (
                          item.emoji
                        )}
                      </div>
                      <div className="absolute -top-2 -right-2 bg-art-orange text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={14} />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {items.length === 0 && (
                  <div className="col-span-3 text-center py-20 pointer-events-none">
                    <p className={`text-xl font-bold uppercase tracking-widest ${container === 'lunchbox' ? 'text-art-gold-dark/50' : 'text-slate-200'}`}>
                      {container === 'lunchbox' ? 'Select items to pack' : 'Place items on plate'}
                    </p>
                  </div>
                )}
              </div>

              {/* Canvas Controls */}
              <div className="absolute bottom-6 left-6 flex gap-3">
                <button 
                  onClick={clearItems}
                  className="bg-white/80 backdrop-blur-sm p-4 rounded-full text-art-green hover:text-art-orange shadow-lg transition-all active:scale-95 border-2 border-transparent hover:border-art-orange/20"
                  id="btn-clear"
                >
                  <RotateCcw size={24} />
                </button>
              </div>

              {mode === 'quiz' && items.length > 0 && !quizFeedback && (
                <div className="absolute bottom-6 right-6">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={checkQuiz}
                    className="bg-art-orange px-8 py-3 rounded-full text-white font-black uppercase tracking-widest shadow-xl flex items-center gap-2 border-4 border-white/20"
                    id="btn-check-quiz"
                  >
                    Check Work
                  </motion.button>
                </div>
              )}
            </div>

            {/* Sentence Builder Section */}
            <section className="w-full bg-art-green p-10 rounded-[40px] shadow-2xl relative overflow-hidden">
              <div className="absolute -top-4 left-10 bg-art-orange px-4 py-1 rounded-md text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
                Sentence Builder
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-6 text-white min-h-[80px]">
                {items.length > 0 ? (
                   <>
                    <span className="text-5xl font-serif italic text-white/70">He</span>
                    {items.map((item, idx) => (
                      <React.Fragment key={`sentence-${idx}`}>
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`min-w-[120px] h-16 px-6 bg-white/20 border-2 border-dashed border-white/40 rounded-2xl flex items-center justify-center text-2xl font-black ${idx === items.length - 1 ? 'text-orange-200' : 'text-white'}`}
                        >
                          {item.maori}{idx < items.length - 1 ? ',' : ''}
                        </motion.div>
                        {idx < items.length - 1 && (
                          <span className="text-5xl font-serif italic text-white/70">he</span>
                        )}
                      </React.Fragment>
                    ))}
                    <span className="text-5xl font-serif italic text-white/70 whitespace-nowrap">hoki.</span>
                  </>
                ) : (
                  <p className="text-white/40 font-serif italic text-3xl">Whiriwhiria he kai... (Select some food...)</p>
                )}
              </div>

              {items.length > 0 && quizFeedback === 'fail' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 flex items-center justify-center gap-2 text-white bg-art-orange/80 backdrop-blur-sm p-3 rounded-2xl border border-white/20"
                >
                  <AlertCircle size={20} />
                  <p className="font-bold text-sm">Oops! Check your items or the location (Roto vs Runga).</p>
                </motion.div>
              )}
            </section>

            {/* Footer Reference */}
            <footer className="w-full flex justify-between items-center text-[10px] font-black text-art-green/40 uppercase tracking-[0.2em] pt-4">
              <div>Curriculum Level 1.5</div>
              <div className="bg-art-green/10 px-4 py-1 rounded-full">Tūwāhi: Roto & Runga</div>
              <div>© Te Reo Kete 2026</div>
            </footer>

          </div>
        </main>
        
      </div>
    </div>
  );
}
