const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  commentId: {
    type: String,
    required: true
  },
  pageId: {
    type: String,
    required: true
  },
  postId: {
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
  content: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'deleted'],
    default: 'pending'
  },
  reply: {
    type: String
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
commentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
commentSchema.index({ pageId: 1, status: 1, createdAt: -1 });
commentSchema.index({ commentId: 1 });

module.exports = mongoose.model('Comment', commentSchema);
