interface CircledLetters {
  word: string;
  positions: number[];
}

export const extractCircledLetters = (word: string, positions: string): string => {
  const positionArray = positions.split(',').map(Number);
  return positionArray.map(pos => word[pos - 1]).join('');
};

export const createFinalJumble = (clues: any): string => {
  const dec27Format = clues.c1 && typeof clues.c1 === 'string';
  
  if (dec27Format) {
    // December 27 format
    const words: CircledLetters[] = [
      { word: clues.c1, positions: clues.o1.split(',').map(Number) },
      { word: clues.c2, positions: clues.o2.split(',').map(Number) },
      { word: clues.c3, positions: clues.o3.split(',').map(Number) },
      { word: clues.c4, positions: clues.o4.split(',').map(Number) }
    ];
    
    return words.map(({ word, positions }) => 
      positions.map(pos => word[pos - 1]).join('')
    ).join('');
  } else {
    // December 28 format
    return Object.values(clues)
      .map((clue: any) => extractCircledLetters(clue.j, clue.circle))
      .join('');
  }
};