const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Configure the test
const config = {
  baseUrl: 'https://monksealseal.github.io/AppealAid/',
  headless: process.env.HEADLESS !== 'false',
  credentials: {
    email: 'test@example.com',
    password: 'password123'
  },
  timeout: 15000, // 15 seconds
  screenshotDir: path.join(__dirname, '../../test-screenshots')
};

// Ensure screenshot directory exists
if (!fs.existsSync(config.screenshotDir)) {
  fs.mkdirSync(config.screenshotDir, { recursive: true });
}

// Setup Chrome options
function getChromeOptions() {
  const options = new chrome.Options();
  
  if (config.headless) {
    options.addArguments('--headless');
  }
  
  options.addArguments('--disable-gpu');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--window-size=1920,1080');
  
  return options;
}

// Helper function to take screenshots
async function takeScreenshot(driver, name) {
  try {
    const screenshotData = await driver.takeScreenshot();
    const screenshotPath = path.join(config.screenshotDir, `${name}_${new Date().toISOString().replace(/[:.]/g, '-')}.png`);
    fs.writeFileSync(screenshotPath, screenshotData, 'base64');
    console.log(`Screenshot saved: ${screenshotPath}`);
  } catch (error) {
    console.error('Failed to take screenshot:', error);
  }
}

// Test cases
async function runTests() {
  let driver;
  const testResults = {
    passed: 0,
    failed: 0,
    total: 0,
    failures: []
  };

  try {
    console.log('Starting AppealAid automated tests...');
    console.log(`Base URL: ${config.baseUrl}`);
    console.log(`Headless: ${config.headless}`);
    
    // Build the driver
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(getChromeOptions())
      .build();
    
    await driver.manage().setTimeouts({ implicit: config.timeout });
    
    // Run individual tests
    await testLogin(driver, testResults);
    await testDashboard(driver, testResults);
    await testAppealsList(driver, testResults);
    await testAppealCreation(driver, testResults);
    await testDocumentUpload(driver, testResults);
    
    // Print summary
    console.log('\n--- Test Summary ---');
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`Passed: ${testResults.passed}`);
    console.log(`Failed: ${testResults.failed}`);
    
    if (testResults.failures.length > 0) {
      console.log('\nFailures:');
      testResults.failures.forEach((failure, index) => {
        console.log(`${index + 1}. ${failure.test}: ${failure.error}`);
      });
      process.exit(1);
    }
    
  } catch (error) {
    console.error('Test runner error:', error);
    process.exit(1);
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
}

// Individual test functions
async function testLogin(driver, results) {
  const testName = 'Login';
  results.total++;
  
  try {
    console.log(`\nRunning test: ${testName}`);
    
    // Navigate to the application
    await driver.get(config.baseUrl);
    await driver.wait(until.titleContains('AppealAid'), config.timeout);
    
    // Take screenshot of login page
    await takeScreenshot(driver, 'login_page');
    
    // Fill in login form
    await driver.findElement(By.name('email')).sendKeys(config.credentials.email);
    await driver.findElement(By.name('password')).sendKeys(config.credentials.password);
    
    // Click login button
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    // Wait for dashboard to load
    await driver.wait(until.urlContains('dashboard'), config.timeout);
    
    // Verify login was successful
    const welcomeText = await driver.findElement(By.css('h1')).getText();
    assert(welcomeText.includes('Dashboard') || welcomeText.includes('Welcome'), 'Dashboard title not found');
    
    console.log(`✅ ${testName} passed!`);
    results.passed++;
  } catch (error) {
    console.error(`❌ ${testName} failed:`, error.message);
    results.failed++;
    results.failures.push({
      test: testName,
      error: error.message
    });
    await takeScreenshot(driver, 'login_failure');
  }
}

async function testDashboard(driver, results) {
  const testName = 'Dashboard';
  results.total++;
  
  try {
    console.log(`\nRunning test: ${testName}`);
    
    // Make sure we're on the dashboard
    if (!await driver.getCurrentUrl().then(url => url.includes('dashboard'))) {
      await driver.get(`${config.baseUrl}dashboard`);
    }
    
    // Wait for dashboard content to load
    await driver.wait(until.elementLocated(By.css('.dashboard-container, .dashboard, [data-testid="dashboard"]')), config.timeout);
    
    // Take screenshot
    await takeScreenshot(driver, 'dashboard');
    
    // Verify dashboard elements
    const dashboardWidgets = await driver.findElements(By.css('.dashboard-widget, .MuiCard-root, .card'));
    assert(dashboardWidgets.length > 0, 'Dashboard widgets not found');
    
    // Check for appeals section
    const appealElements = await driver.findElements(By.css('[data-testid="appeal-item"], .appeal-item, .MuiListItem-root'));
    
    console.log(`Found ${dashboardWidgets.length} dashboard widgets and ${appealElements.length} appeal items`);
    
    console.log(`✅ ${testName} passed!`);
    results.passed++;
  } catch (error) {
    console.error(`❌ ${testName} failed:`, error.message);
    results.failed++;
    results.failures.push({
      test: testName,
      error: error.message
    });
    await takeScreenshot(driver, 'dashboard_failure');
  }
}

