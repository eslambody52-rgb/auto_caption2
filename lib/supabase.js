const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

let supabase = null;
try {
    supabase = createClient(supabaseUrl, supabaseKey);
} catch (e) {
    console.error("Supabase init failed:", e.message);
}

module.exports = supabase;
