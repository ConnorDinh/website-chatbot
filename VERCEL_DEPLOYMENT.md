# Vercel Deployment Guide

This project has been restructured to run as Vercel serverless functions.

## Project Structure

```
├── api/                          # Vercel API functions
│   ├── lib/                      # Shared utilities
│   │   ├── supabase.js          # Supabase client
│   │   ├── openai.js            # OpenAI client
│   │   └── conversation.js      # Conversation utilities
│   ├── chat.js                  # Main chat endpoint
│   ├── conversations.js         # List conversations
│   ├── conversation/            # Conversation detail endpoints
│   │   └── [conversationId].js  # Get/delete specific conversation
│   ├── analyze-lead/            # Lead analysis endpoints
│   │   └── [conversationId].js  # Analyze lead quality
│   ├── health.js                # Health check endpoint
│   └── index.js                 # API root endpoint
├── public/                      # Static files
│   ├── index.html              # Main chatbot page
│   ├── dashboard.html          # Dashboard page
│   ├── styles.css              # Main styles
│   ├── dashboard.css           # Dashboard styles
│   ├── script.js               # Chatbot functionality
│   └── dashboard.js            # Dashboard functionality
├── vercel.json                 # Vercel configuration
└── package.json               # Dependencies and scripts
```

## Environment Variables

Set these environment variables in your Vercel dashboard:

- `OPENAI_API_KEY`: Your OpenAI API key
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

## Deployment Steps

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Deploy to Vercel:
   ```bash
   vercel
   ```

4. Set environment variables in Vercel dashboard or via CLI:
   ```bash
   vercel env add OPENAI_API_KEY
   vercel env add SUPABASE_URL
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   ```

5. Deploy to production:
   ```bash
   vercel --prod
   ```

## Local Development

Run locally with Vercel CLI:
```bash
vercel dev
```

This will start the development server at `http://localhost:3000`.

## API Endpoints

- `POST /api/chat` - Send message and get AI response
- `GET /api/conversations` - List all conversations
- `GET /api/conversation/:id` - Get specific conversation
- `POST /api/analyze-lead/:id` - Analyze lead quality
- `GET /api/health` - Health check
- `GET /api/` - API information

## Static Files

All static files (HTML, CSS, JS) are served from the `/public` directory and accessible at the root URL.

## Notes

- The original Express server (`server.js`) is no longer needed
- All API routes have been converted to Vercel serverless functions
- CORS headers are handled in each API function
- Environment variables are automatically loaded by Vercel
