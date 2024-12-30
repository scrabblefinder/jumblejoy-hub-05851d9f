export const formatSolution = (solution: string): string => {
  // Remove any existing { } and extra spaces, but preserve single spaces between words
  return solution.replace(/[{}]/g, '').replace(/\s+/g, ' ').trim();
};

export const extractJumbleWords = (clues: any, puzzleId: string) => {
  const jumbleWords = [];
  const seenWords = new Set();
  
  // Process regular jumble words (c1/a1, c2/a2, etc.)
  for (let i = 1; i <= 6; i++) {
    const jumbledWord = clues[`c${i}`];
    const answer = clues[`a${i}`];
    
    if (jumbledWord && answer) {
      const uniqueKey = `${puzzleId}-${jumbledWord}`;
      if (!seenWords.has(uniqueKey)) {
        seenWords.add(uniqueKey);
        jumbleWords.push({
          puzzle_id: puzzleId,
          jumbled_word: jumbledWord,
          answer: answer
        });
      }
    }
  }
  
  return jumbleWords;
};

export const calculateFinalJumble = (clues: any): { jumble: string | null, answer: string | null } => {
  // If we have both the final jumble and its answer in the clues
  if (clues.finalJumble?.j && clues.finalJumble?.a) {
    return {
      jumble: clues.finalJumble.j,
      answer: clues.finalJumble.a
    };
  }
  
  // Otherwise, return null values
  return {
    jumble: null,
    answer: null
  };
};
