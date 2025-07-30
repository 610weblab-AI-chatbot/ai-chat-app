#!/usr/bin/env node

/**
 * End-to-end connection test script
 * Tests the complete pipeline: Frontend -> Middleware -> AI -> Backend (mock)
 */

const http = require('http');

const API_BASE = 'http://localhost:3001';
const FRONTEND_BASE = 'http://localhost:8080';

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testHealthEndpoint() {
  console.log('Testing middleware health endpoint...');
  try {
    const response = await makeRequest(`${API_BASE}/api/health`);
    if (response.status === 200) {
      console.log('Health endpoint working:', response.data);
      return true;
    } else {
      console.log('Health endpoint failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('Health endpoint error:', error.message);
    return false;
  }
}

async function testChatEndpoint() {
  console.log('Testing chat endpoint...');
  try {
    const testMessage = 'Cancel truck 123';
    const response = await makeRequest(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: testMessage })
    });
    
    if (response.status === 200 && response.data.reply) {
      console.log('Chat endpoint working');
      console.log('Sent:', testMessage);
      console.log('Received:', response.data.reply);
      return true;
    } else {
      console.log('Chat endpoint failed:', response);
      return false;
    }
  } catch (error) {
    console.log('Chat endpoint error:', error.message);
    return false;
  }
}

  async function testFrontendServer() {
    console.log('Testing frontend server...');
  try {
    const response = await makeRequest(FRONTEND_BASE);
    if (response.status === 200) {
      console.log('Frontend server running');
      return true;
    } else {
      console.log('Frontend server failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('Frontend server error:', error.message);
    return false;
  }
}

  async function runTests() {
    console.log('Starting connection tests...\n');
  
  const results = {
    health: await testHealthEndpoint(),
    chat: await testChatEndpoint(),
    frontend: await testFrontendServer()
  };
  
      console.log('\nTest Results:');
  console.log('=================');
  console.log(`Health Endpoint: ${results.health ? 'PASS' : 'FAIL'}`);
  console.log(`Chat Endpoint:   ${results.chat ? 'PASS' : 'FAIL'}`);
  console.log(`Frontend Server: ${results.frontend ? 'PASS' : 'FAIL'}`);
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\nAll tests passed! Your chat system is ready to use.');
    console.log('Open http://localhost:8080 and click the chat button to test the UI.');
      } else {
      console.log('\nSome tests failed. Check the following:');
    
          if (!results.health || !results.chat) {
        console.log('   Middleware issues:');
      console.log('      - Is the middleware running? cd ai-middleware && npm start');
      console.log('      - Check the terminal for error messages');
    }
    
          if (!results.frontend) {
        console.log('   Frontend issues:');
      console.log('      - Is the frontend running? cd cargo-chat-quest && npm run dev');
      console.log('      - Check for build errors in the terminal');
    }
  }
  
      console.log('\nQuick Start Commands:');
  console.log('   Middleware: cd ai-middleware && npm start');
  console.log('   Frontend:   cd cargo-chat-quest && npm run dev');
  console.log('   This test:  node test-connection.js');
}

if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testHealthEndpoint, testChatEndpoint, testFrontendServer }; 