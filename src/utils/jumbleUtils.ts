export interface JumbleData {
  Date: string;
  Clues: {
    c1: string;
    c2: string;
    c3: string;
    c4: string;
    a1: string;
    a2: string;
    a3: string;
    a4: string;
    o1: string;
    o2: string;
    o3: string;
    o4: string;
  };
  Caption: {
    v1: string;
  };
  Solution: {
    s1: string;
    k1: string;
  };
  Image: string;
}

export const parseJumbleCallback = (input: string): JumbleData | null => {
  try {
    const jsonStr = input.replace(/^\/\*\*\/jsonCallback\((.*)\)$/, '$1');
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return null;
  }
};

export const extractCircledLetters = (word: string, positions: string): string => {
  const posArray = positions.split(',').map(Number);
  return posArray.map(pos => word[pos - 1]).join('');
};

export const createFinalJumble = (data: JumbleData): string => {
  const circledLetters = [
    extractCircledLetters(data.Clues.c1, data.Clues.o1),
    extractCircledLetters(data.Clues.c2, data.Clues.o2),
    extractCircledLetters(data.Clues.c3, data.Clues.o3),
    extractCircledLetters(data.Clues.c4, data.Clues.o4)
  ];
  
  return circledLetters.join('');
};