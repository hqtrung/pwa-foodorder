/**
 * Vietnamese text utilities for search and text processing
 */

// Comprehensive mapping of Vietnamese characters with diacritics to their base forms
const vietnameseMap: Record<string, string> = {
  // Lowercase vowels with diacritics
  'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
  'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
  'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
  'đ': 'd',
  'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
  'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
  'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
  'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
  'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
  'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
  'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
  'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
  'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
  
  // Uppercase vowels with diacritics
  'À': 'A', 'Á': 'A', 'Ả': 'A', 'Ã': 'A', 'Ạ': 'A',
  'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ẳ': 'A', 'Ẵ': 'A', 'Ặ': 'A',
  'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ậ': 'A',
  'Đ': 'D',
  'È': 'E', 'É': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ẹ': 'E',
  'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ể': 'E', 'Ễ': 'E', 'Ệ': 'E',
  'Ì': 'I', 'Í': 'I', 'Ỉ': 'I', 'Ĩ': 'I', 'Ị': 'I',
  'Ò': 'O', 'Ó': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ọ': 'O',
  'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ộ': 'O',
  'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ở': 'O', 'Ỡ': 'O', 'Ợ': 'O',
  'Ù': 'U', 'Ú': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ụ': 'U',
  'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ử': 'U', 'Ữ': 'U', 'Ự': 'U',
  'Ỳ': 'Y', 'Ý': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y', 'Ỵ': 'Y'
};

/**
 * Normalize Vietnamese text by removing diacritical marks
 * Examples:
 * - "Bánh Mì" → "Banh Mi"
 * - "Phở Bò" → "Pho Bo"
 * - "Cơm Tấm" → "Com Tam"
 */
export function normalizeVietnamese(text: string): string {
  if (!text) return '';
  
  return text
    .split('')
    .map(char => vietnameseMap[char] || char)
    .join('')
    .toLowerCase();
}

/**
 * Check if a Vietnamese text contains a search query (accent-insensitive)
 * Both the text and query are normalized before comparison
 */
export function vietnameseIncludes(text: string, query: string): boolean {
  if (!text || !query) return false;
  
  const normalizedText = normalizeVietnamese(text);
  const normalizedQuery = normalizeVietnamese(query);
  
  return normalizedText.includes(normalizedQuery);
}

/**
 * Search Vietnamese text with multiple terms (accent-insensitive)
 * All terms must be found in the text (AND logic)
 */
export function vietnameseMultiSearch(text: string, query: string): boolean {
  if (!text || !query) return false;
  
  const normalizedText = normalizeVietnamese(text);
  const terms = query.trim().split(/\s+/).map(term => normalizeVietnamese(term));
  
  return terms.every(term => normalizedText.includes(term));
}

/**
 * Highlight search terms in Vietnamese text (for future use)
 * Returns the original text with matched portions identified
 */
export function vietnameseHighlight(text: string, query: string): { text: string; hasMatch: boolean } {
  if (!text || !query) return { text, hasMatch: false };
  
  const normalizedText = normalizeVietnamese(text);
  const normalizedQuery = normalizeVietnamese(query);
  
  const hasMatch = normalizedText.includes(normalizedQuery);
  
  return { text, hasMatch };
}