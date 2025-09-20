const axios = require('axios');

class FacebookAPI {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseURL = 'https://graph.facebook.com/v18.0';
  }

  // Send message to user
  async sendMessage(recipientId, message) {
    try {
      const response = await axios.post(
        `${this.baseURL}/me/messages`,
        {
          recipient: { id: recipientId },
          message: { text: message }
        },
        {
          params: { access_token: this.accessToken }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Send message error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Reply to comment
  async replyToComment(commentId, message) {
    try {
      const response = await axios.post(
        `${this.baseURL}/${commentId}/comments`,
        {
          message: message
        },
        {
          params: { access_token: this.accessToken }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Reply to comment error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Delete comment
  async deleteComment(commentId) {
    try {
      const response = await axios.delete(
        `${this.baseURL}/${commentId}`,
        {
          params: { access_token: this.accessToken }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Delete comment error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get page posts
  async getPagePosts(pageId, limit = 25, offset = 0) {
    try {
      const response = await axios.get(
        `${this.baseURL}/${pageId}/posts`,
        {
          params: {
            access_token: this.accessToken,
            limit,
            offset,
            fields: 'id,message,created_time,likes.summary(true),comments.summary(true)'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Get page posts error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get post comments
  async getPostComments(postId, limit = 50, offset = 0) {
    try {
      const response = await axios.get(
        `${this.baseURL}/${postId}/comments`,
        {
          params: {
            access_token: this.accessToken,
            limit,
            offset,
            fields: 'id,message,from,created_time,like_count'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Get post comments error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get page conversations
  async getPageConversations(pageId, limit = 50, offset = 0) {
    try {
      const response = await axios.get(
        `${this.baseURL}/${pageId}/conversations`,
        {
          params: {
            access_token: this.accessToken,
            limit,
            offset
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Get page conversations error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get conversation messages
  async getConversationMessages(conversationId, limit = 50, offset = 0) {
    try {
      const response = await axios.get(
        `${this.baseURL}/${conversationId}/messages`,
        {
          params: {
            access_token: this.accessToken,
            limit,
            offset
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Get conversation messages error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get user info
  async getUserInfo(userId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/${userId}`,
        {
          params: {
            access_token: this.accessToken,
            fields: 'id,name,email,picture'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Get user info error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Verify webhook
  verifyWebhook(mode, token, challenge) {
    if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
      return challenge;
    }
    return null;
  }

  // Process webhook data
  async processWebhookData(webhookData) {
    try {
      const events = [];
      
      if (webhookData.object === 'page') {
        for (const entry of webhookData.entry) {
          const pageId = entry.id;
          
          // Process messaging events
          for (const event of entry.messaging || []) {
            events.push({
              type: 'messaging',
              pageId,
              event
            });
          }

          // Process feed events
          for (const change of entry.changes || []) {
            if (change.field === 'feed') {
              events.push({
                type: 'feed',
                pageId,
                event: change
              });
            }
          }
        }
      }

      return events;
    } catch (error) {
      console.error('Process webhook data error:', error);
      throw error;
    }
  }
}

module.exports = FacebookAPI;
