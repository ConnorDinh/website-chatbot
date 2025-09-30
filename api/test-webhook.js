// Test webhook endpoint for development/testing
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Test webhook received data:', req.body);
    console.log('Headers:', req.headers);
    
    // Check for authentication (optional for test endpoint)
    const authHeader = req.headers.authorization;
    const apiKey = req.headers['x-api-key'];
    
    // Simulate authentication check
    if (authHeader && !authHeader.startsWith('Basic ') && !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Invalid authentication format',
        message: 'Expected Basic or Bearer authentication'
      });
    }
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return success response with auth info
    res.json({
      success: true,
      message: 'Webhook test successful!',
      receivedData: req.body,
      authentication: {
        hasAuth: !!(authHeader || apiKey),
        authType: authHeader ? authHeader.split(' ')[0] : (apiKey ? 'API-Key' : 'None'),
        headers: {
          authorization: authHeader || 'None',
          'x-api-key': apiKey || 'None'
        }
      },
      timestamp: new Date().toISOString(),
      processed: true
    });

  } catch (error) {
    console.error('Test webhook error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};
