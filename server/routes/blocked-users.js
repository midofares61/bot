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

// Get all blocked users for user's pages
router.get('/', verifyToken, async (req, res) => {
  try {
    const { search, reason } = req.query;

    // Get user's pages
    const pages = await Page.find({ owner: req.userId });
    const pageIds = pages.map(page => page.pageId);

    if (pageIds.length === 0) {
      return res.json({
        success: true,
        data: [],
        total: 0,
        stats: {
          total: 0,
          byReason: {}
        }
      });
    }

    // Build query
    const query = { pageId: { $in: pageIds } };
    
    if (search) {
      query.$or = [
        { userId: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (reason) {
      query.reason = reason;
    }

    // Get blocked users
    const blockedUsers = await BlockedUser.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    // Get stats
    const totalBlocked = await BlockedUser.countDocuments({ pageId: { $in: pageIds } });
    const stats = await BlockedUser.aggregate([
      { $match: { pageId: { $in: pageIds } } },
      { $group: { _id: '$reason', count: { $sum: 1 } } }
    ]);

    const byReason = {};
    stats.forEach(stat => {
      byReason[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: blockedUsers,
      total: totalBlocked,
      stats: {
        total: totalBlocked,
        byReason
      }
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

// Get blocked users for a page
router.get('/:pageId', verifyToken, async (req, res) => {
  try {
    const { pageId } = req.params;
    const { search, reason } = req.query;

    // Verify page ownership
    const page = await Page.findOne({ 
      pageId, 
      owner: req.userId 
    });

    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    // Build query
    const query = { pageId, isActive: true };
    
    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { userId: { $regex: search, $options: 'i' } }
      ];
    }

    if (reason) {
      query.reason = reason;
    }

    // Get blocked users
    const blockedUsers = await BlockedUser.find(query)
      .sort({ blockedAt: -1 })
      .limit(100);

    res.json({
      success: true,
      blockedUsers
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

// Block a user
router.post('/block', verifyToken, async (req, res) => {
  try {
    const { userId, userName, pageId, reason, notes } = req.body;

    if (!userId || !pageId || !reason) {
      return res.status(400).json({ message: 'User ID, page ID, and reason are required' });
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

    // Create blocked user record
    const blockedUser = new BlockedUser({
      userId,
      userName: userName || 'مستخدم غير معروف',
      pageId,
      reason,
      blockedBy: req.userId,
      notes
    });

    await blockedUser.save();

    res.json({
      success: true,
      message: 'User blocked successfully',
      blockedUser: {
        id: blockedUser._id,
        userId: blockedUser.userId,
        userName: blockedUser.userName,
        reason: blockedUser.reason,
        blockedAt: blockedUser.blockedAt
      }
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

// Unblock a user
router.put('/unblock/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Find and update blocked user
    const blockedUser = await BlockedUser.findOneAndUpdate(
      { userId, isActive: true },
      { 
        isActive: false, 
        unblockedAt: new Date() 
      },
      { new: true }
    );

    if (!blockedUser) {
      return res.status(404).json({ message: 'Blocked user not found' });
    }

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

// Get blocked user statistics
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
    const totalBlocked = await BlockedUser.countDocuments({ pageId, isActive: true });
    
    const blockedByReason = await BlockedUser.aggregate([
      { $match: { pageId, isActive: true } },
      { $group: { _id: '$reason', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const recentBlocks = await BlockedUser.find({ pageId, isActive: true })
      .sort({ blockedAt: -1 })
      .limit(10)
      .select('userName reason blockedAt');

    res.json({
      success: true,
      stats: {
        totalBlocked,
        blockedByReason,
        recentBlocks
      }
    });

  } catch (error) {
    console.error('Get blocked user stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get blocked user statistics',
      error: error.message 
    });
  }
});

module.exports = router;
