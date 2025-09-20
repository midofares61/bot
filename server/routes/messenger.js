const express = require('express');
const jwt = require('jsonwebtoken');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
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

// Get all conversations for user's pages
router.get('/conversations', verifyToken, async (req, res) => {
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
          active: 0,
          archived: 0,
          unread: 0
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
        { userName: { $regex: search, $options: 'i' } },
        { lastMessage: { $regex: search, $options: 'i' } }
      ];
    }

    // Get conversations
    const conversations = await Conversation.find(query)
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    // Get stats
    const totalConversations = await Conversation.countDocuments({ pageId: { $in: pageIds } });
    const activeConversations = await Conversation.countDocuments({ pageId: { $in: pageIds }, status: 'active' });
    const archivedConversations = await Conversation.countDocuments({ pageId: { $in: pageIds }, status: 'archived' });
    const unreadConversations = await Conversation.countDocuments({ pageId: { $in: pageIds }, isRead: false });

    res.json({
      success: true,
      data: conversations,
      total: totalConversations,
      stats: {
        total: totalConversations,
        active: activeConversations,
        archived: archivedConversations,
        unread: unreadConversations
      }
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get conversations',
      error: error.message 
    });
  }
});

// Get conversations for a page
router.get('/conversations/:pageId', verifyToken, async (req, res) => {
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
        { userName: { $regex: search, $options: 'i' } },
        { lastMessage: { $regex: search, $options: 'i' } }
      ];
    }

    // Get conversations
    const conversations = await Conversation.find(query)
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await Conversation.countDocuments(query);

    res.json({
      success: true,
      conversations,
      total,
      hasMore: offset + conversations.length < total
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get conversations',
      error: error.message 
    });
  }
});

// Get messages for a conversation
router.get('/messages/:conversationId', verifyToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 100, offset = 0 } = req.query;

    // Get messages
    const messages = await Message.find({ conversationId })
      .sort({ timestamp: 1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await Message.countDocuments({ conversationId });

    res.json({
      success: true,
      messages,
      total,
      hasMore: offset + messages.length < total
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get messages',
      error: error.message 
    });
  }
});

// Send a message
router.post('/send', verifyToken, async (req, res) => {
  try {
    const { conversationId, message } = req.body;

    if (!conversationId || !message) {
      return res.status(400).json({ message: 'Conversation ID and message are required' });
    }

    // Create new message
    const newMessage = new Message({
      conversationId,
      sender: 'bot',
      content: message,
      timestamp: new Date()
    });

    await newMessage.save();

    // Update conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message,
      status: 'replied',
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Message sent successfully',
      newMessage
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send message',
      error: error.message 
    });
  }
});

// Mark conversation as read
router.put('/mark-read/:conversationId', verifyToken, async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findByIdAndUpdate(
      conversationId,
      { 
        status: 'read',
        unreadCount: 0,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json({
      success: true,
      message: 'Conversation marked as read',
      conversation
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark conversation as read',
      error: error.message 
    });
  }
});

// Mark conversation as unread
router.put('/mark-unread/:conversationId', verifyToken, async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findByIdAndUpdate(
      conversationId,
      { 
        status: 'unread',
        unreadCount: 1,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json({
      success: true,
      message: 'Conversation marked as unread',
      conversation
    });

  } catch (error) {
    console.error('Mark as unread error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark conversation as unread',
      error: error.message 
    });
  }
});

// Archive conversation
router.put('/archive/:conversationId', verifyToken, async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findByIdAndUpdate(
      conversationId,
      { 
        status: 'archived',
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json({
      success: true,
      message: 'Conversation archived successfully',
      conversation
    });

  } catch (error) {
    console.error('Archive conversation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to archive conversation',
      error: error.message 
    });
  }
});

// Get messenger statistics
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
    const totalConversations = await Conversation.countDocuments({ pageId });
    const totalMessages = await Message.countDocuments({ 
      conversationId: { $in: await Conversation.find({ pageId }).distinct('_id') }
    });
    
    const conversationsByStatus = await Conversation.aggregate([
      { $match: { pageId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const recentConversations = await Conversation.find({ pageId })
      .sort({ updatedAt: -1 })
      .limit(10)
      .select('userName lastMessage status updatedAt');

    res.json({
      success: true,
      stats: {
        totalConversations,
        totalMessages,
        conversationsByStatus,
        recentConversations
      }
    });

  } catch (error) {
    console.error('Get messenger stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get messenger statistics',
      error: error.message 
    });
  }
});

module.exports = router;