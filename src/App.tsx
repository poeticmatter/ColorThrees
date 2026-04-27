import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CellData, Color, DominoCard, DominoOrientation,
  getDominoPlacement, getInitialDeck, checkMerge,
} from './lib/gameLogic';
import { Trophy, Skull } from 'lucide-react';

const COLOR: Record<Color, {
  bg: string; glow: string; l2glow: string;
  text: string; border: string; ring: string; label: string;
}> = {
  red:    { bg: 'bg-red-500',     glow: 'shadow-[0_0_14px_rgba(239,68,68,0.55)]',   l2glow: 'shadow-[0_0_28px_rgba(239,68,68,0.85)]',   text: 'text-red-400',     border: 'border-red-500',     ring: 'ring-red-500',     label: 'RED' },
  blue:   { bg: 'bg-blue-500',    glow: 'shadow-[0_0_14px_rgba(59,130,246,0.55)]',  l2glow: 'shadow-[0_0_28px_rgba(59,130,246,0.85)]',  text: 'text-blue-400',    border: 'border-blue-500',    ring: 'ring-blue-500',    label: 'BLUE' },
  green:  { bg: 'bg-emerald-500', glow: 'shadow-[0_0_14px_rgba(16,185,129,0.55)]',  l2glow: 'shadow-[0_0_28px_rgba(16,185,129,0.85)]',  text: 'text-emerald-400', border: 'border-emerald-500', ring: 'ring-emerald-500', label: 'GREEN' },
  yellow: { bg: 'bg-yellow-500',  glow: 'shadow-[0_0_14px_rgba(234,179,8,0.55)]',   l2glow: 'shadow-[0_0_28px_rgba(234,179,8,0.85)]',   text: 'text-yellow-400',  border: 'border-yellow-500',  ring: 'ring-yellow-500',  label: 'YELLOW' },
};

