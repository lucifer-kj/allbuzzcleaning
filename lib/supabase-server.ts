import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables on server:', {
      url: !!supabaseUrl,
      key: !!supabaseAnonKey,
    });
    // Return a mock server client to avoid crashing previews or misconfigurations
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({ single: async () => ({ data: null, error: null }) }),
        update: () => ({ eq: () => ({ select: () => ({ single: async () => ({ data: null, error: new Error('Supabase not configured') }) }) }) }),
        insert: () => ({ select: () => ({ single: async () => ({ data: null, error: new Error('Supabase not configured') }) }) }),
        delete: () => ({ eq: () => ({ select: async () => ({ data: null, error: new Error('Supabase not configured') }) }) }),
      }),
      // Minimal realtime stub
      realtime: {
        isConnected: () => false,
        isConnecting: () => false,
        isDisconnecting: () => false,
      },
      channel: () => ({ on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }) }),
      removeChannel: () => {},
    } as any;
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}
