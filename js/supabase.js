/* =====================================================
   FALCONX - Supabase Integration Client
   =====================================================
   PURPOSE: Initializes the Supabase client connection and
   verifies connection status without affecting LocalStorage logic.
   ===================================================== */

// Supabase configuration
const supabaseUrl = 'https://pebbggjfrbibkhgobjvl.supabase.co';
const supabaseKey = 'sb_publishable_irosogl7BQSLnKa7M_m8Ag_3DdlGwM2';

let supabase = null;

try {
  if (typeof supabaseUrl !== 'undefined' && supabaseUrl && typeof supabaseKey !== 'undefined' && supabaseKey) {
    // Initialize the client
    supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized.');
  }
} catch (e) {
  console.error('Error initializing Supabase client:', e);
}

// Function to verify connection
async function verifySupabaseConnection() {
  if (!supabase) {
    console.warn('Supabase client is not initialized.');
    return false;
  }
  try {
    // Attempt a simple query on a potential table to test connectivity
    const { data, error } = await supabase.from('products').select('*').limit(1);
    
    if (error) {
      // 401/403 indicates authentication issues (e.g. invalid key)
      if (error.status === 401 || error.status === 403) {
        console.error('Supabase connection failed: Authentication error (401/403). Check anon key.');
        return false;
      }
      
      // If the relation/table does not exist yet, the connection itself is still successfully verified!
      if (error.message && error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('Supabase Connection Verified! (Note: "products" table not found in your schema yet, which is expected).');
        return true;
      }
      
      console.warn('Supabase Connection Warning:', error.message);
      return false;
    }
    
    console.log('Supabase Connection Verified! Connected successfully and "products" table is accessible.');
    return true;
  } catch (err) {
    console.error('Supabase connection failed (Network/Other):', err);
    return false;
  }
}

// Auto-run connection check on script load
document.addEventListener('DOMContentLoaded', () => {
  // Delay slightly to ensure browser loaded everything
  setTimeout(() => {
    verifySupabaseConnection();
  }, 1000);
});
