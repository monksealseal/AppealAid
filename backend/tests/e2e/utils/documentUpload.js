/**
 * Document Upload Helper
 */
const fs = require('fs');
const path = require('path');
const { By, until } = require('selenium-webdriver');
const config = require('../config');

/**
 * Upload a document through the UI
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {string} filePath - Path to the document file
 * @param {string} documentType - Type of document
 * @returns {Promise<string>} Document ID
 */
const uploadDocumentUi = async (driver, filePath, documentType) => {
  // Navigate to upload page
  await driver.get(`${config.baseUrl}/documents/upload`);
  
  // Wait for upload form to be ready
  await driver.wait(until.elementLocated(By.id('document-upload-form')), config.explicitTimeout);
  
  // Find the file input and upload the file
  const fileInput = await driver.findElement(By.css('input[type="file"]'));
  await fileInput.sendKeys(filePath);
  
  // Select document type
  const typeSelect = await driver.findElement(By.id('document-type'));
  await typeSelect.click();
  
  // Wait for the dropdown options to be visible
  await driver.wait(until.elementLocated(By.css(`.document-type-option[value="${documentType}"]`)), config.explicitTimeout);
  
  // Select the document type
  const option = await driver.findElement(By.css(`.document-type-option[value="${documentType}"]`));
  await option.click();
  
  // Submit the form
  const submitButton = await driver.findElement(By.css('button[type="submit"]'));
  await submitButton.click();
  
  // Wait for upload to complete
  await driver.wait(until.elementLocated(By.css('.upload-success')), config.explicitTimeout);
  
  // Get the document ID from the success message or URL
  const currentUrl = await driver.getCurrentUrl();
  const documentId = currentUrl.split('/').pop();
  
  return documentId;
};

/**
 * Check if a document appears to be a response via UI
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {string} documentId - Document ID
 * @returns {Promise<boolean>} True if document appears to be a response
 */
const checkDocumentIsResponseUi = async (driver, documentId) => {
  // Navigate to document detail page
  await driver.get(`${config.baseUrl}/documents/${documentId}`);
  
  // Wait for document details to load
  await driver.wait(until.elementLocated(By.css('.document-details')), config.explicitTimeout);
  
  // Check if the response badge is visible
  try {
    await driver.wait(until.elementLocated(By.css('.response-badge')), 5000);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Process a response document via UI
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {string} documentId - Document ID
 * @returns {Promise<string>} Appeal ID
 */
const processResponseDocumentUi = async (driver, documentId) => {
  // Navigate to document detail page
  await driver.get(`${config.baseUrl}/documents/${documentId}`);
  
  // Wait for document details to load
  await driver.wait(until.elementLocated(By.css('.document-details')), config.explicitTimeout);
  
  // Click the "Process Response" button
  const processButton = await driver.findElement(By.id('process-response-button'));
  await processButton.click();
  
  // Wait for processing to complete
  await driver.wait(until.elementLocated(By.css('.processing-success')), config.explicitTimeout);
  
  // Get the appeal ID from the success message or URL
  const appealLink = await driver.findElement(By.css('.view-appeal-link'));
  await appealLink.click();
  
  // Wait for appeal page to load
  await driver.wait(until.elementLocated(By.css('.appeal-details')), config.explicitTimeout);
  
  // Get appeal ID from URL
  const currentUrl = await driver.getCurrentUrl();
  const appealId = currentUrl.split('/').pop();
  
  return appealId;
};

/**
 * Manually record a response via UI
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {string} appealId - Appeal ID
 * @param {Object} responseData - Response data
 * @returns {Promise<void>}
 */
const recordManualResponseUi = async (driver, appealId, responseData) => {
  // Navigate to appeal detail page
  await driver.get(`${config.baseUrl}/appeals/${appealId}`);
  
  // Wait for appeal details to load
  await driver.wait(until.elementLocated(By.css('.appeal-details')), config.explicitTimeout);
  
  // Click the "Record Response" button
  const recordButton = await driver.findElement(By.id('record-response-button'));
  await recordButton.click();
  
  // Wait for the response form to load
  await driver.wait(until.elementLocated(By.id('response-form')), config.explicitTimeout);
  
  // Fill out the form
  
  // Select decision
  const decisionSelect = await driver.findElement(By.id('decision'));
  await decisionSelect.click();
  const decisionOption = await driver.findElement(By.css(`.decision-option[value="${responseData.decision}"]`));
  await decisionOption.click();
  
  // Enter response date
  const dateInput = await driver.findElement(By.id('response-date'));
  await dateInput.clear();
  await dateInput.sendKeys(responseData.responseDate);
  
  // Enter recovered amount if applicable
  if (responseData.recoveredAmount && (responseData.decision === 'approved' || responseData.decision === 'partiallyApproved')) {
    const amountInput = await driver.findElement(By.id('recovered-amount'));
    await amountInput.clear();
    await amountInput.sendKeys(responseData.recoveredAmount.toString());
  }
  
  // Enter notes
  if (responseData.notes) {
    const notesInput = await driver.findElement(By.id('response-notes'));
    await notesInput.clear();
    await notesInput.sendKeys(responseData.notes);
  }
  
  // Submit the form
  const submitButton = await driver.findElement(By.css('button[type="submit"]'));
  await submitButton.click();
  
  // Wait for recording to complete
  await driver.wait(until.elementLocated(By.css('.recording-success')), config.explicitTimeout);
};

/**
 * Check appeal status via UI
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {string} appealId - Appeal ID
 * @returns {Promise<string>} Appeal status
 */
const checkAppealStatusUi = async (driver, appealId) => {
  // Navigate to appeal detail page
  await driver.get(`${config.baseUrl}/appeals/${appealId}`);
  
  // Wait for appeal details to load
  await driver.wait(until.elementLocated(By.css('.appeal-details')), config.explicitTimeout);
  
  // Get the appeal status
  const statusElement = await driver.findElement(By.css('.appeal-status'));
  const status = await statusElement.getText();
  
  return status.toLowerCase();
};

module.exports = {
  uploadDocumentUi,
  checkDocumentIsResponseUi,
  processResponseDocumentUi,
  recordManualResponseUi,
  checkAppealStatusUi
};