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

// Connect page to bot
router.post('/connect-page', verifyToken, async (req, res) => {
  try {
    const { pageId, pageName, pageAccessToken } = req.body;

    if (!pageId || !pageName || !pageAccessToken) {
      return res.status(400).json({ message: 'Page ID, name, and access token are required' });
    }

    // Check if page already exists
    const existingPage = await Page.findOne({ pageId });
    if (existingPage) {
      return res.status(400).json({ message: 'Page already connected' });
    }

    // Create new page
    const page = new Page({
      pageId,
      pageName,
      pageAccessToken,
      owner: req.userId
    });

    await page.save();

    res.json({
      success: true,
      message: 'Page connected successfully',
      page: {
        id: page._id,
        pageId: page.pageId,
        pageName: page.pageName,
        isActive: page.isActive,
        botEnabled: page.botEnabled
      }
    });

  } catch (error) {
    console.error('Connect page error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to connect page',
      error: error.message 
    });
  }
});

// Get user's connected pages
router.get('/pages', verifyToken, async (req, res) => {
  try {
    const pages = await Page.find({ owner: req.userId })
      .select('-pageAccessToken')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      pages
    });

  } catch (error) {
    console.error('Get pages error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get pages',
      error: error.message 
    });
  }
});

// Toggle bot for a page
router.put('/toggle-bot/:pageId', verifyToken, async (req, res) => {
  try {
    const { pageId } = req.params;
    const { botEnabled } = req.body;

    const page = await Page.findOne({ 
      pageId, 
      owner: req.userId 
    });

    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    page.botEnabled = botEnabled;
    await page.save();

    res.json({
      success: true,
      message: `Bot ${botEnabled ? 'enabled' : 'disabled'} for page`,
      page: {
        id: page._id,
        pageId: page.pageId,
        pageName: page.pageName,
        botEnabled: page.botEnabled
      }
    });

  } catch (error) {
    console.error('Toggle bot error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to toggle bot',
      error: error.message 
    });
  }
});

