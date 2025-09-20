const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['comment_reply', 'message_sent', 'comment_deleted', 'user_blocked', 'user_unblocked', 'webhook_received'],
    required: true
  },
  pageId: {
    type: String,
    required: true
  },
  userId: {
    type: String
  },
  userName: {
    type: String
  },
  content: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  status: {
    type: String,
    enum: ['success', 'error', 'pending'],
    default: 'success'
  },
  errorMessage: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
logSchema.index({ pageId: 1, type: 1, timestamp: -1 });
logSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Log', logSchema);
