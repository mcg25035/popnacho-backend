const assert = require('assert');

const baseUrl = 'http://localhost:3000'; // Base URL of the API

async function registerUser(username, password) {
  const fetch = (await import('node-fetch')).default;
  const url = `${baseUrl}/auth/register`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  return response;
}

async function loginUser(username, password) {
  const fetch = (await import('node-fetch')).default;
  const url = `${baseUrl}/auth/login`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  return response;
}

async function getLeaderboard() {
  const fetch = (await import('node-fetch')).default;
  const url = `${baseUrl}/leaderboard`;
  const response = await fetch(url);
  return response;
}

async function runTests() {
  console.log('Starting functional tests...');

  // Register User Test
  try {
    const registerResponse = await registerUser('testuser', 'testpassword');
    assert.strictEqual(registerResponse.status, 201, 'Register user status should be 201');
    const registerBody = await registerResponse.json();
    assert.deepStrictEqual(registerBody, { message: 'User registered successfully' }, 'Register user response body should match');
    console.log('Register user test passed');
  } catch (error) {
    console.error('Register user test failed:', error);
  }

  // Login User Test
  try {
    const loginResponse = await loginUser('testuser', 'testpassword');
    assert.strictEqual(loginResponse.status, 200, 'Login user status should be 200');
    console.log('Login user test passed');
  } catch (error) {
    console.error('Login user test failed:', error);
  }

  // Get Leaderboard Test
  try {
    const leaderboardResponse = await getLeaderboard();
    assert.strictEqual(leaderboardResponse.status, 200, 'Get leaderboard status should be 200');
    console.log('Get leaderboard test passed');
  } catch (error) {
    console.error('Get leaderboard test failed:', error);
  }

  console.log('Functional tests completed.');
}

runTests();
