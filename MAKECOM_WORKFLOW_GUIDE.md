# Make.com Workflow: Webhook → OpenAI → Customer Data Extraction

This guide shows how to create a Make.com workflow that receives customer messages via webhook and uses OpenAI to extract structured customer information.

## Workflow Overview

```
Webhook Trigger → OpenAI Analysis → Data Processing → Output Actions
```

## Step-by-Step Workflow Setup

### 1. Webhook Trigger
- **Module**: Webhooks > Custom webhook
- **Purpose**: Receive customer messages from the chatbot
- **Expected Payload**:
```json
{
  "conversationId": "conv_123456",
  "customerMessages": [
    {
      "role": "user",
      "content": "Hi, I'd like to book a manicure",
      "timestamp": "2024-01-15T10:30:00Z"
    },
    {
      "role": "assistant", 
      "content": "Hello! I'd be happy to help you book a manicure. What type of manicure are you interested in?",
      "timestamp": "2024-01-15T10:30:15Z"
    },
    {
      "role": "user",
      "content": "I want a gel manicure for my wedding next week. My name is Sarah Johnson and my email is sarah@email.com",
      "timestamp": "2024-01-15T10:31:00Z"
    }
  ],
  "metadata": {
    "source": "Soco Nail Chatbot",
    "timestamp": "2024-01-15T10:31:00Z"
  }
}
```

### 2. OpenAI Analysis Module
- **Module**: OpenAI > Create a chat completion
- **Model**: gpt-4o-mini (cost-effective) or gpt-4o
- **System Prompt**: See below
- **User Message**: `{{1.customerMessages}}` (the customer messages array from webhook)

### 3. Data Processing
- **Module**: JSON > Parse JSON
- **Purpose**: Parse the structured response from OpenAI

### 4. Output Actions (Choose one or more)
- **Google Sheets**: Add row with customer data
- **Airtable**: Create record
- **Slack**: Send notification
- **Email**: Send to sales team
- **CRM**: Create lead/contact

## OpenAI System Prompt

```
You are a customer data extraction specialist for Soco Nail salon. Analyze the provided customer conversation messages and extract structured information.

The input is an array of conversation messages with this structure:
[
  {"role": "user", "content": "Customer message", "timestamp": "ISO timestamp"},
  {"role": "assistant", "content": "Bot response", "timestamp": "ISO timestamp"}
]

Extract the following information from the customer messages:
- Customer Name
- Email Address  
- Phone Number
- Service Requested
- Appointment Date/Time (if mentioned)
- Special Notes or Requirements
- Preferred Technician (if mentioned)
- Lead Quality (good/ok/spam)
- Appointment Status (booked/pending/not_booked)

Rules:
1. Only extract information explicitly mentioned by the customer (role: "user")
2. If information is not provided, use "Not provided"
3. Lead Quality: "good" if contact info provided, "ok" if engaged but limited info, "spam" if no meaningful engagement
4. Be conservative with lead quality assessment
5. Focus on the actual conversation content, not timestamps

Return ONLY a valid JSON object with this exact structure:
{
  "customerName": "string",
  "customerEmail": "string", 
  "customerPhone": "string",
  "customerService": "string",
  "appointmentTime": "string",
  "specialNotes": "string",
  "preferredTechnician": "string",
  "leadQuality": "good|ok|spam",
  "appointmentStatus": "booked|pending|not_booked",
  "extractedAt": "ISO timestamp"
}
```

## Workflow Configuration

### Webhook Settings
- **Webhook URL**: Copy from Make.com webhook module
- **HTTP Method**: POST
- **Content Type**: application/json

### OpenAI Settings
- **Model**: gpt-4o-mini
- **Max Tokens**: 500
- **Temperature**: 0.1
- **Response Format**: JSON Object

### Data Mapping
Map the OpenAI response to your output modules:

| OpenAI Field | Google Sheets Column | Airtable Field | Notes |
|--------------|---------------------|----------------|-------|
| customerName | Customer Name | Name | |
| customerEmail | Email | Email | |
| customerPhone | Phone | Phone | |
| customerService | Service | Service | |
| appointmentTime | Appointment Time | Appointment Time | |
| leadQuality | Lead Quality | Lead Quality | |
| appointmentStatus | Status | Status | |

## Error Handling

### 1. OpenAI API Errors
- **Module**: Error handling
- **Action**: Send notification to admin
- **Fallback**: Store raw data for manual review

### 2. Invalid JSON Response
- **Module**: JSON validation
- **Action**: Retry with different prompt
- **Fallback**: Use basic extraction

### 3. Webhook Timeout
- **Module**: Webhook settings
- **Timeout**: 30 seconds
- **Retry**: 3 attempts

## Testing the Workflow

### 1. Test with Sample Data
Use the webhook test page to send sample customer messages:

```json
{
  "conversationId": "test_123",
  "customerMessages": [
    {
      "role": "user",
      "content": "Hi, I need to book a pedicure for this weekend. My name is Maria Garcia, email maria@example.com, phone 555-1234",
      "timestamp": "2024-01-15T10:30:00Z"
    },
    {
      "role": "assistant",
      "content": "Hello Maria! I'd be happy to help you book a pedicure. What day this weekend works best for you?",
      "timestamp": "2024-01-15T10:30:15Z"
    },
    {
      "role": "user", 
      "content": "Saturday afternoon would be perfect. Around 2 PM if possible.",
      "timestamp": "2024-01-15T10:31:00Z"
    }
  ]
}
```

### 2. Expected Output
```json
{
  "customerName": "Maria Garcia",
  "customerEmail": "maria@example.com",
  "customerPhone": "555-1234", 
  "customerService": "Pedicure",
  "appointmentTime": "Saturday 2 PM",
  "specialNotes": "Weekend appointment",
  "preferredTechnician": "Not provided",
  "leadQuality": "good",
  "appointmentStatus": "pending",
  "extractedAt": "2024-01-15T10:31:30Z"
}
```

## Advanced Features

### 1. Lead Scoring
Add custom logic to score leads based on:
- Contact information completeness
- Service value
- Urgency indicators
- Engagement level

### 2. Duplicate Detection
- Check existing customers by email/phone
- Update vs. create new records
- Merge conversation data

### 3. Follow-up Automation
- Send confirmation emails
- Schedule follow-up calls
- Add to marketing sequences

## Monitoring and Analytics

### 1. Success Metrics
- Webhook success rate
- OpenAI extraction accuracy
- Data completeness rate
- Processing time

### 2. Error Tracking
- Failed extractions
- Invalid responses
- API timeouts
- Data validation errors

## Cost Optimization

### 1. OpenAI Usage
- Use gpt-4o-mini for cost efficiency
- Limit max tokens to 500
- Cache similar conversations
- Batch processing when possible

### 2. Webhook Efficiency
- Compress payloads
- Use webhook signatures for security
- Implement rate limiting
- Monitor usage patterns

## Security Considerations

### 1. Data Protection
- Encrypt sensitive customer data
- Use HTTPS for all communications
- Implement webhook signatures
- Regular security audits

### 2. Access Control
- Limit webhook access
- Use API keys for OpenAI
- Monitor access logs
- Implement user permissions

## Troubleshooting

### Common Issues
1. **Webhook not receiving data**: Check URL and authentication
2. **OpenAI returning invalid JSON**: Adjust prompt and add validation
3. **Slow processing**: Optimize prompt length and model selection
4. **Missing data**: Improve extraction prompt and add fallbacks

### Debug Steps
1. Test webhook with Postman/curl
2. Check OpenAI API logs
3. Validate JSON responses
4. Monitor Make.com execution logs
5. Test with different conversation types
