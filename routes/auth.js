const express = require('express');
const router = express.Router();
const userService = require('../service/userService');

/**
 * POST /api/auth/login
 * Authenticate user with username and password
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || username.trim() === '' || !password || password.trim() === '') {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Authenticate user
    const user = await userService.authenticate(username, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Store user in session
    req.session.user = user;
    res.json({ success: true, message: 'Login successful', user: user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    console.log('Register request body:', JSON.stringify(req.body));
    const { empId, name, designation, deptCode, password, roles } = req.body;

    // Validate input
    if (!empId || empId.trim() === '' || !password || password.trim() === '') {
      return res.status(400).json({ error: 'EMP ID and password are required' });
    }

    // Check if user already exists
    const exists = await userService.userExists(empId);
    if (exists) {
      return res.status(409).json({ error: 'Employee ID already exists' });
    }

    // Register user
    const roleList = Array.isArray(roles) ? roles : [];
    console.log('Registering user:', { empId, name, designation, deptCode, roles: roleList });
    const result = await userService.register(empId, name, designation, deptCode, password, roleList);
    console.log('Register result:', result);
    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/auth/verify
 * Verify if user is authenticated
 */
router.get('/verify', (req, res) => {
  if (req.session.user) {
    res.json({ authenticated: true, user: req.session.user });
  } else {
    res.status(401).json({ authenticated: false, error: 'Not authenticated' });
  }
});

module.exports = router;
