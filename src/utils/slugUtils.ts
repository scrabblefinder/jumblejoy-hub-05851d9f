export const createSlug = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export const matchSlug = (slug1: string, slug2: string) => {
  const normalizedSlug1 = createSlug(slug1);
  const normalizedSlug2 = createSlug(slug2);
  return normalizedSlug1 === normalizedSlug2;
};