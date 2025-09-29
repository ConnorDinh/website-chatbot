# 💅 Soco Nail Chatbot

A beautiful and interactive chatbot for a nail salon website with OpenAI integration.

## Features

- 🤖 AI-powered responses using OpenAI GPT-3.5-turbo
- 💅 Nail salon specific personality and responses
- 💬 Conversation memory and context
- 🎨 Beautiful, responsive UI
- 🔄 Real-time messaging with typing indicators
- 📱 Mobile-friendly design

## Setup Instructions

### Prerequisites

- Node.js (version 14 or higher)
- OpenAI API key

### Installation

1. **Clone or download this repository**

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Open the `.env` file
   - Replace the placeholder values with your actual credentials:
   ```
   OPENAI_API_KEY=sk-your-actual-openai-api-key-here
   PORT=3000
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

4. **Set up Supabase database:**
   - Create a table named `conversations` with these columns:
     - `id` (bigint, primary key, auto-increment)
     - `created_at` (timestamp with time zone, default now())
     - `conversation_id` (text, unique)
     - `messages` (jsonb)
     - `updated_at` (timestamp with time zone, default now())
   - Or run this SQL in your Supabase SQL editor:
   ```sql
   CREATE TABLE conversations (
     id BIGSERIAL PRIMARY KEY,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     conversation_id TEXT UNIQUE NOT NULL,
     messages JSONB DEFAULT '[]'::jsonb,
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

5. **Test the connection:**
   ```bash
   node test-supabase.js
   ```
   This will verify your Supabase connection and database setup.

6. **Start the server:**
   ```bash
   npm start
   ```
   
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

7. **Open your browser:**
   Navigate to `http://localhost:3000`

## API Endpoints

- `POST /api/chat` - Send a message and get AI response
- `GET /api/conversation/:conversationId` - Get conversation history
- `GET /api/conversations` - List all conversations (debug)
- `DELETE /api/conversation/:conversationId` - Clear a conversation
- `GET /api/health` - Health check

## Project Structure

```
website-chatbot/
├── index.html          # Frontend HTML
├── script.js           # Frontend JavaScript
├── styles.css          # Frontend CSS
├── server.js           # Backend Node.js server
├── package.json        # Dependencies and scripts
├── .env               # Environment variables (create this)
├── .gitignore         # Git ignore file
└── README.md          # This file
```

## How It Works

1. **Frontend**: The HTML/CSS/JS frontend provides the chat interface
2. **Backend**: Node.js/Express server handles API requests
3. **OpenAI Integration**: Backend calls OpenAI API for AI responses
4. **Database Storage**: Conversations are stored in Supabase PostgreSQL database
5. **CORS**: Backend includes CORS support for frontend communication

### Database Schema

The chatbot uses a Supabase PostgreSQL database with the following table structure:

```sql
CREATE TABLE conversations (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  conversation_id TEXT UNIQUE NOT NULL,
  messages JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

- **id**: Auto-incrementing primary key
- **created_at**: Timestamp when conversation was created
- **conversation_id**: Unique identifier for each conversation
- **messages**: JSON array storing all messages in the conversation
- **updated_at**: Timestamp when conversation was last updated

## Customization

- Modify the system prompt in `server.js` to change the AI's personality
- Update the fallback responses in `script.js` for offline functionality
- Customize the UI by editing `styles.css`
- Add database storage by modifying the conversation storage in `server.js`

## Security Notes

- Keep your OpenAI API key secure and never commit it to version control
- The `.env` file is included in `.gitignore` for security
- Consider adding rate limiting for production use
- Add authentication if needed for production deployment

## Troubleshooting

- **"OpenAI API error"**: Check your API key in the `.env` file
- **"Backend API error"**: Make sure the server is running on port 3000
- **CORS errors**: Ensure the backend server is running and accessible
- **Module not found**: Run `npm install` to install dependencies

