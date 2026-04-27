export type Color = 'red' | 'blue' | 'green' | 'yellow';
export type CardData = { id: string; color: Color; level: number };

export const SHAPES: Record<Color, string> = {
  red: 'L',
  blue: 'O',
  green: 'S',
  yellow: 'T'
};

export const baseShapes = {
  L: [{x:0,y:0}, {x:0,y:1}, {x:0,y:2}, {x:1,y:2}],
  O: [{x:0,y:0}, {x:1,y:0}, {x:0,y:1}, {x:1,y:1}],
  T: [{x:0,y:0}, {x:1,y:0}, {x:2,y:0}, {x:1,y:1}],
  S: [{x:1,y:0}, {x:2,y:0}, {x:0,y:1}, {x:1,y:1}],
};

export const normalize = (points: {x:number; y:number}[]) => {
  const minX = Math.min(...points.map(p => p.x));
  const minY = Math.min(...points.map(p => p.y));
  const translated = points.map(p => ({ x: p.x - minX, y: p.y - minY }));
  translated.sort((a, b) => a.y !== b.y ? a.y - b.y : a.x - b.x);
  return translated.map(p => `${p.x},${p.y}`).join('|');
};

const transform = (pts: {x:number; y:number}[], rot: number, ref: boolean) => {
  let result = pts;
  if (ref) result = result.map(p => ({x: -p.x, y: p.y}));
  for(let i=0; i<rot; i++) {
    result = result.map(p => ({x: -p.y, y: p.x}));
  }
  return result;
};

export const getVariants = (basePts: {x:number; y:number}[]) => {
  const variants = new Set<string>();
  for (let rot = 0; rot < 4; rot++) {
    for (let ref of [false, true]) {
      const t = transform(basePts, rot, ref);
      variants.add(normalize(t));
    }
  }
  return variants;
};

export const VALID_SHAPES = {
  L: getVariants(baseShapes.L),
  O: getVariants(baseShapes.O),
  T: getVariants(baseShapes.T),
  S: getVariants(baseShapes.S),
};

export const getInitialDeck = (): CardData[] => {
  const deck: CardData[] = [];
  const colors: Color[] = ['red', 'blue', 'green', 'yellow'];
  colors.forEach(color => {
    for (let i = 0; i < 20; i++) {
      deck.push({ id: `${color}-${i}`, color, level: 1 });
    }
  });
  // Shuffle
  for(let k = 0; k < 3; k++) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }
  return deck;
};

function getCombinations<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  function combine(start: number, currentCombo: T[]) {
    if (currentCombo.length === size) {
      result.push([...currentCombo]);
      return;
    }
    for (let i = start; i < array.length; i++) {
      currentCombo.push(array[i]);
      combine(i + 1, currentCombo);
      currentCombo.pop();
    }
  }
  combine(0, []);
  return result;
}

export const checkMerge = (
  board: (CardData | null)[], 
  targetIdx: number, 
  score: Record<Color, number>,
  deck: CardData[]
): { board: (CardData | null)[]; score: Record<Color, number>; deck: CardData[] } => {
  const card = board[targetIdx];
  if (!card) return { board, score, deck };

  const shapeType = SHAPES[card.color];
  const validVariants = VALID_SHAPES[shapeType as keyof typeof VALID_SHAPES];

  const sameCells = [];
  for (let i = 0; i < 9; i++) {
    if (board[i] && board[i]?.color === card.color && board[i]?.level === card.level) {
      sameCells.push(i);
    }
  }

  if (sameCells.length >= 4) {
    const others = sameCells.filter(idx => idx !== targetIdx);
    const combos = getCombinations(others, 3);
    for (const combo of combos) {
      const fullCombo = [targetIdx, ...combo];
      const pts = fullCombo.map(idx => ({ x: idx % 3, y: Math.floor(idx / 3) }));
      const norm = normalize(pts);
      if (validVariants.has(norm)) {
        // Merge combo!
        const newBoard = [...board];
        combo.forEach(idx => newBoard[idx] = null);
        const newLevel = card.level + 1;
        let newScore = { ...score };
        let newDeck = [...deck];

        if (newLevel === 3) {
           newBoard[targetIdx] = null;
           newScore[card.color]++;
           return checkMerge(newBoard, targetIdx, newScore, newDeck); 
        } else {
           newBoard[targetIdx] = null;
           newDeck.push({ ...card, level: newLevel, id: `${card.color}-lvl${newLevel}-${Date.now()}-${Math.random()}` });
           // Shuffle the deck
           for(let k = 0; k < 2; k++) {
             for (let i = newDeck.length - 1; i > 0; i--) {
               const j = Math.floor(Math.random() * (i + 1));
               [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
             }
           }
           return checkMerge(newBoard, targetIdx, newScore, newDeck);
        }
      }
    }
  }

  return { board, score, deck };
};
