import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    return NextResponse.json({
      hasSession: !!session,
      sessionId: session?.access_token ? 'present' : 'missing',
      userId: session?.user?.id || 'no-user',
      userEmail: session?.user?.email || 'no-email',
      error: error?.message || null,
      cookies: {
        hasAuthCookies: cookieStore.getAll().filter(c => c.name.includes('supabase')).length > 0,
        cookieNames: cookieStore.getAll().map(c => c.name).filter(n => n.includes('supabase'))
      }
    });
  } catch (err) {
    return NextResponse.json({
      error: 'Failed to get session',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
}