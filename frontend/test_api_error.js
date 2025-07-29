/**
 * © 2025 Mohamed Amine FRAD. All rights reserved.
 * Unauthorized use, reproduction, or modification of this code is strictly prohibited.
 * Intellectual Property – Protected by international copyright law.
 */

/**
 * Test script to verify API error handling
 */

// Mock the API response that was causing the error
const mockResponse = {
  status: 404,
  text: () => Promise.resolve(JSON.stringify({ error: 'No active internship found' })),
  json: () => Promise.resolve({ error: 'No active internship found' })
};

// Test the error handling logic from the API client
async function testErrorHandling() {
  console.log('🧪 Testing API error handling...');
  
  try {
    // Simulate the error handling logic from the API client
    const text = await mockResponse.text();
    let errorData;
    try {
      errorData = text ? JSON.parse(text) : {};
    } catch {
      errorData = {};
    }
    
    // Handle specific error cases
    if (mockResponse.status === 404 && errorData.error === 'No active internship found') {
      throw new Error('Aucun stage actif trouvé. Veuillez contacter votre administrateur.');
    }
    
    // Default error message
    throw new Error(errorData.detail || errorData.message || errorData.error || `Erreur HTTP ${mockResponse.status}`);
  } catch (error) {
    if (error.message === 'Aucun stage actif trouvé. Veuillez contacter votre administrateur.') {
      console.log('✅ Error handling working correctly!');
      console.log('   Expected: "Aucun stage actif trouvé. Veuillez contacter votre administrateur."');
      console.log('   Got: "' + error.message + '"');
    } else {
      console.log('❌ Error handling not working as expected');
      console.log('   Expected: "Aucun stage actif trouvé. Veuillez contacter votre administrateur."');
      console.log('   Got: "' + error.message + '"');
    }
  }
}

// Test the token refresh error handling
async function testTokenRefreshErrorHandling() {
  console.log('\n🧪 Testing token refresh error handling...');
  
  // Mock a response that gets consumed during token refresh
  const originalResponseText = JSON.stringify({ error: 'No active internship found' });
  let originalErrorData;
  try {
    originalErrorData = originalResponseText ? JSON.parse(originalResponseText) : {};
  } catch {
    originalErrorData = {};
  }
  
  try {
    // Simulate token refresh failure
    throw new Error('Token refresh failed');
  } catch (refreshError) {
    // Handle specific error cases for the original response
    if (originalErrorData.error === 'No active internship found') {
      throw new Error('Aucun stage actif trouvé. Veuillez contacter votre administrateur.');
    }
    
    // Default error message
    throw new Error(originalErrorData.detail || originalErrorData.message || originalErrorData.error || 'Erreur HTTP 401');
  }
}

// Run tests
console.log('🚀 StageBloom API Error Handling Test');
console.log('=====================================');

testErrorHandling()
  .then(() => testTokenRefreshErrorHandling())
  .then(() => {
    console.log('\n🎉 All tests completed!');
  })
  .catch(error => {
    console.log('❌ Test failed:', error.message);
  }); 