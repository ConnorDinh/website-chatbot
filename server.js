const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const OpenAI = require('openai');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://cnmncnbpikvbpfuykhby.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNubW5jbmJwaWt2YnBmdXlraGJ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTA2NjMzMSwiZXhwIjoyMDc0NjQyMzMxfQ.oL3SV_pmxNZlNRiWILxVGKZTn-hC4FmGwFwh83CnL2s'
);

// Temporary in-memory storage for lead analysis (until database columns are added)
const leadAnalysisCache = new Map();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// System prompt for nail salon assistant
const systemPrompt = `You are a helpful and friendly nail salon assistant for Soco Nail. You should:
        - Be warm, welcoming, and professional
        - Use nail salon terminology and emojis (💅, ✨, 💖, 🌸)
        - Help with appointments, services, nail care tips, and general questions
        - Keep responses concise but helpful
        - Always maintain a positive, pampering tone
        - Use nail-related emojis appropriately
        - Be knowledgeable about manicures, pedicures, nail art, gel nails, etc.
        You are the Soco Nail AI Assistant - friendly and helpful virtual assistant representing Soco AI, a nail salon

        Your goal are to advise customers and schedule appointments

        Always keep responses short, helpful, and polite.
        Always reply in the same language the user speaks.
        Ask only one question at a time.

        BENEFITS: Emphasize saving time, low costs, beautyful and trendy products.
        PRICING: Only mention "starting from $35 USD" if the user explicitly asks about pricing.

        CONVERSATION FLOW:
        1. Ask what service the customer want.
        2. Then ask what specific nail(basic/gel/dip powder/fullset) and pedicure.
        3. Based on that, recommend other service.
        4. Ask if they would like to learn more about the service.
        5. If yes, collect necessary information (name, phone, email).
        6. Provide a more technical description of the services and invite them to book a free appointment.
        7. If they want to make an appointment, ask them if they want to request any specific technician.
        8. Finally, ask if they have any notes or questions before ending the chat.

        OTHER RULES:
        - Be friendly but concise.
        - Do not ask multiple questions at once.
        - Do not mention pricing unless asked.
        - Stay on-topic and professional throughout the conversation.`
;

// Generate a unique conversation ID
function generateConversationId() {
  return 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Get conversation from Supabase
async function getConversation(conversationId) {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('conversation_id', conversationId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching conversation:', error);
      throw error;
    }

    if (data) {
      return {
        id: data.id,
        conversationId: data.conversation_id,
        messages: data.messages || [],
        createdAt: new Date(data.created_at),
        lastActivity: new Date(data.created_at) // You might want to add a last_activity column
      };
    }

    // Create new conversation if it doesn't exist
    return await createConversation(conversationId);
  } catch (error) {
    console.error('Error in getConversation:', error);
    throw error;
  }
}

// Create new conversation in Supabase
async function createConversation(conversationId) {
  try {
    const newConversation = {
      conversation_id: conversationId,
      messages: [],
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('conversations')
      .insert([newConversation])
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }

    return {
      id: data.id,
      conversationId: data.conversation_id,
      messages: data.messages || [],
      createdAt: new Date(data.created_at),
      lastActivity: new Date(data.created_at)
    };
  } catch (error) {
    console.error('Error in createConversation:', error);
    throw error;
  }
}

// Update conversation messages in Supabase
async function updateConversationMessages(conversationId, messages) {
  try {
    // First, try to update existing conversation
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ 
        messages: messages
      })
      .eq('conversation_id', conversationId);

    // If update failed because conversation doesn't exist, create it
    if (updateError && updateError.code === 'PGRST116') {
      const newConversation = {
        conversation_id: conversationId,
        messages: messages,
        created_at: new Date().toISOString()
      };

      const { error: insertError } = await supabase
        .from('conversations')
        .insert([newConversation]);

      if (insertError) {
        console.error('Error creating conversation:', insertError);
        throw insertError;
      }
    } else if (updateError) {
      console.error('Error updating conversation messages:', updateError);
      throw updateError;
    }
  } catch (error) {
    console.error('Error in updateConversationMessages:', error);
    throw error;
  }
}

