import { ApiCategory, ApiProduct, ApiTopping, AttributeLine, AttributeValue, apiClient } from './api';
import { Category, Product, Topping } from '@/types';

// Transform API category to frontend category
export function transformCategory(apiCategory: ApiCategory): Category {
  return {
    id: apiCategory.id.toString(),
    name: apiCategory.name,
    description: getCategoryDescription(apiCategory.name),
    image: apiCategory.image_url || `/images/categories/${apiCategory.name.toLowerCase().replace(/\s+/g, '-')}.jpg`,
    productCount: 0, // Will be set separately when loading products
    availableCount: 0, // Will be calculated when loading products
  };
}

// Helper function to generate descriptions for categories
function getCategoryDescription(categoryName: string): string {
  const descriptions: Record<string, string> = {
    'COMBO': 'Value meal combinations',
    'Mì trộn': 'Mixed noodle dishes',
    'Bánh Mì Truyền Thống': 'Traditional Vietnamese sandwiches',
    'Đồ Uống': 'Refreshing beverages',
    'Salad': 'Fresh and healthy salads',
    'Topping': 'Extra toppings and add-ons',
    'Xôi': 'Sticky rice dishes',
    'Vật Phẩm': 'Other items',
  };
  return descriptions[categoryName] || `Delicious ${categoryName.toLowerCase()}`;
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
export function transformProduct(apiProduct: ApiProduct): Product {
  // Safe access to pos_categ_id with fallback
  const categoryId = apiProduct.pos_categ_id && Array.isArray(apiProduct.pos_categ_id) && apiProduct.pos_categ_id.length > 0 
    ? apiProduct.pos_categ_id[0] 
    : 1; // Default to category 1 if missing

  // Transform attribute lines to toppings
  const toppings = transformAttributeLinesToToppings(apiProduct.attribute_lines || []);

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
    description: typeof apiProduct.description_sale === 'string' ? apiProduct.description_sale : getProductDescription(apiProduct.name || ''),
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
  return 'Authentic Vietnamese dish prepared with care';
}

// Helper function to estimate preparation time based on product name
function getEstimatedPrepTime(productName: string): number {
  if (productName.includes('Express')) return 10;
  if (productName.includes('Sáng')) return 8;
  if (productName.includes('CMB') || productName.includes('COMBO')) return 15;
  return 12;
}


// Transform attribute lines to toppings array
export function transformAttributeLinesToToppings(attributeLines: AttributeLine[]): Topping[] {
  const toppings: Topping[] = [];
  
  attributeLines.forEach(line => {
    line.values.forEach(value => {
      toppings.push({
        id: value.id.toString(),
        name: value.name,
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