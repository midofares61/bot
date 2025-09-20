const express = require('express');
const jwt = require('jsonwebtoken');
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

// Update page settings
router.put('/:pageId', verifyToken, async (req, res) => {
  try {
    const { pageId } = req.params;
    const { settings } = req.body;

    const page = await Page.findOne({ 
      pageId, 
      owner: req.userId 
    });

    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    // Update specific settings
    if (settings.welcomeMessage !== undefined) {
      page.settings.welcomeMessage = settings.welcomeMessage;
    }
    if (settings.autoReplyMessage !== undefined) {
      page.settings.autoReplyMessage = settings.autoReplyMessage;
    }
    if (settings.commentAutoReply !== undefined) {
      page.settings.commentAutoReply = settings.commentAutoReply;
    }
    if (settings.badWords !== undefined) {
      page.settings.badWords = settings.badWords;
    }
    if (settings.autoDeleteBadComments !== undefined) {
      page.settings.autoDeleteBadComments = settings.autoDeleteBadComments;
    }

    await page.save();

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: page.settings
    });

  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update settings',
      error: error.message 
    });
  }
});

// Get page settings
router.get('/:pageId', verifyToken, async (req, res) => {
  try {
    const { pageId } = req.params;

    const page = await Page.findOne({ 
      pageId, 
      owner: req.userId 
    });

    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    res.json({
      success: true,
      settings: page.settings
    });

  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get settings',
      error: error.message 
    });
  }
});

// Add bad word
router.post('/:pageId/bad-words', verifyToken, async (req, res) => {
  try {
    const { pageId } = req.params;
    const { word } = req.body;

    if (!word) {
      return res.status(400).json({ message: 'Word is required' });
    }

    const page = await Page.findOne({ 
      pageId, 
      owner: req.userId 
    });

    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    // Add word if not already exists
    if (!page.settings.badWords.includes(word.toLowerCase())) {
      page.settings.badWords.push(word.toLowerCase());
      await page.save();
    }

    res.json({
      success: true,
      message: 'Bad word added successfully',
      badWords: page.settings.badWords
    });

  } catch (error) {
    console.error('Add bad word error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add bad word',
      error: error.message 
    });
  }
});

// Remove bad word
router.delete('/:pageId/bad-words/:word', verifyToken, async (req, res) => {
  try {
    const { pageId, word } = req.params;

    const page = await Page.findOne({ 
      pageId, 
      owner: req.userId 
    });

    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    // Remove word
    page.settings.badWords = page.settings.badWords.filter(
      w => w !== word.toLowerCase()
    );
    await page.save();

    res.json({
      success: true,
      message: 'Bad word removed successfully',
      badWords: page.settings.badWords
    });

  } catch (error) {
    console.error('Remove bad word error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to remove bad word',
      error: error.message 
    });
  }
});

// Get all bad words
router.get('/:pageId/bad-words', verifyToken, async (req, res) => {
  try {
    const { pageId } = req.params;

    const page = await Page.findOne({ 
      pageId, 
      owner: req.userId 
    });

    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    res.json({
      success: true,
      badWords: page.settings.badWords
    });

  } catch (error) {
    console.error('Get bad words error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get bad words',
      error: error.message 
    });
  }
});

module.exports = router;
