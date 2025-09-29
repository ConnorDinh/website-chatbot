const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://cnmncnbpikvbpfuykhby.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNubW5jbmJwaWt2YnBmdXlraGJ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTA2NjMzMSwiZXhwIjoyMDc0NjQyMzMxfQ.oL3SV_pmxNZlNRiWILxVGKZTn-hC4FmGwFwh83CnL2s'
);

module.exports = { supabase };
