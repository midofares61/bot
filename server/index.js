const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const https = require('https');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());

// CORS: allow configured client URL and localhost over http/https
const allowedOrigins = (process.env.CLIENT_URL
  ? [process.env.CLIENT_URL]
  : ['http://localhost:3000', 'https://localhost:3000']);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// MongoDB Atlas Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/facebook', require('./routes/facebook'));
app.use('/api/logs', require('./routes/logs'));
app.use('/api/messenger', require('./routes/messenger'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/blocked-users', require('./routes/blocked-users'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/users', require('./routes/users'));

// Webhook endpoint for Facebook
app.use('/webhook', require('./routes/webhook'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// HTTPS support using local/provided certificates
function getSslOptions() {
  try {
    const keyPath = process.env.SSL_KEY_PATH || path.join(__dirname, '..', 'certs', 'privkey.pem');
    const certPath = process.env.SSL_CERT_PATH || path.join(__dirname, '..', 'certs', 'fullchain.pem');
    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      const caPath = process.env.SSL_CA_PATH && fs.existsSync(process.env.SSL_CA_PATH)
        ? process.env.SSL_CA_PATH
        : null;
      const options = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
      };
      if (caPath) {
        options.ca = fs.readFileSync(caPath);
      }
      return options;
    }
    return null;
  } catch (e) {
    console.error('⚠️ Failed to load SSL certificates:', e.message);
    return null;
  }
}

const sslOptions = getSslOptions();

if (sslOptions) {
  https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`🔐 HTTPS server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
} else {
  app.listen(PORT, () => {
    console.log(`⚠️ SSL certificates not found. Starting HTTP server.`);
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}
