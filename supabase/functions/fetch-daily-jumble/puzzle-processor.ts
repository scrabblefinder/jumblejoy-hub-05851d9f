import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { formatSolution, extractJumbleWords, calculateFinalJumble } from './puzzle-formatter.ts';

export const processPuzzleData = async (
  puzzleData: any,
  formattedDate: string,
  supabaseClient: ReturnType<typeof createClient>
) => {
  // Check if puzzle already exists
  const { data: existingPuzzle } = await supabaseClient
    .from('daily_puzzles')
    .select('id')
    .eq('date', formattedDate)
    .single();

  // Extract and format puzzle data
  const caption = puzzleData.Caption?.v1 || '';
  const imageUrl = puzzleData.Image || '';
  const rawSolution = puzzleData.Solution?.s1 || '';
  const solution = formatSolution(rawSolution);
  
  // Calculate final jumble
  const { jumble: finalJumble, answer: finalJumbleAnswer } = calculateFinalJumble(puzzleData);

  // Prepare puzzle record
  const puzzleRecord = {
    date: formattedDate,
    caption,
    image_url: imageUrl,
    solution,
    final_jumble: finalJumble,
    final_jumble_answer: finalJumbleAnswer
  };

  let savedPuzzle;
  if (existingPuzzle) {
    // Update existing puzzle
    const { data: updatedPuzzle, error: updateError } = await supabaseClient
      .from('daily_puzzles')
      .update(puzzleRecord)
      .eq('id', existingPuzzle.id)
      .select()
      .single();

    if (updateError) throw updateError;
    savedPuzzle = updatedPuzzle;
  } else {
    // Insert new puzzle
    const { data: newPuzzle, error: insertError } = await supabaseClient
      .from('daily_puzzles')
      .insert(puzzleRecord)
      .select()
      .single();

    if (insertError) throw insertError;
    savedPuzzle = newPuzzle;
  }

  // Delete existing jumble words
  if (savedPuzzle.id) {
    const { error: deleteError } = await supabaseClient
      .from('jumble_words')
      .delete()
      .eq('puzzle_id', savedPuzzle.id);

    if (deleteError) throw deleteError;
  }

  // Process and insert jumble words
  const jumbleWords = extractJumbleWords(puzzleData.Clues, savedPuzzle.id);
  
  if (jumbleWords.length > 0) {
    const { error: wordsError } = await supabaseClient
      .from('jumble_words')
      .insert(jumbleWords);

    if (wordsError) throw wordsError;
  }

  return { puzzle: savedPuzzle, jumbleWords };
};