import { supabase } from "@/integrations/supabase/client";

export const calculateFinalJumble = (clues: any): string => {
  const jumbledParts = [];
  const answers = [
    clues.c1.a,
    clues.c2.a,
    clues.c3.a,
    clues.c4.a
  ];
  const positions = [
    clues.c1.circle,
    clues.c2.circle,
    clues.c3.circle,
    clues.c4.circle
  ];
  
  for (let i = 0; i < answers.length; i++) {
    const word = answers[i];
    const pos = positions[i].split(',').map(Number);
    const letters = pos.map(p => word[p - 1]).join('');
    jumbledParts.push(letters);
  }
  
  return jumbledParts.join('');
};

export const updateFinalJumble = async (puzzleId: string, finalJumble: string) => {
  const { error: updateError } = await supabase
    .from('daily_puzzles')
    .update({ final_jumble: finalJumble })
    .eq('id', puzzleId);
    
  if (updateError) {
    console.error('Error updating final jumble:', updateError);
    return false;
  }
  return true;
};