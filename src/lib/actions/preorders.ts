// src/lib/actions/preorders.ts

'use server';

import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface PreorderItem {
  id: string;
  preorder_code: string;
  user_id?: string | null;
  product_id: string;
  variant_id?: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  quantity: number;
  status: 'pending_payment' | 'paid_confirmed' | 'assigned' | 'fulfilled' | 'cancelled';
  order_id?: string | null;
  admin_notes?: string | null;
  created_at: string;
  paid_at?: string | null;
  updated_at: string;
  queue_position?: number | null;
  product?: {
    id: string;
    title_az: string;
    title_en?: string;
    title_ru?: string;
    image_url: string;
    price_azn: number;
    stock_quantity: number;
    allow_preorder?: boolean;
    preorder_lead_time?: string;
    slug: string;
  } | null;
  variant?: {
    id: string;
    name?: string;
    title_az?: string;
  } | null;
}

export interface SupplierReportItem {
  product_id: string;
  product_title: string;
  product_image: string;
  product_slug: string;
  current_stock: number;
  total_preorder_quantity: number;
  confirmed_preorders_count: number;
  preorders_list: {
    id: string;
    preorder_code: string;
    customer_name: string;
    customer_phone: string;
    quantity: number;
    paid_at?: string | null;
    status: string;
  }[];
  lead_time: string;
}

/**
 * Generate a collision-resistant unique pre-order code
 * Format: RC-YYYY-XXXX (e.g., RC-2026-A8K9)
 */

function generatePreorderCode(): string {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `RC-${year}-${randomPart}`;
}

/**
 * Create a new Pre-order record
 */
export async function createPreorderAction(payload: {
  product_id: string;
  variant_id?: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  quantity?: number;
  user_id?: string | null;
  admin_notes?: string | null;
}) {
  try {
    const supabase = createAdminSupabaseClient();
    const quantity = Math.max(1, Number(payload.quantity || 1));

    // Retry loop for unique preorder_code collision safety
    let code = generatePreorderCode();
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 5) {
      attempts++;
      const { data: existing } = await supabase
        .from('preorders')
        .select('id')
        .eq('preorder_code', code)
        .maybeSingle();

      if (!existing) {
        isUnique = true;
      } else {
        code = generatePreorderCode();
      }
    }

    const insertData: any = {
      preorder_code: code,
      product_id: payload.product_id,
      variant_id: payload.variant_id || null,
      customer_name: payload.customer_name.trim(),
      customer_phone: payload.customer_phone.trim(),
      customer_email: payload.customer_email?.trim() || null,
      quantity,
      status: 'pending_payment',
      user_id: payload.user_id || null,
      admin_notes: payload.admin_notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('preorders')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating preorder in database:', error.message);
      return { success: false, error: error.message };
    }

    revalidatePath('/[locale]/admin/preorders', 'page');
    return { success: true, data };
  } catch (err: any) {
    console.error('createPreorderAction Exception:', err.message || err);
    return { success: false, error: err.message || 'Ön sifariş yaradılarkən xəta baş verdi' };
  }
}

/**
 * Fetch preorders for admin with optional filtering & search
 * Dynamically computes queue position for paid_confirmed / assigned items
 */
export async function getAdminPreordersAction(params?: {
  status?: string;
  search?: string;
}) {
  try {
    const supabase = await createServerSupabaseClient();

    let query = supabase
      .from('preorders')
      .select(`
        *,
        product:products(id, title_az, title_en, title_ru, image_url, price_azn, stock_quantity, allow_preorder, preorder_lead_time, slug)
      `)
      .order('created_at', { ascending: false });

    if (params?.status && params.status !== 'all') {
      query = query.eq('status', params.status);
    }

    if (params?.search && params.search.trim()) {
      const s = `%${params.search.trim()}%`;
      query = query.or(`preorder_code.ilike.${s},customer_name.ilike.${s},customer_phone.ilike.${s},customer_email.ilike.${s}`);
    }

    const { data, error } = await query;

    if (error) {
      // If table does not exist yet (before migration), return empty array gracefully
      console.error('getAdminPreordersAction Error:', error.message);
      return { success: true, data: [] };
    }

    const preorders: PreorderItem[] = data || [];

    // Calculate dynamic FIFO queue position for paid_confirmed and assigned status
    // Items with paid_at timestamp are sorted by paid_at ASC
    const paidItems = preorders
      .filter((item) => (item.status === 'paid_confirmed' || item.status === 'assigned') && item.paid_at)
      .sort((a, b) => new Date(a.paid_at!).getTime() - new Date(b.paid_at!).getTime());

    const queueMap = new Map<string, number>();
    paidItems.forEach((item, idx) => {
      queueMap.set(item.id, idx + 1);
    });

    const enriched = preorders.map((item) => ({
      ...item,
      queue_position: queueMap.get(item.id) || null
    }));

    return { success: true, data: enriched };
  } catch (err: any) {
    console.error('getAdminPreordersAction Exception:', err.message || err);
    return { success: false, error: err.message || 'Xəta baş verdi', data: [] };
  }
}

