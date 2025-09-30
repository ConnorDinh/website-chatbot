// Test script to validate webhook payload structure
// Run with: node test-webhook-payload.js

const samplePayload = {
    "conversationId": "conv_123456789",
    "customerMessages": [
        {
            "role": "user",
            "content": "Hi, I'd like to book a manicure for my wedding next week",
            "timestamp": "2024-01-15T10:30:00Z"
        },
        {
            "role": "assistant",
            "content": "Hello! Congratulations on your wedding! I'd be happy to help you book a manicure. What type of manicure are you interested in?",
            "timestamp": "2024-01-15T10:30:15Z"
        },
        {
            "role": "user",
            "content": "I want a gel manicure with French tips. My name is Sarah Johnson, email is sarah.johnson@email.com, and my phone is 555-123-4567. I'd prefer Saturday afternoon around 2 PM if possible.",
            "timestamp": "2024-01-15T10:31:00Z"
        },
        {
            "role": "assistant",
            "content": "Perfect! I can help you with that. Let me check our availability for Saturday afternoon around 2 PM for a gel manicure with French tips.",
            "timestamp": "2024-01-15T10:31:15Z"
        },
        {
            "role": "user",
            "content": "Great! Do you have any specific nail artists who specialize in wedding manicures?",
            "timestamp": "2024-01-15T10:31:30Z"
        },
        {
            "role": "assistant",
            "content": "Yes! Our senior nail artist Maria specializes in wedding manicures and has excellent reviews. Would you like me to book you with her for Saturday at 2 PM?",
            "timestamp": "2024-01-15T10:31:45Z"
        },
        {
            "role": "user",
            "content": "Yes, that sounds perfect! Please book me with Maria for Saturday at 2 PM. Thank you!",
            "timestamp": "2024-01-15T10:32:00Z"
        }
    ],
    "extractedData": {
        "customerName": "Sarah Johnson",
        "customerEmail": "sarah.johnson@email.com",
        "customerPhone": "555-123-4567",
        "customerService": "Gel Manicure with French Tips",
        "customerTime": "Saturday 2 PM",
        "customerNotes": "Wedding manicure",
        "customerTechnician": "Maria",
        "leadQuality": "good",
        "appointmentBooked": true
    },
    "metadata": {
        "source": "Soco Nail Chatbot",
        "timestamp": "2024-01-15T10:32:00Z",
        "messageCount": 7
    }
};

// Expected OpenAI extraction result
const expectedExtraction = {
    "customerName": "Sarah Johnson",
    "customerEmail": "sarah.johnson@email.com",
    "customerPhone": "555-123-4567",
    "customerService": "Gel Manicure with French Tips",
    "appointmentTime": "Saturday 2 PM",
    "specialNotes": "Wedding manicure",
    "preferredTechnician": "Maria",
    "leadQuality": "good",
    "appointmentStatus": "booked",
    "extractedAt": "2024-01-15T10:32:00Z"
};

console.log('=== Webhook Payload Test ===');
console.log('Sample payload structure:');
console.log(JSON.stringify(samplePayload, null, 2));

console.log('\n=== Expected OpenAI Extraction ===');
console.log(JSON.stringify(expectedExtraction, null, 2));

console.log('\n=== Validation Tests ===');

// Test 1: Check required fields
const requiredFields = ['conversationId', 'customerMessages', 'extractedData', 'metadata'];
const missingFields = requiredFields.filter(field => !samplePayload[field]);
console.log(`✓ Required fields present: ${missingFields.length === 0 ? 'PASS' : 'FAIL'}`);
if (missingFields.length > 0) {
    console.log(`  Missing: ${missingFields.join(', ')}`);
}

// Test 2: Check customerMessages structure
const messages = samplePayload.customerMessages;
const validMessageStructure = messages.every(msg => 
    msg.role && msg.content && msg.timestamp
);
console.log(`✓ Customer messages structure: ${validMessageStructure ? 'PASS' : 'FAIL'}`);

// Test 3: Check extractedData structure
const extractedData = samplePayload.extractedData;
const requiredExtractedFields = [
    'customerName', 'customerEmail', 'customerPhone', 'customerService',
    'leadQuality', 'appointmentBooked'
];
const missingExtractedFields = requiredExtractedFields.filter(field => 
    extractedData[field] === undefined
);
console.log(`✓ Extracted data structure: ${missingExtractedFields.length === 0 ? 'PASS' : 'FAIL'}`);
if (missingExtractedFields.length > 0) {
    console.log(`  Missing: ${missingExtractedFields.join(', ')}`);
}

// Test 4: Check metadata structure
const metadata = samplePayload.metadata;
const requiredMetadataFields = ['source', 'timestamp', 'messageCount'];
const missingMetadataFields = requiredMetadataFields.filter(field => 
    metadata[field] === undefined
);
console.log(`✓ Metadata structure: ${missingMetadataFields.length === 0 ? 'PASS' : 'FAIL'}`);
if (missingMetadataFields.length > 0) {
    console.log(`  Missing: ${missingMetadataFields.join(', ')}`);
}

console.log('\n=== Make.com Integration Notes ===');
console.log('1. Webhook URL: Use the URL from your Make.com webhook module');
console.log('2. OpenAI API Key: Add your OpenAI API key in Make.com settings');
console.log('3. Google Sheets: Update spreadsheet ID and range in the template');
console.log('4. Slack: Update channel name and webhook URL');
console.log('5. Test with the webhook test page before going live');

console.log('\n=== Next Steps ===');
console.log('1. Import the scenario template into Make.com');
console.log('2. Configure your API keys and endpoints');
console.log('3. Test with the webhook test page');
console.log('4. Deploy and monitor the workflow');
