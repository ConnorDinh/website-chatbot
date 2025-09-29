const { getConversation } = require('../lib/conversation');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { conversationId } = req.query;

  if (!conversationId) {
    return res.status(400).json({ error: 'Conversation ID is required' });
  }

  try {
    if (req.method === 'GET') {
      const conversation = await getConversation(conversationId);
      
      res.json({
        conversationId: conversation.conversationId,
        messages: conversation.messages,
        createdAt: conversation.createdAt,
        lastActivity: conversation.lastActivity
      });
    } else if (req.method === 'DELETE') {
      // Delete conversation logic would go here
      // For now, just return success
      res.json({ success: true, message: 'Conversation deleted' });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error handling conversation request:', error);
    res.status(404).json({ error: 'Conversation not found' });
  }
};
