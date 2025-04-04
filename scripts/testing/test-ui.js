/**
 * Simple UI test script for AppealAid
 * This script opens the browser to run the app without headless mode
 * so you can manually verify the UI looks correct
 */

const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function testUI() {
  // Set base URL for GitHub Pages
  const baseUrl = 'https://monksealseal.github.io/AppealAid/';
  
  console.log('Starting AppealAid UI test...');
  console.log(`Opening: ${baseUrl}`);
  
  // Configure Chrome options
  const options = new chrome.Options();
  options.addArguments('--start-maximized'); // Start with maximized browser
  options.addArguments('--disable-infobars');
  options.addArguments('--disable-extensions');
  
  try {
    // Create the browser
    const driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
    
    // Navigate to the site
    await driver.get(baseUrl);
    
    console.log('\nBrowser opened successfully. Please manually test the application.');
    console.log('When finished testing, close the browser window or press Ctrl+C in this console.\n');
    
    // Keep the browser open until manually closed
    await new Promise(resolve => {
      // Listen for process termination
      process.on('SIGINT', async () => {
        console.log('\nClosing browser and exiting...');
        await driver.quit();
        resolve();
      });
    });
    
  } catch (error) {
    console.error('Error running UI test:', error);
    process.exit(1);
  }
}

// Run the UI test
testUI();