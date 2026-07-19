// src/middleware.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['az', 'en', 'ru'];
const defaultLocale = 'az';

// Standard simple process-level in-memory storage for rate limiting
const rateLimits = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests/minute per IP

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const { pathname } = url;
  
  // 1. RATE LIMITING & IP CONTROL FOR API ROUTES
  if (pathname.startsWith('/api')) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || '127.0.0.1';
    const now = Date.now();
    const rateData = rateLimits.get(ip);

    if (!rateData || (now - rateData.lastReset) > RATE_LIMIT_WINDOW_MS) {
      rateLimits.set(ip, { count: 1, lastReset: now });
    } else {
      rateData.count += 1;
      if (rateData.count > MAX_REQUESTS_PER_WINDOW) {
        return new NextResponse(
          JSON.stringify({ error: 'Çox sayda sorğu göndərilib. Zəhmət olmasa bir az gözləyin.' }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': '60',
            },
          }
        );
      }
    }
  }

  // 2. CSRF PROTECTION for API Mutations
  if (pathname.startsWith('/api') && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    if (origin) {
      try {
        const originUrl = new URL(origin);
        if (originUrl.host !== host) {
          return new NextResponse(
            JSON.stringify({ error: 'CSRF qorunması xətası: İcazəsiz mənşə (origin).' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        }
      } catch (e) {
        return new NextResponse(
          JSON.stringify({ error: 'CSRF qorunması xətası: Yanlış mənşə (origin) formatı.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
  }

  // 3. SECURE SESSION & ROUTING PROTECTION FOR ADMIN ROUTES
  // Check if target is admin route: /locale/admin/... or /admin/...
  const isAdminRoute = !!pathname.match(/^\/(az|en|ru)\/admin(\/.*)?$/) || pathname.startsWith('/admin');
  const isExactAdminRoot = !!pathname.match(/^\/(az|en|ru)\/admin\/?$/) || pathname === '/admin' || pathname === '/admin/';
  const locale = pathname.split('/')[1] || defaultLocale;

  let response = NextResponse.next();

  if (isAdminRoute) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (supabaseUrl && supabaseAnonKey) {
      const host = request.headers.get('host') || '';
      const referer = request.headers.get('referer') || '';
      const secFetchDest = request.headers.get('sec-fetch-dest') || '';

      const isIframe = secFetchDest === 'iframe' || referer.includes('ai.studio') || referer.includes('google.com');
      const isRunApp = host.includes('.run.app');
      const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
      const sameSiteValue = (isIframe || isRunApp) ? 'none' : 'lax';

      const supabaseServer = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value, options }) => {
              const secureOptions = {
                ...options,
                secure: isLocalhost ? false : true,
                sameSite: sameSiteValue as any,
                path: options.path || '/',
              };
              request.cookies.set(name, value, secureOptions);
            });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            cookiesToSet.forEach(({ name, value, options }) => {
              const secureOptions = {
                ...options,
                secure: isLocalhost ? false : true,
                sameSite: sameSiteValue as any,
                path: options.path || '/',
              };
              response.cookies.set(name, value, secureOptions);
            });
          },
        },
      });

      try {
        const { data: { user } } = await supabaseServer.auth.getUser();

        if (!user) {
          if (!isExactAdminRoot) {
            return NextResponse.redirect(new URL(`/${locale}/admin`, request.url));
          }
          addSecurityHeaders(response);
          return response;
        }

        // Check user role from profiles table
        const { data: profile } = await supabaseServer
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        const userRole = profile?.role || user.user_metadata?.role || user.app_metadata?.role;
        if (userRole !== 'admin' && userRole !== 'manager') {
          return NextResponse.redirect(new URL(`/${locale}`, request.url));
        }

        // Check Multi-Factor Authentication Assurance Level
        const { data: aalData } = await supabaseServer.auth.mfa.getAuthenticatorAssuranceLevel();
        const currentAal = aalData?.currentLevel; // 'aal1' or 'aal2'
        const nextAal = aalData?.nextLevel;       // 'aal1' or 'aal2'

        // If MFA is active/required, but user has only passed AAL1
        if (nextAal === 'aal2' && currentAal !== 'aal2') {
          const deviceId = request.cookies.get('deviceId')?.value;
          let isDeviceTrusted = false;

          if (deviceId) {
            const { data: trustedDevice } = await supabaseServer
              .from('trusted_devices')
              .select('*')
              .eq('user_id', user.id)
              .eq('device_id', deviceId)
              .gt('expires_at', new Date().toISOString())
              .single();

            if (trustedDevice) {
              isDeviceTrusted = true;
              // Update last_used_at timestamp on the trusted device record asynchronously
              await supabaseServer
                .from('trusted_devices')
                .update({ last_used_at: new Date().toISOString() })
                .eq('id', trustedDevice.id);
            }
          }

          if (!isDeviceTrusted) {
            if (!isExactAdminRoot) {
              return NextResponse.redirect(new URL(`/${locale}/admin`, request.url));
            }
            addSecurityHeaders(response);
            return response;
          }
        }

        // If authenticated (and AAL2 is verified, or bypassed via device trust, or no MFA configured),
        // and visiting the exact login root, redirect them to admin CMS page to prevent re-login view.
        if (isExactAdminRoot) {
          return NextResponse.redirect(new URL(`/${locale}/admin/cms`, request.url));
        }
      } catch (error) {
        console.error('Middleware Supabase auth check error:', error);
      }
    }
  }

  // 4. LOCALE REDIRECT CHECK FOR NON-ADMIN & NON-API STATIC PATHS
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale && !pathname.startsWith('/api') && !pathname.includes('.')) {
    request.nextUrl.pathname = `/${defaultLocale}${pathname}`;
    const redirectResponse = NextResponse.redirect(request.nextUrl);
    addSecurityHeaders(redirectResponse);
    return redirectResponse;
  }

  // 5. SECURITY HEADERS
  addSecurityHeaders(response);

  return response;
}

function addSecurityHeaders(res: NextResponse) {
  // Prevent MIME sniffing
  res.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Referrer policy
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // XSS protection
  res.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Strict Transport Security (HSTS)
  res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Content Security Policy - relaxed to allow AI Studio framing and remote fetches/connections
  res.headers.set(
    'Content-Security-Policy',
    "default-src 'self' https: http: 'unsafe-inline' 'unsafe-eval' data: blob:; " +
    "frame-ancestors 'self' https://*.google.com https://*.studio https://*.ai.studio; " +
    "connect-src 'self' https: http: wss: ws:;"
  );
}

export const config = {
  matcher: [
    // Skip static files & Next.js internals, run on everything else
    '/((?!_next|.*\\..*).*)',
  ],
};
