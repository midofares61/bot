const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  pageId: {
    type: String,
    required: true,
    unique: true
  },
  pageName: {
    type: String,
    required: true
  },
  pageAccessToken: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  botEnabled: {
    type: Boolean,
    default: false
  },
  settings: {
    welcomeMessage: {
      type: String,
      default: 'مرحباً! شكراً لك على التواصل معنا. سنرد عليك قريباً.'
    },
    autoReplyMessage: {
      type: String,
      default: 'شكراً لك على رسالتك. سنقوم بالرد عليك في أقرب وقت ممكن.'
    },
    commentAutoReply: {
      type: String,
      default: 'شكراً لك على تعليقك!'
    },
    badWords: [{
      type: String
    }],
    autoDeleteBadComments: {
      type: Boolean,
      default: true
    }
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
pageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Page', pageSchema);
