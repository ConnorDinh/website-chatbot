// Process Webhook Queue API
// Sends all unprocessed conversations to your webhook

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { webhook_url } = req.body;
    
    if (!webhook_url) {
      return res.status(400).json({ error: 'Webhook URL is required' });
    }

    // Get all unprocessed conversations
    const { supabase } = require('./lib/supabase');
    
    const { data: conversations, error: fetchError } = await supabase
      .from('conversations')
      .select('*')
      .not('lead_analysis', 'is', null)
      .eq('webhook_sent', false)
      .order('created_at', { ascending: false });

    if (fetchError) {
      throw new Error(`Database error: ${fetchError.message}`);
    }

    if (conversations.length === 0) {
      return res.json({
        success: true,
        message: 'No unprocessed conversations found',
        processed: 0,
        failed: 0
      });
    }

    let processed = 0;
    let failed = 0;
    const results = [];

    // Process each conversation
    for (const conv of conversations) {
      try {
        const analysis = conv.lead_analysis || {};
        
        // Prepare webhook payload
        const payload = {
          // Customer Information (convert null to empty string)
          customer_name: String(analysis.customerName || ''),
          customer_email: String(analysis.customerEmail || ''),
          customer_phone: String(analysis.customerPhone || ''),
          customer_service: String(analysis.customerService || ''),
          appointment_time: String(analysis.customerTime || ''),
          special_notes: String(analysis.customerNotes || ''),
          preferred_technician: String(analysis.customerTechnician || ''),
          lead_quality: String(analysis.leadQuality || ''),
          appointment_booked: Boolean(analysis.customerAppointment || false),
          
          // Conversation Details
          conversation_id: String(conv.conversation_id || ''),
          message_count: Number(conv.messages ? conv.messages.length : 0),
          
          // Customer Messages (as simple text)
          customer_messages: (conv.messages || [])
            .map(msg => `${msg.role === 'user' ? 'Customer' : 'Assistant'}: ${msg.content || ''}`)
            .join('\n'),
          
          // Metadata
          source: 'Soco Nail Chatbot',
          timestamp: new Date().toISOString(),
          extracted_at: new Date().toISOString()
        };

        // Send webhook
        const response = await fetch(webhook_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          // Mark as sent in database
          await supabase
            .from('conversations')
            .update({ 
              webhook_sent: true,
              webhook_sent_at: new Date().toISOString()
            })
            .eq('conversation_id', conv.conversation_id);

          processed++;
          results.push({
            conversation_id: conv.conversation_id,
            status: 'success',
            customer_name: analysis.customerName || 'Unknown'
          });
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        failed++;
        results.push({
          conversation_id: conv.conversation_id,
          status: 'failed',
          error: error.message,
          customer_name: conv.lead_analysis?.customerName || 'Unknown'
        });
        console.error(`Error processing conversation ${conv.conversation_id}:`, error);
      }
    }

    res.json({
      success: true,
      message: `Processed ${processed} conversations successfully, ${failed} failed`,
      processed: processed,
      failed: failed,
      total: conversations.length,
      results: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Queue processing error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to process queue',
      details: error.message 
    });
  }
};
