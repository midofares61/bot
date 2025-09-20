const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // OAuth (Facebook) identity. Optional when using local email/password auth
  facebookId: {
    type: String,
    required: false,
    unique: true,
    sparse: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  profilePicture: {
    type: String
  },
  // OAuth access token (Facebook). Optional when using local auth
  accessToken: {
    type: String
  },
  refreshToken: {
    type: String
  },
  // Local authentication
  authProvider: {
    type: String,
    enum: ['facebook', 'local'],
    default: 'facebook'
  },
  passwordHash: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);
