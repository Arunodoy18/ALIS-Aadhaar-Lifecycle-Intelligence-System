/**
 * Example Backend API Routes with Firebase Authentication
 * 
 * This file demonstrates how to use Firebase authentication
 * in your Express backend routes.
 */

const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole, optionalAuth } = require('../security/firebase-auth/authMiddleware');
const { createUser, setUserRole, getUserByUID } = require('../security/firebase-auth/login');

// Example: Public route (no authentication required)
router.get('/api/public', (req, res) => {
  res.json({ message: 'This route is public' });
});

// Example: Protected route (authentication required)
router.get('/api/user/profile', authMiddleware, async (req, res) => {
  try {
    const uid = req.user.uid;
    const userRecord = await getUserByUID(uid);
    
    res.json({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      emailVerified: userRecord.emailVerified
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Example: Admin-only route
router.post('/api/admin/create-user', authMiddleware, requireRole(['admin']), async (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const userRecord = await createUser(email, password, displayName);
    
    res.json({
      message: 'User created successfully',
      uid: userRecord.uid,
      email: userRecord.email
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Example: Set user role (admin only)
router.post('/api/admin/set-role', authMiddleware, requireRole(['admin']), async (req, res) => {
  try {
    const { uid, role } = req.body;
    
    if (!uid || !role) {
      return res.status(400).json({ error: 'UID and role are required' });
    }
    
    await setUserRole(uid, role);
    
    res.json({ message: `User role set to ${role}` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Example: Optional auth (works with or without authentication)
router.get('/api/data', optionalAuth, (req, res) => {
  if (req.user) {
    res.json({ 
      message: 'Authenticated access',
      user: req.user.email
    });
  } else {
    res.json({ 
      message: 'Public access' 
    });
  }
});

// Example: Analytics endpoint (protected)
router.get('/api/analytics/dashboard', authMiddleware, async (req, res) => {
  try {
    // Your analytics logic here
    res.json({
      message: 'Analytics data',
      user: req.user.email
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Example: User data submission (protected)
router.post('/api/data/submit', authMiddleware, async (req, res) => {
  try {
    const uid = req.user.uid;
    const data = req.body;
    
    // Store data associated with user
    // Example: Save to database with user UID
    
    res.json({
      message: 'Data submitted successfully',
      userId: uid,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
