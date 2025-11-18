// Connect to Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config(); // Load .env variables

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Erreur: SUPABASE_URL ou SUPABASE_KEY n'est pas défini dans .env");
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;  