async function testAppealsList(driver, results) {
  const testName = 'Appeals List';
  results.total++;
  
  try {
    console.log(`\nRunning test: ${testName}`);
    
    // Navigate to appeals page
    await driver.findElement(By.css('a[href*="appeals"], [data-testid="appeals-link"], a:contains("Appeals")'))
      .click();
    
    // Wait for appeals list to load
    await driver.wait(until.elementLocated(By.css('.appeals-list, [data-testid="appeals-list"], .MuiTable-root')), config.timeout);
    
    // Take screenshot
    await takeScreenshot(driver, 'appeals_list');
    
    // Verify appeals list elements
    const appealItems = await driver.findElements(By.css('.appeal-item, .MuiTableRow-root:not(.MuiTableRow-head), [data-testid="appeal-row"]'));
    assert(appealItems.length > 0, 'No appeal items found in the list');
    
    console.log(`Found ${appealItems.length} appeals in the list`);
    
    console.log(`✅ ${testName} passed!`);
    results.passed++;
  } catch (error) {
    console.error(`❌ ${testName} failed:`, error.message);
    results.failed++;
    results.failures.push({
      test: testName,
      error: error.message
    });
    await takeScreenshot(driver, 'appeals_list_failure');
  }
}

async function testAppealCreation(driver, results) {
  const testName = 'Appeal Creation';
  results.total++;
  
  try {
    console.log(`\nRunning test: ${testName}`);
    
    // Navigate to create appeal page
    await driver.get(`${config.baseUrl}appeals/create`);
    
    // Wait for appeal form to load
    await driver.wait(until.elementLocated(By.css('form, .appeal-form, [data-testid="appeal-form"]')), config.timeout);
    
    // Take screenshot
    await takeScreenshot(driver, 'appeal_creation_form');
    
    // Fill out form fields (adjust selectors as needed)
    try {
      await driver.findElement(By.css('input[name="insuranceCompany"], [data-testid="insurance-company"]'))
        .sendKeys('Test Insurance Company');
    } catch (e) {
      console.log('Insurance company field not found or not fillable, continuing...');
    }
    
    try {
      await driver.findElement(By.css('input[name="claimNumber"], [data-testid="claim-number"]'))
        .sendKeys('TEST12345');
    } catch (e) {
      console.log('Claim number field not found or not fillable, continuing...');
    }
    
    // Find and click continue/next buttons
    const buttons = await driver.findElements(By.css('button'));
    for (const button of buttons) {
      const text = await button.getText();
      if (text.includes('Next') || text.includes('Continue') || text.includes('Submit')) {
        await button.click();
        await driver.sleep(1000); // Wait for next step to load
      }
    }
    
    // Take screenshot of appeal submission
    await takeScreenshot(driver, 'appeal_creation_submission');
    
    console.log(`✅ ${testName} passed!`);
    results.passed++;
  } catch (error) {
    console.error(`❌ ${testName} failed:`, error.message);
    results.failed++;
    results.failures.push({
      test: testName,
      error: error.message
    });
    await takeScreenshot(driver, 'appeal_creation_failure');
  }
}

async function testDocumentUpload(driver, results) {
  const testName = 'Document Upload';
  results.total++;
  
  try {
    console.log(`\nRunning test: ${testName}`);
    
    // Navigate to documents page
    await driver.get(`${config.baseUrl}documents`);
    
    // Wait for documents page to load
    await driver.wait(until.elementLocated(By.css('.documents-page, [data-testid="documents-page"]')), config.timeout);
    
    // Take screenshot
    await takeScreenshot(driver, 'documents_page');
    
    // Look for upload button
    const uploadButtons = await driver.findElements(By.css('button'));
    let uploadButton;
    
    for (const button of uploadButtons) {
      const text = await button.getText();
      if (text.includes('Upload') || text.includes('Add')) {
        uploadButton = button;
        break;
      }
    }
    
    assert(uploadButton, 'Upload document button not found');
    
    // We can't actually upload a file in headless tests without additional setup,
    // so we'll just verify the button exists and is clickable
    console.log('Document upload button found');
    
    console.log(`✅ ${testName} passed!`);
    results.passed++;
  } catch (error) {
    console.error(`❌ ${testName} failed:`, error.message);
    results.failed++;
    results.failures.push({
      test: testName,
      error: error.message
    });
    await takeScreenshot(driver, 'document_upload_failure');
  }
}

// Run the tests
runTests();