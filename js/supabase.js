/* =====================================================
   FALCONX - Supabase Integration Client
   =====================================================
   PURPOSE: Initializes the Supabase client connection,
   handles products database migrations, and exposes CRUD
   interfaces.
   ===================================================== */

const supabaseUrl = 'https://pebbggjfrbibkhgobjvl.supabase.co';
const supabaseKey = 'sb_publishable_irosogl7BQSLnKa7M_m8Ag_3DdlGwM2';

let supabase = null;

try {
  if (typeof supabaseUrl !== 'undefined' && supabaseUrl && typeof supabaseKey !== 'undefined' && supabaseKey) {
    supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized successfully.');
  }
} catch (e) {
  console.error('Error initializing Supabase client:', e);
}

/* =====================================================
   PRODUCT MAPPING HELPERS
   ===================================================== */
function mapToJsProduct(dbProd) {
  return {
    id: Number(dbProd.id),
    name: dbProd.name,
    price: Number(dbProd.price),
    oldPrice: dbProd.old_price !== null && dbProd.old_price !== undefined ? Number(dbProd.old_price) : null,
    category: dbProd.category,
    rating: dbProd.rating !== null && dbProd.rating !== undefined ? Number(dbProd.rating) : 0,
    reviewCount: dbProd.review_count !== null && dbProd.review_count !== undefined ? Number(dbProd.review_count) : 0,
    image: dbProd.image,
    description: dbProd.description || ''
  };
}

function mapToDbProduct(jsProd) {
  return {
    id: Number(jsProd.id),
    name: jsProd.name,
    price: Number(jsProd.price),
    old_price: jsProd.oldPrice !== undefined && jsProd.oldPrice !== null ? Number(jsProd.oldPrice) : null,
    category: jsProd.category,
    rating: jsProd.rating !== undefined && jsProd.rating !== null ? Number(jsProd.rating) : 0,
    review_count: jsProd.reviewCount !== undefined && jsProd.reviewCount !== null ? Number(jsProd.reviewCount) : 0,
    image: jsProd.image,
    description: jsProd.description || ''
  };
}

/* =====================================================
   SUPABASE PRODUCTS DATABASE API
   ===================================================== */

// Fetch all products from Supabase and synchronize with LocalStorage
async function dbGetProducts() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.warn('Could not fetch products from Supabase:', error.message);
      return null;
    }

    const jsProducts = data.map(mapToJsProduct);
    // Cache in local storage for fallback/synchronization
    localStorage.setItem('shopverse_products', JSON.stringify(jsProducts));
    
    // Dispatch event to notify other scripts (like products.js) that products updated from Supabase
    document.dispatchEvent(new CustomEvent('supabase_products_synced'));
    
    return jsProducts;
  } catch (err) {
    console.error('Error fetching products from Supabase:', err);
    return null;
  }
}

// Save or Update product in Supabase
async function dbSaveProduct(jsProduct) {
  if (!supabase) return false;
  try {
    const dbProduct = mapToDbProduct(jsProduct);
    const { error } = await supabase
      .from('products')
      .upsert(dbProduct);

    if (error) {
      console.error('Failed to save product to Supabase:', error.message);
      return false;
    }
    console.log(`Product #${jsProduct.id} saved/updated in Supabase successfully.`);
    return true;
  } catch (err) {
    console.error('Error saving product to Supabase:', err);
    return false;
  }
}

// Delete product in Supabase
async function dbDeleteProduct(id) {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', Number(id));

    if (error) {
      console.error(`Failed to delete product #${id} from Supabase:`, error.message);
      return false;
    }
    console.log(`Product #${id} deleted from Supabase successfully.`);
    return true;
  } catch (err) {
    console.error('Error deleting product from Supabase:', err);
    return false;
  }
}

// Migrate local products to Supabase if Supabase database is empty
async function dbMigrateProducts() {
  if (!supabase) return;
  try {
    // 1. Check if Supabase already has products
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (error) {
      // 401/403 means auth/anon key error
      if (error.status === 401 || error.status === 403) {
        console.error('Migration aborted: Supabase credentials authentication failed.');
        return;
      }
      // If table doesn't exist, tell the user to run SQL
      if (error.message && error.message.includes('relation') && error.message.includes('does not exist')) {
        console.error('Migration aborted: The "products" table does not exist in Supabase yet. Please run the SQL DDL commands from the implementation plan.');
        return;
      }
      console.warn('Migration status check failed:', error.message);
      return;
    }

    if (count > 0) {
      console.log(`Supabase products table is already populated (${count} items). Skipping migration. Loading from DB...`);
      await dbGetProducts();
      return;
    }

    // 2. Fetch products from Local Storage
    const localData = localStorage.getItem('shopverse_products');
    let localProducts = [];
    if (localData) {
      localProducts = JSON.parse(localData);
    }

    // Fallback if local storage is empty
    if (localProducts.length === 0) {
      console.log('No local products found to migrate.');
      return;
    }

    console.log(`Migrating ${localProducts.length} products from Local Storage to Supabase...`);

    // 3. Insert each product
    for (const prod of localProducts) {
      await dbSaveProduct(prod);
    }

    console.log('Migration completed successfully.');
    // Force refresh cache
    await dbGetProducts();
  } catch (err) {
    console.error('Error running products migration:', err);
  }
}

