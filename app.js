// app.js - Main application file
const express = require('express');
const path = require('path');
const session = require('express-session');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes and middleware
const authRoutes = require('./routes/auth');
const { ensureAuthenticated, redirectIfAuthenticated } = require('./middleware/auth');
const { mockUser } = require('./config/auth');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;
const isDevelopment = process.env.NODE_ENV === 'development';

// Configure view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: !isDevelopment, // Use secure cookies in production
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Make auth status available to all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.isAuthenticated = !!req.session.user;
  res.locals.isDevelopment = isDevelopment;
  res.locals.mockEnabled = isDevelopment && process.env.MOCK_USER_ENABLED === 'true';
  res.locals.mockUser = mockUser;
  next();
});


// Home route - redirect to login page
app.get('/', (req, res) => {
  // If user is already authenticated, redirect to dashboard
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  // Otherwise redirect to login page
  res.redirect('/login-page');
});

// Routes
app.use('/', authRoutes);

// Public home/about page (optional)
app.get('/home', (req, res) => {
  res.render('index', { 
    title: 'Home - My Node.js Web App'
  });
});

// Login page route
app.get('/login-page', redirectIfAuthenticated, (req, res) => {
  res.render('login', { 
    title: 'Login - My Node.js Web App'
  });
});

// Protected dashboard route
app.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.render('dashboard', { 
    title: 'Dashboard - My Node.js Web App'
  });
});

// API route example
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'Server is running', 
    authenticated: !!req.session.user,
    timestamp: new Date() 
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).render('error', {
    message: 'Page not found',
    error: { status: 404 }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).render('error', {
    message: err.message || 'Something went wrong',
    error: isDevelopment ? err : {}
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on http://localhost:${PORT}`);
  if (isDevelopment && process.env.MOCK_USER_ENABLED === 'true') {
    console.log(`Mock authentication enabled: ${mockUser.name} (${mockUser.email})`);
  }
});