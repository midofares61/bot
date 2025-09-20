const express = require('express');
const jwt = require('jsonwebtoken');
const Log = require('../models/Log');
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

// Get logs for a page
router.get('/:pageId', verifyToken, async (req, res) => {
  try {
    const { pageId } = req.params;
    const { 
      type, 
      limit = 50, 
      offset = 0, 
      startDate, 
      endDate 
    } = req.query;

    // Verify page ownership
    const page = await Page.findOne({ 
      pageId, 
      owner: req.userId 
    });

    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    // Build query
    const query = { pageId };
    
    if (type) {
      query.type = type;
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate);
      }
    }

    // Get logs
    const logs = await Log.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await Log.countDocuments(query);

    res.json({
      success: true,
      logs,
      total,
      hasMore: offset + logs.length < total
    });

  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get logs',
      error: error.message 
    });
  }
});

// Get log statistics
router.get('/stats/:pageId', verifyToken, async (req, res) => {
  try {
    const { pageId } = req.params;
    const { startDate, endDate } = req.query;

    // Verify page ownership
    const page = await Page.findOne({ 
      pageId, 
      owner: req.userId 
    });

    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) {
        dateFilter.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.timestamp.$lte = new Date(endDate);
      }
    }

    const query = { pageId, ...dateFilter };

    // Get statistics
    const totalLogs = await Log.countDocuments(query);

    const logsByType = await Log.aggregate([
      { $match: query },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const logsByStatus = await Log.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const recentActivity = await Log.find(query)
      .sort({ timestamp: -1 })
      .limit(10)
      .select('type content timestamp status');

    // Get daily activity for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyActivity = await Log.aggregate([
      {
        $match: {
          pageId,
          timestamp: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
            day: { $dayOfMonth: '$timestamp' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    res.json({
      success: true,
      stats: {
        totalLogs,
        logsByType,
        logsByStatus,
        recentActivity,
        dailyActivity
      }
    });

  } catch (error) {
    console.error('Get log stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get log statistics',
      error: error.message 
    });
  }
});

// Get all log types
router.get('/types/:pageId', verifyToken, async (req, res) => {
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

    // Get unique log types
    const logTypes = await Log.distinct('type', { pageId });

    res.json({
      success: true,
      logTypes
    });

  } catch (error) {
    console.error('Get log types error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get log types',
      error: error.message 
    });
  }
});

// Clear old logs (older than 30 days)
router.delete('/clear-old/:pageId', verifyToken, async (req, res) => {
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

    // Delete logs older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await Log.deleteMany({
      pageId,
      timestamp: { $lt: thirtyDaysAgo }
    });

    res.json({
      success: true,
      message: `Cleared ${result.deletedCount} old logs`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Clear old logs error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to clear old logs',
      error: error.message 
    });
  }
});

module.exports = router;
