import { 
  mockCategories, 
  mockProducts, 
  mockToppings, 
  mockStore,
  Category,
  Product,
  Topping,
  Store
} from './mockData';

// Simulate API delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions
export const mockApi = {
  // Categories
  async getCategories(): Promise<Category[]> {
    await delay(300);
    return mockCategories.sort((a, b) => a.order - b.order);
  },

  async getCategoryById(id: string): Promise<Category | null> {
    await delay(200);
    return mockCategories.find(cat => cat.id === id) || null;
  },

  // Products
  async getProducts(filters?: {
    categoryId?: string;
    available?: boolean;
    isPromotional?: boolean;
    isBestSeller?: boolean;
    search?: string;
  }): Promise<Product[]> {
    await delay(400);
    let filteredProducts = [...mockProducts];

    if (filters?.categoryId) {
      filteredProducts = filteredProducts.filter(p => p.categoryId === filters.categoryId);
    }

    if (filters?.available !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.available === filters.available);
    }

    if (filters?.isPromotional !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.isPromotional === filters.isPromotional);
    }

    if (filters?.isBestSeller !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.isBestSeller === filters.isBestSeller);
    }

    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.name.vi.toLowerCase().includes(searchTerm) ||
        p.name.en.toLowerCase().includes(searchTerm) ||
        p.description.vi.toLowerCase().includes(searchTerm) ||
        p.description.en.toLowerCase().includes(searchTerm) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    return filteredProducts;
  },

  async getProductById(id: string): Promise<Product | null> {
    await delay(200);
    return mockProducts.find(product => product.id === id) || null;
  },

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    await delay(300);
    return mockProducts.filter(product => 
      product.categoryId === categoryId && product.available
    );
  },

  async getFeaturedProducts(): Promise<Product[]> {
    await delay(350);
    return mockProducts.filter(product => 
      (product.isBestSeller || product.isPromotional || product.isNew) && 
      product.available
    ).slice(0, 8);
  },

  async getPromotionalProducts(): Promise<Product[]> {
    await delay(300);
    return mockProducts.filter(product => 
      product.isPromotional && product.available
    );
  },

  async getBestSellerProducts(): Promise<Product[]> {
    await delay(300);
    return mockProducts.filter(product => 
      product.isBestSeller && product.available
    );
  },

  async getNewProducts(): Promise<Product[]> {
    await delay(300);
    return mockProducts.filter(product => 
      product.isNew && product.available
    );
  },

  // Toppings
  async getToppings(): Promise<Topping[]> {
    await delay(200);
    return mockToppings.filter(topping => topping.available);
  },

  async getToppingsByCategory(category: string): Promise<Topping[]> {
    await delay(200);
    return mockToppings.filter(topping => 
      topping.category === category && topping.available
    );
  },

  async getToppingsByIds(ids: string[]): Promise<Topping[]> {
    await delay(150);
    return mockToppings.filter(topping => 
      ids.includes(topping.id) && topping.available
    );
  },

  // Store
  async getStoreInfo(): Promise<Store> {
    await delay(200);
    return mockStore;
  },

  // Search
  async searchProducts(query: string): Promise<Product[]> {
    await delay(400);
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase();
    return mockProducts.filter(product => {
      const matchesName = Object.values(product.name).some(name => 
        name.toLowerCase().includes(searchTerm)
      );
      const matchesDescription = Object.values(product.description).some(desc => 
        desc.toLowerCase().includes(searchTerm)
      );
      const matchesTags = product.tags.some(tag => 
        tag.toLowerCase().includes(searchTerm)
      );
      
      return (matchesName || matchesDescription || matchesTags) && product.available;
    });
  },

  // Menu recommendations
  async getRecommendations(productId?: string): Promise<Product[]> {
    await delay(400);
    
    if (productId) {
      const currentProduct = mockProducts.find(p => p.id === productId);
      if (currentProduct) {
        // Recommend products from same category or with similar tags
        return mockProducts
          .filter(p => 
            p.id !== productId && 
            p.available && 
            (p.categoryId === currentProduct.categoryId || 
             p.tags.some(tag => currentProduct.tags.includes(tag)))
          )
          .slice(0, 4);
      }
    }
    
    // Default recommendations: best sellers and new products
    return mockProducts
      .filter(p => (p.isBestSeller || p.isNew) && p.available)
      .slice(0, 6);
  },

  // Cart operations simulation
  async addToCart(productId: string, quantity: number, toppings: string[] = []): Promise<boolean> {
    await delay(300);
    
    const product = mockProducts.find(p => p.id === productId);
    if (!product || !product.available) {
      throw new Error('Product not available');
    }
    
    // Validate toppings
    const validToppings = mockToppings.filter(t => 
      toppings.includes(t.id) && t.available
    );
    
    if (validToppings.length !== toppings.length) {
      throw new Error('Some toppings are not available');
    }
    
    return true;
  },

  // Order operations simulation
  async calculateDeliveryFee(address: string): Promise<number> {
    await delay(600);
    
    // Simulate delivery fee calculation based on distance
    // In real app, this would use GPS coordinates and mapping service
    const baseDeliveryFee = mockStore.deliveryFee;
    const randomMultiplier = Math.random() * 0.5 + 0.75; // 0.75 to 1.25
    
    return Math.round(baseDeliveryFee * randomMultiplier);
  },

  async validateAddress(address: string): Promise<boolean> {
    await delay(800);
    
    // Simulate address validation
    // In real app, this would use geocoding service
    return address.length > 10; // Simple validation
  },

  async estimateDeliveryTime(address: string): Promise<number> {
    await delay(500);
    
    // Simulate delivery time estimation (in minutes)
    const baseTime = 30;
    const randomVariation = Math.floor(Math.random() * 20) - 10; // -10 to +10 minutes
    
    return Math.max(15, baseTime + randomVariation);
  },

  async submitOrder(orderData: Record<string, unknown>): Promise<{ orderId: string; estimatedTime: number }> {
    await delay(1000);
    
    // Simulate order submission
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    const estimatedTime = await this.estimateDeliveryTime(orderData.address || '');
    
    return {
      orderId,
      estimatedTime
    };
  },

  // Order tracking simulation
  async getOrderStatus(orderId: string): Promise<{
    status: 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled';
    estimatedTime: number;
    currentStep: number;
    totalSteps: number;
  }> {
    await delay(400);
    
    // Simulate order status based on order age
    const orderTime = parseInt(orderId.split('-')[1]) || Date.now();
    const ageInMinutes = (Date.now() - orderTime) / (1000 * 60);
    
    if (ageInMinutes < 5) {
      return {
        status: 'preparing',
        estimatedTime: 25,
        currentStep: 1,
        totalSteps: 4
      };
    } else if (ageInMinutes < 15) {
      return {
        status: 'ready',
        estimatedTime: 15,
        currentStep: 2,
        totalSteps: 4
      };
    } else if (ageInMinutes < 35) {
      return {
        status: 'delivering',
        estimatedTime: 10,
        currentStep: 3,
        totalSteps: 4
      };
    } else {
      return {
        status: 'delivered',
        estimatedTime: 0,
        currentStep: 4,
        totalSteps: 4
      };
    }
  }
};

// Export individual functions for easier imports
export const {
  getCategories,
  getCategoryById,
  getProducts,
  getProductById,
  getProductsByCategory,
  getFeaturedProducts,
  getPromotionalProducts,
  getBestSellerProducts,
  getNewProducts,
  getToppings,
  getToppingsByCategory,
  getToppingsByIds,
  getStoreInfo,
  searchProducts,
  getRecommendations,
  addToCart,
  calculateDeliveryFee,
  validateAddress,
  estimateDeliveryTime,
  submitOrder,
  getOrderStatus
} = mockApi;