/* =====================================================
   USER MAPPING HELPERS
   ===================================================== */
function mapToJsUser(dbUser) {
  return {
    id: Number(dbUser.id),
    name: dbUser.name,
    email: dbUser.email,
    password: dbUser.password,
    joinDate: dbUser.join_date
  };
}

function mapToDbUser(jsUser) {
  return {
    id: Number(jsUser.id),
    name: jsUser.name,
    email: jsUser.email,
    password: jsUser.password,
    join_date: jsUser.joinDate || new Date().toISOString()
  };
}

/* =====================================================
   SUPABASE USERS DATABASE API
   ===================================================== */

// Fetch all users from Supabase and synchronize with LocalStorage
async function dbGetUsers() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.warn('Could not fetch users from Supabase:', error.message);
      return null;
    }

    const jsUsers = data.map(mapToJsUser);
    // Cache in local storage for fallback/synchronization
    localStorage.setItem('shopverse_users', JSON.stringify(jsUsers));
    
    // Dispatch event to notify other scripts that users updated from Supabase
    document.dispatchEvent(new CustomEvent('supabase_users_synced'));
    
    return jsUsers;
  } catch (err) {
    console.error('Error fetching users from Supabase:', err);
    return null;
  }
}

// Save or Update user in Supabase
async function dbSaveUser(jsUser) {
  if (!supabase) return false;
  try {
    const dbUser = mapToDbUser(jsUser);
    const { error } = await supabase
      .from('users')
      .upsert(dbUser);

    if (error) {
      console.error('Failed to save user to Supabase:', error.message);
      return false;
    }
    console.log(`User #${jsUser.id} (${jsUser.email}) saved/updated in Supabase successfully.`);
    
    // Refresh local cache
    await dbGetUsers();
    return true;
  } catch (err) {
    console.error('Error saving user to Supabase:', err);
    return false;
  }
}

// Migrate local users to Supabase if Supabase database is empty
async function dbMigrateUsers() {
  if (!supabase) return;
  try {
    // 1. Check if Supabase already has users
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (error) {
      // 401/403 means auth/anon key error
      if (error.status === 401 || error.status === 403) {
        console.error('User migration aborted: Supabase credentials authentication failed.');
        return;
      }
      // If table doesn't exist, tell the user to run SQL
      if (error.message && error.message.includes('relation') && error.message.includes('does not exist')) {
        console.error('User migration aborted: The "users" table does not exist in Supabase yet. Please run the SQL DDL commands.');
        return;
      }
      console.warn('User migration status check failed:', error.message);
      return;
    }

    if (count > 0) {
      console.log(`Supabase users table is already populated (${count} items). Skipping migration. Loading from DB...`);
      await dbGetUsers();
      return;
    }

    // 2. Fetch users from Local Storage
    const localData = localStorage.getItem('shopverse_users');
    let localUsers = [];
    if (localData) {
      localUsers = JSON.parse(localData);
    }

    if (localUsers.length === 0) {
      console.log('No local users found to migrate.');
      return;
    }

    console.log(`Migrating ${localUsers.length} users from Local Storage to Supabase...`);

    // 3. Insert each user
    for (const usr of localUsers) {
      await dbSaveUser(usr);
    }

    console.log('User migration completed successfully.');
    // Force refresh cache
    await dbGetUsers();
  } catch (err) {
    console.error('Error running users migration:', err);
  }
}

/* =====================================================
   CONNECTION TESTING & AUTO-INITIALIZATION
   ===================================================== */
async function verifySupabaseConnection() {
  if (!supabase) return false;
  try {
    const { data, error } = await supabase.from('products').select('*').limit(1);
    if (error) {
      if (error.status === 401 || error.status === 403) {
        console.error('Supabase verification failed: Auth check returned 401/403.');
        return false;
      }
      if (error.message && error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('Supabase Connection Verified! (Note: "products" table needs to be created in your Supabase SQL Editor).');
        return true;
      }
      console.warn('Supabase Connection check returned warning:', error.message);
      return false;
    }
    console.log('Supabase Connection Verified! Ready for transactions.');
    return true;
  } catch (err) {
    console.error('Supabase connection test failed:', err);
    return false;
  }
}

// Auto-run connection check and migration on load
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(async () => {
    const isOk = await verifySupabaseConnection();
    if (isOk) {
      await dbMigrateProducts();
      await dbMigrateUsers();
    }
  }, 1000);
});
