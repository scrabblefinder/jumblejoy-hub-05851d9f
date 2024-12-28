interface JumbleClue {
  jumbledWord: string;
  positions: number[];
}

export const extractLetters = (word: string, positions: number[]): string => {
  return positions.map(pos => word[pos - 1]).join('');
};

export const createFinalJumble = (clues: JumbleClue[]): string => {
  return clues.map(clue => extractLetters(clue.jumbledWord, clue.positions)).join('');
};

export const parseJumbleCallback = (data: any) => {
  const clues = [
    { jumbledWord: data.Clues.c1, answer: data.Clues.a1, positions: data.Clues.o1.split(',').map(Number) },
    { jumbledWord: data.Clues.c2, answer: data.Clues.a2, positions: data.Clues.o2.split(',').map(Number) },
    { jumbledWord: data.Clues.c3, answer: data.Clues.a3, positions: data.Clues.o3.split(',').map(Number) },
    { jumbledWord: data.Clues.c4, answer: data.Clues.a4, positions: data.Clues.o4.split(',').map(Number) }
  ];

  const finalJumble = createFinalJumble(clues);

  return {
    date: data.Date,
    clues: clues,
    caption: data.Caption.v1,
    solution: data.Solution.s1,
    imageUrl: data.Image,
    finalJumble
  };
};