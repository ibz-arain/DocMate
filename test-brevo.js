const SibApiV3Sdk = require('@getbrevo/brevo');

// Load environment variables
require('dotenv').config();

async function testBrevoConnection() {
  console.log('Testing Brevo API connection...');
  
  // Check environment variables
  console.log('BREVO_API_KEY exists:', !!process.env.BREVO_API_KEY);
  console.log('BREVO_FROM_EMAIL exists:', !!process.env.BREVO_FROM_EMAIL);
  
  if (!process.env.BREVO_API_KEY) {
    console.error('❌ BREVO_API_KEY is not set in environment variables');
    return;
  }
  
  if (!process.env.BREVO_FROM_EMAIL) {
    console.error('❌ BREVO_FROM_EMAIL is not set in environment variables');
    return;
  }
  
  // Test with AccountApi (simpler endpoint)
  const accountApi = new SibApiV3Sdk.AccountApi();
  
  try {
    // Try new authentication method
    accountApi.authentications.apiKey.apiKey = process.env.BREVO_API_KEY;
    console.log('✅ Authentication method set successfully');
    
    // Test API call
    const result = await accountApi.getAccount();
    console.log('✅ API connection successful!');
    console.log('Account details:', {
      email: result.body.email,
      companyName: result.body.companyName,
      firstName: result.body.firstName,
      lastName: result.body.lastName
    });
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testBrevoConnection(); 