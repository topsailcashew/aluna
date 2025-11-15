#!/usr/bin/env node

/**
 * Quick test script to verify Google AI API key is working
 * Run with: node test-ai-connection.js
 */

require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  console.log('🔍 Testing Google AI API Connection...\n');

  // Check if API key is configured
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;

  if (!apiKey) {
    console.error('❌ Error: GOOGLE_GENAI_API_KEY not found in .env.local');
    console.log('\nPlease add your API key to .env.local:');
    console.log('GOOGLE_GENAI_API_KEY=your_api_key_here\n');
    process.exit(1);
  }

  console.log('✅ API key found in environment');
  console.log(`   Key starts with: ${apiKey.substring(0, 10)}...\n`);

  // Test the API with a simple request
  console.log('🚀 Testing API call to Gemini 2.0 Flash...\n');

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=' + apiKey,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Say "Hello! The AI connection is working!" in a friendly way.'
            }]
          }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ API Error:', data.error?.message || 'Unknown error');
      console.log('\nStatus:', response.status);
      console.log('Details:', JSON.stringify(data, null, 2));
      process.exit(1);
    }

    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    console.log('✅ SUCCESS! Google AI API is working!\n');
    console.log('📝 AI Response:');
    console.log('   ' + aiResponse + '\n');
    console.log('🎉 Your AI features are ready to use!\n');
    console.log('Next steps:');
    console.log('   1. Start the dev server: npm run dev');
    console.log('   2. Visit http://localhost:9002/dashboard');
    console.log('   3. Check in a few times to generate AI insights\n');

  } catch (error) {
    console.error('❌ Connection Error:', error.message);
    console.log('\nPlease check:');
    console.log('   1. Your internet connection');
    console.log('   2. Your API key is valid');
    console.log('   3. You have quota remaining on your API key\n');
    process.exit(1);
  }
}

testConnection();