/**
 * Supplier Summary Report (Təchizatçı Hesabatı - Çin Sifariş Sayğacı)
 * SUM(quantity) of confirmed preorders per product
 */
export async function getSupplierReportAction() {
  try {
    const supabase = await createServerSupabaseClient();

    // Query active preorders in 'paid_confirmed' or 'assigned' status
    const { data: activePreorders, error } = await supabase
      .from('preorders')
      .select(`
        *,
        product:products(id, title_az, title_en, image_url, price_azn, stock_quantity, allow_preorder, preorder_lead_time, slug)
      `)
      .in('status', ['paid_confirmed', 'assigned'])
      .order('paid_at', { ascending: true });

    if (error) {
      console.error('getSupplierReportAction Error:', error.message);
      return { success: true, report: [], total_units_to_order: 0 };
    }

    const groupMap = new Map<string, SupplierReportItem>();
    let totalUnits = 0;

    (activePreorders || []).forEach((item: any) => {
      const prodId = item.product_id;
      const qty = Number(item.quantity || 1);
      totalUnits += qty;

      const prod = item.product || {};
      const title = prod.title_az || prod.title_en || 'Məhsul';
      const image = prod.image_url || '/placeholder.png';
      const slug = prod.slug || '';
      const stock = Number(prod.stock_quantity || 0);
      const leadTime = prod.preorder_lead_time || '14-28 iş günü';

      if (!groupMap.has(prodId)) {
        groupMap.set(prodId, {
          product_id: prodId,
          product_title: title,
          product_image: image,
          product_slug: slug,
          current_stock: stock,
          total_preorder_quantity: 0,
          confirmed_preorders_count: 0,
          preorders_list: [],
          lead_time: leadTime
        });
      }

      const reportEntry = groupMap.get(prodId)!;
      reportEntry.total_preorder_quantity += qty;
      reportEntry.confirmed_preorders_count += 1;
      reportEntry.preorders_list.push({
        id: item.id,
        preorder_code: item.preorder_code,
        customer_name: item.customer_name,
        customer_phone: item.customer_phone,
        quantity: qty,
        paid_at: item.paid_at,
        status: item.status
      });
    });

    const reportArray = Array.from(groupMap.values()).sort(
      (a, b) => b.total_preorder_quantity - a.total_preorder_quantity
    );

    return {
      success: true,
      report: reportArray,
      total_units_to_order: totalUnits
    };
  } catch (err: any) {
    console.error('getSupplierReportAction Exception:', err.message || err);
    return { success: false, error: err.message, report: [], total_units_to_order: 0 };
  }
}

/**
 * Update Pre-Order status
 */
export async function updatePreorderStatusAction(
  preorder_id: string,
  new_status: 'pending_payment' | 'paid_confirmed' | 'assigned' | 'fulfilled' | 'cancelled',
  admin_notes?: string
) {
  try {
    const supabase = createAdminSupabaseClient();

    // Fetch existing preorder record
    const { data: existing, error: fetchErr } = await supabase
      .from('preorders')
      .select('*')
      .eq('id', preorder_id)
      .single();

    if (fetchErr || !existing) {
      return { success: false, error: 'Ön sifariş tapılmadı' };
    }

    const updateObj: any = {
      status: new_status,
      updated_at: new Date().toISOString()
    };

    if (admin_notes !== undefined) {
      updateObj.admin_notes = admin_notes;
    }

    // Set paid_at when transitioning to paid_confirmed
    if (new_status === 'paid_confirmed' && !existing.paid_at) {
      updateObj.paid_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('preorders')
      .update(updateObj)
      .eq('id', preorder_id)
      .select()
      .single();

    if (error) {
      console.error('updatePreorderStatusAction Error:', error.message);
      return { success: false, error: error.message };
    }

    revalidatePath('/[locale]/admin/preorders', 'page');
    return { success: true, data };
  } catch (err: any) {
    console.error('updatePreorderStatusAction Exception:', err.message || err);
    return { success: false, error: err.message || 'Status yenilənərkən xəta baş verdi' };
  }
}

/**
 * Update Pre-Order Admin Notes
 */
export async function updatePreorderNotesAction(preorder_id: string, notes: string) {
  try {
    const supabase = createAdminSupabaseClient();

    const { data, error } = await supabase
      .from('preorders')
      .update({
        admin_notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', preorder_id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/[locale]/admin/preorders', 'page');
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Qeyd saxlanılarkən xəta baş verdi' };
  }
}

/**
 * Delete a Pre-Order record
 */
export async function deletePreorderAction(preorder_id: string) {
  try {
    const supabase = createAdminSupabaseClient();

    const { error } = await supabase
      .from('preorders')
      .delete()
      .eq('id', preorder_id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/[locale]/admin/preorders', 'page');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Silinərkən xəta baş verdi' };
  }
}
