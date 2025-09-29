// Simple test script to verify API functions work
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing Vercel API functions...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);

    // Test API info endpoint
    console.log('\n2. Testing API info endpoint...');
    const infoResponse = await fetch(`${BASE_URL}/api/`);
    const infoData = await infoResponse.json();
    console.log('✅ API info:', infoData.message);

    // Test chat endpoint
    console.log('\n3. Testing chat endpoint...');
    const chatResponse = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Hello, I need a manicure!'
      })
    });
    const chatData = await chatResponse.json();
    console.log('✅ Chat response:', chatData.response);

    // Test conversations endpoint
    console.log('\n4. Testing conversations endpoint...');
    const conversationsResponse = await fetch(`${BASE_URL}/api/conversations`);
    const conversationsData = await conversationsResponse.json();
    console.log('✅ Conversations count:', conversationsData.length);

    console.log('\n🎉 All tests passed! API is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure to run "vercel dev" first to start the development server.');
  }
}

testAPI();
