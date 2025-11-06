/**
 * Permission System Test Script
 * Run with: node test-permissions.js
 *
 * Tests all user roles and their permissions
 */

const baseUrl = 'http://localhost:3000/api/v1';

// Test users
const testUsers = [
  {
    name: 'Admin',
    email: 'admin@example.com',
    password: 'admin123',
    expectedPermissions: {
      readProduct: true,
      createProduct: true,
      updateProduct: true,
      deleteProduct: true,
      accessCart: true,
      createOrder: true,
    },
  },
  {
    name: 'Customer',
    email: 'customer@example.com',
    password: 'password123',
    expectedPermissions: {
      readProduct: true,
      createProduct: false,
      updateProduct: false,
      deleteProduct: false,
      accessCart: true,
      createOrder: true,
    },
  },
  {
    name: 'Product Manager',
    email: 'productmanager@example.com',
    password: 'products123',
    expectedPermissions: {
      readProduct: true,
      createProduct: true,
      updateProduct: true,
      deleteProduct: true,
      accessCart: false,
      createOrder: false,
    },
  },
  {
    name: 'Order Manager',
    email: 'ordermanager@example.com',
    password: 'orders123',
    expectedPermissions: {
      readProduct: true,
      createProduct: false,
      updateProduct: false,
      deleteProduct: false,
      accessCart: false,
      createOrder: false,
    },
  },
  {
    name: 'Guest',
    email: 'guest@example.com',
    password: 'guest123',
    expectedPermissions: {
      readProduct: true,
      createProduct: false,
      updateProduct: false,
      deleteProduct: false,
      accessCart: false,
      createOrder: false,
    },
  },
];

// Login helper
async function login(email, password) {
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  return data.success ? data.data.token : null;
}

// Test helpers
async function testEndpoint(method, path, token, body = null) {
  const options = {
    method,
    headers: {},
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${baseUrl}${path}`, options);
  return {
    status: response.status,
    success: response.status >= 200 && response.status < 300,
    forbidden: response.status === 403,
  };
}

// Test user permissions
async function testUser(user) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing: ${user.name} (${user.email})`);
  console.log('='.repeat(60));

  // Login
  const token = await login(user.email, user.password);
  if (!token) {
    console.log('❌ Login failed');
    return;
  }
  console.log('✅ Login successful');

  let passed = 0;
  let failed = 0;

  // Test read product (public - no token needed)
  console.log('\n📖 Testing product read (public)...');
  const readResult = await testEndpoint('GET', '/products', null);
  if (readResult.success === user.expectedPermissions.readProduct) {
    console.log('  ✅ Read products: Expected result');
    passed++;
  } else {
    console.log('  ❌ Read products: Unexpected result');
    failed++;
  }

  // Test create product
  console.log('\n➕ Testing product creation...');
  const createResult = await testEndpoint('POST', '/products', token, {
    name: 'Test Product',
    price: 99.99,
  });
  if (createResult.success === user.expectedPermissions.createProduct) {
    console.log(
      `  ${createResult.success ? '✅' : '🔒'} Create product: Expected result`
    );
    passed++;
  } else {
    console.log('  ❌ Create product: Unexpected result');
    failed++;
  }

  // Test update product
  console.log('\n✏️  Testing product update...');
  const updateResult = await testEndpoint('PUT', '/products/test-123', token, {
    name: 'Updated Product',
  });
  if (updateResult.success === user.expectedPermissions.updateProduct) {
    console.log(
      `  ${updateResult.success ? '✅' : '🔒'} Update product: Expected result`
    );
    passed++;
  } else {
    console.log('  ❌ Update product: Unexpected result');
    failed++;
  }

  // Test delete product
  console.log('\n🗑️  Testing product deletion...');
  const deleteResult = await testEndpoint(
    'DELETE',
    '/products/test-123',
    token
  );
  if (deleteResult.success === user.expectedPermissions.deleteProduct) {
    console.log(
      `  ${deleteResult.success ? '✅' : '🔒'} Delete product: Expected result`
    );
    passed++;
  } else {
    console.log('  ❌ Delete product: Unexpected result');
    failed++;
  }

  // Test cart access
  console.log('\n🛒 Testing cart access...');
  const cartResult = await testEndpoint('GET', '/cart', token);
  if (cartResult.success === user.expectedPermissions.accessCart) {
    console.log(
      `  ${cartResult.success ? '✅' : '🔒'} Access cart: Expected result`
    );
    passed++;
  } else {
    console.log('  ❌ Access cart: Unexpected result');
    failed++;
  }

  console.log(
    `\n📊 Results for ${user.name}: ${passed} passed, ${failed} failed`
  );
  return { passed, failed };
}

// Run all tests
async function runAllTests() {
  console.log('='.repeat(60));
  console.log('🧪 Permission System Tests');
  console.log('='.repeat(60));

  try {
    // Check if server is running
    const healthCheck = await fetch(`${baseUrl}/health`);
    if (!healthCheck.ok) {
      throw new Error('Server is not running');
    }
    console.log('✅ Server is running\n');

    let totalPassed = 0;
    let totalFailed = 0;

    // Test each user
    for (const user of testUsers) {
      const result = await testUser(user);
      totalPassed += result.passed;
      totalFailed += result.failed;
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📈 OVERALL RESULTS');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${totalPassed + totalFailed}`);
    console.log(`✅ Passed: ${totalPassed}`);
    console.log(`❌ Failed: ${totalFailed}`);
    console.log('='.repeat(60));

    if (totalFailed === 0) {
      console.log(
        '\n🎉 All tests passed! Permission system is working correctly.\n'
      );
    } else {
      console.log(
        '\n⚠️  Some tests failed. Please review the permission system.\n'
      );
    }
  } catch (error) {
    console.error('\n❌ Error running tests:', error.message);
    console.log('\n💡 Make sure the server is running: yarn start:dev\n');
  }
}

// Run tests
runAllTests();
