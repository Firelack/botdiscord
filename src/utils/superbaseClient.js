// Connect to Supabase using the service_role key (server-side only, bypasses RLS)
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config(); // Load .env variables

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error(
    "❌ Erreur: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY n'est pas défini dans .env",
  );
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

module.exports = supabase;
