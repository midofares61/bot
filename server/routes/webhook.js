const express = require('express');
const axios = require('axios');
const Page = require('../models/Page');
const BlockedUser = require('../models/BlockedUser');
const Log = require('../models/Log');
const router = express.Router();

// Webhook verification
router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    console.log('✅ Webhook verified');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Webhook verification failed');
    res.status(403).send('Forbidden');
  }
});

// Webhook endpoint for receiving events
router.post('/', async (req, res) => {
  try {
    const body = req.body;
    
    // Log the webhook event
    await Log.create({
      type: 'webhook_received',
      pageId: body.object || 'unknown',
      content: JSON.stringify(body),
      metadata: body
    });

    if (body.object === 'page') {
      for (const entry of body.entry) {
        const pageId = entry.id;
        
        // Find the page in our database
        const page = await Page.findOne({ pageId, isActive: true, botEnabled: true });
        if (!page) continue;

        // Process each event
        for (const event of entry.messaging || []) {
          await processMessagingEvent(event, page);
        }

        // Process comments
        for (const event of entry.changes || []) {
          if (event.field === 'feed') {
            await processFeedEvent(event, page);
          }
        }
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Error');
  }
});

// Process messaging events
async function processMessagingEvent(event, page) {
  try {
    const senderId = event.sender.id;
    
    // Check if user is blocked
    const isBlocked = await BlockedUser.findOne({
      userId: senderId,
      pageId: page.pageId,
      isActive: true
    });

    if (isBlocked) {
      console.log(`User ${senderId} is blocked, ignoring message`);
      return;
    }

    // Handle different message types
    if (event.message) {
      await handleMessage(event, page);
    } else if (event.postback) {
      await handlePostback(event, page);
    }

  } catch (error) {
    console.error('Error processing messaging event:', error);
  }
}

// Process feed events (comments, reactions)
async function processFeedEvent(event, page) {
  try {
    const item = event.value;
    
    if (item.item === 'comment') {
      await handleComment(item, page);
    } else if (item.item === 'reaction') {
      await handleReaction(item, page);
    }

  } catch (error) {
    console.error('Error processing feed event:', error);
  }
}

// Handle incoming messages
async function handleMessage(event, page) {
  try {
    const senderId = event.sender.id;
    const message = event.message;
    
    // Send welcome message if it's the first message
    if (message.text && page.settings.welcomeMessage) {
      await sendMessage(senderId, page.settings.welcomeMessage, page.pageAccessToken);
      
      // Log the message
      await Log.create({
        type: 'message_sent',
        pageId: page.pageId,
        userId: senderId,
        content: page.settings.welcomeMessage
      });
    }

  } catch (error) {
    console.error('Error handling message:', error);
  }
}

// Handle comments
async function handleComment(comment, page) {
  try {
    const commentId = comment.comment_id;
    const commentText = comment.message;
    const commenterId = comment.from.id;
    const commenterName = comment.from.name;

    // Check if comment contains bad words
    const containsBadWords = page.settings.badWords.some(badWord => 
      commentText.toLowerCase().includes(badWord.toLowerCase())
    );

    if (containsBadWords && page.settings.autoDeleteBadComments) {
      // Delete the comment
      await deleteComment(commentId, page.pageAccessToken);
      
      // Block the user
      await BlockedUser.create({
        userId: commenterId,
        userName: commenterName,
        pageId: page.pageId,
        reason: 'bad_comment',
        blockedBy: page.owner
      });

      // Log the action
      await Log.create({
        type: 'comment_deleted',
        pageId: page.pageId,
        userId: commenterId,
        userName: commenterName,
        content: commentText,
        metadata: { commentId, reason: 'bad_words' }
      });

      return;
    }

    // Send auto-reply to comment
    if (page.settings.commentAutoReply) {
      await replyToComment(commentId, page.settings.commentAutoReply, page.pageAccessToken);
      
      // Log the reply
      await Log.create({
        type: 'comment_reply',
        pageId: page.pageId,
        userId: commenterId,
        userName: commenterName,
        content: page.settings.commentAutoReply,
        metadata: { commentId, originalComment: commentText }
      });
    }

  } catch (error) {
    console.error('Error handling comment:', error);
  }
}

// Handle reactions
async function handleReaction(reaction, page) {
  try {
    const reactorId = reaction.from.id;
    const reactorName = reaction.from.name;
    const reactionType = reaction.reaction_type;

    // If user reacted with angry face, block them
    if (reactionType === 'angry') {
      await BlockedUser.create({
        userId: reactorId,
        userName: reactorName,
        pageId: page.pageId,
        reason: 'angry_reaction',
        blockedBy: page.owner
      });

      // Log the action
      await Log.create({
        type: 'user_blocked',
        pageId: page.pageId,
        userId: reactorId,
        userName: reactorName,
        content: 'Blocked due to angry reaction',
        metadata: { reactionType }
      });
    }

  } catch (error) {
    console.error('Error handling reaction:', error);
  }
}

// Send message to user
async function sendMessage(recipientId, message, accessToken) {
  try {
    await axios.post(`https://graph.facebook.com/v18.0/me/messages`, {
      recipient: { id: recipientId },
      message: { text: message }
    }, {
      params: { access_token: accessToken }
    });
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

// Reply to comment
async function replyToComment(commentId, message, accessToken) {
  try {
    await axios.post(`https://graph.facebook.com/v18.0/${commentId}/comments`, {
      message: message
    }, {
      params: { access_token: accessToken }
    });
  } catch (error) {
    console.error('Error replying to comment:', error);
  }
}

// Delete comment
async function deleteComment(commentId, accessToken) {
  try {
    await axios.delete(`https://graph.facebook.com/v18.0/${commentId}`, {
      params: { access_token: accessToken }
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
  }
}

module.exports = router;
