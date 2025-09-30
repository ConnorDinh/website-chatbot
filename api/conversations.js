const { supabase } = require('./lib/supabase');

// Temporary in-memory storage for lead analysis (until database columns are added)
const leadAnalysisCache = new Map();

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

  try {
    console.log('Fetching conversations...');
    const { data, error } = await supabase
      .from('conversations')
      .select('id, conversation_id, messages, created_at, lead_analysis, analyzed_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }

    const conversationList = data.map(conv => {
      // Check if we have cached analysis data (fallback)
      const cachedAnalysis = leadAnalysisCache.get(conv.conversation_id);
      
      return {
        id: conv.id,
        conversationId: conv.conversation_id,
        messageCount: conv.messages ? conv.messages.length : 0,
        createdAt: new Date(conv.created_at),
        lastActivity: new Date(conv.created_at),
        leadAnalysis: conv.lead_analysis || cachedAnalysis || null,
        analyzedAt: conv.analyzed_at ? new Date(conv.analyzed_at) : (cachedAnalysis ? new Date() : null)
      };
    });
    
    console.log('Returning', conversationList.length, 'conversations');
    res.json(conversationList);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

