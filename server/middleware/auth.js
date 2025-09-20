const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: 'User account is deactivated' 
      });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};

// Middleware to check if user owns a page
const checkPageOwnership = async (req, res, next) => {
  try {
    const { pageId } = req.params;
    const Page = require('../models/Page');
    
    const page = await Page.findOne({ 
      pageId, 
      owner: req.userId 
    });

    if (!page) {
      return res.status(404).json({ 
        success: false, 
        message: 'Page not found or you do not have permission to access it' 
      });
    }

    req.page = page;
    next();
  } catch (error) {
    console.error('Page ownership check error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error checking page ownership' 
    });
  }
};

module.exports = {
  verifyToken,
  checkPageOwnership
};
