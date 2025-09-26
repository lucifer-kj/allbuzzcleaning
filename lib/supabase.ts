import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables:', {
      url: !!supabaseUrl,
      key: !!supabaseAnonKey
    });
    
    // Return a mock client to prevent crashes
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signOut: () => Promise.resolve({ error: null }),
        signInWithOAuth: () => Promise.resolve({ error: new Error('Supabase not configured') })
      },
      realtime: {
        isConnected: () => false,
        isConnecting: () => false,
        isDisconnecting: () => false
      },
      channel: () => ({
        on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) })
      }),
      removeChannel: () => {}
    } as any;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
