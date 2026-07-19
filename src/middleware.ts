// src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const host = request.headers.get('host') || '';
  const isIframePreview = host.includes('run.app') || host.includes('aistudio');
  const sameSiteVal = isIframePreview ? 'none' : 'lax';

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll().map((c) => ({ name: c.name, value: c.value }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, {
              ...options,
              secure: true,
              sameSite: sameSiteVal,
              path: options.path || '/',
            });
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const url = request.nextUrl.clone();

  const segments = url.pathname.split('/');
  const locale = ['az', 'en', 'ru'].includes(segments[1]) ? segments[1] : 'az';

  // Locale redirect check for non-admin & non-api paths
  const pathnameHasLocale = ['az', 'en', 'ru'].some(
    (l) => url.pathname.startsWith(`/${l}/`) || url.pathname === `/${l}`
  );

  if (!pathnameHasLocale && !url.pathname.startsWith('/api') && !url.pathname.includes('.')) {
    url.pathname = `/az${url.pathname}`;
    const redirectResponse = NextResponse.redirect(url);
    return redirectResponse;
  }

  if (url.pathname.includes('/admin')) {
    const isExactAdminRoot = url.pathname === `/${locale}/admin` || url.pathname === `/${locale}/admin/`;

    // Case 1: Not logged in
    if (!user) {
      if (!isExactAdminRoot) {
        const redirectRes = NextResponse.redirect(new URL(`/${locale}/admin`, request.url));
        supabaseResponse.cookies.getAll().forEach((c) => redirectRes.cookies.set(c.name, c.value));
        return redirectRes;
      }
      return supabaseResponse;
    }

    // Case 2: Logged in, check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'manager')) {
      const redirectRes = NextResponse.redirect(new URL(`/${locale}`, request.url));
      supabaseResponse.cookies.getAll().forEach((c) => redirectRes.cookies.set(c.name, c.value));
      return redirectRes;
    }

    // Case 3: Is admin, check 2FA status
    const { data: mfaData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    const requiresMfa = mfaData?.currentLevel === 'aal1' && mfaData?.nextLevel === 'aal2';

    if (requiresMfa) {
      const deviceId = request.cookies.get('deviceId')?.value;
      let isTrusted = false;

      if (deviceId) {
        const { data: deviceCheck } = await supabase
          .from('trusted_devices')
          .select('id, expires_at')
          .eq('user_id', user.id)
          .eq('device_id', deviceId)
          .single();

        if (deviceCheck && new Date(deviceCheck.expires_at) > new Date()) {
          isTrusted = true;
        }
      }

      if (!isTrusted) {
        if (!isExactAdminRoot) {
          const redirectRes = NextResponse.redirect(new URL(`/${locale}/admin`, request.url));
          supabaseResponse.cookies.getAll().forEach((c) => redirectRes.cookies.set(c.name, c.value));
          return redirectRes;
        }
        return supabaseResponse;
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
