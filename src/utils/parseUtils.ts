interface JumbleClue {
  jumbledWord: string;
  answer: string;
  positions: number[];
}

interface ParsedJumbleData {
  date: string;
  clues: JumbleClue[];
  caption: string;
  solution: string;
  imageUrl?: string;
  finalJumble: string;
}

export const parseJumbleXML = (xmlData: any): ParsedJumbleData => {
  const clues = [
    { 
      jumbledWord: xmlData.clues.c1.j, 
      answer: xmlData.clues.c1.a, 
      positions: xmlData.clues.c1.circle.split(',').map(Number)
    },
    { 
      jumbledWord: xmlData.clues.c2.j, 
      answer: xmlData.clues.c2.a, 
      positions: xmlData.clues.c2.circle.split(',').map(Number)
    },
    { 
      jumbledWord: xmlData.clues.c3.j, 
      answer: xmlData.clues.c3.a, 
      positions: xmlData.clues.c3.circle.split(',').map(Number)
    },
    { 
      jumbledWord: xmlData.clues.c4.j, 
      answer: xmlData.clues.c4.a, 
      positions: xmlData.clues.c4.circle.split(',').map(Number)
    }
  ];

  const finalJumble = createFinalJumble(clues);

  return {
    date: xmlData.date.v,
    clues,
    caption: xmlData.caption.v1.t,
    solution: xmlData.solution.s1.a,
    finalJumble
  };
};

export const parseJumbleCallback = (data: any): ParsedJumbleData => {
  const clues = [
    { 
      jumbledWord: data.Clues.c1, 
      answer: data.Clues.a1, 
      positions: data.Clues.o1.split(',').map(Number)
    },
    { 
      jumbledWord: data.Clues.c2, 
      answer: data.Clues.a2, 
      positions: data.Clues.o2.split(',').map(Number)
    },
    { 
      jumbledWord: data.Clues.c3, 
      answer: data.Clues.a3, 
      positions: data.Clues.o3.split(',').map(Number)
    },
    { 
      jumbledWord: data.Clues.c4, 
      answer: data.Clues.a4, 
      positions: data.Clues.o4.split(',').map(Number)
    }
  ];

  const finalJumble = createFinalJumble(clues);

  return {
    date: data.Date,
    clues,
    caption: data.Caption.v1,
    solution: data.Solution.s1,
    imageUrl: data.Image,
    finalJumble
  };
};

const extractLetters = (word: string, positions: number[]): string => {
  return positions.map(pos => word[pos - 1]).join('');
};

const createFinalJumble = (clues: JumbleClue[]): string => {
  return clues.map(clue => extractLetters(clue.jumbledWord, clue.positions)).join('');
};