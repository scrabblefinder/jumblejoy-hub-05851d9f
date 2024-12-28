import { createFinalJumble } from './jumbleProcessor';

export const parseJumbleXML = (xmlData: any) => {
  const finalJumble = createFinalJumble(xmlData.clues);
  
  return {
    date: xmlData.date.v,
    clues: xmlData.clues,
    caption: xmlData.caption.v1.t,
    solution: xmlData.solution.s1.a,
    finalJumble
  };
};

export const parseJumbleCallback = (data: any) => {
  const finalJumble = createFinalJumble(data.Clues);
  
  return {
    date: data.Date,
    clues: data.Clues,
    caption: data.Caption.v1,
    solution: data.Solution.s1,
    imageUrl: data.Image,
    finalJumble
  };
};