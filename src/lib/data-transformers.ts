import { ApiCategory, ApiProduct, ApiTopping, AttributeLine, AttributeValue, apiClient } from './api';
import { Category, Product, Topping } from '@/types';
import { getCategoryTranslation } from './category-translations';
import { getAttributeValueTranslation } from './topping-translations';

// Transform API category to frontend category
export function transformCategory(apiCategory: ApiCategory, locale: string = 'en'): Category {
  const translatedName = getCategoryTranslation(apiCategory.name, locale) || apiCategory.name;
  
  return {
    id: apiCategory.id.toString(),
    name: translatedName,
    description: getCategoryDescription(apiCategory.name, locale),
    image: apiCategory.image_url || `/images/categories/${apiCategory.name.toLowerCase().replace(/\s+/g, '-')}.jpg`,
    productCount: 0, // Will be set separately when loading products
    availableCount: 0, // Will be calculated when loading products
  };
}

// Helper function to generate descriptions for categories
function getCategoryDescription(categoryName: string, locale: string = 'en'): string {
  const descriptions: Record<string, Record<string, string>> = {
    'COMBO': {
      vi: 'Combo giá trị với nhiều món',
      en: 'Value meal combinations',
      fr: 'Combinaisons de repas avantageux',
      it: 'Combinazioni di pasti convenienti',
      zh: '超值套餐组合',
      ja: 'お得なセットメニュー',
      'zh-TW': '超值套餐組合',
      es: 'Combinaciones de comidas económicas',
      th: 'ชุดอาหารคุ้มค่า'
    },
    'Mì trộn': {
      vi: 'Các món mì trộn',
      en: 'Mixed noodle dishes',
      fr: 'Plats de nouilles mélangées',
      it: 'Piatti di noodles misti',
      zh: '拌面类',
      ja: '汁なし麺料理',
      'zh-TW': '拌麵類',
      es: 'Platos de fideos mezclados',
      th: 'เส้นผสม'
    },
    'Bánh Mì Truyền Thống': {
      vi: 'Bánh mì Việt Nam truyền thống',
      en: 'Traditional Vietnamese sandwiches',
      fr: 'Sandwichs vietnamiens traditionnels',
      it: 'Panini vietnamiti tradizionali',
      zh: '传统越南三明治',
      ja: '伝統的ベトナムサンドイッチ',
      'zh-TW': '傳統越南三明治',
      es: 'Sándwiches vietnamitas tradicionales',
      th: 'แซนด์วิชเวียดนามแบบดั้งเดิม'
    },
    'Đồ Uống': {
      vi: 'Đồ uống tươi mát',
      en: 'Refreshing beverages',
      fr: 'Boissons rafraîchissantes',
      it: 'Bevande rinfrescanti',
      zh: '清爽饮品',
      ja: '爽やかな飲み物',
      'zh-TW': '清爽飲品',
      es: 'Bebidas refrescantes',
      th: 'เครื่องดื่มสดชื่น'
    },
    'Salad': {
      vi: 'Salad tươi và lành mạnh',
      en: 'Fresh and healthy salads',
      fr: 'Salades fraîches et saines',
      it: 'Insalate fresche e salutari',
      zh: '新鲜健康沙拉',
      ja: '新鮮で健康的なサラダ',
      'zh-TW': '新鮮健康沙拉',
      es: 'Ensaladas frescas y saludables',
      th: 'สลัดสดและเพื่อสุขภาพ'
    },
    'Topping': {
      vi: 'Topping và gia vị thêm',
      en: 'Extra toppings and add-ons',
      fr: 'Garnitures et compléments supplémentaires',
      it: 'Condimenti e aggiunte extra',
      zh: '额外配菜和添加物',
      ja: 'エクストラトッピングとアドオン',
      'zh-TW': '額外配菜和添加物',
      es: 'Ingredientes adicionales y complementos',
      th: 'ท็อปปิ้งและส่วนเพิ่มเติม'
    },
    'Xôi': {
      vi: 'Các món xôi',
      en: 'Sticky rice dishes',
      fr: 'Plats de riz gluant',
      it: 'Piatti di riso appiccicoso',
      zh: '糯米类',
      ja: 'もち米料理',
      'zh-TW': '糯米類',
      es: 'Platos de arroz pegajoso',
      th: 'ข้าวเหนียว'
    },
    'Vật Phẩm': {
      vi: 'Các món khác',
      en: 'Other items',
      fr: 'Autres articles',
      it: 'Altri articoli',
      zh: '其他物品',
      ja: 'その他のアイテム',
      'zh-TW': '其他物品',
      es: 'Otros artículos',
      th: 'รายการอื่นๆ'
    },
  };
  
  const categoryDescriptions = descriptions[categoryName];
  if (categoryDescriptions && categoryDescriptions[locale]) {
    return categoryDescriptions[locale];
  }
  
  // Fallback to English or default
  if (categoryDescriptions && categoryDescriptions['en']) {
    return categoryDescriptions['en'];
  }
  
  return `Delicious ${categoryName.toLowerCase()}`;
}

