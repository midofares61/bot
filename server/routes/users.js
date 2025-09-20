const express = require('express');
const jwt = require('jsonwebtoken');
const BlockedUser = require('../models/BlockedUser');
const Page = require('../models/Page');
const router = express.Router();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get blocked users for a page
router.get('/blocked/:pageId', verifyToken, async (req, res) => {
  try {
    const { pageId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Verify page ownership
    const page = await Page.findOne({ 
      pageId, 
      owner: req.userId 
    });

    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    // Get blocked users
    const blockedUsers = await BlockedUser.find({
      pageId,
      isActive: true
    })
    .sort({ blockedAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(offset));

    const total = await BlockedUser.countDocuments({
      pageId,
      isActive: true
    });

    res.json({
      success: true,
      blockedUsers,
      total,
      hasMore: offset + blockedUsers.length < total
    });

  } catch (error) {
    console.error('Get blocked users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get blocked users',
      error: error.message 
    });
  }
});

// Unblock a user
router.put('/unblock/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { pageId } = req.body;

    if (!pageId) {
      return res.status(400).json({ message: 'Page ID is required' });
    }

    // Verify page ownership
    const page = await Page.findOne({ 
      pageId, 
      owner: req.userId 
    });

    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    // Unblock user
    const blockedUser = await BlockedUser.findOne({
      userId,
      pageId,
      isActive: true
    });

    if (!blockedUser) {
      return res.status(404).json({ message: 'User not found in blocked list' });
    }

    blockedUser.isActive = false;
    blockedUser.unblockedAt = new Date();
    await blockedUser.save();

    res.json({
      success: true,
      message: 'User unblocked successfully'
    });

  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to unblock user',
      error: error.message 
    });
  }
});

// Block a user manually
router.post('/block', verifyToken, async (req, res) => {
  try {
    const { pageId, userId, userName, reason, notes } = req.body;

    if (!pageId || !userId || !userName) {
      return res.status(400).json({ message: 'Page ID, user ID, and user name are required' });
    }

    // Verify page ownership
    const page = await Page.findOne({ 
      pageId, 
      owner: req.userId 
    });

    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    // Check if user is already blocked
    const existingBlock = await BlockedUser.findOne({
      userId,
      pageId,
      isActive: true
    });

    if (existingBlock) {
      return res.status(400).json({ message: 'User is already blocked' });
    }

    // Block user
    const blockedUser = new BlockedUser({
      userId,
      userName,
      pageId,
      reason: reason || 'manual_block',
      blockedBy: req.userId,
      notes
    });

    await blockedUser.save();

    res.json({
      success: true,
      message: 'User blocked successfully',
      blockedUser
    });

  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to block user',
      error: error.message 
    });
  }
});

// Get user statistics
router.get('/stats/:pageId', verifyToken, async (req, res) => {
  try {
    const { pageId } = req.params;

    // Verify page ownership
    const page = await Page.findOne({ 
      pageId, 
      owner: req.userId 
    });

    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    // Get statistics
    const totalBlocked = await BlockedUser.countDocuments({
      pageId,
      isActive: true
    });

    const blockedByReason = await BlockedUser.aggregate([
      { $match: { pageId, isActive: true } },
      { $group: { _id: '$reason', count: { $sum: 1 } } }
    ]);

    const recentlyBlocked = await BlockedUser.find({
      pageId,
      isActive: true
    })
    .sort({ blockedAt: -1 })
    .limit(10)
    .select('userName reason blockedAt');

    res.json({
      success: true,
      stats: {
        totalBlocked,
        blockedByReason,
        recentlyBlocked
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get user statistics',
      error: error.message 
    });
  }
});

module.exports = router;
