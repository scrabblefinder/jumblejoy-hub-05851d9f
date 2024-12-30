export function formatDate(dateStr) {
  const year = dateStr.slice(0, 4);
  const month = dateStr.slice(4, 6);
  const day = dateStr.slice(6, 8);
  return new Date(`${year}-${month}-${day}`).toLocaleDateString();
}

export function formatUrlDate(dateString) {
  const date = new Date(dateString);
  const month = date.toLocaleString('default', { month: 'long' }).toLowerCase();
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `/daily-jumble-${month}-${day}-${year}-answers`;
}

export function createSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
}