// Update page settings
router.put('/settings/:pageId', verifyToken, async (req, res) => {
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

    // Update settings
    if (settings.welcomeMessage) {
      page.settings.welcomeMessage = settings.welcomeMessage;
    }
    if (settings.autoReplyMessage) {
      page.settings.autoReplyMessage = settings.autoReplyMessage;
    }
    if (settings.commentAutoReply) {
      page.settings.commentAutoReply = settings.commentAutoReply;
    }
    if (settings.badWords) {
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
router.get('/settings/:pageId', verifyToken, async (req, res) => {
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

// OAuth callback for connecting pages
router.post('/oauth-callback', verifyToken, async (req, res) => {
  try {
    console.log('OAuth callback received:', req.body);
    const { code } = req.body;

    if (!code) {
      console.log('No authorization code provided');
      return res.status(400).json({ message: 'Authorization code is required' });
    }

    console.log('Exchanging code for access token...');
    // Exchange code for access token
    const tokenResponse = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        redirect_uri: `${process.env.CLIENT_URL}/pages/connect/callback`,
        code: code
      })
    });

    const tokenData = await tokenResponse.json();
    console.log('Token response:', tokenData);

    if (tokenData.error) {
      console.error('Token error:', tokenData.error);
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to get access token',
        error: tokenData.error 
      });
    }

    const accessToken = tokenData.access_token;
    console.log('Access token obtained, getting pages...');

    // Get user's pages
    const pagesResponse = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`);
    const pagesData = await pagesResponse.json();
    console.log('Pages response:', pagesData);

    if (pagesData.error) {
      console.error('Pages error:', pagesData.error);
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to get pages',
        error: pagesData.error 
      });
    }

    const connectedPages = [];
    console.log(`Processing ${pagesData.data.length} pages...`);

    // Process each page
    for (const page of pagesData.data) {
      try {
        console.log(`Processing page: ${page.name} (${page.id})`);
        
        // Check if page already exists
        const existingPage = await Page.findOne({ pageId: page.id });
        
        if (existingPage) {
          console.log(`Updating existing page: ${page.name}`);
          // Update existing page
          existingPage.pageAccessToken = page.access_token;
          existingPage.isActive = true;
          await existingPage.save();
          connectedPages.push({
            id: existingPage._id,
            pageId: existingPage.pageId,
            pageName: existingPage.pageName,
            isActive: existingPage.isActive,
            botEnabled: existingPage.botEnabled
          });
        } else {
          console.log(`Creating new page: ${page.name}`);
          // Create new page
          const newPage = new Page({
            pageId: page.id,
            pageName: page.name,
            pageAccessToken: page.access_token,
            owner: req.userId,
            isActive: true
          });

          await newPage.save();
          console.log(`Page saved successfully: ${newPage._id}`);
          connectedPages.push({
            id: newPage._id,
            pageId: newPage.pageId,
            pageName: newPage.pageName,
            isActive: newPage.isActive,
            botEnabled: newPage.botEnabled
          });
        }
      } catch (pageError) {
        console.error(`Error processing page ${page.id}:`, pageError);
        // Continue with other pages even if one fails
      }
    }

    console.log(`Successfully processed ${connectedPages.length} pages`);
    res.json({
      success: true,
      message: `تم ربط ${connectedPages.length} صفحة بنجاح`,
      pages: connectedPages
    });

  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process OAuth callback',
      error: error.message 
    });
  }
});

// Test endpoint to check database connection and pages
router.get('/test-db', verifyToken, async (req, res) => {
  try {
    console.log('Testing database connection...');
    
    // Get all pages for this user
    const pages = await Page.find({ owner: req.userId });
    console.log(`Found ${pages.length} pages for user ${req.userId}`);
    
    // Get all pages in database
    const allPages = await Page.find({});
    console.log(`Total pages in database: ${allPages.length}`);
    
    res.json({
      success: true,
      message: 'Database connection successful',
      userPages: pages.length,
      totalPages: allPages.length,
      pages: pages.map(page => ({
        id: page._id,
        pageId: page.pageId,
        pageName: page.pageName,
        isActive: page.isActive,
        botEnabled: page.botEnabled,
        createdAt: page.createdAt
      }))
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      success: false,
      message: 'Database test failed',
      error: error.message
    });
  }
});

// Debug endpoint to check all pages without authentication
router.get('/debug-pages', async (req, res) => {
  try {
    console.log('Debug: Getting all pages...');
    
    // Get all pages in database
    const allPages = await Page.find({});
    console.log(`Total pages in database: ${allPages.length}`);
    
    res.json({
      success: true,
      message: 'Debug: All pages retrieved',
      totalPages: allPages.length,
      pages: allPages.map(page => ({
        id: page._id,
        pageId: page.pageId,
        pageName: page.pageName,
        owner: page.owner,
        isActive: page.isActive,
        botEnabled: page.botEnabled,
        createdAt: page.createdAt
      }))
    });
  } catch (error) {
    console.error('Debug pages error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug: Failed to get pages',
      error: error.message
    });
  }
});

// Manual page connection for testing
router.post('/test-connect-page', verifyToken, async (req, res) => {
  try {
    const { pageId, pageName, pageAccessToken } = req.body;

    if (!pageId || !pageName || !pageAccessToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'Page ID, name, and access token are required' 
      });
    }

    console.log('Creating test page:', { pageId, pageName, owner: req.userId });

    // Check if page already exists
    const existingPage = await Page.findOne({ pageId });
    if (existingPage) {
      return res.status(400).json({ 
        success: false, 
        message: 'Page already exists',
        page: existingPage 
      });
    }

    // Create new page
    const page = new Page({
      pageId,
      pageName,
      pageAccessToken,
      owner: req.userId,
      isActive: true,
      botEnabled: false
    });

    await page.save();
    console.log('Test page saved successfully:', page._id);

    res.json({
      success: true,
      message: 'Test page created successfully',
      page: {
        id: page._id,
        pageId: page.pageId,
        pageName: page.pageName,
        isActive: page.isActive,
        botEnabled: page.botEnabled,
        createdAt: page.createdAt
      }
    });

  } catch (error) {
    console.error('Test page creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create test page',
      error: error.message 
    });
  }
});

module.exports = router;
