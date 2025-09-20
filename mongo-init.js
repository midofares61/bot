// MongoDB initialization script for Docker
db = db.getSiblingDB('facebook-bot');

// Create collections
db.createCollection('users');
db.createCollection('pages');
db.createCollection('comments');
db.createCollection('messages');
db.createCollection('conversations');
db.createCollection('blockedusers');
db.createCollection('logs');

// Create indexes for better performance
db.users.createIndex({ "facebookId": 1 }, { unique: true });
db.users.createIndex({ "email": 1 });
db.users.createIndex({ "createdAt": 1 });

db.pages.createIndex({ "pageId": 1 }, { unique: true });
db.pages.createIndex({ "owner": 1 });
db.pages.createIndex({ "isActive": 1 });

db.comments.createIndex({ "commentId": 1 }, { unique: true });
db.comments.createIndex({ "pageId": 1 });
db.comments.createIndex({ "status": 1 });
db.comments.createIndex({ "createdAt": 1 });

db.messages.createIndex({ "messageId": 1 }, { unique: true });
db.messages.createIndex({ "conversationId": 1 });
db.messages.createIndex({ "senderId": 1 });
db.messages.createIndex({ "createdAt": 1 });

db.conversations.createIndex({ "conversationId": 1 }, { unique: true });
db.conversations.createIndex({ "pageId": 1 });
db.conversations.createIndex({ "participantId": 1 });
db.conversations.createIndex({ "status": 1 });

db.blockedusers.createIndex({ "userId": 1, "pageId": 1 }, { unique: true });
db.blockedusers.createIndex({ "pageId": 1 });
db.blockedusers.createIndex({ "blockedAt": 1 });

db.logs.createIndex({ "pageId": 1 });
db.logs.createIndex({ "type": 1 });
db.logs.createIndex({ "createdAt": 1 });

print('Database initialized successfully!');




