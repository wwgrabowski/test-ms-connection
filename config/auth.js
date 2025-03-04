// config/auth.js - Authentication Configuration
const { ConfidentialClientApplication } = require('@azure/msal-node');
require('dotenv').config();

// Azure Entra ID (AAD) configuration
const msalConfig = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
    clientSecret: process.env.AZURE_CLIENT_SECRET,
  },
  system: {
    loggerOptions: {
      loggerCallback(level, message, containsPii) {
        if (!containsPii) {
          console.log(message);
        }
      },
      piiLoggingEnabled: false,
      logLevel: process.env.NODE_ENV === 'development' ? 'Info' : 'Warning',
    }
  }
};

// Initialize MSAL application
const msalClient = new ConfidentialClientApplication(msalConfig);

// Authentication parameters
const authParams = {
  scopes: ['user.read'], // Microsoft Graph scopes
  redirectUri: process.env.REDIRECT_URI,
};

// Mock user for development environment
const mockUser = process.env.NODE_ENV === 'development' && process.env.MOCK_USER_ENABLED === 'true' ? {
  name: process.env.MOCK_USER_NAME,
  email: process.env.MOCK_USER_EMAIL,
  id: 'mock-user-id',
  accessToken: 'mock-access-token'
} : null;

module.exports = {
  msalClient,
  authParams,
  mockUser,
  isProduction: process.env.NODE_ENV === 'production'
};