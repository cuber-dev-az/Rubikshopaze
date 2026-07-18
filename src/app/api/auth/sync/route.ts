export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { access_token, refresh_token } = await req.json();

    if (!access_token) {
      // Logout request, clear session cookies directly in the response
      const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
      const supabase = await createRouteHandlerSupabaseClient(req, response);
      await supabase.auth.signOut();
      return response;
    }

    // Temporary response object to collect cookies during setSession call
    const cookieCollectorResponse = NextResponse.json({ success: true });
    const supabase = await createRouteHandlerSupabaseClient(req, cookieCollectorResponse);
    
    // Set session in Supabase client which triggers cookie setting via setAll onto the cookieCollectorResponse object
    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token: refresh_token || '',
    });

    if (error || !data.user) {
      return NextResponse.json({ error: error?.message || 'Failed to authenticate session' }, { status: 401 });
    }

    const user = data.user;

    // Use admin client to query/insert the profile row, bypassing client-side RLS limits for profile creation
    const adminSupabase = createAdminSupabaseClient();
    
    const { data: existingProfile, error: profileError } = await adminSupabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !existingProfile) {
      console.log(`Creating missing profile for user ${user.id} (${user.email})`);
      
      // Auto-assign admin if email matches the admin list
      let role = 'customer';
      const adminEmails = ['rubikshopaz@gmail.com', 'mirselimsahbazov2@gmail.com'];
      if (user.email && adminEmails.includes(user.email.toLowerCase())) {
        role = 'admin';
      }

      const { error: insertError } = await adminSupabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || '',
          phone: user.user_metadata?.phone || '',
          role: role,
        });

      if (insertError) {
        console.error('Failed to create user profile during session sync:', insertError.message);
        const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
        return NextResponse.json({ 
          error: `Profil yaradıla bilmədi: ${insertError.message}. ${
            !hasServiceKey ? 'Vercel mühitində SUPABASE_SERVICE_ROLE_KEY təyin edilməyib.' : 'Zəhmət olmasa SUPABASE_SERVICE_ROLE_KEY-in düzgünlüyünü yoxlayın.'
          }` 
        }, { status: 500 });
      }
    } else {
      // If profile exists, ensure email is correct
      if (!existingProfile.email && user.email) {
        await adminSupabase
          .from('profiles')
          .update({ email: user.email })
          .eq('id', user.id);
      }
      // Ensure the role is updated to admin for specified administrator emails
      const adminEmails = ['rubikshopaz@gmail.com', 'mirselimsahbazov2@gmail.com'];
      if (user.email && adminEmails.includes(user.email.toLowerCase()) && existingProfile.role !== 'admin') {
        const { error: updateError } = await adminSupabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', user.id);

        if (updateError) {
          console.error('Failed to update user role during session sync:', updateError.message);
          const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
          return NextResponse.json({ 
            error: `Admin rolunuz yenilənə bilmədi: ${updateError.message}. ${
              !hasServiceKey ? 'Vercel mühitində SUPABASE_SERVICE_ROLE_KEY təyin edilməyib.' : 'Zəhmət olmasa SUPABASE_SERVICE_ROLE_KEY-in düzgünlüyünü yoxlayın.'
            }` 
          }, { status: 500 });
        }
      }
    }

    // Prepare the final response and copy the session cookies over to it
    const finalResponse = NextResponse.json({ success: true, user });
    cookieCollectorResponse.headers.getSetCookie().forEach((cookie) => {
      finalResponse.headers.append('Set-Cookie', cookie);
    });

    return finalResponse;
  } catch (err: any) {
    console.error('Session sync API exception:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
