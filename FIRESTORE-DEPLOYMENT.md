# Firestore Deployment Guide

This guide explains how to deploy Firestore security rules and indexes for the FoodOrder PWA, including both menu caching and order management features.

## Features Covered

1. **Menu Data Caching**: Public read access to cached categories/products
2. **Real-time Order Management**: Order creation, updates, and staff dashboard  
3. **Sound Notifications**: Real-time order notifications for staff
4. **Order Statistics**: Daily stats and reporting

## Prerequisites

1. **Firebase CLI installed**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase project setup**:
   - Project ID: `finiziapp` (as configured in `.env.local`)
   - Firebase project should already exist and be configured

3. **Authentication**:
   ```bash
   firebase login
   ```

## Deployment Steps

### 1. Initialize Firebase Project (if needed)

```bash
firebase init firestore
```

- Select "Use an existing project"
- Choose "finiziapp" from the list
- Accept the default firestore.rules file (we've already created it)
- Accept the default firestore.indexes.json file (we've already created it)

### 2. Deploy Firestore Rules

The security rules allow access to cache collections and order management:

```bash
firebase deploy --only firestore:rules
```

### 3. Deploy Firestore Indexes

The indexes optimize queries for real-time order management:

```bash
firebase deploy --only firestore:indexes
```

### 4. Deploy Both (Recommended)

Deploy rules and indexes together:

```bash
firebase deploy --only firestore
```

## Security Rules Summary

The `firestore.rules` file now includes:

### Menu Data Collections
- `foodorder_cache_categories`: Public read access, backend-only write
- `foodorder_cache_products`: Public read access, backend-only write

### Order Management Collections  
- `orders/{orderId}`: Full read/write access for order CRUD operations
- `order_stats/{statsId}`: Full read/write access for staff dashboard statistics
- `config/{configId}`: Read/write access for system configuration

**⚠️ Security Note**: Order collections currently allow unrestricted access for demo purposes. In production, implement proper authentication and user-based access controls.

## Firestore Indexes Summary

New indexes for order management:

1. `orders` by `createdAt` (desc) - Recent orders listing
2. `orders` by `status` + `createdAt` - Filtered order lists  
3. `orders` by `type` + `createdAt` - Table/delivery filtering
4. `orders` by `priority` + `createdAt` - Urgent order handling
5. `orders` by `estimatedCompletionTime` + `status` - Overdue detection

## Verification & Testing

### 1. Menu Data (Existing Feature)

After deployment:
1. Navigate to `http://localhost:3002/en/menu`
2. Check console - No Firestore permission errors
3. Menu loads from Firestore cache

### 2. Order Management (New Feature)

Test the order flow:

1. **Place Order**: Create order in checkout → Should save to Firestore `orders` collection
2. **Staff Dashboard**: Go to `/en/staff` → Should load orders in real-time
3. **Order Updates**: Change order status → Should trigger real-time updates
4. **Sound Notifications**: Should play notification sounds for new orders

### 3. Real-time Features

Monitor in browser console:
- Real-time listeners connect successfully
- Order events trigger sound notifications  
- Status updates sync across browser tabs
- No permission denied errors

### 4. Firebase Console Verification

Check Firebase Console:

1. **Firestore Rules**: Go to Firestore > Rules tab
2. **Firestore Indexes**: Go to Firestore > Indexes tab  
3. **Usage**: Should see read/write operations in Usage tab
4. **Data**: Check `orders` and `order_stats` collections exist

## Collection Structure

### Orders Collection (`orders`)

```typescript
interface FirestoreOrder {
  id: string;                    // Document ID
  orderNumber: string;          // Human-readable order number  
  status: OrderStatus;          // pending | confirmed | preparing | ready | delivering | completed | cancelled
  type: 'table' | 'delivery';   // Order type
  priority: OrderPriority;      // normal | high | urgent
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  estimatedCompletionTime?: Timestamp;
  
  // Customer & Location
  customer: CustomerInfo;
  tableNumber?: string;
  delivery?: DeliveryInfo;
  
  // Order Details  
  items: OrderItem[];
  summary: OrderSummary;
  
  // Payment & Instructions
  paymentMethod: PaymentMethod;
  specialInstructions?: string;
}
```

### Order Stats Collection (`order_stats`)

Daily aggregated statistics:

```typescript
interface DailyOrderStats {
  date: string;              // YYYY-MM-DD
  totalOrders: number;
  totalRevenue: number;
  ordersByType: {
    table: number;
    delivery: number;
  };
  lastUpdated: Timestamp;
}
```

## Troubleshooting

### Permission Denied Errors

If you see "Missing or insufficient permissions":

1. **Verify Deployment**: Check rules deployed correctly in Firebase Console
2. **Check Project ID**: Ensure `.env.local` has correct `NEXT_PUBLIC_FIREBASE_PROJECT_ID=finiziapp`
3. **Clear Cache**: Clear browser cache and restart dev server
4. **Network Issues**: Ensure Firebase endpoints are reachable

### Order Management Issues

If orders aren't saving or updating:

1. **Check Console**: Look for specific Firestore errors
2. **Test Permissions**: Try manual CRUD operations in Firebase Console
3. **Verify Configuration**: Check Firebase config in `src/config/firebase.ts`
4. **Index Errors**: Deploy indexes if seeing "requires an index" errors

### Real-time Listener Issues

If real-time updates aren't working:

1. **WebSocket Connectivity**: Check if WebSockets are blocked
2. **Multiple Tabs**: Test real-time sync across browser tabs
3. **Error Logs**: Monitor console for listener connection errors
4. **Network Tab**: Check WebSocket connections in browser DevTools

## Environment Configuration

Current settings in `.env.local`:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_PROJECT_ID=finiziapp
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC7SpI38rgwxF387baB5IWPRYK8EM54izQ
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=finiziapp.firebaseapp.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=finiziapp.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=600183975778
NEXT_PUBLIC_FIREBASE_APP_ID=1:600183975778:web:7951b83ea2c822f716c63b

# Firestore Settings
NEXT_PUBLIC_USE_FIRESTORE=true
NEXT_PUBLIC_FIRESTORE_FALLBACK_TO_API=false
```

## Commands Reference

```bash
# Deploy everything
firebase deploy

# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Deploy only Firestore indexes
firebase deploy --only firestore:indexes

# Deploy only Firestore (rules + indexes)
firebase deploy --only firestore

# Check deployment status
firebase list

# View current project
firebase projects:list

# View deployed rules
firebase firestore:rules:get
```

## Next Steps After Deployment

1. **Test Order Flow**: Create test orders and verify real-time updates
2. **Test Sound Notifications**: Enable sound controls and test notifications
3. **Monitor Performance**: Check Firestore usage and optimize queries if needed
4. **Production Security**: Implement authentication and proper access controls
5. **Error Monitoring**: Setup error tracking for production deployment