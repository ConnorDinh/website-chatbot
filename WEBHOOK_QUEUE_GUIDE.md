# Webhook Queue Management Guide

## 🚨 **Problem**: Unprocessed Data in Webhook Queue

You have webhook requests that failed or are waiting to be processed. Here's how to handle them:

## 🔧 **Solution 1: Use the Queue Manager (Recommended)**

### 1. Open Queue Manager
Navigate to `webhook-queue-manager.html` in your browser

### 2. Check Queue Status
- Click "Refresh Queue" to see all unprocessed data
- View statistics: Total, Failed, Pending, Processed
- See detailed information for each item

### 3. Process the Queue
- **Process All**: Send all pending items to your webhook
- **Retry Failed**: Retry items that previously failed
- **Individual Actions**: Process or retry specific items

## 🔧 **Solution 2: Command Line Tool**

### 1. Check Queue Status
```bash
node process-queue.js
```

### 2. Process All Unprocessed Data
```bash
node process-queue.js https://hook.eu1.make.com/your-webhook-url
```

## 🔧 **Solution 3: Manual Processing**

### 1. Use the Webhook Test Page
1. Open `webhook-test.html`
2. Click "Load All Conversations"
3. Enter your webhook URL
4. Click "Send All Conversations"

### 2. Process Individual Conversations
1. Go to Dashboard
2. Find conversations with "✓" (analyzed)
3. Click "Test Webhook" for each one

## 📊 **Understanding Queue Status**

### Status Types:
- **Pending**: Ready to be sent to webhook
- **Failed**: Previous attempt failed (can retry)
- **Success**: Successfully sent to webhook
- **Sent**: Marked as sent in database

### Common Failure Reasons:
- **Connection timeout**: Webhook server not responding
- **Invalid JSON**: Data format issues (now fixed)
- **Authentication error**: Wrong webhook URL or credentials
- **Rate limiting**: Too many requests too quickly

## 🛠️ **Troubleshooting**

### If Queue Manager Shows "No Data":
1. Make sure your server is running
2. Check if conversations have been analyzed
3. Verify database connection

### If Webhooks Keep Failing:
1. **Check webhook URL**: Make sure it's correct
2. **Test webhook**: Use the test endpoint first
3. **Check Make.com**: Ensure scenario is active
4. **Verify data format**: Use the updated null-safe format

### If Processing is Slow:
1. **Reduce batch size**: Process fewer items at once
2. **Add delays**: Small delays between requests
3. **Check rate limits**: Don't exceed webhook limits

## 📈 **Queue Statistics Explained**

- **Total in Queue**: All conversations with lead analysis
- **Failed**: Items that failed to send (can retry)
- **Pending**: Items ready to be sent
- **Processed**: Items successfully sent
- **With Email**: Conversations with customer email
- **Good Leads**: High-quality leads (contact info provided)

## 🚀 **Best Practices**

### 1. Regular Processing
- Process queue daily or weekly
- Don't let it build up too much
- Monitor for failed items

### 2. Error Handling
- Always check webhook responses
- Retry failed items
- Log errors for debugging

### 3. Data Quality
- Ensure all fields are properly formatted
- Handle null values correctly
- Validate webhook payloads

## 🔄 **Automated Processing**

### Set up a cron job to process queue automatically:
```bash
# Process queue every hour
0 * * * * cd /path/to/your/project && node process-queue.js https://your-webhook-url

# Process queue daily at 9 AM
0 9 * * * cd /path/to/your/project && node process-queue.js https://your-webhook-url
```

## 📋 **Quick Actions**

### Clear All Failed Items:
1. Open Queue Manager
2. Click "Clear Queue"
3. Confirm deletion

### Retry All Failed Items:
1. Open Queue Manager
2. Click "Retry Failed"
3. Monitor results

### Process Everything:
1. Open Queue Manager
2. Click "Process All"
3. Wait for completion

## ✅ **Success Indicators**

- All items show "Success" status
- Queue statistics show 0 pending/failed
- Data appears in your Make.com workflow
- No error messages in logs

## 🆘 **Need Help?**

If you're still having issues:

1. **Check server logs** for error details
2. **Test webhook manually** with sample data
3. **Verify Make.com scenario** is active
4. **Check database** for conversation data
5. **Use the test endpoint** to verify setup

The queue management tools will help you process all unprocessed data efficiently! 🎉
