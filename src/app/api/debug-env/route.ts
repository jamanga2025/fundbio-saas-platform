import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT_SET',
    supabase_anon_key_exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabase_anon_key_length: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
    supabase_service_role_exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    all_env_keys: Object.keys(process.env).filter(key => key.includes('SUPABASE'))
  });
}