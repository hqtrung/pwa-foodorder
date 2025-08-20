/**
 * Topping and attribute value translation mappings
 * Maps Vietnamese attribute values and topping names to other languages
 */

export interface AttributeValueTranslation {
  [locale: string]: string;
}

export interface AttributeValueTranslations {
  [originalName: string]: AttributeValueTranslation;
}

export const attributeValueTranslations: AttributeValueTranslations = {
  // Sandwich types
  'Bánh Mì Thập Cẩm': {
    vi: 'Bánh Mì Thập Cẩm',
    en: 'Mixed Sandwich',
    fr: 'Sandwich Mixte',
    it: 'Panino Misto',
    ja: 'ミックスサンドイッチ',
    zh: '综合三明治',
    'zh-TW': '綜合三明治',
    es: 'Sándwich Mixto',
    th: 'แซนด์วิชรวม'
  },
  
  'Bánh Mì Gà Xé': {
    vi: 'Bánh Mì Gà Xé',
    en: 'Shredded Chicken Sandwich',
    fr: 'Sandwich au Poulet Effiloché',
    it: 'Panino al Pollo Sfilacciato',
    ja: 'シュレッドチキンサンドイッチ',
    zh: '手撕鸡肉三明治',
    'zh-TW': '手撕雞肉三明治',
    es: 'Sándwich de Pollo Desmenuzado',
    th: 'แซนด์วิชไก่ฉีก'
  },
  
  'Bánh Mì Xá Xíu': {
    vi: 'Bánh Mì Xá Xíu',
    en: 'BBQ Pork Sandwich',
    fr: 'Sandwich au Porc BBQ',
    it: 'Panino al Maiale BBQ',
    ja: 'BBQポークサンドイッチ',
    zh: '叉烧三明治',
    'zh-TW': '叉燒三明治',
    es: 'Sándwich de Cerdo BBQ',
    th: 'แซนด์วิชหมูบาร์บีคิว'
  },
  
  // Beverages
  'Coca Cola Zero': {
    vi: 'Coca Cola Zero',
    en: 'Coca Cola Zero',
    fr: 'Coca Cola Zero',
    it: 'Coca Cola Zero',
    ja: 'コカコーラゼロ',
    zh: '可口可乐零度',
    'zh-TW': '可口可樂零度',
    es: 'Coca Cola Zero',
    th: 'โค้กโคล่าศูนย์'
  },
  
  'Pepsi': {
    vi: 'Pepsi',
    en: 'Pepsi',
    fr: 'Pepsi',
    it: 'Pepsi',
    ja: 'ペプシ',
    zh: '百事可乐',
    'zh-TW': '百事可樂',
    es: 'Pepsi',
    th: 'เป็ปซี่'
  },
  
  'Pepsi Black': {
    vi: 'Pepsi Black',
    en: 'Pepsi Black',
    fr: 'Pepsi Black',
    it: 'Pepsi Black',
    ja: 'ペプシブラック',
    zh: '百事黑可乐',
    'zh-TW': '百事黑可樂',
    es: 'Pepsi Black',
    th: 'เป็ปซี่แบล็ค'
  },
  
  // Sides and extras
  'Salad': {
    vi: 'Salad',
    en: 'Salad',
    fr: 'Salade',
    it: 'Insalata',
    ja: 'サラダ',
    zh: '沙拉',
    'zh-TW': '沙拉',
    es: 'Ensalada',
    th: 'สลัด'
  },
  
  'Sữa chua': {
    vi: 'Sữa chua',
    en: 'Yogurt',
    fr: 'Yaourt',
    it: 'Yogurt',
    ja: 'ヨーグルト',
    zh: '酸奶',
    'zh-TW': '優格',
    es: 'Yogur',
    th: 'โยเกิร์ต'
  },
  
  'Không': {
    vi: 'Không',
    en: 'None',
    fr: 'Aucun',
    it: 'Nessuno',
    ja: 'なし',
    zh: '无',
    'zh-TW': '無',
    es: 'Ninguno',
    th: 'ไม่มี'
  },
  
  // Modifiers and options
  'Không cay': {
    vi: 'Không cay',
    en: 'Not spicy',
    fr: 'Pas épicé',
    it: 'Non piccante',
    ja: '辛くない',
    zh: '不辣',
    'zh-TW': '不辣',
    es: 'No picante',
    th: 'ไม่เผ็ด'
  },
  
  'Có đường': {
    vi: 'Có đường',
    en: 'With sugar',
    fr: 'Avec sucre',
    it: 'Con zucchero',
    ja: '砂糖入り',
    zh: '加糖',
    'zh-TW': '加糖',
    es: 'Con azúcar',
    th: 'ใส่น้ำตาล'
  },
  
  'Không lạnh': {
    vi: 'Không lạnh',
    en: 'Not cold',
    fr: 'Pas froid',
    it: 'Non freddo',
    ja: '冷たくない',
    zh: '不冰',
    'zh-TW': '不冰',
    es: 'No frío',
    th: 'ไม่เย็น'
  },
  
  'Tương ớt': {
    vi: 'Tương ớt',
    en: 'Chili sauce',
    fr: 'Sauce piment',
    it: 'Salsa piccante',
    ja: 'チリソース',
    zh: '辣椒酱',
    'zh-TW': '辣椒醬',
    es: 'Salsa de chile',
    th: 'ซอสพริก'
  },
  
  'Ướp lạnh': {
    vi: 'Ướp lạnh',
    en: 'Cold marinated',
    fr: 'Mariné froid',
    it: 'Marinato freddo',
    ja: '冷製マリネ',
    zh: '冷腌',
    'zh-TW': '冷醃',
    es: 'Marinado frío',
    th: 'หมักเย็น'
  },
  
  // Common attribute line names
  'Kèm Salad Sữa Chua': {
    vi: 'Kèm Salad Sữa Chua',
    en: 'With Salad Yogurt',
    fr: 'Avec Salade Yaourt',
    it: 'Con Insalata Yogurt',
    ja: 'サラダヨーグルト付き',
    zh: '配沙拉酸奶',
    'zh-TW': '配沙拉優格',
    es: 'Con Ensalada Yogur',
    th: 'พร้อมสลัดโยเกิร์ต'
  },
  
  'Softdrinks': {
    vi: 'Softdrinks',
    en: 'Soft Drinks',
    fr: 'Boissons Gazeuses',
    it: 'Bibite Analcoliche',
    ja: 'ソフトドリンク',
    zh: '软饮',
    'zh-TW': '軟性飲料',
    es: 'Refrescos',
    th: 'เครื่องดื่มอัดลม'
  }
};

/**
 * Get translated attribute value name
 * @param attributeName - Original attribute value name (usually in Vietnamese)
 * @param locale - Target locale
 * @returns Translated name or original name if no translation found
 */
export function getAttributeValueTranslation(attributeName: string, locale: string = 'en'): string {
  const translation = attributeValueTranslations[attributeName];
  
  if (translation && translation[locale]) {
    return translation[locale];
  }
  
  // Fallback to original name if no translation found
  return attributeName;
}

/**
 * Get all available locales for attribute value translations
 */
export function getAvailableAttributeLocales(): string[] {
  const firstAttribute = Object.values(attributeValueTranslations)[0];
  return firstAttribute ? Object.keys(firstAttribute) : [];
}

/**
 * Check if a translation exists for a given attribute value and locale
 */
export function hasAttributeTranslation(attributeName: string, locale: string): boolean {
  const translation = attributeValueTranslations[attributeName];
  return translation && !!translation[locale];
}