// server/routes/auth.js
const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Helper to create JWT
function generateJwtForUser(user) {
  return jwt.sign(
    { userId: user._id, facebookId: user.facebookId || null },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '7d' }
  );
}

// Email/password registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'الاسم والبريد وكلمة المرور مطلوبة' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'البريد مستخدم بالفعل' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      authProvider: 'local',
      passwordHash,
      isActive: true,
      lastLogin: new Date(),
    });

    const token = generateJwtForUser(user);

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture || null,
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'فشل إنشاء الحساب', error: error.message });
  }
});

// Email/password login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'البريد وكلمة المرور مطلوبة' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة' });
    }

    const match = await bcrypt.compare(password, user.passwordHash || '');
    if (!match) {
      return res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateJwtForUser(user);

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture || null,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'فشل تسجيل الدخول', error: error.message });
  }
});

// Facebook OAuth callback
router.post('/facebook', async (req, res) => {
  try {
    console.log('Facebook auth request received:', req.body);
    
    const { accessToken } = req.body;
    
    if (!accessToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'Access token is required' 
      });
    }

    // Get user info from Facebook
    const response = await axios.get(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`);
    console.log('Facebook user info:', response.data);
    
    const { id, name, email, picture } = response.data;

    // Check if user exists
    let user = await User.findOne({ facebookId: id });
    
    if (user) {
      // Update existing user
      user.accessToken = accessToken;
      user.lastLogin = new Date();
      user.profilePicture = picture.data?.url;
      if (email) user.email = email; // تحديث email إذا كان متوفراً
      await user.save();
    } else {
      // Create new user
      user = new User({
        facebookId: id,
        name,
        email: email || `${id}@facebook.com`,
        accessToken,
        profilePicture: picture.data?.url
      });
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, facebookId: user.facebookId },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    console.log('User created/updated:', user);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        facebookId: user.facebookId,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture
      }
    });

  } catch (error) {
    console.error('Facebook auth error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Authentication failed',
      error: error.message 
    });
  }
});

// Verify JWT token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const user = await User.findById(decoded.userId).select('-accessToken -refreshToken');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        facebookId: user.facebookId,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token',
      error: error.message 
    });
  }
});

// Debug endpoint to check all users
router.get('/debug-users', async (req, res) => {
  try {
    console.log('Debug: Getting all users...');
    
    // Get all users in database
    const allUsers = await User.find({});
    console.log(`Total users in database: ${allUsers.length}`);
    
    res.json({
      success: true,
      message: 'Debug: All users retrieved',
      totalUsers: allUsers.length,
      users: allUsers.map(user => ({
        id: user._id,
        facebookId: user.facebookId,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    console.error('Debug users error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug: Failed to get users',
      error: error.message
    });
  }
});

module.exports = router;