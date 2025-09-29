const { openai } = require('./lib/openai');
const { generateConversationId, getConversation, updateConversationMessages } = require('./lib/conversation');

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
        - Stay on-topic and professional throughout the conversation.`;

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

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
};
