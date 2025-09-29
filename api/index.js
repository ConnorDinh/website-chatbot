module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.json({
    message: '💅 Soco Nail Chatbot API',
    version: '1.0.0',
    endpoints: {
      'POST /api/chat': 'Send a message and get AI response',
      'GET /api/conversation/:conversationId': 'Get conversation history',
      'GET /api/conversations': 'List all conversations',
      'POST /api/analyze-lead/:conversationId': 'Analyze lead quality',
      'GET /api/health': 'Health check',
      'GET /api/': 'API information (this endpoint)'
    },
    status: 'healthy',
    timestamp: new Date()
  });
};
