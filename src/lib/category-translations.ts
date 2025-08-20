/**
 * Category translation mappings
 * Maps Vietnamese category names to their translations in other languages
 */

export interface CategoryTranslation {
  [locale: string]: string;
}

export interface CategoryTranslations {
  [categoryName: string]: CategoryTranslation;
}

export const categoryTranslations: CategoryTranslations = {
  'Bánh Mì Truyền Thống': {
    vi: 'Bánh Mì Truyền Thống',
    en: 'Traditional Sandwiches',
    fr: 'Sandwichs Traditionnels',
    it: 'Panini Tradizionali',
    ja: '伝統的なサンドイッチ',
    zh: '传统三明治',
    'zh-TW': '傳統三明治',
    es: 'Sándwiches Tradicionales',
    th: 'แซนด์วิชแบบดั้งเดิม'
  },
  
  'Mì trộn & Xôi': {
    vi: 'Mì trộn & Xôi',
    en: 'Mixed Noodles & Sticky Rice',
    fr: 'Nouilles Mélangées & Riz Gluant',
    it: 'Noodles Misti & Riso Appiccicoso',
    ja: '混ぜ麺と餅米',
    zh: '拌面和糯米',
    'zh-TW': '拌麵和糯米',
    es: 'Fideos Mixtos y Arroz Pegajoso',
    th: 'บะหมี่ผสมและข้าวเหนียว'
  },
  
  'Xôi': {
    vi: 'Xôi',
    en: 'Sticky Rice',
    fr: 'Riz Gluant',
    it: 'Riso Appiccicoso',
    ja: '餅米',
    zh: '糯米',
    'zh-TW': '糯米',
    es: 'Arroz Pegajoso',
    th: 'ข้าวเหนียว'
  },
  
  'Đồ Uống': {
    vi: 'Đồ Uống',
    en: 'Beverages',
    fr: 'Boissons',
    it: 'Bevande',
    ja: '飲み物',
    zh: '饮料',
    'zh-TW': '飲料',
    es: 'Bebidas',
    th: 'เครื่องดื่ม'
  },
  
  'Salad': {
    vi: 'Salad',
    en: 'Salads',
    fr: 'Salades',
    it: 'Insalate',
    ja: 'サラダ',
    zh: '沙拉',
    'zh-TW': '沙拉',
    es: 'Ensaladas',
    th: 'สลัด'
  },
  
  'COMBO': {
    vi: 'COMBO',
    en: 'Combo Meals',
    fr: 'Menus Combo',
    it: 'Menu Combo',
    ja: 'コンボセット',
    zh: '套餐',
    'zh-TW': '套餐',
    es: 'Menús Combo',
    th: 'ชุดคอมโบ'
  },
  
  'Topping': {
    vi: 'Topping',
    en: 'Toppings',
    fr: 'Garnitures',
    it: 'Condimenti',
    ja: 'トッピング',
    zh: '配料',
    'zh-TW': '配料',
    es: 'Complementos',
    th: 'ท็อปปิ้ง'
  },
  
  'Vật Phẩm': {
    vi: 'Vật Phẩm',
    en: 'Items',
    fr: 'Articles',
    it: 'Articoli',
    ja: 'アイテム',
    zh: '物品',
    'zh-TW': '物品',
    es: 'Artículos',
    th: 'สินค้า'
  }
};

/**
 * Get translated category name
 * @param categoryName - Original category name (usually in Vietnamese)
 * @param locale - Target locale
 * @returns Translated category name or original name if no translation found
 */
export function getCategoryTranslation(categoryName: string, locale: string = 'en'): string {
  const translation = categoryTranslations[categoryName];
  
  if (translation && translation[locale]) {
    return translation[locale];
  }
  
  // Fallback to original name if no translation found
  return categoryName;
}

/**
 * Get all available locales for category translations
 */
export function getAvailableCategoryLocales(): string[] {
  const firstCategory = Object.values(categoryTranslations)[0];
  return firstCategory ? Object.keys(firstCategory) : [];
}