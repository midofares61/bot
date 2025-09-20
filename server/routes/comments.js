const express = require('express');
const jwt = require('jsonwebtoken');
const Comment = require('../models/Comment');
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

// Get all comments for user's pages
router.get('/', verifyToken, async (req, res) => {
  try {
    const { status, search, limit = 50, offset = 0 } = req.query;

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
          pending: 0,
          approved: 0,
          rejected: 0
        }
      });
    }

    // Build query
    const query = { pageId: { $in: pageIds } };
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { message: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } }
      ];
    }

    // Get comments
    const comments = await Comment.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    // Get stats
    const totalComments = await Comment.countDocuments({ pageId: { $in: pageIds } });
    const pendingComments = await Comment.countDocuments({ pageId: { $in: pageIds }, status: 'pending' });
    const approvedComments = await Comment.countDocuments({ pageId: { $in: pageIds }, status: 'approved' });
    const rejectedComments = await Comment.countDocuments({ pageId: { $in: pageIds }, status: 'rejected' });

    res.json({
      success: true,
      data: comments,
      total: totalComments,
      stats: {
        total: totalComments,
        pending: pendingComments,
        approved: approvedComments,
        rejected: rejectedComments
      }
    });

  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get comments',
      error: error.message 
    });
  }
});

// Get comments for a page
router.get('/:pageId', verifyToken, async (req, res) => {
  try {
    const { pageId } = req.params;
    const { status, search, limit = 50, offset = 0 } = req.query;

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
    
    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { content: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } }
      ];
    }

    // Get comments
    const comments = await Comment.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await Comment.countDocuments(query);

    res.json({
      success: true,
      comments,
      total,
      hasMore: offset + comments.length < total
    });

  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get comments',
      error: error.message 
    });
  }
});

// Approve a comment
router.put('/approve/:commentId', verifyToken, async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findByIdAndUpdate(
      commentId,
      { status: 'approved' },
      { new: true }
    );

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.json({
      success: true,
      message: 'Comment approved successfully',
      comment
    });

  } catch (error) {
    console.error('Approve comment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to approve comment',
      error: error.message 
    });
  }
});

// Reject a comment
router.put('/reject/:commentId', verifyToken, async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findByIdAndUpdate(
      commentId,
      { status: 'rejected' },
      { new: true }
    );

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.json({
      success: true,
      message: 'Comment rejected successfully',
      comment
    });

  } catch (error) {
    console.error('Reject comment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reject comment',
      error: error.message 
    });
  }
});

// Delete a comment
router.delete('/delete/:commentId', verifyToken, async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findByIdAndUpdate(
      commentId,
      { status: 'deleted' },
      { new: true }
    );

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.json({
      success: true,
      message: 'Comment deleted successfully',
      comment
    });

  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete comment',
      error: error.message 
    });
  }
});

// Reply to a comment
router.post('/reply/:commentId', verifyToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { reply } = req.body;

    if (!reply) {
      return res.status(400).json({ message: 'Reply content is required' });
    }

    const comment = await Comment.findByIdAndUpdate(
      commentId,
      { 
        reply,
        status: 'replied'
      },
      { new: true }
    );

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.json({
      success: true,
      message: 'Reply sent successfully',
      comment
    });

  } catch (error) {
    console.error('Reply to comment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reply to comment',
      error: error.message 
    });
  }
});

// Get comment statistics
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
    const totalComments = await Comment.countDocuments({ pageId });
    
    const commentsByStatus = await Comment.aggregate([
      { $match: { pageId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const recentComments = await Comment.find({ pageId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('content userName status createdAt');

    res.json({
      success: true,
      stats: {
        totalComments,
        commentsByStatus,
        recentComments
      }
    });

  } catch (error) {
    console.error('Get comment stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get comment statistics',
      error: error.message 
    });
  }
});

module.exports = router;