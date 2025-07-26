// Test script to make authenticated API call to dashboard
const axios = require('axios');

async function testDashboardAPI() {
  try {
    // First, let's try to login
    const loginResponse = await axios.post('http://localhost:8000/api/v1/auth/login', {
      email: 'shani@gmail.com',  // Using one of the users from the database
      password: 'password123'    // You'll need to use the correct password
    });
    
    console.log('Login successful:', loginResponse.data);
    
    const token = loginResponse.data.token;
    
    // Now make dashboard API call
    const dashboardResponse = await axios.get('http://localhost:8000/api/v1/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Dashboard data:', dashboardResponse.data);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testDashboardAPI();
