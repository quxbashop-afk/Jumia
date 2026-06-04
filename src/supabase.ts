import { createClient } from '@supabase/supabase-js';

// Read and clean configuration from environment variables
const getCleanEnvVar = (val: string | undefined): string => {
  if (!val) return '';
  let cleaned = val.trim();
  // Strip outer quotes if present
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
};

const rawUrl = getCleanEnvVar(import.meta.env.VITE_SUPABASE_URL);
const rawKey = getCleanEnvVar(import.meta.env.VITE_SUPABASE_ANON_KEY);

const isValidHttpUrl = (url: string): boolean => {
  return url.startsWith('http://') || url.startsWith('https://');
};

// Determine if Supabase credentials have been fully and properly provided by the user
export const isSupabaseEnabled = Boolean(rawUrl && rawKey && isValidHttpUrl(rawUrl));

// Clean final parameters for client instantiation to guarantee no startup errors
const finalUrl = isSupabaseEnabled ? rawUrl : 'https://placeholder-url-please-configure.supabase.co';
const finalKey = isSupabaseEnabled ? rawKey : 'placeholder-key-please-configure';

// Log the status for the user in the browser console
if (isSupabaseEnabled) {
  console.log('⚡ Supabase is active: Quxba Platform is connected to your Supabase console database and auth!');
} else {
  console.log('ℹ️ Running in default mode with Google Firebase. Connect Supabase by setting the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your env secrets.');
}

// Initialize Supabase Client (lazily/fallback-safely instantiated)
export const supabase = createClient(finalUrl, finalKey);

/**
 * Robust helper functions to interact with Supabase backend
 */

// 1. Authenticate sign-up with Email & Password
export async function supabaseSignUp(email: string, pass: string, name: string) {
  if (!isSupabaseEnabled) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.auth.signUp({
    email,
    password: pass,
    options: {
      data: {
        display_name: name,
        full_name: name,
      }
    }
  });
  if (error) throw error;
  return data;
}

// 2. Authenticate sign-in with Email & Password
export async function supabaseSignIn(email: string, pass: string) {
  if (!isSupabaseEnabled) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pass,
  });
  if (error) throw error;
  return data;
}

// 3. Log out from Supabase
export async function supabaseSignOut() {
  if (!isSupabaseEnabled) return;
  const { error } = await supabase.auth.signOut();
  if (error) console.warn('Supabase logout issue:', error.message);
}

// 4. Fetch Products Table from Supabase
export async function supabaseGetProducts() {
  if (!isSupabaseEnabled) return [];
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.warn('Could not fetch products from Supabase table:', error.message);
    return [];
  }
  return data;
}

// 5. Add a product to Supabase Table
export async function supabaseAddProduct(product: any) {
  if (!isSupabaseEnabled) return null;
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select();
  if (error) throw error;
  return data;
}

// 6. Fetch Categories list from Supabase Table
export async function supabaseGetCategories() {
  if (!isSupabaseEnabled) return [];
  const { data, error } = await supabase
    .from('categories')
    .select('*');
  if (error) {
    console.warn('Could not fetch categories from Supabase table:', error.message);
    return [];
  }
  return data;
}

// 7. Add Category to Supabase
export async function supabaseAddCategory(category: any) {
  if (!isSupabaseEnabled) return null;
  const { data, error } = await supabase
    .from('categories')
    .insert([category])
    .select();
  if (error) {
    console.warn('Supabase add category warning (ignore if table schema differs):', error.message);
    return null;
  }
  return data;
}

// 8. Delete Category from Supabase
export async function supabaseDeleteCategory(categoryId: string) {
  if (!isSupabaseEnabled) return false;
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId);
  if (error) {
    console.warn('Supabase delete category warning:', error.message);
    return false;
  }
  return true;
}

// 9. Fetch Advertisements Table from Supabase
export async function supabaseGetAdverts() {
  if (!isSupabaseEnabled) return [];
  const { data, error } = await supabase
    .from('adverts')
    .select('*')
    .order('createdAt', { ascending: false });
  if (error) {
    console.warn('Could not fetch adverts from Supabase:', error.message);
    // Try plural form in case user created table 'advertisements'
    const { data: altData, error: altErr } = await supabase
      .from('advertisements')
      .select('*')
      .order('createdAt', { ascending: false });
    if (altErr) {
      console.warn('Could not fetch advertisements from Supabase either:', altErr.message);
      return [];
    }
    return altData;
  }
  return data;
}

// 10. Add Advertisement to Supabase
export async function supabaseAddAdvert(advert: any) {
  if (!isSupabaseEnabled) return null;
  const { data, error } = await supabase
    .from('adverts')
    .insert([advert])
    .select();
  if (error) {
    const { data: altData, error: altErr } = await supabase
      .from('advertisements')
      .insert([advert])
      .select();
    if (altErr) {
      console.warn('Supabase advert insert failed:', altErr.message);
      throw altErr;
    }
    return altData;
  }
  return data;
}

// 11. Delete Advertisement from Supabase
export async function supabaseDeleteAdvert(id: string) {
  if (!isSupabaseEnabled) return false;
  const { error } = await supabase
    .from('adverts')
    .delete()
    .eq('id', id);
  if (error) {
    const { error: altErr } = await supabase
      .from('advertisements')
      .delete()
      .eq('id', id);
    if (altErr) {
      console.warn('Supabase advert delete failed:', altErr.message);
      return false;
    }
  }
  return true;
}

// 12. Fetch Orders Table from Supabase
export async function supabaseGetOrders(email?: string, isAdmin?: boolean) {
  if (!isSupabaseEnabled) return [];
  let queryBuilder = supabase.from('orders').select('*');
  
  if (email && !isAdmin) {
    queryBuilder = queryBuilder.eq('customerEmail', email);
  }
  
  const { data, error } = await queryBuilder;
  if (error) {
    console.warn('Could not fetch orders from Supabase table:', error.message);
    return [];
  }
  return data || [];
}

// 13. Add Order to Supabase
export async function supabaseAddOrder(order: any) {
  if (!isSupabaseEnabled) return null;
  const { data, error } = await supabase
    .from('orders')
    .insert([order])
    .select();
  if (error) {
    console.warn('Supabase order insert failed:', error.message);
    throw error;
  }
  return data;
}

// 14. Update Order Status in Supabase
export async function supabaseUpdateOrderStatus(orderId: string, status: string, timestamps: any) {
  if (!isSupabaseEnabled) return false;
  const { error } = await supabase
    .from('orders')
    .update({ status, statusTimestamps: timestamps })
    .eq('id', orderId);
  if (error) {
    console.warn('Supabase order update status failed:', error.message);
    return false;
  }
  return true;
}

