export interface Category {
  id: string;
  name: {
    vi: string;
    en: string;
    fr: string;
    it: string;
    zh: string;
    ja: string;
  };
  description: {
    vi: string;
    en: string;
    fr: string;
    it: string;
    zh: string;
    ja: string;
  };
  image: string;
  isPromotional?: boolean;
  order: number;
}

export interface Topping {
  id: string;
  name: {
    vi: string;
    en: string;
    fr: string;
    it: string;
    zh: string;
    ja: string;
  };
  price: number;
  category: 'meat' | 'vegetable' | 'sauce' | 'extra';
  available: boolean;
}

export interface Product {
  id: string;
  name: {
    vi: string;
    en: string;
    fr: string;
    it: string;
    zh: string;
    ja: string;
  };
  description: {
    vi: string;
    en: string;
    fr: string;
    it: string;
    zh: string;
    ja: string;
  };
  price: number;
  originalPrice?: number; // For promotions
  categoryId: string;
  image: string;
  images: string[]; // Additional product images
  available: boolean;
  isPromotional?: boolean;
  isBestSeller?: boolean;
  isNew?: boolean;
  preparationTime: number; // in minutes
  spicyLevel?: 1 | 2 | 3; // 1=mild, 2=medium, 3=spicy
  allergens: string[];
  tags: string[];
  toppings: string[]; // Topping IDs that can be added
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface Store {
  id: string;
  name: string;
  address: {
    vi: string;
    en: string;
    fr: string;
    it: string;
    zh: string;
    ja: string;
  };
  phone: string;
  email: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  openingHours: {
    [key: string]: { open: string; close: string; closed?: boolean };
  };
  deliveryRadius: number; // in km
  deliveryFee: number;
  minimumOrder: number;
}

// Categories
export const mockCategories: Category[] = [
  {
    id: 'promotion',
    name: {
      vi: 'Khuyến Mãi',
      en: 'Promotions',
      fr: 'Promotions',
      it: 'Promozioni',
      zh: '促销',
      ja: 'プロモーション'
    },
    description: {
      vi: 'Các món ăn đang có ưu đãi đặc biệt',
      en: 'Special promotional dishes with great deals',
      fr: 'Plats promotionnels spéciaux avec de bonnes affaires',
      it: 'Piatti promozionali speciali con ottime offerte',
      zh: '特价促销菜品',
      ja: '特別プロモーション料理'
    },
    image: '/images/categories/promotion.jpg',
    isPromotional: true,
    order: 1
  },
  {
    id: 'combo',
    name: {
      vi: 'Combo',
      en: 'Combo Meals',
      fr: 'Menus Combo',
      it: 'Menu Combo',
      zh: '套餐',
      ja: 'コンボセット'
    },
    description: {
      vi: 'Các set combo tiết kiệm và đầy đủ dinh dưỡng',
      en: 'Economical and nutritious combo sets',
      fr: 'Sets combo économiques et nutritifs',
      it: 'Set combo economici e nutrienti',
      zh: '经济实惠的营养套餐',
      ja: '経済的で栄養満点のコンボセット'
    },
    image: '/images/categories/combo.jpg',
    order: 2
  },
  {
    id: 'flash-sale',
    name: {
      vi: 'Flash Sale',
      en: 'Flash Sale',
      fr: 'Vente Flash',
      it: 'Vendita Flash',
      zh: '限时抢购',
      ja: 'フラッシュセール'
    },
    description: {
      vi: 'Giảm giá sốc trong thời gian giới hạn',
      en: 'Limited time shocking discounts',
      fr: 'Réductions choc pour une durée limitée',
      it: 'Sconti shock per tempo limitato',
      zh: '限时超值优惠',
      ja: '期間限定の衝撃価格'
    },
    image: '/images/categories/flash-sale.jpg',
    isPromotional: true,
    order: 3
  },
  {
    id: 'banh-mi',
    name: {
      vi: 'Bánh Mì',
      en: 'Vietnamese Sandwiches',
      fr: 'Sandwichs Vietnamiens',
      it: 'Panini Vietnamiti',
      zh: '越南三明治',
      ja: 'ベトナムサンドイッチ'
    },
    description: {
      vi: 'Bánh mì Việt Nam truyền thống với nhiều nhân đa dạng',
      en: 'Traditional Vietnamese sandwiches with diverse fillings',
      fr: 'Sandwichs vietnamiens traditionnels avec diverses garnitures',
      it: 'Panini vietnamiti tradizionali con ripieni diversi',
      zh: '传统越南三明治，馅料丰富多样',
      ja: '多様な具材の伝統的ベトナムサンドイッチ'
    },
    image: '/images/categories/banh-mi.jpg',
    order: 4
  },
  {
    id: 'drinks',
    name: {
      vi: 'Nước Uống',
      en: 'Beverages',
      fr: 'Boissons',
      it: 'Bevande',
      zh: '饮品',
      ja: '飲み物'
    },
    description: {
      vi: 'Các loại nước uống tươi mát và thơm ngon',
      en: 'Fresh and delicious beverages',
      fr: 'Boissons fraîches et délicieuses',
      it: 'Bevande fresche e deliziose',
      zh: '新鲜美味的饮品',
      ja: 'フレッシュで美味しい飲み物'
    },
    image: '/images/categories/drinks.jpg',
    order: 5
  },
  {
    id: 'other-dishes',
    name: {
      vi: 'Món Khác',
      en: 'Other Dishes',
      fr: 'Autres Plats',
      it: 'Altri Piatti',
      zh: '其他菜品',
      ja: 'その他の料理'
    },
    description: {
      vi: 'Các món ăn Việt Nam đặc sắc khác',
      en: 'Other distinctive Vietnamese dishes',
      fr: 'Autres plats vietnamiens distinctifs',
      it: 'Altri piatti vietnamiti distintivi',
      zh: '其他特色越南菜',
      ja: 'その他の特色あるベトナム料理'
    },
    image: '/images/categories/other-dishes.jpg',
    order: 6
  },
  {
    id: 'side-dish',
    name: {
      vi: 'Món Phụ',
      en: 'Side Dishes',
      fr: 'Accompagnements',
      it: 'Contorni',
      zh: '配菜',
      ja: 'サイドディッシュ'
    },
    description: {
      vi: 'Các món ăn kèm bổ sung cho bữa ăn',
      en: 'Complementary side dishes for your meal',
      fr: 'Accompagnements complémentaires pour votre repas',
      it: 'Contorni complementari per il vostro pasto',
      zh: '餐食的配菜补充',
      ja: 'お食事を補完するサイドディッシュ'
    },
    image: '/images/categories/side-dish.jpg',
    order: 7
  },
  {
    id: 'dessert',
    name: {
      vi: 'Tráng Miệng',
      en: 'Desserts',
      fr: 'Desserts',
      it: 'Dolci',
      zh: '甜点',
      ja: 'デザート'
    },
    description: {
      vi: 'Các món tráng miệng ngọt ngào để kết thúc bữa ăn',
      en: 'Sweet desserts to finish your meal',
      fr: 'Desserts sucrés pour terminer votre repas',
      it: 'Dolci per concludere il vostro pasto',
      zh: '甜蜜的甜点结束您的用餐',
      ja: 'お食事を締めくくる甘いデザート'
    },
    image: '/images/categories/dessert.jpg',
    order: 8
  }
];

// Toppings
export const mockToppings: Topping[] = [
  // Meat toppings
  {
    id: 'topping-1',
    name: {
      vi: 'Thịt Heo Nướng',
      en: 'Grilled Pork',
      fr: 'Porc Grillé',
      it: 'Maiale Grigliato',
      zh: '烤猪肉',
      ja: 'グリルポーク'
    },
    price: 15000,
    category: 'meat',
    available: true
  },
  {
    id: 'topping-2',
    name: {
      vi: 'Chả Lụa',
      en: 'Vietnamese Ham',
      fr: 'Jambon Vietnamien',
      it: 'Prosciutto Vietnamita',
      zh: '越南火腿',
      ja: 'ベトナムハム'
    },
    price: 12000,
    category: 'meat',
    available: true
  },
  {
    id: 'topping-3',
    name: {
      vi: 'Gà Nướng',
      en: 'Grilled Chicken',
      fr: 'Poulet Grillé',
      it: 'Pollo Grigliato',
      zh: '烤鸡肉',
      ja: 'グリルチキン'
    },
    price: 18000,
    category: 'meat',
    available: true
  },
  {
    id: 'topping-4',
    name: {
      vi: 'Pate',
      en: 'Pate',
      fr: 'Pâté',
      it: 'Paté',
      zh: '肝酱',
      ja: 'パテ'
    },
    price: 8000,
    category: 'meat',
    available: true
  },
  // Vegetable toppings
  {
    id: 'topping-5',
    name: {
      vi: 'Dưa Chuột',
      en: 'Cucumber',
      fr: 'Concombre',
      it: 'Cetriolo',
      zh: '黄瓜',
      ja: 'キュウリ'
    },
    price: 3000,
    category: 'vegetable',
    available: true
  },
  {
    id: 'topping-6',
    name: {
      vi: 'Rau Thơm',
      en: 'Fresh Herbs',
      fr: 'Herbes Fraîches',
      it: 'Erbe Fresche',
      zh: '新鲜香草',
      ja: 'フレッシュハーブ'
    },
    price: 5000,
    category: 'vegetable',
    available: true
  },
  {
    id: 'topping-7',
    name: {
      vi: 'Đậu Hũ Chiên',
      en: 'Fried Tofu',
      fr: 'Tofu Frit',
      it: 'Tofu Fritto',
      zh: '油炸豆腐',
      ja: '揚げ豆腐'
    },
    price: 8000,
    category: 'vegetable',
    available: true
  },
  // Sauce toppings
  {
    id: 'topping-8',
    name: {
      vi: 'Tương Ớt',
      en: 'Chili Sauce',
      fr: 'Sauce Piment',
      it: 'Salsa Piccante',
      zh: '辣椒酱',
      ja: 'チリソース'
    },
    price: 2000,
    category: 'sauce',
    available: true
  },
  {
    id: 'topping-9',
    name: {
      vi: 'Mayonnaise',
      en: 'Mayonnaise',
      fr: 'Mayonnaise',
      it: 'Maionese',
      zh: '蛋黄酱',
      ja: 'マヨネーズ'
    },
    price: 3000,
    category: 'sauce',
    available: true
  },
  // Extra toppings
  {
    id: 'topping-10',
    name: {
      vi: 'Trứng Ốp La',
      en: 'Fried Egg',
      fr: 'Œuf au Plat',
      it: 'Uovo Fritto',
      zh: '煎蛋',
      ja: '目玉焼き'
    },
    price: 10000,
    category: 'extra',
    available: true
  }
];

// Products
export const mockProducts: Product[] = [
  // Promotion category
  {
    id: 'prod-1',
    name: {
      vi: 'Combo Bánh Mì + Nước Ngọt',
      en: 'Banh Mi + Soft Drink Combo',
      fr: 'Combo Banh Mi + Boisson Gazeuse',
      it: 'Combo Banh Mi + Bibita',
      zh: '越南三明治+汽水套餐',
      ja: 'バインミー+ソフトドリンクコンボ'
    },
    description: {
      vi: 'Combo tiết kiệm với bánh mì thịt nướng và nước ngọt',
      en: 'Economical combo with grilled meat banh mi and soft drink',
      fr: 'Combo économique avec banh mi à la viande grillée et boisson gazeuse',
      it: 'Combo economico con banh mi alla carne grigliata e bibita',
      zh: '经济实惠的烤肉三明治和汽水套餐',
      ja: 'グリル肉バインミーとソフトドリンクのお得なコンボ'
    },
    price: 45000,
    originalPrice: 55000,
    categoryId: 'promotion',
    image: '/images/products/combo-banh-mi-drink.jpg',
    images: [
      '/images/products/combo-banh-mi-drink.jpg',
      '/images/products/combo-banh-mi-drink-2.jpg'
    ],
    available: true,
    isPromotional: true,
    preparationTime: 8,
    allergens: ['gluten', 'eggs'],
    tags: ['combo', 'popular'],
    toppings: ['topping-1', 'topping-5', 'topping-6', 'topping-8', 'topping-9']
  },
  // Banh Mi category
  {
    id: 'prod-2',
    name: {
      vi: 'Bánh Mì Thịt Nướng',
      en: 'Grilled Pork Banh Mi',
      fr: 'Banh Mi Porc Grillé',
      it: 'Banh Mi Maiale Grigliato',
      zh: '烤猪肉三明治',
      ja: 'グリルポークバインミー'
    },
    description: {
      vi: 'Bánh mì giòn với thịt heo nướng thơm lừng, rau thơm tươi',
      en: 'Crispy bread with fragrant grilled pork and fresh herbs',
      fr: 'Pain croustillant avec porc grillé parfumé et herbes fraîches',
      it: 'Pane croccante con maiale grigliato profumato e erbe fresche',
      zh: '酥脆面包配香喷喷的烤猪肉和新鲜香草',
      ja: '香ばしいグリルポークとフレッシュハーブの入ったクリスピーなパン'
    },
    price: 35000,
    categoryId: 'banh-mi',
    image: '/images/products/banh-mi-thit-nuong.jpg',
    images: [
      '/images/products/banh-mi-thit-nuong.jpg',
      '/images/products/banh-mi-thit-nuong-2.jpg',
      '/images/products/banh-mi-thit-nuong-3.jpg'
    ],
    available: true,
    isBestSeller: true,
    preparationTime: 7,
    spicyLevel: 1,
    allergens: ['gluten'],
    tags: ['signature', 'bestseller'],
    toppings: ['topping-1', 'topping-4', 'topping-5', 'topping-6', 'topping-8', 'topping-9', 'topping-10'],
    nutritionalInfo: {
      calories: 420,
      protein: 28,
      carbs: 45,
      fat: 15
    }
  },
  {
    id: 'prod-3',
    name: {
      vi: 'Bánh Mì Gà Nướng',
      en: 'Grilled Chicken Banh Mi',
      fr: 'Banh Mi Poulet Grillé',
      it: 'Banh Mi Pollo Grigliato',
      zh: '烤鸡肉三明治',
      ja: 'グリルチキンバインミー'
    },
    description: {
      vi: 'Bánh mì với thịt gà nướng mềm ngon, gia vị đậm đà',
      en: 'Banh mi with tender grilled chicken and rich seasoning',
      fr: 'Banh mi avec poulet grillé tendre et assaisonnement riche',
      it: 'Banh mi con pollo grigliato tenero e condimento ricco',
      zh: '嫩滑烤鸡肉和浓郁调味的三明治',
      ja: '柔らかいグリルチキンと濃厚な調味料のバインミー'
    },
    price: 38000,
    categoryId: 'banh-mi',
    image: '/images/products/banh-mi-ga-nuong.jpg',
    images: [
      '/images/products/banh-mi-ga-nuong.jpg',
      '/images/products/banh-mi-ga-nuong-2.jpg'
    ],
    available: true,
    preparationTime: 8,
    spicyLevel: 1,
    allergens: ['gluten'],
    tags: ['healthy', 'protein'],
    toppings: ['topping-3', 'topping-5', 'topping-6', 'topping-8', 'topping-9', 'topping-10'],
    nutritionalInfo: {
      calories: 390,
      protein: 32,
      carbs: 42,
      fat: 12
    }
  },
  {
    id: 'prod-4',
    name: {
      vi: 'Bánh Mì Chả Cá',
      en: 'Fish Cake Banh Mi',
      fr: 'Banh Mi Galette de Poisson',
      it: 'Banh Mi Polpetta di Pesce',
      zh: '鱼饼三明治',
      ja: 'フィッシュケーキバインミー'
    },
    description: {
      vi: 'Bánh mì với chả cá Hà Nội đặc trưng, thơm ngon khó cưỡng',
      en: 'Banh mi with characteristic Hanoi fish cake, irresistibly delicious',
      fr: 'Banh mi avec galette de poisson caractéristique de Hanoï, délicieusement irrésistible',
      it: 'Banh mi con polpetta di pesce caratteristica di Hanoi, irresistibilmente deliziosa',
      zh: '配有河内特色鱼饼的三明治，美味难挡',
      ja: 'ハノイ特産のフィッシュケーキ入りバインミー、抗いがたい美味しさ'
    },
    price: 40000,
    categoryId: 'banh-mi',
    image: '/images/products/banh-mi-cha-ca.jpg',
    images: [
      '/images/products/banh-mi-cha-ca.jpg',
      '/images/products/banh-mi-cha-ca-2.jpg'
    ],
    available: true,
    isNew: true,
    preparationTime: 10,
    spicyLevel: 2,
    allergens: ['gluten', 'fish'],
    tags: ['specialty', 'hanoi', 'new'],
    toppings: ['topping-5', 'topping-6', 'topping-8', 'topping-9'],
    nutritionalInfo: {
      calories: 405,
      protein: 25,
      carbs: 48,
      fat: 14
    }
  },
  {
    id: 'prod-5',
    name: {
      vi: 'Bánh Mì Đậu Hũ',
      en: 'Tofu Banh Mi',
      fr: 'Banh Mi Tofu',
      it: 'Banh Mi Tofu',
      zh: '豆腐三明治',
      ja: '豆腐バインミー'
    },
    description: {
      vi: 'Bánh mì chay với đậu hũ chiên giòn, dành cho người ăn chay',
      en: 'Vegetarian banh mi with crispy fried tofu, perfect for vegetarians',
      fr: 'Banh mi végétarien avec tofu frit croustillant, parfait pour les végétariens',
      it: 'Banh mi vegetariano con tofu fritto croccante, perfetto per i vegetariani',
      zh: '素食三明治配酥脆油炸豆腐，素食者的完美选择',
      ja: 'カリカリに揚げた豆腐入りのベジタリアンバインミー'
    },
    price: 30000,
    categoryId: 'banh-mi',
    image: '/images/products/banh-mi-dau-hu.jpg',
    images: [
      '/images/products/banh-mi-dau-hu.jpg',
      '/images/products/banh-mi-dau-hu-2.jpg'
    ],
    available: true,
    preparationTime: 6,
    allergens: ['gluten', 'soy'],
    tags: ['vegetarian', 'healthy'],
    toppings: ['topping-7', 'topping-5', 'topping-6', 'topping-8', 'topping-9'],
    nutritionalInfo: {
      calories: 320,
      protein: 18,
      carbs: 44,
      fat: 10
    }
  },
  // Drinks category
  {
    id: 'prod-6',
    name: {
      vi: 'Cà Phê Sữa Đá',
      en: 'Iced Vietnamese Coffee',
      fr: 'Café Vietnamien Glacé',
      it: 'Caffè Vietnamita Ghiacciato',
      zh: '越南冰咖啡',
      ja: 'ベトナムアイスコーヒー'
    },
    description: {
      vi: 'Cà phê Việt Nam đậm đà với sữa đặc ngọt ngào',
      en: 'Rich Vietnamese coffee with sweet condensed milk',
      fr: 'Café vietnamien riche avec lait concentré sucré',
      it: 'Caffè vietnamita ricco con latte condensato dolce',
      zh: '浓郁的越南咖啡配甜炼乳',
      ja: '甘い練乳入りの濃厚ベトナムコーヒー'
    },
    price: 25000,
    categoryId: 'drinks',
    image: '/images/products/ca-phe-sua-da.jpg',
    images: [
      '/images/products/ca-phe-sua-da.jpg',
      '/images/products/ca-phe-sua-da-2.jpg'
    ],
    available: true,
    isBestSeller: true,
    preparationTime: 5,
    allergens: ['dairy'],
    tags: ['signature', 'bestseller', 'caffeine'],
    toppings: [],
    nutritionalInfo: {
      calories: 180,
      protein: 4,
      carbs: 28,
      fat: 6
    }
  },
  {
    id: 'prod-7',
    name: {
      vi: 'Trà Sữa Trân Châu',
      en: 'Bubble Tea',
      fr: 'Thé au Lait aux Perles',
      it: 'Tè al Latte con Perle',
      zh: '珍珠奶茶',
      ja: 'タピオカミルクティー'
    },
    description: {
      vi: 'Trà sữa thơm ngon với trân châu dai dai',
      en: 'Delicious milk tea with chewy tapioca pearls',
      fr: 'Délicieux thé au lait avec perles de tapioca moelleuses',
      it: 'Delizioso tè al latte con perle di tapioca gommose',
      zh: '美味奶茶配有嚼劲十足的珍珠',
      ja: 'もちもちタピオカパール入りの美味しいミルクティー'
    },
    price: 30000,
    categoryId: 'drinks',
    image: '/images/products/tra-sua-tran-chau.jpg',
    images: [
      '/images/products/tra-sua-tran-chau.jpg',
      '/images/products/tra-sua-tran-chau-2.jpg'
    ],
    available: true,
    preparationTime: 4,
    allergens: ['dairy'],
    tags: ['popular', 'sweet'],
    toppings: [],
    nutritionalInfo: {
      calories: 280,
      protein: 3,
      carbs: 65,
      fat: 2
    }
  },
  {
    id: 'prod-8',
    name: {
      vi: 'Nước Dừa Tươi',
      en: 'Fresh Coconut Water',
      fr: 'Eau de Coco Fraîche',
      it: 'Acqua di Cocco Fresca',
      zh: '新鲜椰子水',
      ja: 'フレッシュココナッツウォーター'
    },
    description: {
      vi: 'Nước dừa tươi mát, bổ sung điện giải tự nhiên',
      en: 'Fresh coconut water, natural electrolyte replenishment',
      fr: 'Eau de coco fraîche, reconstitution naturelle d\'électrolytes',
      it: 'Acqua di cocco fresca, reintegro naturale di elettroliti',
      zh: '新鲜椰子水，天然电解质补充',
      ja: 'フレッシュココナッツウォーター、天然電解質補給'
    },
    price: 20000,
    categoryId: 'drinks',
    image: '/images/products/nuoc-dua-tuoi.jpg',
    images: [
      '/images/products/nuoc-dua-tuoi.jpg'
    ],
    available: true,
    preparationTime: 2,
    allergens: [],
    tags: ['healthy', 'natural', 'refreshing'],
    toppings: [],
    nutritionalInfo: {
      calories: 45,
      protein: 2,
      carbs: 9,
      fat: 0
    }
  },
  // Other dishes
  {
    id: 'prod-9',
    name: {
      vi: 'Phở Bò',
      en: 'Beef Pho',
      fr: 'Pho au Bœuf',
      it: 'Pho di Manzo',
      zh: '牛肉河粉',
      ja: '牛肉フォー'
    },
    description: {
      vi: 'Phở bò truyền thống với nước dùng thơm ngon, thịt bò tươi',
      en: 'Traditional beef pho with fragrant broth and fresh beef',
      fr: 'Pho de bœuf traditionnel avec bouillon parfumé et bœuf frais',
      it: 'Pho di manzo tradizionale con brodo profumato e manzo fresco',
      zh: '传统牛肉河粉，香浓汤底配新鲜牛肉',
      ja: '香り豊かなスープと新鮮な牛肉の伝統的フォー'
    },
    price: 65000,
    categoryId: 'other-dishes',
    image: '/images/products/pho-bo.jpg',
    images: [
      '/images/products/pho-bo.jpg',
      '/images/products/pho-bo-2.jpg',
      '/images/products/pho-bo-3.jpg'
    ],
    available: true,
    isBestSeller: true,
    preparationTime: 12,
    allergens: ['gluten'],
    tags: ['signature', 'bestseller', 'traditional'],
    toppings: ['topping-6', 'topping-8'],
    nutritionalInfo: {
      calories: 450,
      protein: 35,
      carbs: 55,
      fat: 8
    }
  },
  {
    id: 'prod-10',
    name: {
      vi: 'Bún Chả',
      en: 'Grilled Pork with Vermicelli',
      fr: 'Porc Grillé aux Vermicelles',
      it: 'Maiale Grigliato con Vermicelli',
      zh: '烤猪肉米粉',
      ja: 'グリルポークと米麺'
    },
    description: {
      vi: 'Bún chả Hà Nội với thịt nướng thơm lừng, nước mắm chua ngọt',
      en: 'Hanoi-style grilled pork with fragrant meat and sweet-sour fish sauce',
      fr: 'Porc grillé à la mode de Hanoï avec viande parfumée et sauce de poisson aigre-douce',
      it: 'Maiale grigliato in stile Hanoi con carne profumata e salsa di pesce agrodolce',
      zh: '河内风味烤猪肉配香喷喷的肉和酸甜鱼露',
      ja: 'ハノイ風グリルポーク、香ばしい肉と甘酸っぱい魚醤ソース'
    },
    price: 55000,
    categoryId: 'other-dishes',
    image: '/images/products/bun-cha.jpg',
    images: [
      '/images/products/bun-cha.jpg',
      '/images/products/bun-cha-2.jpg'
    ],
    available: true,
    preparationTime: 15,
    spicyLevel: 1,
    allergens: ['fish'],
    tags: ['hanoi', 'traditional', 'grilled'],
    toppings: ['topping-6', 'topping-8'],
    nutritionalInfo: {
      calories: 420,
      protein: 30,
      carbs: 48,
      fat: 12
    }
  },
  // Side dishes
  {
    id: 'prod-11',
    name: {
      vi: 'Nem Rán',
      en: 'Spring Rolls',
      fr: 'Rouleaux de Printemps',
      it: 'Involtini Primavera',
      zh: '春卷',
      ja: '春巻き'
    },
    description: {
      vi: 'Nem rán giòn rụm với nhân thịt và rau củ',
      en: 'Crispy spring rolls with meat and vegetable filling',
      fr: 'Rouleaux de printemps croustillants avec farce de viande et légumes',
      it: 'Involtini primavera croccanti con ripieno di carne e verdure',
      zh: '酥脆春卷配肉类和蔬菜馅',
      ja: '肉と野菜の具入りクリスピー春巻き'
    },
    price: 25000,
    categoryId: 'side-dish',
    image: '/images/products/nem-ran.jpg',
    images: [
      '/images/products/nem-ran.jpg',
      '/images/products/nem-ran-2.jpg'
    ],
    available: true,
    preparationTime: 8,
    allergens: ['gluten', 'eggs'],
    tags: ['crispy', 'appetizer'],
    toppings: ['topping-6', 'topping-8'],
    nutritionalInfo: {
      calories: 180,
      protein: 8,
      carbs: 22,
      fat: 7
    }
  },
  // Desserts
  {
    id: 'prod-12',
    name: {
      vi: 'Chè Ba Màu',
      en: 'Three-Color Sweet Soup',
      fr: 'Soupe Sucrée Tricolore',
      it: 'Zuppa Dolce Tricolore',
      zh: '三色甜汤',
      ja: '三色甘いスープ'
    },
    description: {
      vi: 'Chè ba màu truyền thống với đậu xanh, đậu đỏ và thạch',
      en: 'Traditional three-color sweet soup with mung bean, red bean and jelly',
      fr: 'Soupe sucrée tricolore traditionnelle avec haricot mungo, haricot rouge et gelée',
      it: 'Zuppa dolce tricolore tradizionale con fagiolo mungo, fagiolo rosso e gelatina',
      zh: '传统三色甜汤配绿豆、红豆和果冻',
      ja: '緑豆、小豆、ゼリー入りの伝統的三色甘いスープ'
    },
    price: 20000,
    categoryId: 'dessert',
    image: '/images/products/che-ba-mau.jpg',
    images: [
      '/images/products/che-ba-mau.jpg'
    ],
    available: true,
    preparationTime: 5,
    allergens: [],
    tags: ['traditional', 'sweet', 'cold'],
    toppings: [],
    nutritionalInfo: {
      calories: 220,
      protein: 6,
      carbs: 48,
      fat: 2
    }
  }
];

// Store information
export const mockStore: Store = {
  id: 'store-1',
  name: 'Phở & Bánh Mì Saigon',
  address: {
    vi: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    en: '123 Nguyen Hue, District 1, Ho Chi Minh City',
    fr: '123 Nguyen Hue, Arrondissement 1, Hô-Chi-Minh-Ville',
    it: '123 Nguyen Hue, Distretto 1, Città di Ho Chi Minh',
    zh: '胡志明市第一郡阮惠街123号',
    ja: 'ホーチミン市1区グエンフエ通り123番'
  },
  phone: '+84 28 3829 4567',
  email: 'info@phobanhmisaigon.vn',
  coordinates: {
    lat: 10.7769,
    lng: 106.7009
  },
  openingHours: {
    monday: { open: '06:00', close: '22:00' },
    tuesday: { open: '06:00', close: '22:00' },
    wednesday: { open: '06:00', close: '22:00' },
    thursday: { open: '06:00', close: '22:00' },
    friday: { open: '06:00', close: '23:00' },
    saturday: { open: '06:00', close: '23:00' },
    sunday: { open: '07:00', close: '22:00' }
  },
  deliveryRadius: 10,
  deliveryFee: 15000,
  minimumOrder: 50000
};