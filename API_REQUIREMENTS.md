# API Requirements for Food Ordering PWA

This document outlines the API fields and endpoints required for optimal functionality of the Food Ordering PWA.

## Current API Status

### ✅ Working Endpoints
- `GET /api/v1/categories` - Returns list of food categories
- `GET /api/v1/products?category_id={id}` - Returns products for a category
- `GET /api/v1/products/{id}` - Returns single product details
- `GET /api/v1/cache/status` - Returns cache status

### ✅ Working Fields
- Product: `id`, `name`, `list_price`, `image_url`, `description_sale`
- Category: `id`, `name`, `parent_id`, `sequence`, `image_url`

## Missing/Required Fields

### Products API (`/api/v1/products`)

#### 🔴 Critical Missing Fields
```json
{
  "is_available": true,           // Boolean - Product availability status
  "pos_categ_id": [8, "COMBO"]   // Array - Must always be present with valid category
}
```

#### 🟡 Important Missing Fields
```json
{
  "preparation_time": 15,         // Number - Minutes to prepare (0-60)
  "tags": ["combo", "popular"],   // Array - Product tags for filtering
  "original_price": 75000,        // Number - Original price before discounts
  "discount_percentage": 10       // Number - Discount percentage (0-100)
}
```

#### 🟢 Nice-to-Have Fields
```json
{
  "allergens": ["gluten", "nuts"],         // Array - List of allergens
  "nutritional_info": {                    // Object - Nutritional information
    "calories": 450,
    "protein": 25,
    "carbs": 45,
    "fat": 15
  },
  "toppings": [                           // Array - Available toppings/add-ons
    {
      "id": 1,
      "name": "Extra Cheese",
      "price": 5000,
      "is_available": true
    }
  ],
  "variants": [                           // Array - Size/flavor variants
    {
      "id": 1,
      "name": "Large",
      "price_adjustment": 10000,
      "is_available": true
    }
  ]
}
```

### Categories API (`/api/v1/categories`)

#### 🟡 Important Missing Fields
```json
{
  "description": "Value meal combinations",  // String - Category description
  "is_active": true,                        // Boolean - Category visibility
  "product_count": 4,                       // Number - Count of products in category
  "icon": "🍽️"                             // String - Category icon/emoji
}
```

## Data Validation Requirements

### Product Validation
- `id`: Must be positive integer
- `name`: Must be non-empty string (max 255 chars)
- `pos_categ_id`: Must be array with at least one valid category ID
- `list_price`: Must be positive number
- `is_available`: Must be boolean (default: true)

### Category Validation
- `id`: Must be positive integer
- `name`: Must be non-empty string (max 100 chars)
- `sequence`: Must be positive integer for ordering

## Error Handling

### Current Issues Fixed in Frontend
1. **Missing `pos_categ_id`**: Frontend now defaults to category 1
2. **Null/undefined fields**: Frontend provides safe fallbacks
3. **Type mismatches**: Frontend validates types before processing

### Recommended API Error Responses
```json
{
  "error": "validation_error",
  "message": "Product validation failed",
  "details": {
    "pos_categ_id": "This field is required"
  }
}
```

## Image Handling

### Current Implementation
- Product images: `/images/products/{product_id}.jpg`
- Category images: `/images/categories/{category_name}.jpg`

### Recommendations
- Add `image_exists` boolean field to prevent 404s
- Support multiple image formats (jpg, png, webp)
- Add thumbnail URLs for performance

## Performance Recommendations

1. **Pagination**: Add pagination to products endpoint
2. **Caching**: Implement proper cache headers
3. **Compression**: Enable gzip/brotli compression
4. **CDN**: Consider CDN for images

## Future Enhancements

1. **Search API**: `GET /api/v1/products/search?q={query}`
2. **Filters API**: Support for price range, dietary restrictions
3. **Real-time Updates**: WebSocket for availability changes
4. **Analytics**: Track popular products/categories

## Implementation Priority

### Phase 1 (Critical - Fix Current Errors)
- ✅ Ensure `pos_categ_id` is always present
- ✅ Add `is_available` field
- ✅ Validate all required fields

### Phase 2 (Important - Enhance UX)
- Add `preparation_time` and `tags`
- Implement product variants/toppings
- Add category descriptions

### Phase 3 (Nice-to-Have - Advanced Features)
- Nutritional information
- Advanced search and filtering
- Real-time updates

---

**Note**: The frontend has been updated with defensive programming to handle missing fields gracefully, but implementing these API improvements will significantly enhance the user experience.