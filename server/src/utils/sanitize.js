// Утилита для очистки текста от HTML-тегов
const HTML_TAG_RE = /<[^>]*>/g;
const SCRIPT_RE = /<script[\s\S]*?<\/script>/gi;
const STYLE_RE = /<style[\s\S]*?<\/style>/gi;

/**
 * Удаляет HTML-теги из строки, предотвращая XSS
 * @param {string} text
 * @returns {string}
 */
export const stripHtml = (text) => {
  if (!text || typeof text !== 'string') return text;
  return text
    .replace(SCRIPT_RE, '')
    .replace(STYLE_RE, '')
    .replace(HTML_TAG_RE, '')
    .trim();
};
