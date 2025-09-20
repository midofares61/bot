const mongoose = require('mongoose');

const blockedUserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  pageId: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    enum: ['angry_reaction', 'bad_comment', 'manual_block'],
    required: true
  },
  blockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  blockedAt: {
    type: Date,
    default: Date.now
  },
  unblockedAt: {
    type: Date
  },
  notes: {
    type: String
  }
});

// Index for efficient queries
blockedUserSchema.index({ userId: 1, pageId: 1 });
blockedUserSchema.index({ isActive: 1, pageId: 1 });

module.exports = mongoose.model('BlockedUser', blockedUserSchema);
