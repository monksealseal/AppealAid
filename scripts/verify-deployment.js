/**
 * AppealAid Deployment Verification Script
 * 
 * This script checks if the deployed backend and frontend are working correctly.
 * 
 * Usage:
 * node verify-deployment.js <backend-url> <frontend-url>
 * 
 * Example:
 * node verify-deployment.js https://appealaid-api.herokuapp.com https://appealaid.netlify.app
 */

const axios = require('axios');
const chalk = require('chalk');  // You may need to install this package

// Get URLs from command line arguments
const backendUrl = process.argv[2] || 'http://localhost:5000';
const frontendUrl = process.argv[3] || 'http://localhost:3000';

console.log(chalk.blue('AppealAid Deployment Verification'));
console.log(chalk.blue('=================================='));
console.log(`Backend URL: ${backendUrl}`);
console.log(`Frontend URL: ${frontendUrl}`);
console.log('');

async function verifyDeployment() {
  let succeeded = 0;
  let failed = 0;
  
  // Check Backend API
  try {
    console.log(chalk.yellow('Checking Backend API...'));
    const response = await axios.get(`${backendUrl}/health`);
    
    if (response.status === 200 && response.data.status === 'OK') {
      console.log(chalk.green('✓ Backend API is running'));
      console.log(`  - Environment: ${response.data.environment}`);
      console.log(`  - Uptime: ${response.data.uptime} seconds`);
      succeeded++;
    } else {
      console.log(chalk.red('✗ Backend API check failed'));
      console.log(`  - Status: ${response.status}`);
      console.log(`  - Data: ${JSON.stringify(response.data)}`);
      failed++;
    }
  } catch (error) {
    console.log(chalk.red('✗ Backend API check failed'));
    console.log(`  - Error: ${error.message}`);
    failed++;
  }
  
  // Check Frontend
  try {
    console.log(chalk.yellow('\nChecking Frontend...'));
    const response = await axios.get(frontendUrl);
    
    if (response.status === 200) {
      console.log(chalk.green('✓ Frontend is accessible'));
      succeeded++;
    } else {
      console.log(chalk.red('✗ Frontend check failed'));
      console.log(`  - Status: ${response.status}`);
      failed++;
    }
  } catch (error) {
    console.log(chalk.red('✗ Frontend check failed'));
    console.log(`  - Error: ${error.message}`);
    failed++;
  }
  
  // Check API Endpoints
  try {
    console.log(chalk.yellow('\nChecking API Endpoints...'));
    
    // Check register endpoint
    const registerResponse = await axios.options(`${backendUrl}/api/users`);
    if (registerResponse.status === 204 || registerResponse.status === 200) {
      console.log(chalk.green('✓ Registration endpoint is accessible'));
      succeeded++;
    } else {
      console.log(chalk.red('✗ Registration endpoint check failed'));
      failed++;
    }
    
    // Check login endpoint
    const loginResponse = await axios.options(`${backendUrl}/api/users/login`);
    if (loginResponse.status === 204 || loginResponse.status === 200) {
      console.log(chalk.green('✓ Login endpoint is accessible'));
      succeeded++;
    } else {
      console.log(chalk.red('✗ Login endpoint check failed'));
      failed++;
    }
  } catch (error) {
    console.log(chalk.red('✗ API Endpoints check failed'));
    console.log(`  - Error: ${error.message}`);
    failed++;
  }
  
  // Summary
  console.log(chalk.blue('\nVerification Summary'));
  console.log(chalk.blue('===================='));
  console.log(`Tests Passed: ${chalk.green(succeeded)}`);
  console.log(`Tests Failed: ${chalk.red(failed)}`);
  
  if (failed === 0) {
    console.log(chalk.green('\n✓ Deployment verification successful!'));
    console.log(chalk.green('Your AppealAid application is up and running.'));
  } else {
    console.log(chalk.red('\n✗ Deployment verification completed with issues.'));
    console.log(chalk.yellow('Please check the failed tests and fix the issues.'));
  }
}

verifyDeployment().catch(error => {
  console.error('Verification script error:', error);
  process.exit(1);
});