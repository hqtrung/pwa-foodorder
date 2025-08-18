// Test script to create a simple order without complex queries
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyC7SpI38rgwxF387baB5IWPRYK8EM54izQ",
  authDomain: "finiziapp.firebaseapp.com",
  projectId: "finiziapp",
  storageBucket: "finiziapp.firebasestorage.app",
  messagingSenderId: "600183975778",
  appId: "1:600183975778:web:7951b83ea2c822f716c63b"
};

async function testSimpleOrder() {
  console.log('🧪 Testing simple order creation...\n');
  
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✅ Firebase initialized successfully');
    
    // Create a simple test order
    const ordersRef = collection(db, 'foodorder_orders');
    const now = Timestamp.now();
    
    const testOrder = {
      orderNumber: 'TEST001',
      status: 'pending',
      type: 'table',
      priority: 'normal',
      
      // Timestamps
      createdAt: now,
      updatedAt: now,
      estimatedCompletionTime: Timestamp.fromMillis(now.toMillis() + (30 * 60 * 1000)),
      
      // Customer info (cleaned)
      customer: {
        name: 'Test Customer'
      },
      
      tableNumber: '5',
      
      // Order details
      items: [{
        id: 'test-item-1',
        productId: 1234,
        name: 'Test Phở',
        quantity: 1,
        unitPrice: 50000,
        totalPrice: 50000,
        category: 'Phở',
        toppings: []
      }],
      
      summary: {
        subtotal: 50000,
        deliveryFee: 0,
        total: 50000,
        itemCount: 1
      },
      
      paymentMethod: 'cash',
      source: 'web',
      version: 1
    };
    
    console.log('📄 Creating test order...');
    const docRef = await addDoc(ordersRef, testOrder);
    console.log(`✅ Test order created successfully with ID: ${docRef.id}`);
    
    console.log('\n🎉 Order creation test passed! The permission issue is resolved.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code) {
      console.error('Error code:', error.code);
    }
    
    if (error.message.includes('permission')) {
      console.log('\n💡 This indicates the Firestore rules are still not properly deployed.');
    }
  }
}

testSimpleOrder().then(() => {
  console.log('\n✨ Test complete');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test script failed:', error);
  process.exit(1);
});