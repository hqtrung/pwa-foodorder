import { Category, Product } from '@/types';

// Fallback mock data when API is not available
export const fallbackCategories: Category[] = [
  {
    id: '1',
    name: 'Promotion',
    description: 'Special offers and deals',
    image: '/images/categories/promotion.jpg',
    productCount: 8,
    availableCount: 6,
  },
  {
    id: '2',
    name: 'Combo',
    description: 'Value meal combinations',
    image: '/images/categories/combo.jpg',
    productCount: 12,
    availableCount: 10,
  },
  {
    id: '3',
    name: 'Flash Sale',
    description: 'Limited time offers',
    image: '/images/categories/flash-sale.jpg',
    productCount: 5,
    availableCount: 4,
  },
  {
    id: '4',
    name: 'Bánh Mì',
    description: 'Fresh Vietnamese sandwiches',
    image: '/images/categories/banh-mi.jpg',
    productCount: 15,
    availableCount: 12,
  },
  {
    id: '5',
    name: 'Drinks',
    description: 'Refreshing beverages',
    image: '/images/categories/drinks.jpg',
    productCount: 20,
    availableCount: 18,
  },
  {
    id: '6',
    name: 'Other Dishes',
    description: 'Vietnamese specialties',
    image: '/images/categories/other-dishes.jpg',
    productCount: 25,
    availableCount: 20,
  },
  {
    id: '7',
    name: 'Side Dishes',
    description: 'Perfect accompaniments',
    image: '/images/categories/side-dishes.jpg',
    productCount: 10,
    availableCount: 8,
  },
  {
    id: '8',
    name: 'Desserts',
    description: 'Sweet treats',
    image: '/images/categories/desserts.jpg',
    productCount: 8,
    availableCount: 6,
  },
];

export const fallbackProducts: Product[] = [
  // Combo products (category 2)
  {
    id: '101',
    name: 'Phở Combo Special',
    description: 'Traditional beef phở with spring rolls and Vietnamese coffee',
    price: 89000,
    originalPrice: 110000,
    image: '/images/products/101.jpg',
    category: '2',
    isAvailable: true,
    preparationTime: 25,
    tags: ['combo', 'popular'],
    allergens: ['gluten'],
    nutritionalInfo: {
      calories: 650,
      protein: 35,
      carbs: 85,
      fat: 18,
    },
    toppings: [
      {
        id: '1',
        name: 'Extra Beef',
        price: 15000,
        isAvailable: true,
      },
      {
        id: '2',
        name: 'Extra Noodles',
        price: 8000,
        isAvailable: true,
      },
    ],
    badge: {
      type: 'promotion',
      text: 'Special Deal',
    },
  },
  {
    id: '102',
    name: 'Bánh Mì Combo',
    description: 'Classic bánh mì with pork, iced tea and side salad',
    price: 65000,
    originalPrice: 75000,
    image: '/images/products/102.jpg',
    category: '2',
    isAvailable: true,
    preparationTime: 15,
    tags: ['combo', 'quick'],
    allergens: ['gluten', 'dairy'],
    nutritionalInfo: {
      calories: 480,
      protein: 25,
      carbs: 55,
      fat: 15,
    },
    toppings: [
      {
        id: '3',
        name: 'Extra Pork',
        price: 12000,
        isAvailable: true,
      },
      {
        id: '4',
        name: 'Extra Vegetables',
        price: 5000,
        isAvailable: true,
      },
    ],
  },
  {
    id: '103',
    name: 'Bún Bò Huế Combo',
    description: 'Spicy beef noodle soup with fresh herbs and lemon',
    price: 95000,
    originalPrice: 95000,
    image: '/images/products/103.jpg',
    category: '2',
    isAvailable: true,
    preparationTime: 30,
    tags: ['combo', 'spicy'],
    allergens: ['shellfish'],
    nutritionalInfo: {
      calories: 720,
      protein: 40,
      carbs: 90,
      fat: 22,
    },
    toppings: [
      {
        id: '5',
        name: 'Extra Beef',
        price: 18000,
        isAvailable: true,
      },
      {
        id: '6',
        name: 'Less Spicy',
        price: 0,
        isAvailable: true,
      },
    ],
    badge: {
      type: 'new',
      text: 'New Recipe',
    },
  },
  // Add more fallback products as needed
];

export function getFallbackProducts(categoryId?: number): Product[] {
  if (categoryId) {
    return fallbackProducts.filter(product => product.category === categoryId.toString());
  }
  return fallbackProducts;
}