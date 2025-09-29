// Chatbot functionality
class Chatbot {
    constructor() {
        this.messagesContainer = document.getElementById('chatbot-messages');
        this.userInput = document.getElementById('user-input');
        this.sendButton = document.getElementById('send-button');
        
        // Backend API Configuration
        this.apiUrl = '/api/chat';
        this.conversationId = null;
        
        // System prompt for nail salon assistant
        this.systemPrompt = `You are a helpful and friendly nail salon assistant for Soco Nail. You should:
        - Be warm, welcoming, and professional
        - Use nail salon terminology and emojis (💅, ✨, 💖, 🌸)
        - Help with appointments, services, nail care tips, and general questions
        - Keep responses concise but helpful
        - Always maintain a positive, pampering tone
        - Use nail-related emojis appropriately
        - Be knowledgeable about manicures, pedicures, nail art, gel nails, etc.`;
        
        // Fixed bot responses (fallback)
        this.botResponses = {
            greetings: [
                "Hello beautiful! 💅 Welcome to our nail salon! How can I pamper you today?",
                "Hi gorgeous! ✨ Ready for some self-care? What nail service interests you?",
                "Welcome to our salon! 💖 I'm here to help you look and feel fabulous!",
                "Hello lovely! 🌸 Let's make your nails absolutely stunning today!"
            ],
            help: [
                "I'm your nail salon assistant! 💅 I can help with appointments, services, nail care tips, and answer any questions about our treatments.",
                "I'm here to help you with everything nail-related! Ask me about our services, book appointments, or get nail care advice.",
                "I can assist you with our nail services, help you choose the perfect nail art, or answer questions about nail health.",
                "I'm your personal nail consultant! 💖 Ask me about manicures, pedicures, nail art, or any nail care questions."
            ],
            services: [
                "We offer amazing nail services! 💅 Classic manicures, gel manicures, nail art, pedicures, nail extensions, and special treatments. What interests you?",
                "Our salon provides: French manicures, gel polish, nail art designs, spa pedicures, nail extensions, and nail repair services. Which would you like to know more about?",
                "We specialize in: Manicures, pedicures, gel nails, nail art, nail extensions, nail repair, and luxury spa treatments. What's your style?",
                "Our services include: Classic & gel manicures, pedicures, nail art, extensions, nail repair, and special occasion nail designs. Ready to book? 💖"
            ],
            contact: [
                "Contact us at (555) NAIL-ART or visit us at 123 Beauty Street! We're open Mon-Sat 9AM-7PM. 💅",
                "Call us at (555) 624-5278 or book online! We're located at 123 Beauty Street, open Mon-Sat 9AM-7PM. ✨",
                "Reach us at (555) 624-5278 or visit our salon at 123 Beauty Street! We'd love to pamper you! 💖",
                "Call (555) NAIL-ART or visit 123 Beauty Street! We're here to make you feel beautiful! 🌸"
            ],
            appointments: [
                "I'd love to help you book an appointment! 💅 What service are you interested in and what day works best for you?",
                "Let's get you scheduled! ✨ We have availability for manicures, pedicures, and nail art. When would you like to come in?",
                "Perfect! I can help you book your nail appointment. What service would you like and what's your preferred time?",
                "Great choice! 💖 Let me help you schedule your nail service. What day and time works for you?"
            ],
            nailcare: [
                "Great question! 💅 For healthy nails, keep them clean, moisturized, and avoid harsh chemicals. Use cuticle oil daily!",
                "Nail care tips: Keep nails dry, use a base coat, avoid picking at polish, and give nails a break between gel applications! ✨",
                "For beautiful nails: Moisturize daily, file in one direction, use quality products, and don't forget sunscreen on your hands! 💖",
                "Healthy nail tips: Eat well, stay hydrated, use gentle nail tools, and always use a top coat for protection! 🌸"
            ],
            default: [
                "That's a great question! 💅 Let me help you with that nail-related topic.",
                "I love that you're interested in nail care! ✨ Here's what I can tell you:",
                "Perfect question! 💖 As your nail expert, I'd suggest:",
                "Great to hear from you! 🌸 Here's some nail wisdom for you:",
                "Thanks for asking! 💅 Here's what I think about that:"
            ]
        };
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        // Send button click
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Enter key press
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        // Auto-focus input
        this.userInput.focus();
    }
    
