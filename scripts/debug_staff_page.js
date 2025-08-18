// Debug script to verify staff page Firestore connectivity
const { initializeApp } = require('firebase/app');
const { getFirestore, connectFirestoreEmulator, collection, getDocs, query, orderBy, where } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyC7SpI38rgwxF387baB5IWPRYK8EM54izQ",
  authDomain: "finiziapp.firebaseapp.com",
  projectId: "finiziapp",
  storageBucket: "finiziapp.firebasestorage.app",
  messagingSenderId: "600183975778",
  appId: "1:600183975778:web:7951b83ea2c822f716c63b"
};

async function debugFirestore() {
  console.log('🔧 Debugging Firestore connectivity for staff page...\n');
  
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✅ Firebase initialized successfully');
    
    // Test basic connection
    const ordersRef = collection(db, 'foodorder_orders');
    console.log('✅ Orders collection reference created');
    
    // Test simple query (should work with single-field index)
    console.log('📋 Testing basic query...');
    const simpleQuery = query(ordersRef, orderBy('createdAt', 'desc'));
    const simpleSnapshot = await getDocs(simpleQuery);
    console.log(`✅ Basic query successful: ${simpleSnapshot.size} orders found`);
    
    // Test status filter query (requires composite index)
    console.log('📋 Testing status filter query...');
    const statusQuery = query(
      ordersRef, 
      where('status', 'in', ['pending', 'confirmed', 'preparing']),
      orderBy('createdAt', 'desc')
    );
    const statusSnapshot = await getDocs(statusQuery);
    console.log(`✅ Status filter query successful: ${statusSnapshot.size} orders found`);
    
    // Display some order details
    if (statusSnapshot.size > 0) {
      console.log('\n📄 Sample orders:');
      statusSnapshot.forEach((doc, index) => {
        if (index < 3) { // Show first 3 orders
          const data = doc.data();
          console.log(`  - Order ${doc.id}: ${data.status} (${data.orderNumber || 'N/A'})`);
        }
      });
    }
    
    console.log('\n🎉 All Firestore tests passed! Staff page should work correctly.');
    
  } catch (error) {
    console.error('❌ Firestore error:', error.message);
    
    if (error.code) {
      console.error('Error code:', error.code);
    }
    
    if (error.message.includes('index')) {
      console.log('\n💡 Tip: This looks like a missing index error.');
      console.log('   Check Firebase Console > Firestore > Indexes');
      console.log('   The required indexes should be building or built already.');
    }
    
    if (error.message.includes('permission')) {
      console.log('\n💡 Tip: This looks like a permission error.');
      console.log('   Check Firebase Console > Firestore > Rules');
    }
  }
}

debugFirestore().then(() => {
  console.log('\n✨ Debug complete');
  process.exit(0);
}).catch(error => {
  console.error('💥 Debug script failed:', error);
  process.exit(1);
});