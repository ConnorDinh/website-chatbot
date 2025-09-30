const { openai } = require('../lib/openai');
const { supabase } = require('../lib/supabase');

// Temporary in-memory storage for lead analysis (until database columns are added)
const leadAnalysisCache = new Map();

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

  const { conversationId } = req.query;

  console.log('Lead analysis request:', { conversationId });

  if (!conversationId) {
    return res.status(400).json({ error: 'Conversation ID is required' });
  }

  try {
    // Get conversation from database
    const { data: conversationData, error: fetchError } = await supabase
      .from('conversations')
      .select('*')
      .eq('conversation_id', conversationId)
      .single();

    if (fetchError) {
      console.error('Error fetching conversation:', fetchError);
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (!conversationData.messages || conversationData.messages.length === 0) {
      return res.status(400).json({ error: 'No messages found in conversation' });
    }

    // Prepare conversation transcript for analysis
    const transcript = conversationData.messages.map(msg => 
      `${msg.role === 'user' ? 'Customer' : 'Assistant'}: ${msg.content}`
    ).join('\n');

    // Lead quality analysis system prompt
    const analysisPrompt = `Extract the following customer details from the transcript:
- Name
- Email address
- Phone number
- Service
- Whether they have booked an appointment yet. If yes, extract time
- Any special notes
- Any specific technician
- Lead quality (categorize as 'good', 'ok', or 'spam')

Format the response using this JSON schema:
{
    "type": "object",
    "properties": {
        "customerName": { "type": "string" },
        "customerEmail": { "type": "string" },
        "customerPhone": { "type": "string" },
        "customerService": { "type": "string" },
        "customerAppointment": { "type": "boolean" },
        "customerTime": { "type": "string" },
        "customerNotes": { "type": "string" },
        "customerTechnician": { "type": "string" },
        "leadQuality": { "type": "string", "enum": ["good","ok","spam"] }
    },
    "required": ["customerName", "customerEmail", "customerService", "leadQuality"]
}

If the user provided contact details, set lead quality to "good"; otherwise, "spam"

Conversation transcript:
${transcript}`;

    // Call OpenAI API for analysis
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        { role: "system", content: analysisPrompt }
      ],
      max_tokens: 500,
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const analysisResult = JSON.parse(completion.choices[0].message.content);

    // Update conversation with lead analysis
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ 
        lead_analysis: analysisResult,
        analyzed_at: new Date().toISOString()
      })
      .eq('conversation_id', conversationId);

    if (updateError) {
      console.error('Error updating conversation with lead analysis:', updateError);
      // If columns don't exist, store in cache and return the analysis
      if (updateError.code === '42703' || updateError.message.includes('does not exist') || updateError.code === 'PGRST204') {
        console.log('Lead analysis columns not found in database. Storing in cache.');
        // Store analysis in cache
        leadAnalysisCache.set(conversationId, analysisResult);
        
        return res.json({
          success: true,
          analysis: analysisResult,
          conversationId: conversationId,
          warning: 'Analysis completed and cached. Add lead_analysis and analyzed_at columns to save permanently.'
        });
      }
      return res.status(500).json({ error: 'Failed to save analysis' });
    }
    
    // If successful, also store in cache for consistency
    leadAnalysisCache.set(conversationId, analysisResult);

    res.json({
      success: true,
      analysis: analysisResult,
      conversationId: conversationId
    });

  } catch (error) {
    console.error('Error analyzing lead:', error);
    res.status(500).json({ 
      error: 'Failed to analyze lead',
      details: error.message 
    });
  }
};

