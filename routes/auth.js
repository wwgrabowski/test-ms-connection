// routes/auth.js - Authentication Routes
const express = require('express');
const router = express.Router();
const { msalClient, authParams, mockUser, isProduction } = require('../config/auth');
const { redirectIfAuthenticated } = require('../middleware/auth');

// Login route - redirects to Azure Entra ID login page
router.get('/login', redirectIfAuthenticated, async (req, res) => {
  try {
    // In development with mock user enabled, directly log in with mock user
    if (!isProduction && mockUser) {
      req.session.user = mockUser;
      return res.redirect('/dashboard');
    }

    // Generate Azure Entra ID authorization URL
    const authUrl = await msalClient.getAuthCodeUrl({
      ...authParams,
      state: Buffer.from(JSON.stringify({ redirectTo: req.query.redirectTo || '/dashboard' })).toString('base64')
    });
    
    // Redirect user to Azure login page
    res.redirect(authUrl);
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).render('error', { 
      message: 'Authentication service unavailable',
      error: isProduction ? {} : error 
    });
  }
});

// Auth redirect route - handles the callback from Azure Entra ID
router.get('/auth/redirect', async (req, res) => {
  // Error handling
  if (req.query.error) {
    console.error(`Authentication error: ${req.query.error_description}`);
    return res.status(500).render('error', { 
      message: 'Authentication failed',
      error: { description: req.query.error_description } 
    });
  }

  try {
    // Get authorization code from query parameters
    const code = req.query.code;
    let redirectTo = '/dashboard';
    
    // Parse the state if it exists
    if (req.query.state) {
      try {
        const stateData = JSON.parse(Buffer.from(req.query.state, 'base64').toString());
        if (stateData.redirectTo) {
          redirectTo = stateData.redirectTo;
        }
      } catch (e) {
        console.error('Error parsing state:', e);
      }
    }

    // Exchange authorization code for tokens
    const tokenResponse = await msalClient.acquireTokenByCode({
      ...authParams,
      code
    });

    // Store user information in session
    req.session.user = {
      name: tokenResponse.account.name,
      email: tokenResponse.account.username,
      id: tokenResponse.account.homeAccountId,
      accessToken: tokenResponse.accessToken
    };

    // Redirect to the requested page or dashboard
    res.redirect(redirectTo);
  } catch (error) {
    console.error('Error during token acquisition:', error);
    res.status(500).render('error', { 
      message: 'Failed to complete authentication',
      error: isProduction ? {} : error 
    });
  }
});

// Logout route
router.get('/logout', (req, res) => {
  // Clear the user session
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    // Redirect to home page after logout
    res.redirect('/');
  });
});

module.exports = router;