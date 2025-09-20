const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    required: true,
    unique: true
  },
  pageId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'replied', 'archived'],
    default: 'unread'
  },
  lastMessage: {
    type: String
  },
  unreadCount: {
    type: Number,
    default: 0
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
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
conversationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
conversationSchema.index({ pageId: 1, status: 1, updatedAt: -1 });
conversationSchema.index({ conversationId: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
