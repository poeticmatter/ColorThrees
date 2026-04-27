import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CardData, Color, SHAPES, getInitialDeck, checkMerge, baseShapes } from './lib/gameLogic';
import { Trophy, Skull } from 'lucide-react';

const THEME = {
  red: {
    l1: { bg: 'bg-red-500/20', border: 'border-red-500', shadow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]', text: 'text-red-400', box: 'bg-red-500' },
    l2: { bg: 'bg-red-500', border: 'border-white', shadow: 'shadow-[0_0_30px_rgba(239,68,68,0.6)]', textBox: 'text-red-600' },
    ring: 'ring-red-500/50',
  },
  blue: {
    l1: { bg: 'bg-blue-500/20', border: 'border-blue-500', shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]', text: 'text-blue-400', box: 'bg-blue-500' },
    l2: { bg: 'bg-blue-500', border: 'border-white', shadow: 'shadow-[0_0_30px_rgba(59,130,246,0.6)]', textBox: 'text-blue-600' },
    ring: 'ring-blue-500/50',
  },
  green: {
    l1: { bg: 'bg-emerald-500/20', border: 'border-emerald-500', shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]', text: 'text-emerald-400', box: 'bg-emerald-500' },
    l2: { bg: 'bg-emerald-500', border: 'border-white', shadow: 'shadow-[0_0_30px_rgba(16,185,129,0.6)]', textBox: 'text-emerald-600' },
    ring: 'ring-emerald-500/50',
  },
  yellow: {
    l1: { bg: 'bg-yellow-500/20', border: 'border-yellow-500', shadow: 'shadow-[0_0_15px_rgba(234,179,8,0.3)]', text: 'text-yellow-400', box: 'bg-yellow-500' },
    l2: { bg: 'bg-yellow-500', border: 'border-white', shadow: 'shadow-[0_0_30px_rgba(234,179,8,0.6)]', textBox: 'text-yellow-600' },
    ring: 'ring-yellow-500/50',
  }
};

