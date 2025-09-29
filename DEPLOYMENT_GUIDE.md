# 🚀 Vercel Deployment Guide

## Prerequisites
- Vercel CLI installed and logged in ✅
- OpenAI API key
- Supabase project with database set up

## Step 1: Deploy to Vercel

Run this command in your project directory:
```bash
vercel
```

Follow the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Choose your account
- **Link to existing project?** → No (for first deployment)
- **What's your project's name?** → `website-chatbot` (or your preferred name)
- **In which directory is your code located?** → `./` (current directory)

## Step 2: Set Environment Variables

After deployment, set these environment variables in your Vercel dashboard:

### Required Environment Variables:
1. **OPENAI_API_KEY** - Your OpenAI API key
2. **SUPABASE_URL** - Your Supabase project URL
3. **SUPABASE_SERVICE_ROLE_KEY** - Your Supabase service role key

### How to Set Environment Variables:
1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Click on your project
3. Go to Settings → Environment Variables
4. Add each variable:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: `sk-your-openai-key-here`
   - **Environment**: Production, Preview, Development
   - Click "Save"

   - **Name**: `SUPABASE_URL`
   - **Value**: `https://your-project.supabase.co`
   - **Environment**: Production, Preview, Development
   - Click "Save"

   - **Name**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: `your-service-role-key-here`
   - **Environment**: Production, Preview, Development
   - Click "Save"

## Step 3: Redeploy with Environment Variables

After setting environment variables, redeploy:
```bash
vercel --prod
```

## Step 4: Test Your Deployment

1. Visit your deployed URL (provided by Vercel)
2. Test the chatbot: Send a message
3. Test the dashboard: Click the dashboard link
4. Verify conversations are loading

## Project Structure (Deployed)
```
├── api/
│   ├── lib/
│   │   ├── supabase.js
│   │   ├── openai.js
│   │   └── conversation.js
│   └── index.js          # All API endpoints
├── index.html            # Main chatbot page
├── dashboard.html        # Dashboard page
├── styles.css           # Main styles
├── dashboard.css        # Dashboard styles
├── script.js           # Chatbot functionality
├── dashboard.js        # Dashboard functionality
├── vercel.json         # Vercel configuration
└── package.json        # Dependencies
```

## API Endpoints (After Deployment)
- `POST /api/chat` - Send message and get AI response
- `GET /api/conversations` - List all conversations
- `GET /api/conversation/:id` - Get specific conversation
- `POST /api/analyze-lead/:id` - Analyze lead quality
- `GET /api/health` - Health check
- `GET /api/` - API information

## Troubleshooting

### If conversations don't load:
- Check that SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set correctly
- Verify your Supabase database has the `conversations` table
- Check the Vercel function logs in the dashboard

### If chat doesn't work:
- Check that OPENAI_API_KEY is set correctly
- Verify the API key has sufficient credits
- Check the Vercel function logs for errors

### If static files don't load:
- Ensure all HTML, CSS, JS files are in the root directory
- Check that vercel.json is configured correctly

## Custom Domain (Optional)
1. Go to your Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Monitoring
- Check Vercel dashboard for deployment status
- Monitor function logs for errors
- Use Vercel Analytics for usage insights

Your chatbot will be live at: `https://your-project-name.vercel.app`
