# Make.com Webhook Test Page

This page allows you to test Make.com webhook integrations with customer booking data from the Soco Nail chatbot.

## Features

- **Customer Information Display**: Shows extracted customer details including:
  - Customer Name
  - Email Address
  - Phone Number
  - Service Requested
  - Appointment Time
  - Lead Quality (Good/OK/Spam)
  - Special Notes
  - Preferred Technician

- **Webhook Testing**: 
  - Input field for Make.com webhook URL
  - Test Webhook button to send customer data
  - Clear Results button to reset the display
  - Success announcement when webhook test passes

## How to Use

### Method 1: From Dashboard
1. Go to the Dashboard
2. Find a conversation that has been analyzed (shows ✓ in the Analyzed column)
3. Click the "Test Webhook" button
4. The webhook test page will open with the customer data pre-loaded

### Method 2: Direct Access
1. Navigate to `webhook-test.html` directly
2. Click "Refresh Customer Data" to load the most recent conversation data
3. Enter your Make.com webhook URL
4. Click "Test Webhook"

## Webhook Payload

The webhook sends the following JSON structure:

```json
{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+1234567890",
  "customerService": "Gel Manicure",
  "customerTime": "2024-01-15 2:00 PM",
  "customerNotes": "Special occasion",
  "customerTechnician": "Sarah",
  "leadQuality": "good",
  "appointmentBooked": true,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "source": "Soco Nail Chatbot"
}
```

## Lead Quality Categories

- **Good**: Customer provided contact details and shows genuine interest
- **OK**: Customer engaged but limited contact information
- **Spam**: No meaningful engagement or contact information

## Integration with Make.com

1. Create a new scenario in Make.com
2. Add a "Webhook" trigger
3. Copy the webhook URL
4. Paste it into the webhook test page
5. Test the integration with real customer data

## Troubleshooting

- **No customer data**: Make sure to analyze a conversation first using the "Analyze Lead" button in the dashboard
- **Webhook test fails**: Check that the webhook URL is correct and accessible
- **Data not loading**: Try refreshing the page or clearing browser cache

## Security Notes

- Customer data is stored temporarily in browser localStorage
- Webhook URLs are not stored permanently
- All data transmission uses HTTPS when deployed