// API endpoint to send message and get response
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    
    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Generate new conversation ID if not provided
    const convId = conversationId || generateConversationId();
    
    // Add user message
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    // Prepare messages for OpenAI API (get existing conversation or start fresh)
    let existingMessages = [];
    try {
      const conversation = await getConversation(convId);
      existingMessages = conversation.messages || [];
    } catch (error) {
      // If conversation doesn't exist, start with empty array
      existingMessages = [];
    }

    const updatedMessages = [...existingMessages, userMessage];

    // Prepare messages for OpenAI API
    const messages = [
      { role: 'system', content: systemPrompt },
      ...updatedMessages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: messages,
      max_tokens: 150,
      temperature: 0.5,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    });

    const botResponse = completion.choices[0].message.content.trim();

    // Add bot response to conversation
    const finalMessages = [...updatedMessages, {
      role: 'assistant',
      content: botResponse,
      timestamp: new Date().toISOString()
    }];

    // Only create/update conversation in Supabase if we have messages
    if (finalMessages.length > 0) {
      await updateConversationMessages(convId, finalMessages);
    }

    // Return response with conversation ID
    res.json({
      response: botResponse,
      conversationId: convId,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Error processing chat message:', error);
    
    // Fallback response
    const fallbackResponses = [
      "I'm having trouble connecting right now, but I'm still here to help! 💅 Please try again in a moment.",
      "Oops! Something went wrong on my end. ✨ But don't worry, I'm still your nail assistant! Try asking again.",
      "I'm experiencing some technical difficulties, but I'm ready to help with your nail needs! 💖",
      "Sorry for the hiccup! 🌸 I'm still here to assist you with all your nail salon questions."
    ];
    
    const fallbackResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    
    res.json({
      response: fallbackResponse,
      conversationId: req.body.conversationId || generateConversationId(),
      timestamp: new Date(),
      error: 'OpenAI API error'
    });
  }
});

// API endpoint to get conversation history
app.get('/api/conversation/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = await getConversation(conversationId);
    
    res.json({
      conversationId: conversation.conversationId,
      messages: conversation.messages,
      createdAt: conversation.createdAt,
      lastActivity: conversation.lastActivity
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(404).json({ error: 'Conversation not found' });
  }
});

// API endpoint to get all conversations (for debugging)
app.get('/api/conversations', async (req, res) => {
  try {
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
    
    res.json(conversationList);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Lead quality analysis endpoint
app.post('/api/analyze-lead/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    
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
});

// API root endpoint
app.get('/api/', (req, res) => {
  res.json({
    message: '💅 Soco Nail Chatbot API',
    version: '1.0.0',
    endpoints: {
      'POST /api/chat': 'Send a message and get AI response',
      'GET /api/conversation/:conversationId': 'Get conversation history',
      'GET /api/conversations': 'List all conversations',
      'DELETE /api/conversation/:conversationId': 'Clear a conversation',
      'GET /api/health': 'Health check',
      'GET /api/': 'API information (this endpoint)'
    },
    status: 'healthy',
    timestamp: new Date()
  });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test Supabase connection
    const { count, error } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Supabase connection error:', error);
      return res.status(500).json({
        status: 'unhealthy',
        timestamp: new Date(),
        error: 'Database connection failed',
        details: error.message
      });
    }

    res.json({ 
      status: 'healthy', 
      timestamp: new Date(),
      conversationCount: count || 0,
      database: 'connected'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date(),
      error: 'Health check failed',
      details: error.message
    });
  }
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`💅 Soco Nail Chatbot server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} to view the chatbot`);
  console.log(`API endpoints available at http://localhost:${PORT}/api/`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n💅 Shutting down Soco Nail Chatbot server...');
  process.exit(0);
});
