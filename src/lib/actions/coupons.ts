'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function validateCoupon(code: string, cartTotal: number) {
  try {
    const supabase = await createServerSupabaseClient();
    const cleanCode = code.trim().toUpperCase();
    
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', cleanCode)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    
    if (!coupon) {
      return { success: false, error: 'Kupon kodu tapılmadı və ya aktiv deyil.' };
    }

    // Check expiration
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return { success: false, error: 'Bu kuponun vaxtı bitib.' };
    }

    // Check usage limits
    if (coupon.usage_limit && coupon.usage_count && coupon.usage_count >= coupon.usage_limit) {
      return { success: false, error: 'Bu kupon artıq limitə çatıb.' };
    }

    // Check min spend
    if (coupon.min_spend && cartTotal < coupon.min_spend) {
      return { success: false, error: `Bu kupon üçün minimum sifariş məbləği ${coupon.min_spend} AZN olmalıdır.` };
    }

    return { 
      success: true, 
      coupon: {
        code: coupon.code,
        discount_type: coupon.discount_type, // 'percentage' | 'fixed'
        discount_value: coupon.discount_value
      } 
    };
  } catch (error: any) {
    console.error('validateCoupon Error:', error.message);
    return { success: false, error: 'Kupon yoxlanılarkən xəta baş verdi.' };
  }
}
