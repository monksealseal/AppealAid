# AppealAid Testing Guide

This document provides a comprehensive testing checklist for the AppealAid application hosted on GitHub Pages.

## Accessing the Application

The application is available at: https://monksealseal.github.io/AppealAid/

## Testing Credentials

For the GitHub Pages deployment, authentication is mocked:
- You can use ANY email and password to log in
- Default demo email: `demo@example.com`
- Default demo password: `demopassword123` (though any password will work)

## Test Cases

### 1. Authentication

- [ ] **User Login**
  - Visit the application URL
  - Enter any email and password
  - Verify you are redirected to the dashboard
  - Verify user information appears in the header/sidebar

- [ ] **User Registration**
  - Navigate to registration page
  - Complete the registration form
  - Submit the form
  - Verify you are redirected to the dashboard

- [ ] **Navigation After Login**
  - Verify all navigation links work
  - Verify protected routes require authentication

### 2. Dashboard

- [ ] **Dashboard Loading**
  - Verify all dashboard widgets load properly
  - Check appeal statistics display correctly
  - Verify recent appeals section is populated

- [ ] **Quick Actions**
  - Test "New Appeal" button
  - Test "Upload Document" button
  - Verify document count is displayed
  - Verify appeal count is displayed

### 3. Appeals Management

- [ ] **View Appeals List**
  - Navigate to Appeals page
  - Verify list of appeals is displayed
  - Check sorting and filtering functionality

- [ ] **Appeal Creation**
  - Start new appeal creation
  - Navigate through all steps of appeal wizard
  - Complete required fields
  - Submit appeal
  - Verify appeal appears in list

- [ ] **Appeal Details**
  - Click on an existing appeal
  - Verify all appeal details are displayed
  - Check timeline functionality
  - Test status updates

### 4. Document Management

- [ ] **Document Upload**
  - Navigate to Documents page
  - Upload a document (any PDF or image file)
  - Verify upload progress indicator
  - Confirm document appears in list

- [ ] **Document Viewing**
  - Click on an existing document
  - Verify document preview loads
  - Test download functionality

### 5. Provider Collaboration

- [ ] **Provider Collaboration Tools**
  - Navigate to Provider Collaboration section
  - Test message creation
  - Verify status updates

### 6. Responsive Design

- [ ] **Mobile Responsiveness**
  - Test on various screen sizes
  - Verify menu collapses properly on small screens
  - Check form layouts on different devices

### 7. Error Handling

- [ ] **Network Error Handling**
  - Test offline behavior
  - Verify error messages are displayed appropriately

## Reporting Issues

If you encounter any issues during testing, please:

1. Take a screenshot of the error
2. Note the steps to reproduce
3. Document what browser/device you were using
4. Submit an issue on GitHub

## Testing Tools

For automated testing:
- Selenium WebDriver scripts are available in `/backend/tests/e2e/`
- Jest unit tests can be run with `npm test`
- End-to-end tests can be run with `npm run test:e2e`