const CellDisplay = ({ cell }: { cell: CellData; key?: React.Key }) => {
  const c = COLOR[cell.color];
  if (cell.level === 1) {
    return (
      <motion.div
        key={cell.id}
        layoutId={cell.id}
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className={`absolute inset-2 rounded-xl ${c.bg} ${c.glow}`}
      />
    );
  }
  return (
    <motion.div
      key={cell.id}
      layoutId={cell.id}
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className={`absolute inset-0.5 rounded-xl ${c.bg} ${c.l2glow} flex items-center justify-center overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-white/30 rounded-xl" />
      <span className="relative z-10 text-white font-bold text-2xl drop-shadow">★</span>
    </motion.div>
  );
};

const PreviewCell = ({ color }: { color: Color }) => {
  const c = COLOR[color];
  return (
    <div className={`absolute inset-2 rounded-xl ${c.bg} opacity-35 border-2 ${c.border} pointer-events-none`} />
  );
};

const HandDomino = ({
  card, isSelected, orientation, flipped, onClick,
}: {
  card: DominoCard; isSelected: boolean; orientation: DominoOrientation; flipped: boolean; onClick: () => void; key?: React.Key;
}) => {
  const colorA = flipped ? card.colorB : card.colorA;
  const colorB = flipped ? card.colorA : card.colorB;
  const cA = COLOR[colorA];
  const cB = COLOR[colorB];
  const isHorizontal = orientation === 'H';
  return (
    <div className="w-20 h-20 flex items-center justify-center shrink-0">
      <motion.button
        layoutId={card.id}
        onClick={onClick}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, y: isSelected ? -10 : 0 }}
        exit={{ scale: 0, opacity: 0 }}
        className={`relative rounded-xl overflow-hidden cursor-pointer flex border-2 transition-shadow ${
          isHorizontal ? 'w-20 h-9 flex-row' : 'w-9 h-20 flex-col'
        } ${
          isSelected
            ? 'border-white shadow-[0_0_0_3px_rgba(255,255,255,0.25)]'
            : 'border-slate-700 hover:border-slate-500'
        }`}
      >
        <div className={`flex-1 ${cA.bg}`} />
        <div className={isHorizontal ? 'w-0.5 bg-black/50 shrink-0' : 'h-0.5 bg-black/50 shrink-0'} />
        <div className={`flex-1 ${cB.bg}`} />
      </motion.button>
    </div>
  );
};

export default function App() {
  const [deck, setDeck] = useState<DominoCard[]>([]);
  const [hand, setHand] = useState<DominoCard[]>([]);
  const [board, setBoard] = useState<(CellData | null)[]>(Array(9).fill(null));
  const [score, setScore] = useState<Record<Color, number>>({ red: 0, blue: 0, green: 0, yellow: 0 });
  const [selectedCardIdx, setSelectedCardIdx] = useState<number | null>(null);
  const [orientation, setOrientation] = useState<DominoOrientation>('H');
  const [flipped, setFlipped] = useState(false);
  const [hoverCell, setHoverCell] = useState<number | null>(null);

  useEffect(() => { startNewGame(); }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') setOrientation(o => o === 'H' ? 'V' : 'H');
      if (e.key === 'f' || e.key === 'F') setFlipped(f => !f);
      if (e.key === 'Escape') setSelectedCardIdx(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const startNewGame = () => {
    const newDeck = getInitialDeck();
    const initialHand = newDeck.splice(newDeck.length - 5, 5);
    setDeck(newDeck);
    setHand(initialHand);
    setBoard(Array(9).fill(null));
    setScore({ red: 0, blue: 0, green: 0, yellow: 0 });
    setSelectedCardIdx(null);
    setOrientation('H');
    setFlipped(false);
    setHoverCell(null);
  };

  const getPreviewColor = (cellIdx: number): Color | null => {
    if (selectedCardIdx === null || hoverCell === null) return null;
    const placement = getDominoPlacement(hoverCell, orientation);
    if (!placement) return null;
    const [posA, posB] = placement;
    const card = hand[selectedCardIdx];
    const colorA = flipped ? card.colorB : card.colorA;
    const colorB = flipped ? card.colorA : card.colorB;
    if (cellIdx === posA) return colorA;
    if (cellIdx === posB) return colorB;
    return null;
  };

  const playDomino = (anchor: number) => {
    if (selectedCardIdx === null) return;
    const placement = getDominoPlacement(anchor, orientation);
    if (!placement) return;
    const [posA, posB] = placement;
    const card = hand[selectedCardIdx];
    const colorA = flipped ? card.colorB : card.colorA;
    const colorB = flipped ? card.colorA : card.colorB;
    const ts = Date.now();

    const newBoard = [...board];
    newBoard[posA] = { id: `cell-${posA}-${ts}`,   color: colorA, level: 1 };
    newBoard[posB] = { id: `cell-${posB}-${ts}-b`, color: colorB, level: 1 };

    const newHand = [...hand];
    newHand.splice(selectedCardIdx, 1);
    const newDeck = [...deck];
    if (newDeck.length > 0) newHand.push(newDeck.pop()!);

    let { board: b, score: s } = checkMerge(newBoard, posA, score);
    ({ board: b, score: s } = checkMerge(b, posB, s));

    setBoard(b);
    setScore(s);
    setHand(newHand);
    setDeck(newDeck);
    setSelectedCardIdx(null);
    setHoverCell(null);
  };

  const isWin = (Object.values(score) as number[]).every(s => s >= 1);
  const canPlay = hand.length > 0;
  const isLoss = !isWin && !canPlay;
  const gameActive = !isWin && !isLoss;

  const dominoPreviewLabel = selectedCardIdx !== null ? (
    `${orientation === 'H' ? '→' : '↓'}  ${flipped ? 'flipped' : 'normal'}`
  ) : null;

  return (
    <div className="w-full h-screen bg-slate-950 text-slate-100 flex flex-col p-4 sm:p-10 font-sans overflow-hidden select-none relative max-w-[1200px] mx-auto min-h-[768px]">

      <header className="flex justify-between items-end border-b border-slate-800 pb-6 mb-10 shrink-0">
        <div className="flex flex-col">
          <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-blue-400 uppercase">Experimental Phase 02</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">QUARTET<span className="text-blue-500">MERGE</span></h1>
        </div>
        <div className="flex gap-4 sm:gap-8 text-right">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-slate-500">Deck</span>
            <span className="text-xl sm:text-2xl font-mono text-emerald-400">{deck.length.toString().padStart(2, '0')} <span className="text-slate-600 font-sans text-sm">/ 36</span></span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-slate-500">Hand</span>
            <span className="text-xl sm:text-2xl font-mono">{hand.length.toString().padStart(2, '0')} <span className="text-slate-600 font-sans text-sm">/ 05</span></span>
          </div>
        </div>
      </header>

      <main className="flex flex-col lg:flex-row flex-1 gap-6 lg:gap-12 overflow-hidden h-full">

        {/* Left Sidebar */}
        <section className="hidden sm:flex w-full lg:w-64 flex-row lg:flex-col gap-6 shrink-0 overflow-y-auto pr-2">
          <div className="p-5 bg-slate-900/50 rounded-2xl border border-slate-800/50 flex-1 lg:flex-none">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Match Lines</h3>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:space-y-4 lg:gap-0">
              {([
                { label: 'Row',       cells: [3,4,5] },
                { label: 'Column',    cells: [1,4,7] },
                { label: 'Diagonal',  cells: [0,4,8] },
                { label: 'Anti-diag', cells: [2,4,6] },
              ] as const).map(({ label, cells }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="grid grid-cols-3 gap-0.5 w-12 shrink-0">
                    {Array.from({length: 9}).map((_, i) => (
                      <div key={i} className={`w-3 h-3 ${cells.includes(i as never) ? 'bg-slate-400' : 'bg-slate-800'}`} />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-slate-400">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 lg:flex-none p-5 bg-blue-900/10 rounded-2xl border border-blue-500/10 flex flex-col justify-center items-center text-center">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-2 lg:mb-3">
              <span className="text-blue-400 text-lg lg:text-xl font-bold">!</span>
            </div>
            <p className="text-[10px] lg:text-xs text-slate-400 leading-relaxed uppercase tracking-wider px-2">3 in a line → 2 vanish, 1 upgrades to ★. Three ★ in a line → score!</p>
            <p className="text-[9px] lg:text-[10px] text-slate-600 mt-2 uppercase tracking-wider">[R] rotate · [F] flip</p>
          </div>
        </section>

        {/* Board */}
        <section className="flex-1 flex flex-col justify-center items-center gap-4 min-h-[400px]">
          <div className="grid grid-cols-3 gap-3 sm:gap-4 p-4 sm:p-5 bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] border-4 border-slate-800 shadow-2xl shrink-0">
            {board.map((cell, i) => {
              const previewColor = getPreviewColor(i);
              const placement = selectedCardIdx !== null && hoverCell !== null
                ? getDominoPlacement(hoverCell, orientation)
                : null;
              const isInvalidPreview = selectedCardIdx !== null && hoverCell === i
                && getDominoPlacement(i, orientation) === null;

              return (
                <div
                  key={`cell-${i}`}
                  onClick={() => gameActive && playDomino(i)}
                  onMouseEnter={() => setHoverCell(i)}
                  onMouseLeave={() => setHoverCell(null)}
                  className={`w-24 h-24 sm:w-28 sm:h-28 rounded-xl sm:rounded-2xl bg-slate-800/50 border border-slate-700 relative transition-colors ${
                    selectedCardIdx !== null && !isInvalidPreview
                      ? 'cursor-pointer'
                      : selectedCardIdx !== null
                      ? 'cursor-not-allowed'
                      : ''
                  } ${
                    placement && (placement[0] === i || placement[1] === i)
                      ? 'border-slate-500 bg-slate-800/80'
                      : ''
                  }`}
                >
                  <AnimatePresence mode="popLayout">
                    {cell && <CellDisplay key={cell.id} cell={cell} />}
                  </AnimatePresence>
                  {previewColor && <PreviewCell color={previewColor} />}
                </div>
              );
            })}
          </div>

          {/* Rotation controls */}
          {selectedCardIdx !== null && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <button
                onClick={() => setOrientation(o => o === 'H' ? 'V' : 'H')}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
              >
                {orientation === 'H' ? '→ Rotate ↓' : '↓ Rotate →'}
              </button>
              <button
                onClick={() => setFlipped(f => !f)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
              >
                {flipped ? '⇄ Flipped' : '⇄ Flip'}
              </button>
              <span className="text-[10px] text-slate-600 uppercase">[R] [F]</span>
            </motion.div>
          )}
        </section>

        {/* Right Sidebar */}
        <section className="w-full lg:w-64 flex flex-col gap-6 shrink-0 h-full">
          <div className="p-4 sm:p-6 bg-slate-900/50 rounded-2xl border border-slate-800/50 flex flex-col h-full lg:h-auto lg:flex-1">
            <h3 className="hidden sm:block text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Synthesis Progress</h3>
            <div className="flex-1 grid grid-cols-2 lg:grid-cols-1 gap-4 lg:space-y-8 lg:gap-0">
              {(['red', 'blue', 'yellow', 'green'] as Color[]).map(color => {
                const c = COLOR[color];
                const scored = score[color] >= 1;
                return (
                  <div key={color} className="flex flex-col gap-2 sm:gap-3">
                    <div className="flex justify-between items-center">
                      <span className={`text-xs sm:text-sm ${c.text} font-bold tracking-tight`}>{c.label} CORE</span>
                      {scored
                        ? <span className={`text-[9px] sm:text-[10px] ${c.text} font-bold uppercase tracking-tighter`}>Scored!</span>
                        : <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase">Pending</span>
                      }
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${c.bg} ${scored ? 'w-full ' + c.glow : 'w-0'}`} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 sm:mt-auto sm:pt-6 border-t border-slate-800">
              <div className="text-center flex flex-col items-center">
                <div className="text-[10px] text-slate-500 uppercase mb-1 tracking-tighter">Score</div>
                <div className="text-2xl sm:text-3xl font-mono font-bold">
                  {(score.red + score.blue + score.green + score.yellow) * 3112}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Hand */}
      <footer className="mt-4 sm:mt-10 flex justify-center gap-2 sm:gap-3 py-4 sm:py-6 border-t border-slate-800 shrink-0 overflow-x-auto">
        <AnimatePresence>
          {hand.map((card, idx) => (
            <HandDomino
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
