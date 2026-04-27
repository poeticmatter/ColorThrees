export type Color = 'red' | 'blue' | 'green' | 'yellow';
export type CellData = { id: string; color: Color; level: 1 | 2 };
export type DominoCard = { id: string; colorA: Color; colorB: Color };
export type DominoOrientation = 'H' | 'V';

const LINES: readonly (readonly number[])[] = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

export const getDominoPlacement = (
  anchor: number,
  orientation: DominoOrientation,
): [number, number] | null => {
  if (orientation === 'H') {
    if (anchor % 3 === 2) return null;
    return [anchor, anchor + 1];
  }
  if (anchor >= 6) return null;
  return [anchor, anchor + 3];
};

export const getInitialDeck = (): DominoCard[] => {
  const colors: Color[] = ['red', 'blue', 'green', 'yellow'];
  const deck: DominoCard[] = [];
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      for (let k = 0; k < 6; k++) {
        deck.push({ id: `${colors[i]}-${colors[j]}-${k}`, colorA: colors[i], colorB: colors[j] });
      }
    }
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

export const checkMerge = (
  board: (CellData | null)[],
  targetIdx: number,
  score: Record<Color, number>,
): { board: (CellData | null)[]; score: Record<Color, number> } => {
  const cell = board[targetIdx];
  if (!cell) return { board, score };

  for (const line of LINES) {
    if (!line.includes(targetIdx)) continue;
    if (!line.map(i => board[i]).every(c => c?.color === cell.color && c?.level === cell.level)) continue;

    const newBoard = [...board];

    if (cell.level === 1) {
      line.forEach(i => { if (i !== targetIdx) newBoard[i] = null; });
      newBoard[targetIdx] = { ...cell, level: 2, id: `${cell.id}-l2` };
      return checkMerge(newBoard, targetIdx, score);
    }

    const newScore = { ...score, [cell.color]: score[cell.color] + 1 };
    line.forEach(i => { newBoard[i] = null; });
    return { board: newBoard, score: newScore };
  }

  return { board, score };
};
