// Webhook Queue Status API
// This helps you check and manage unprocessed webhook data

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Get all conversations with lead analysis
    const { supabase } = require('./lib/supabase');
    
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*')
      .not('lead_analysis', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // Process conversations to check webhook status
    const queueData = conversations.map(conv => {
      const analysis = conv.lead_analysis || {};
      
      return {
        conversation_id: conv.conversation_id,
        status: conv.webhook_sent ? 'sent' : 'pending',
        customer_name: analysis.customerName || 'Unknown',
        customer_email: analysis.customerEmail || 'No email',
        customer_service: analysis.customerService || 'No service',
        lead_quality: analysis.leadQuality || 'unknown',
        created_at: conv.created_at,
        webhook_sent: conv.webhook_sent || false,
        webhook_sent_at: conv.webhook_sent_at || null,
        message_count: conv.messages ? conv.messages.length : 0
      };
    });

    // Calculate statistics
    const stats = {
      total: queueData.length,
      pending: queueData.filter(item => !item.webhook_sent).length,
      sent: queueData.filter(item => item.webhook_sent).length,
      with_email: queueData.filter(item => item.customer_email !== 'No email').length,
      good_leads: queueData.filter(item => item.lead_quality === 'good').length
    };

    res.json({
      success: true,
      stats: stats,
      queue: queueData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Queue status error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get queue status',
      details: error.message 
    });
  }
};
