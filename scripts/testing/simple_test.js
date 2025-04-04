// Simple web test that doesn't require Selenium
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

// Test configuration
const config = {
  baseUrl: 'https://monksealseal.github.io/AppealAid/',
  paths: [
    '', // Home page
    'login',
    'register',
    'dashboard',
    'appeals',
    'appeals/create',
    'documents',
    'profile'
  ],
  outputDir: path.join(__dirname, '../../test-results'),
  timeoutMs: 10000
};

// Create output directory
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

// Fetch a URL and save the HTML
async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        // Handle redirects
        return resolve({
          status: res.statusCode,
          redirect: res.headers.location,
          body: null
        });
      }
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          redirect: null,
          body: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(config.timeoutMs, () => {
      req.destroy();
      reject(new Error(`Request timeout after ${config.timeoutMs}ms`));
    });
  });
}

// Save HTML content to a file
function saveHtml(pageName, html) {
  const sanitizedName = pageName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const filePath = path.join(config.outputDir, `${sanitizedName}.html`);
  fs.writeFileSync(filePath, html);
  return filePath;
}

// Check if HTML contains expected elements
function checkHtml(html, pageName) {
  const results = {
    title: html.includes('<title>') && html.includes('</title>'),
    reactRoot: html.includes('<div id="root">'),
    appName: html.includes('AppealAid'),
    mainJs: html.includes('main.') && html.includes('.js'),
    mainCss: html.includes('main.') && html.includes('.css'),
  };
  
  const success = Object.values(results).every(v => v);
  
  return {
    pageName,
    success,
    details: results
  };
}

// Run the tests
async function runTests() {
  console.log('Starting simple web tests...');
  console.log(`Base URL: ${config.baseUrl}`);
  console.log(`Testing ${config.paths.length} paths`);
  console.log('-'.repeat(50));
  
  const results = {
    passed: 0,
    failed: 0,
    total: config.paths.length,
    details: []
  };
  
  for (const path of config.paths) {
    const url = config.baseUrl + path;
    const pageName = path || 'home';
    
    try {
      console.log(`Testing: ${pageName}`);
      const response = await fetchUrl(url);
      
      if (response.status >= 200 && response.status < 300 && response.body) {
        const savedPath = saveHtml(pageName, response.body);
        const checkResult = checkHtml(response.body, pageName);
        
        if (checkResult.success) {
          console.log(`✅ ${pageName}: Success`);
          results.passed++;
        } else {
          console.log(`❌ ${pageName}: Failed checks`);
          console.log('  Details:', JSON.stringify(checkResult.details));
          results.failed++;
        }
        
        results.details.push({
          path: pageName,
          url,
          status: response.status,
          savedTo: savedPath,
          ...checkResult
        });
      } else if (response.redirect) {
        console.log(`ℹ️ ${pageName}: Redirected to ${response.redirect}`);
        results.details.push({
          path: pageName,
          url,
          status: response.status,
          redirect: response.redirect
        });
        results.passed++; // Count redirects as success
      } else {
        console.log(`❌ ${pageName}: Failed with status ${response.status}`);
        results.failed++;
        results.details.push({
          path: pageName,
          url,
          status: response.status,
          error: `HTTP ${response.status}`
        });
      }
    } catch (error) {
      console.error(`❌ ${pageName}: Error - ${error.message}`);
      results.failed++;
      results.details.push({
        path: pageName,
        url,
        error: error.message
      });
    }
    
    console.log('-'.repeat(50));
  }
  
  // Write results to JSON file
  const resultsPath = path.join(config.outputDir, 'test_results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  
  // Print summary
  console.log('\n--- Test Summary ---');
  console.log(`Total: ${results.total}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Results saved to: ${resultsPath}`);
  
  return results;
}

// Execute tests
runTests()
  .then(results => {
    if (results.failed > 0) {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Test execution error:', error);
    process.exit(1);
  });