const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ApiCategory {
  id: number;
  name: string;
  parent_id: boolean | number;
  sequence: number;
  image_url?: string | null;
}

export interface ApiCategoriesResponse {
  categories: ApiCategory[];
}

export interface AttributeValue {
  id: number;
  name: string;
  price_extra: number;
}

export interface AttributeLine {
  attribute_id: number;
  attribute_name: string;
  display_type: 'check_box' | 'radio';
  values: AttributeValue[];
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface ApiProduct {
  id: number;
  name?: string;
  pos_categ_id?: [number, string];
  list_price?: number;
  description_sale?: boolean | string;
  barcode?: string;
  image_url?: string | null;
  is_available?: boolean;
  attribute_lines?: AttributeLine[];
  has_attributes?: boolean;
  has_toppings?: boolean;
  price_range?: PriceRange;
  tags?: string[];
}

export interface ApiProductsResponse {
  products: ApiProduct[];
}

export interface ApiTopping {
  id: number;
  name: string;
  price: number;
  is_available: boolean;
}

export interface ApiCacheStatus {
  products_count: number;
  categories_count: number;
  images_loaded: number;
  last_updated: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options?.headers,
        },
        // For HTTPS with self-signed certificates in development
        ...(process.env.NODE_ENV === 'development' && {
          // Note: This doesn't work in browser, but helps document the issue
        }),
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        throw new Error('Response is not valid JSON');
      }
    } catch (error) {
      // console.error(`API request failed for ${endpoint}:`, error);
      
      // More detailed error information
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error(`Network error: Cannot connect to ${this.baseURL}. Please check if the FastAPI server is running and accessible.`);
      }
      
      throw error;
    }
  }

  // Categories API - Real API only
  async getCategories(): Promise<ApiCategory[]> {
    const response = await this.request<ApiCategoriesResponse>('/api/v1/categories');
    return response.categories;
  }

  async getCategory(id: number): Promise<ApiCategory> {
    return this.request<ApiCategory>(`/api/v1/categories/${id}`);
  }

  // Products API - Real API only
  async getProducts(categoryId?: number): Promise<ApiProduct[]> {
    const params = categoryId ? `?category_id=${categoryId}` : '';
    const response = await this.request<ApiProductsResponse>(`/api/v1/products${params}`);
    return response.products;
  }

  async getProduct(id: number): Promise<ApiProduct> {
    return this.request<ApiProduct>(`/api/v1/products/${id}`);
  }

  // Cache status - Real API only
  async getCacheStatus(): Promise<ApiCacheStatus> {
    return this.request<ApiCacheStatus>('/api/v1/cache/status');
  }

  // Helper method to get product image URL
  getProductImageUrl(productId: number): string {
    // Use the same base URL as the API
    return `${this.baseURL}/images/products/${productId}.jpg`;
  }
}

export const apiClient = new ApiClient();