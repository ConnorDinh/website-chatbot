#!/usr/bin/env node

// Command-line tool to process webhook queue
// Usage: node process-queue.js <webhook-url>

const https = require('https');
const http = require('http');

async function processQueue(webhookUrl) {
  console.log('🚀 Processing webhook queue...');
  console.log(`📡 Webhook URL: ${webhookUrl}`);
  console.log('');

  try {
    // Call the process-queue API
    const response = await fetch('http://localhost:3000/api/process-queue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ webhook_url: webhookUrl })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.success) {
      console.log('✅ Queue processing completed!');
      console.log(`📊 Processed: ${result.processed}`);
      console.log(`❌ Failed: ${result.failed}`);
      console.log(`📈 Total: ${result.total}`);
      console.log('');

      if (result.results && result.results.length > 0) {
        console.log('📋 Detailed Results:');
        result.results.forEach(item => {
          const status = item.status === 'success' ? '✅' : '❌';
          console.log(`  ${status} ${item.conversation_id}: ${item.customer_name}`);
          if (item.error) {
            console.log(`     Error: ${item.error}`);
          }
        });
      }
    } else {
      console.error('❌ Queue processing failed:', result.error);
      if (result.details) {
        console.error('Details:', result.details);
      }
    }

  } catch (error) {
    console.error('❌ Error processing queue:', error.message);
    console.log('');
    console.log('💡 Make sure your server is running on localhost:3000');
    console.log('💡 Or update the API URL in this script');
  }
}

async function checkQueueStatus() {
  console.log('📊 Checking queue status...');
  console.log('');

  try {
    const response = await fetch('http://localhost:3000/api/queue-status');
    const result = await response.json();

    if (result.success) {
      console.log('📈 Queue Statistics:');
      console.log(`  Total conversations: ${result.stats.total}`);
      console.log(`  Pending webhooks: ${result.stats.pending}`);
      console.log(`  Sent webhooks: ${result.stats.sent}`);
      console.log(`  With email: ${result.stats.with_email}`);
      console.log(`  Good leads: ${result.stats.good_leads}`);
      console.log('');

      if (result.stats.pending > 0) {
        console.log('⚠️  You have unprocessed webhook data!');
        console.log('💡 Run: node process-queue.js <your-webhook-url>');
      } else {
        console.log('✅ All conversations have been processed!');
      }
    } else {
      console.error('❌ Failed to check queue status:', result.error);
    }

  } catch (error) {
    console.error('❌ Error checking queue status:', error.message);
    console.log('');
    console.log('💡 Make sure your server is running on localhost:3000');
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('📋 Webhook Queue Manager');
    console.log('');
    console.log('Usage:');
    console.log('  node process-queue.js                    # Check queue status');
    console.log('  node process-queue.js <webhook-url>      # Process queue');
    console.log('');
    console.log('Examples:');
    console.log('  node process-queue.js');
    console.log('  node process-queue.js https://hook.eu1.make.com/your-webhook-url');
    console.log('');
    
    await checkQueueStatus();
  } else {
    const webhookUrl = args[0];
    await processQueue(webhookUrl);
  }
}

// Run the main function
main().catch(console.error);