const BoardCard = ({ card, keyProp }: { card: CardData, keyProp?: string, key?: React.Key }) => {
  const t = THEME[card.color];
  const isL1 = card.level === 1;

  if (isL1) {
    return (
      <motion.div
        key={keyProp}
        layoutId={card.id}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className={`absolute inset-0 w-full h-full rounded-2xl ${t.l1.bg} border-2 ${t.l1.border} flex flex-col items-center justify-center gap-1 ${t.l1.shadow}`}
      >
        <span className={`text-[10px] font-bold ${t.l1.text} uppercase`}>Lvl 1</span>
        <div className={`w-8 h-8 rounded ${t.l1.box}`}></div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key={keyProp}
      layoutId={card.id}
      initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      exit={{ scale: 0, opacity: 0 }}
      className={`absolute w-[115%] h-[115%] -left-[7.5%] -top-[7.5%] z-10 rounded-3xl ${t.l2.bg} border-4 ${t.l2.border} ${t.l2.shadow} flex flex-col items-center justify-center gap-1 overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-white/20"></div>
      <span className="text-[10px] font-bold text-white uppercase relative z-10">Level 2</span>
      <div className={`w-10 h-10 rounded-lg bg-white shadow-inner flex items-center justify-center relative z-10 ${t.l2.textBox} font-bold text-xl`}>★</div>
    </motion.div>
  );
};

const HandCard = ({ card, isSelected, onClick, keyProp }: { card: CardData, isSelected?: boolean, onClick?: () => void, keyProp?: string, key?: React.Key }) => {
  const t = THEME[card.color];
  const isL1 = card.level === 1;

  return (
    <motion.div
      key={keyProp}
      layoutId={card.id}
      onClick={onClick}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1, y: isSelected ? -8 : 0 }}
      exit={{ scale: 0, opacity: 0 }}
      className={`relative w-24 h-32 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer group ${isSelected ? `ring-4 ${t.ring}` : ''} shrink-0 overflow-hidden ${isL1 ? 'bg-slate-800 border border-slate-600' : `${t.l2.bg} border-2 ${t.l2.border} shadow-lg`}`}
    >
      {isL1 ? (
        <>
          <span className="text-[8px] text-slate-500 uppercase mb-2">Level 1</span>
          <div className={`w-12 h-12 ${t.l1.box} rounded shadow-lg group-hover:shadow-[0_0_10px_rgba(255,255,255,0.2)]`}></div>
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-tr from-black/30 to-white/20 pointer-events-none"></div>
          <span className="text-[10px] font-bold text-white uppercase relative z-10 mb-2">Level 2</span>
          <div className={`w-12 h-12 rounded-lg bg-white shadow-inner flex items-center justify-center relative z-10 ${t.l2.textBox} font-bold text-2xl`}>★</div>
        </>
      )}
    </motion.div>
  );
};

export default function App() {
  const [deck, setDeck] = useState<CardData[]>([]);
  const [hand, setHand] = useState<CardData[]>([]);
  const [board, setBoard] = useState<(CardData | null)[]>(Array(9).fill(null));
  const [score, setScore] = useState<Record<Color, number>>({ red: 0, blue: 0, green: 0, yellow: 0 });
  const [selectedCardIdx, setSelectedCardIdx] = useState<number | null>(null);

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const newDeck = getInitialDeck();
    const initialHand = newDeck.splice(newDeck.length - 5, 5);
    setDeck(newDeck);
    setHand(initialHand);
    setBoard(Array(9).fill(null));
    setScore({ red: 0, blue: 0, green: 0, yellow: 0 });
    setSelectedCardIdx(null);
  };

  const playCard = (boardIdx: number) => {
    if (selectedCardIdx === null) return;

    const card = hand[selectedCardIdx];
    const newHand = [...hand];
    newHand.splice(selectedCardIdx, 1);
    
    const newDeck = [...deck];
    if (newDeck.length > 0) {
      newHand.push(newDeck.pop()!);
    }

    const newBoard = [...board];
    newBoard[boardIdx] = card;

    const { board: mergedBoard, score: mergedScore, deck: mergedDeck } = checkMerge(newBoard, boardIdx, score, newDeck);

    setBoard(mergedBoard);
    setScore(mergedScore);
    setHand(newHand);
    setDeck(mergedDeck);
    setSelectedCardIdx(null);
  };

  const isWin = (Object.values(score) as number[]).every(s => s >= 1);
  const canPlay = hand.length > 0;
  const isLoss = !isWin && !canPlay;
  const gameActive = !isWin && !isLoss;

  return (
    <div className="w-full h-screen bg-slate-950 text-slate-100 flex flex-col p-4 sm:p-10 font-sans overflow-hidden select-none relative max-w-[1200px] mx-auto min-h-[768px]">
      
      <header className="flex justify-between items-end border-b border-slate-800 pb-6 mb-10 shrink-0">
        <div className="flex flex-col">
          <div>
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-blue-400 uppercase">Experimental Phase 01</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">QUARTET<span className="text-blue-500">MERGE</span></h1>
          </div>
        </div>
        <div className="flex gap-4 sm:gap-8 text-right">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-slate-500">Deck Integrity</span>
            <span className="text-xl sm:text-2xl font-mono text-emerald-400">{deck.length.toString().padStart(2, '0')} <span className="text-slate-600 font-sans text-sm">/ 80</span></span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-slate-500">Active Hand</span>
            <span className="text-xl sm:text-2xl font-mono">{hand.length.toString().padStart(2, '0')} <span className="text-slate-600 font-sans text-sm">/ 05</span></span>
          </div>
        </div>
      </header>

      <main className="flex flex-col lg:flex-row flex-1 gap-6 lg:gap-12 overflow-hidden h-full">
        {/* Left Sidebar */}
        <section className="hidden sm:flex w-full lg:w-64 flex-row lg:flex-col gap-6 shrink-0 h-[full] overflow-y-auto pr-2 custom-scrollbar">
          <div className="p-5 bg-slate-900/50 rounded-2xl border border-slate-800/50 flex-1 lg:flex-none">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Color Patterns</h3>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:space-y-4 lg:gap-0">
              {/* Pattern L */}
              <div className="flex items-center gap-4">
                <div className="grid grid-cols-3 gap-0.5 w-12 shrink-0">
                  {Array.from({length: 9}).map((_, i) => (
                    <div key={i} className={`w-3 h-3 ${[0, 3, 6, 7].includes(i) ? 'bg-red-500' : 'bg-slate-800'}`}></div>
                  ))}
                </div>
                <span className="text-sm font-semibold text-slate-400">Pattern L</span>
              </div>
              {/* Pattern O */}
              <div className="flex items-center gap-4">
                <div className="grid grid-cols-3 gap-0.5 w-12 shrink-0">
                  {Array.from({length: 9}).map((_, i) => (
                    <div key={i} className={`w-3 h-3 ${[0, 1, 3, 4].includes(i) ? 'bg-blue-500' : 'bg-slate-800'}`}></div>
                  ))}
                </div>
                <span className="text-sm font-semibold text-slate-400">Pattern O</span>
              </div>
              {/* Pattern T */}
              <div className="flex items-center gap-4">
                <div className="grid grid-cols-3 gap-0.5 w-12 shrink-0">
                  {Array.from({length: 9}).map((_, i) => (
                    <div key={i} className={`w-3 h-3 ${[0, 1, 2, 4].includes(i) ? 'bg-yellow-500' : 'bg-slate-800'}`}></div>
                  ))}
                </div>
                <span className="text-sm font-semibold text-slate-400">Pattern T</span>
              </div>
              {/* Pattern S */}
              <div className="flex items-center gap-4">
                <div className="grid grid-cols-3 gap-0.5 w-12 shrink-0">
                  {Array.from({length: 9}).map((_, i) => (
                    <div key={i} className={`w-3 h-3 ${[1, 2, 3, 4].includes(i) ? 'bg-emerald-500' : 'bg-slate-800'}`}></div>
                  ))}
                </div>
                <span className="text-sm font-semibold text-slate-400">Pattern S</span>
              </div>
            </div>
          </div>
          <div className="flex-1 lg:flex-none p-5 bg-blue-900/10 rounded-2xl border border-blue-500/10 flex flex-col justify-center items-center text-center">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-2 lg:mb-3">
              <span className="text-blue-400 text-lg lg:text-xl font-bold">!</span>
            </div>
            <p className="text-[10px] lg:text-xs text-slate-400 leading-relaxed uppercase tracking-wider px-2">Match Level 2 sets to score Level 3 components.</p>
          </div>
        </section>

        {/* Board */}
        <section className="flex-1 flex justify-center items-center min-h-[400px]">
          <div className="grid grid-cols-3 gap-3 sm:gap-4 p-4 sm:p-5 bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] border-4 border-slate-800 shadow-2xl shrink-0">
            {board.map((card, i) => (
              <div 
                key={`cell-${i}`} 
                onClick={() => gameActive && playCard(i)}
                className={`w-24 h-24 sm:w-32 sm:h-32 rounded-xl sm:rounded-2xl bg-slate-800/50 border border-slate-700 relative ${selectedCardIdx !== null ? 'cursor-pointer hover:bg-slate-800 hover:border-slate-500 hover:ring-2 hover:ring-white/20' : ''}`}
              >
                <AnimatePresence mode="popLayout">
                  {card && <BoardCard key={card.id} keyProp={`bc-${card.id}`} card={card} />}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* Right Sidebar */}
        <section className="w-full lg:w-64 flex flex-col gap-6 shrink-0 h-full">
          <div className="p-4 sm:p-6 bg-slate-900/50 rounded-2xl border border-slate-800/50 flex flex-col h-full lg:h-auto lg:flex-1">
            <h3 className="hidden sm:block text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Synthesis Progress</h3>
            <div className="flex-1 grid grid-cols-2 lg:grid-cols-1 gap-4 lg:space-y-8 lg:gap-0">
              
              <div className="flex flex-col gap-2 sm:gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-red-500 font-bold tracking-tight">RED CORE</span>
                  {score.red >= 1 ? <span className="text-[9px] sm:text-[10px] text-red-500 font-bold uppercase tracking-tighter">Level 3 OK</span> : <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase">Pending</span>}
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full bg-red-500 ${score.red >= 1 ? 'w-full shadow-[0_0_8px_#ef4444]' : 'w-0'}`}></div>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-blue-500 font-bold tracking-tight">BLUE CORE</span>
                  {score.blue >= 1 ? <span className="text-[9px] sm:text-[10px] text-blue-500 font-bold uppercase tracking-tighter">Level 3 OK</span> : <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase">Pending</span>}
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full bg-blue-500 ${score.blue >= 1 ? 'w-full shadow-[0_0_8px_#3b82f6]' : 'w-0'}`}></div>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-yellow-500 font-bold tracking-tight">YELLOW CORE</span>
                  {score.yellow >= 1 ? <span className="text-[9px] sm:text-[10px] text-yellow-500 font-bold uppercase tracking-tighter">Level 3 OK</span> : <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase">Pending</span>}
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full bg-yellow-500 ${score.yellow >= 1 ? 'w-full shadow-[0_0_8px_#eab308]' : 'w-0'}`}></div>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-emerald-500 font-bold tracking-tight">GREEN CORE</span>
                  {score.green >= 1 ? <span className="text-[9px] sm:text-[10px] text-emerald-500 font-bold uppercase tracking-tighter">Level 3 OK</span> : <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase">Pending</span>}
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full bg-emerald-500 ${score.green >= 1 ? 'w-full shadow-[0_0_8px_#10b981]' : 'w-0'}`}></div>
                </div>
              </div>

            </div>
            <div className="mt-4 pt-4 sm:mt-auto sm:pt-6 border-t border-slate-800 flex justify-between sm:block">
              <div className="text-center sm:text-left mx-auto sm:mx-0 w-full flex flex-col items-center">
                <div className="text-[10px] text-slate-500 uppercase mb-1 tracking-tighter">Multiplier Score</div>
                <div className="text-2xl sm:text-3xl font-mono font-bold">{(score.red * 1 + score.blue * 1 + score.green * 1 + score.yellow * 1) * 3112}</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-4 sm:mt-10 flex justify-center gap-2 sm:gap-4 py-4 sm:py-6 border-t border-slate-800 shrink-0 overflow-x-auto custom-scrollbar">
        <AnimatePresence>
          {hand.map((card, idx) => (
            <HandCard 
              keyProp={`hc-${card.id}`}
              key={card.id}
              card={card} 
              isSelected={selectedCardIdx === idx}
              onClick={() => gameActive && setSelectedCardIdx(selectedCardIdx === idx ? null : idx)}
            />
          ))}
        </AnimatePresence>
      </footer>

      {isWin && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center p-8 bg-slate-900 border border-slate-800 shadow-2xl rounded-3xl">
            <Trophy className="w-20 h-20 text-emerald-400 mx-auto mb-6" />
            <h2 className="text-4xl font-extrabold mb-2 tracking-tighter text-emerald-400">SYNTHESIS COMPLETE</h2>
            <p className="text-slate-400 mb-8 text-sm uppercase tracking-widest">All core elements verified</p>
            <button onClick={startNewGame} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded font-bold uppercase tracking-widest transition-transform hover:-translate-y-1 active:translate-y-0 shadow-[0_4px_14px_rgba(16,185,129,0.4)]">Restart Sequence</button>
          </motion.div>
        </div>
      )}
      
      {isLoss && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center p-8 bg-slate-900 border border-slate-800 shadow-2xl rounded-3xl">
            <Skull className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h2 className="text-4xl font-extrabold text-red-500 mb-2 tracking-tighter">SYSTEM FAILURE</h2>
            <p className="text-slate-400 mb-8 text-sm uppercase tracking-widest">Resources depleted</p>
            <button onClick={startNewGame} className="px-8 py-3 bg-slate-100 hover:bg-white text-slate-900 rounded font-bold uppercase tracking-widest transition-transform hover:-translate-y-1 active:translate-y-0 shadow-[0_4px_14px_rgba(255,255,255,0.2)]">Reboot Sequence</button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

