/**
 * Simple JWT Test Script
 * Run this with: node test-jwt.js
 *
 * This demonstrates how to:
 * 1. Login to get a JWT token
 * 2. Use the token to access protected endpoints
 */

const baseUrl = 'http://localhost:3000/api/v1';

// Test 1: Login
async function testLogin() {
  console.log('🔐 Test 1: Login and get JWT token\n');

  const response = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'customer@example.com',
      password: 'password123',
    }),
  });

  const data = await response.json();

  if (data.success) {
    console.log('✅ Login successful!');
    console.log('📧 User:', data.data.user.email);
    console.log('👤 Roles:', data.data.user.roles.join(', '));
    console.log('🎟️  Token:', data.data.token.substring(0, 50) + '...\n');
    return data.data.token;
  } else {
    console.log('❌ Login failed:', data.error);
    return null;
  }
}

// Test 2: Access protected endpoint with token
async function testProtectedEndpoint(token) {
  console.log('🔒 Test 2: Access protected endpoint (Get Current User)\n');

  const response = await fetch(`${baseUrl}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (data.success) {
    console.log('✅ Successfully accessed protected endpoint!');
    console.log('📧 Email:', data.data.user.email);
    console.log('🆔 ID:', data.data.user.id);
    console.log('👤 Roles:', data.data.user.roles.join(', '));
    console.log('');
  } else {
    console.log('❌ Failed to access protected endpoint:', data.error);
  }
}

// Test 3: Try accessing without token
async function testWithoutToken() {
  console.log('🚫 Test 3: Try accessing without token\n');

  const response = await fetch(`${baseUrl}/auth/me`);
  const data = await response.json();

  console.log('❌ Expected failure:', data.error.message);
  console.log('');
}

// Test 4: Try accessing with invalid token
async function testWithInvalidToken() {
  console.log('🚫 Test 4: Try accessing with invalid token\n');

  const response = await fetch(`${baseUrl}/auth/me`, {
    headers: {
      Authorization: 'Bearer invalid-token-here',
    },
  });

  const data = await response.json();
  console.log('❌ Expected failure:', data.error.message);
  console.log('');
}

// Test 5: Try accessing cart with token
async function testCartEndpoint(token) {
  console.log('🛒 Test 5: Access cart endpoint with token\n');

  const response = await fetch(`${baseUrl}/cart`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (data.success) {
    console.log('✅ Successfully accessed cart!');
    console.log('📦 Cart items:', data.data.items.length);
    console.log('');
  } else {
    console.log('❌ Failed to access cart:', data.error);
  }
}

// Run all tests
async function runTests() {
  console.log('='.repeat(60));
  console.log('🧪 JWT Authentication Tests');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Make sure server is running
    const healthCheck = await fetch(`${baseUrl}/health`);
    if (!healthCheck.ok) {
      throw new Error('Server is not running. Start it with: yarn start:dev');
    }

    // Run tests
    const token = await testLogin();

    if (token) {
      await testProtectedEndpoint(token);
      await testCartEndpoint(token);
    }

    await testWithoutToken();
    await testWithInvalidToken();

    console.log('='.repeat(60));
    console.log('✅ All tests completed!');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('\n❌ Error running tests:', error.message);
    console.log('\n💡 Make sure the server is running: yarn start:dev\n');
  }
}

// Run the tests
runTests();