// Helper function to generate Google Cloud Storage image URLs
export function generateGCSImageUrl(productId: string, size: 'small' | 'medium' | 'large' | 'extra_large' = 'medium'): string {
  // For now, using a fixed hash and date. In production, these would be:
  // - hash: generated from product metadata or fetched from API/Firestore
  // - date: actual upload date from product metadata
  const hash = `ef3e1695`;
  const date = '20250817';
  
  const baseUrl = 'https://storage.googleapis.com/finiziapp-foodorder-images/products';
  return `${baseUrl}/${date}/${hash}_product_${productId}_${size}.jpg`;
}

// Helper function to get responsive image URLs for different screen sizes
export function getResponsiveImageUrls(productId: string) {
  return {
    small: generateGCSImageUrl(productId, 'small'),      // For thumbnails, mobile cards
    medium: generateGCSImageUrl(productId, 'medium'),    // For product cards, default
    large: generateGCSImageUrl(productId, 'large'),      // For product detail modals
    extraLarge: generateGCSImageUrl(productId, 'extra_large') // For hero images, full screen
  };
}

// Transform API product to frontend product
export function transformProduct(apiProduct: ApiProduct, locale?: string): Product {
  // Safe access to pos_categ_id with fallback
  const categoryId = apiProduct.pos_categ_id && Array.isArray(apiProduct.pos_categ_id) && apiProduct.pos_categ_id.length > 0 
    ? apiProduct.pos_categ_id[0] 
    : 1; // Default to category 1 if missing

  // Transform attribute lines to toppings
  const toppings = transformAttributeLinesToToppings(apiProduct.attribute_lines || [], locale);

  // Use price range if available, otherwise use list_price
  const basePrice = apiProduct.list_price || 0;
  const priceRange = apiProduct.price_range || { min: basePrice, max: basePrice };

  // Use tags from API only (no generation to prevent mistagging)
  const tags = apiProduct.tags || [];

  // Generate Google Cloud Storage image URL
  let imageUrl = '/images/placeholder-food.svg'; // Default fallback
  
  if (apiProduct.image_url) {
    // Check if it's already a GCS URL
    if (apiProduct.image_url.includes('storage.googleapis.com/finiziapp-foodorder-images')) {
      imageUrl = apiProduct.image_url;
    } else if (apiProduct.image_url.startsWith('http')) {
      // For ERP URLs, extract product ID and generate GCS URL
      const productIdMatch = apiProduct.image_url.match(/product\.product\/(\d+)/);
      if (productIdMatch) {
        imageUrl = generateGCSImageUrl(productIdMatch[1], 'medium');
      } else {
        // Fix malformed URLs that are missing the colon after https
        if (apiProduct.image_url.startsWith('https//')) {
          imageUrl = apiProduct.image_url.replace('https//', 'https://');
        } else {
          imageUrl = apiProduct.image_url;
        }
      }
    } else {
      // It's a relative path, generate GCS URL using product ID
      imageUrl = generateGCSImageUrl(apiProduct.id.toString(), 'medium');
    }
  } else {
    // No image_url provided, generate GCS URL using product ID
    imageUrl = generateGCSImageUrl(apiProduct.id.toString(), 'medium');
  }


  return {
    id: apiProduct.id.toString(),
    name: apiProduct.name || 'Unnamed Product',
    description: apiProduct.description || apiProduct.long_description || apiProduct.description_sale || getProductDescription(apiProduct.name || ''),
    price: basePrice,
    originalPrice: basePrice,
    priceRange: priceRange,
    image: imageUrl,
    category: categoryId.toString(),
    isAvailable: apiProduct.is_available ?? true,
    preparationTime: getEstimatedPrepTime(apiProduct.name || ''),
    tags: tags,
    allergens: [], // API doesn't provide this
    nutritionalInfo: {
      calories: 0, // API doesn't provide this
      protein: 0,
      carbs: 0,
      fat: 0,
    },
    toppings: toppings,
    attributeLines: apiProduct.attribute_lines || [],
    hasAttributes: apiProduct.has_attributes || false,
    hasToppings: apiProduct.has_toppings || false,
    badge: getProductBadge(tags),
  };
}

