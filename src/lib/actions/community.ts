'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface LoyaltyUser {
  user_id: string;
  name: string;
  email: string;
  balance: number;
  tier: 'Bürünc' | 'Gümüş' | 'Qızıl' | 'Platin';
  updated_at: string;
}

export interface NewsletterSub {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

// 1. Get loyalty program participants
export async function getLoyaltyParticipants() {
  try {
    const supabase = await createServerSupabaseClient();

    // Get profiles
    const { data: profiles, error: pError } = await supabase
      .from('profiles')
      .select('id, full_name, email');

    if (pError) throw pError;

    // Get loyalty records
    const { data: loyalty, error: lError } = await supabase
      .from('loyalty_points')
      .select('*');

    if (lError) throw lError;

    const loyaltyMap = new Map<string, number>();
    const loyaltyTimeMap = new Map<string, string>();
    if (loyalty) {
      for (const record of loyalty) {
        loyaltyMap.set(record.user_id, record.balance);
        loyaltyTimeMap.set(record.user_id, record.updated_at);
      }
    }

    const participants: LoyaltyUser[] = (profiles || []).map(p => {
      const balance = loyaltyMap.get(p.id) || 0;
      const updated_at = loyaltyTimeMap.get(p.id) || p.created_at || new Date().toISOString();

      let tier: LoyaltyUser['tier'] = 'Bürünc';
      if (balance >= 1000) tier = 'Platin';
      else if (balance >= 500) tier = 'Qızıl';
      else if (balance >= 200) tier = 'Gümüş';

      return {
        user_id: p.id,
        name: p.full_name || 'Qeydiyyatlı İstifadəçi',
        email: p.email || '',
        balance,
        tier,
        updated_at
      };
    });

    return { success: true, participants };
  } catch (error: any) {
    return { success: false, error: error.message, participants: [] };
  }
}

// 2. Add or update manual loyalty points for user
export async function updateLoyaltyPoints(userId: string, points: number) {
  try {
    const supabase = await createServerSupabaseClient();

    // Check if record exists
    const { data: existing } = await supabase
      .from('loyalty_points')
      .select('balance')
      .eq('user_id', userId)
      .maybeSingle();

    let res;
    if (existing) {
      res = await supabase
        .from('loyalty_points')
        .update({
          balance: Math.max(0, points),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
    } else {
      res = await supabase
        .from('loyalty_points')
        .insert([{
          user_id: userId,
          balance: Math.max(0, points)
        }]);
    }

    if (res.error) throw res.error;
    revalidatePath('/admin/marketing/loyalty');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 3. Get all newsletter subscribers
export async function getNewsletterSubscribers() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, subscribers: (data as NewsletterSub[]) || [] };
  } catch (error: any) {
    return { success: false, error: error.message, subscribers: [] };
  }
}

// 4. Add newsletter subscriber (from public pages/footer)
export async function subscribeToNewsletter(email: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert([{ email: email.trim().toLowerCase(), is_active: true }])
      .select()
      .single();

    if (error) throw error;
    return { success: true, subscriber: data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
