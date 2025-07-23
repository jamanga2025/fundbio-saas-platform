"use client";

import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('Initial session check:', { session: !!session, error, email: session?.user?.email });
        
        if (error) {
          console.error('Session error:', error);
          setSession(null);
          setUser(null);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (err) {
        console.error('Failed to get session:', err);
        setSession(null);
        setUser(null);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, { session: !!session, email: session?.user?.email });
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Create a compatible session object for NextAuth compatibility
  const compatibleSession = session ? {
    ...session,
    user: {
      ...session.user,
      name: session.user.email,
      role: 'FUNDACION' // Default role for now, can be customized later
    }
  } : null;

  return {
    user,
    session: compatibleSession,
    loading,
    signOut,
    supabase,
    // Compatibility with NextAuth
    status: loading ? 'loading' : session ? 'authenticated' : 'unauthenticated',
    data: compatibleSession
  };
}