// Helper function to generate descriptions for products
function getProductDescription(productName: string): string {
  if (productName.includes('CMB') || productName.includes('COMBO')) {
    return 'Delicious combo meal with multiple items';
  }
  if (productName.includes('Lunchset')) {
    return 'Perfect lunch combo with great value';
  }
  if (productName.includes('Sáng')) {
    return 'Fresh breakfast combination to start your day';
  }
  return ''; // Return empty string if no specific description available
}

// Helper function to estimate preparation time based on product name
function getEstimatedPrepTime(productName: string): number {
  if (productName.includes('Express')) return 10;
  if (productName.includes('Sáng')) return 8;
  if (productName.includes('CMB') || productName.includes('COMBO')) return 15;
  return 12;
}


// Transform attribute lines to toppings array
export function transformAttributeLinesToToppings(attributeLines: AttributeLine[], locale: string = 'en'): Topping[] {
  const toppings: Topping[] = [];
  
  attributeLines.forEach(line => {
    line.values.forEach(value => {
      const translatedName = getAttributeValueTranslation(value.name, locale) || value.name;
      
      toppings.push({
        id: value.id.toString(),
        name: translatedName,
        price: value.price_extra,
        isAvailable: true, // Assume available if not specified
        attributeId: line.attribute_id,
        attributeName: line.attribute_name,
        displayType: line.display_type,
      });
    });
  });
  
  return toppings;
}

// Transform API topping to frontend topping
export function transformTopping(apiTopping: ApiTopping): Topping {
  return {
    id: apiTopping.id.toString(),
    name: apiTopping.name,
    price: apiTopping.price,
    isAvailable: apiTopping.is_available,
  };
}

// Helper function to determine product badge based on tags
export function getProductBadge(tags: string[]): Product['badge'] {
  if (!tags || tags.length === 0) {
    return undefined;
  }
  
  // Check tags for badges in priority order
  if (tags.includes('popular')) {
    return { type: 'bestseller', text: 'Popular' };
  }
  if (tags.includes('combo')) {
    return { type: 'promotion', text: 'Combo' };
  }
  if (tags.includes('breakfast')) {
    return { type: 'new', text: 'Breakfast' };
  }
  if (tags.includes('quick')) {
    return { type: 'new', text: 'Quick' };
  }
  
  return undefined;
}

// Helper function to get category icon
export function getCategoryIcon(categoryName: string): string {
  const iconMap: Record<string, string> = {
    // Vietnamese categories from real API
    'combo': '🍽️',
    'mì trộn': '🍜',
    'bánh mì truyền thống': '🥖',
    'đồ uống': '🥤',
    'salad': '🥗',
    'topping': '➕',
    'xôi': '🍚',
    'vật phẩm': '📦',
    
    // English fallbacks
    'promotion': '🔥',
    'flash sale': '⚡',
    'drink': '🥤',
    'drinks': '🥤',
    'beverage': '🥤',
    'noodles': '🍜',
    'sandwich': '🥖',
    'rice': '🍚',
    'other': '📦',
    'items': '📦',
  };

  const key = categoryName.toLowerCase();
  return iconMap[key] || '🍴';
}