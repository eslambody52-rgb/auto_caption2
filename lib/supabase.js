const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://missing.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'missing-key';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