    async sendMessage() {
        const message = this.userInput.value.trim();
        if (message === '') return;
        
        // Add user message
        this.addMessage(message, 'user');
        
        // Clear input
        this.userInput.value = '';
        
        // Disable input while processing
        this.userInput.disabled = true;
        this.sendButton.disabled = true;
        
        try {
            // Show loading indicator
            const loadingMessage = this.addLoadingMessage();
            
            // Generate bot response using backend API
            const botResponse = await this.generateBackendResponse(message);
            
            // Remove loading message and add actual response
            this.removeLoadingMessage(loadingMessage);
            this.addMessage(botResponse, 'bot');
        } catch (error) {
            console.error('Error calling backend API:', error);
            // Remove loading message if it exists
            const loadingMessage = document.querySelector('.loading-message');
            if (loadingMessage) {
                this.removeLoadingMessage(loadingMessage);
            }
            // Fallback to fixed responses
            const fallbackResponse = this.generateResponse(message);
            this.addMessage(fallbackResponse, 'bot');
        } finally {
            // Re-enable input
            this.userInput.disabled = false;
            this.sendButton.disabled = false;
            this.userInput.focus();
        }
    }
    
    async generateBackendResponse(userMessage) {
        const requestBody = {
            message: userMessage,
            conversationId: this.conversationId
        };
        
        console.log('Sending request:', requestBody);
        
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Received response:', data);
        
        // Store conversation ID for future requests
        if (data.conversationId) {
            this.conversationId = data.conversationId;
            console.log('Updated conversation ID:', this.conversationId);
        }
        
        return data.response;
    }
    
    
    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = sender === 'user' ? '👤' : '💅';
        const currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        messageDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                <p>${content}</p>
                <span class="message-time">${currentTime}</span>
            </div>
        `;
        
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    generateResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        // Check for greeting patterns
        if (this.containsAny(message, ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'])) {
            return this.getRandomResponse(this.botResponses.greetings);
        }
        
        // Check for help requests
        if (this.containsAny(message, ['help', 'assist', 'support', 'what can you do'])) {
            return this.getRandomResponse(this.botResponses.help);
        }
        
        // Check for services questions
        if (this.containsAny(message, ['service', 'services', 'what do you offer', 'products', 'offerings', 'manicure', 'pedicure', 'nail art', 'gel', 'polish'])) {
            return this.getRandomResponse(this.botResponses.services);
        }
        
        // Check for appointment booking
        if (this.containsAny(message, ['appointment', 'book', 'schedule', 'reservation', 'when', 'available', 'time'])) {
            return this.getRandomResponse(this.botResponses.appointments);
        }
        
        // Check for nail care tips
        if (this.containsAny(message, ['nail care', 'healthy nails', 'nail health', 'tips', 'advice', 'how to', 'maintain'])) {
            return this.getRandomResponse(this.botResponses.nailcare);
        }
        
        // Check for contact information
        if (this.containsAny(message, ['contact', 'phone', 'email', 'address', 'reach', 'get in touch', 'location', 'where'])) {
            return this.getRandomResponse(this.botResponses.contact);
        }
        
        // Check for goodbye
        if (this.containsAny(message, ['bye', 'goodbye', 'see you', 'thanks', 'thank you'])) {
            return "Thank you for visiting our nail salon! 💅 Have a beautiful day and don't forget to show off those gorgeous nails! ✨";
        }
        
        // Default response
        const defaultResponse = this.getRandomResponse(this.botResponses.default);
        return `${defaultResponse} Feel free to ask me about our nail services, book an appointment, or get nail care tips! 💖`;
    }
    
    containsAny(str, keywords) {
        return keywords.some(keyword => str.includes(keyword));
    }
    
    getRandomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    addLoadingMessage() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message bot-message loading-message';
        loadingDiv.innerHTML = `
            <div class="message-avatar">💅</div>
            <div class="message-content">
                <p>Nail artist is thinking<span class="typing-dots">...</span></p>
                <span class="message-time">Just now</span>
            </div>
        `;
        
        this.messagesContainer.appendChild(loadingDiv);
        this.scrollToBottom();
        return loadingDiv;
    }
    
    removeLoadingMessage(loadingMessage) {
        if (loadingMessage && loadingMessage.parentNode) {
            loadingMessage.parentNode.removeChild(loadingMessage);
        }
    }
    
    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
}

// Initialize chatbot when page loads
document.addEventListener('DOMContentLoaded', () => {
    new Chatbot();
});

// Add some typing indicator functionality
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.innerHTML = `
        <div class="message-avatar">💅</div>
        <div class="message-content">
            <p>Nail artist is typing<span class="typing-dots">...</span></p>
        </div>
    `;
    
    document.getElementById('chatbot-messages').appendChild(typingDiv);
    return typingDiv;
}

function removeTypingIndicator(typingDiv) {
    if (typingDiv && typingDiv.parentNode) {
        typingDiv.parentNode.removeChild(typingDiv);
    }
}
