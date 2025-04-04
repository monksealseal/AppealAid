#!/usr/bin/env node
/**
 * Test Runner for End-to-End Tests
 * 
 * Runs all E2E tests and generates a comprehensive report.
 * 
 * Usage:
 * node runTests.js [options]
 * 
 * Options:
 *   --headless       Run tests in headless mode
 *   --test=<pattern> Run tests matching pattern
 *   --browser=<name> Use specified browser (chrome, firefox)
 *   --report-dir=<path> Specify report directory
 */

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  headless: args.includes('--headless'),
  browser: args.find(arg => arg.startsWith('--browser='))?.split('=')[1] || 'chrome',
  testPattern: args.find(arg => arg.startsWith('--test='))?.split('=')[1] || '**/*.test.js',
  reportDir: args.find(arg => arg.startsWith('--report-dir='))?.split('=')[1] || 'reports'
};

// Set environment variables
process.env.TEST_HEADLESS = options.headless ? 'true' : 'false';
process.env.TEST_BROWSER = options.browser;
process.env.NODE_ENV = 'test';

// Create report directory if it doesn't exist
const reportDir = path.join(__dirname, options.reportDir);
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

// Banner
console.log('='.repeat(80));
console.log('AppealAid E2E Test Runner');
console.log('='.repeat(80));
console.log(`Running tests with options:
- Headless: ${options.headless}
- Browser: ${options.browser}
- Test Pattern: ${options.testPattern}
- Report Directory: ${options.reportDir}
`);

// Start the backend server in test mode (if not already running)
console.log('Starting backend server in test mode...');
const serverProcess = spawnSync('cross-env', [
  'NODE_ENV=test',
  'MOCK_MONGO=true',
  'PORT=5000',
  'node',
  path.join(__dirname, '../../server.js')
], {
  stdio: 'inherit',
  detached: true,
  shell: true
});

// Wait for server to start
console.log('Waiting for server to start...');
setTimeout(() => {
  // Run the tests
  console.log('Running E2E tests...');
  const testProcess = spawnSync('npx', [
    'mocha',
    '--recursive',
    `tests/e2e/${options.testPattern}`,
    '--timeout',
    '60000',
    '--reporter',
    'mochawesome',
    '--reporter-options',
    `reportDir=${reportDir},reportFilename=e2e-test-report,overwrite=true`
  ], {
    stdio: 'inherit',
    shell: true
  });

  // Show test results summary
  if (testProcess.status === 0) {
    console.log('\n✅ All tests passed!');
  } else {
    console.log(`\n❌ Tests failed with exit code ${testProcess.status}`);
  }

  console.log(`\nTest report generated at ${path.join(reportDir, 'e2e-test-report.html')}`);
  
  // Kill the server process
  console.log('Shutting down test server...');
  process.exit(testProcess.status);
}, 3000);