const { supabase } = require('./supabase');

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

module.exports = {
  generateConversationId,
  getConversation,
  createConversation,
  updateConversationMessages
};
