// src/app/api/auth/logout/route.ts

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const response = NextResponse.json({ success: true, message: 'Çıxış uğurla tamamlandı.' });
    
    // Initialize Supabase route handler client linked to response
    const supabase = await createRouteHandlerSupabaseClient(req, response);
    
    // Sign out globally (invalidates tokens across all devices)
    await supabase.auth.signOut({ scope: 'global' });
    
    // Determine cookie characteristics for clean extraction
    const host = req.headers.get('host') || '';
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
    const isIframe = req.headers.get('sec-fetch-dest') === 'iframe' || (req.headers.get('referer') || '').includes('ai.studio');
    const sameSiteVal = (isIframe || host.includes('.run.app')) ? 'none' : 'lax';

    // Delete custom device cookies
    response.cookies.set('x-device-id', '', {
      path: '/',
      expires: new Date(0),
      secure: !isLocalhost,
      sameSite: sameSiteVal as any,
    });

    // Extract and explicitly invalidate all Supabase-associated cookies
    const allCookies = req.cookies.getAll();
    allCookies.forEach((c) => {
      if (c.name.startsWith('sb-') || c.name.includes('supabase-') || c.name.includes('auth')) {
        response.cookies.set(c.name, '', {
          path: '/',
          expires: new Date(0),
          secure: !isLocalhost,
          sameSite: sameSiteVal as any,
        });
      }
    });

    return response;
  } catch (err: any) {
    console.error('Logout error:', err);
    return NextResponse.json({ error: err.message || 'Server xətası baş verdi.' }, { status: 500 });
  }
}
