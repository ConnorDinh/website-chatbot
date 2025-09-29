const { supabase } = require('./lib/supabase');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test Supabase connection
    const { count, error } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Supabase connection error:', error);
      return res.status(500).json({
        status: 'unhealthy',
        timestamp: new Date(),
        error: 'Database connection failed',
        details: error.message
      });
    }

    res.json({ 
      status: 'healthy', 
      timestamp: new Date(),
      conversationCount: count || 0,
      database: 'connected'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date(),
      error: 'Health check failed',
      details: error.message
    });
  }
};
