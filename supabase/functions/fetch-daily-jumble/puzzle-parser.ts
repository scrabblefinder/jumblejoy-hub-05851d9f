import { format } from 'https://esm.sh/date-fns@3.3.1';

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
  };
  Caption: {
    v1: string;
  };
  Solution: {
    s1: string;
  };
  Image: string;
}

function extractValue(xml: string, tag: string, index: number = 0): string {
  const regex = new RegExp(`<${tag}[^>]*>(.*?)<\/${tag}>`, 'gs');
  const matches = [...xml.matchAll(regex)];
  return matches[index] ? matches[index][1].trim() : '';
}

export function parseJumbleXML(xmlText: string): JumbleData {
  console.log('Parsing XML:', xmlText);
  
  // Extract clues
  const clues = xmlText.match(/<clue[^>]*>[\s\S]*?<\/clue>/g) || [];
  console.log('Found clues:', clues);
  
  const jumbledWords = clues.map(clue => extractValue(clue, 'j'));
  const answers = clues.map(clue => extractValue(clue, 'a'));
  
  console.log('Extracted jumbled words:', jumbledWords);
  console.log('Extracted answers:', answers);

  // Extract caption
  const captionMatch = xmlText.match(/<caption>[\s\S]*?<v1>[\s\S]*?<t>(.*?)<\/t>[\s\S]*?<\/v1>[\s\S]*?<\/caption>/);
  const caption = captionMatch ? captionMatch[1].trim() : '';
  
  // Extract solution
  const solutionMatch = xmlText.match(/<solution>[\s\S]*?<s1[^>]*>[\s\S]*?<a>(.*?)<\/a>[\s\S]*?<\/s1>[\s\S]*?<\/solution>/);
  const solution = solutionMatch ? solutionMatch[1].trim() : '';
  
  // Extract image URL
  const imageMatch = xmlText.match(/<image>(.*?)<\/image>/);
  const imageUrl = imageMatch ? imageMatch[1].trim() : '';

  const today = new Date();
  const dateStr = format(today, 'yyMMdd');

  return {
    Date: dateStr,
    Clues: {
      c1: jumbledWords[0] || '',
      c2: jumbledWords[1] || '',
      c3: jumbledWords[2] || '',
      c4: jumbledWords[3] || '',
      a1: answers[0] || '',
      a2: answers[1] || '',
      a3: answers[2] || '',
      a4: answers[3] || '',
    },
    Caption: {
      v1: caption,
    },
    Solution: {
      s1: solution,
    },
    Image: imageUrl,
  };
}