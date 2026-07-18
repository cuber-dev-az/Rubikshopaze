// src/lib/actions/admin.ts

'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// =========================================================================
// ORDERS MANAGEMENT
// =========================================================================

export async function getOrders() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, variants(*, products(*))))')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Map database enterprise schema columns back to expected frontend fields
    const mappedOrders = (data || []).map((order: any) => {
      const shippingAddressStr = order.shipping_address || '';
      const hasInstagram = shippingAddressStr.includes(' | Instagram: @');
      const deliveryAddress = hasInstagram 
        ? shippingAddressStr.split(' | Instagram: @')[0] 
        : shippingAddressStr;
      const customerInstagram = hasInstagram 
        ? shippingAddressStr.split(' | Instagram: @')[1] 
        : 'Yoxdur';

      return {
        ...order,
        customer_name: order.full_name,
        customer_phone: order.phone,
        customer_instagram: customerInstagram,
        delivery_address: deliveryAddress,
        delivery_method: deliveryAddress.includes('Metrosu') ? 'Metro' : 'Courier',
        total_amount_azn: Number(order.total),
        checkout_platform: 'whatsapp',
        status: order.shipping_status === 'pending' ? 'pending' : (order.shipping_status === 'delivered' ? 'completed' : 'cancelled'),
        order_items: order.order_items?.map((item: any) => ({
          ...item,
          product_title: item.variants?.products?.title_az || 'Məhsul',
          unit_price_azn: Number(item.price_azn),
          subtotal_azn: Number(item.total_azn),
          image_url: item.variants?.products?.image_url || 'https://picsum.photos/seed/boxart/200/200'
        })) || []
      };
    });

    return { success: true, data: mappedOrders };
  } catch (error: any) {
    console.error('getOrders Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function updateOrderStatus(orderId: string, status: 'pending' | 'shipped' | 'delivered' | 'returned') {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('orders')
      .update({ shipping_status: status })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    revalidatePath('/[locale]/admin', 'page');
    return { success: true, data };
  } catch (error: any) {
    console.error('updateOrderStatus Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function updatePaymentStatus(orderId: string, status: 'pending' | 'paid' | 'failed' | 'refunded') {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('orders')
      .update({ payment_status: status })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    revalidatePath('/[locale]/admin', 'page');
    return { success: true, data };
  } catch (error: any) {
    console.error('updatePaymentStatus Error:', error.message);
    return { success: false, error: error.message };
  }
}


// =========================================================================
// INVENTORY & WAREHOUSES
// =========================================================================

export async function getWarehouses() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('warehouses')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('getWarehouses Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function createWarehouse(name: string, location?: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('warehouses')
      .insert({ name, location, is_active: true })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('createWarehouse Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function getInventoryByWarehouse(warehouseId: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('inventory')
      .select('*, variants(*, products(*))')
      .eq('warehouse_id', warehouseId);

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('getInventoryByWarehouse Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function updateInventoryQuantity(warehouseId: string, variantId: string, quantity: number) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('inventory')
      .upsert({
        warehouse_id: warehouseId,
        variant_id: variantId,
        quantity,
      }, { onConflict: 'warehouse_id,variant_id' })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('updateInventoryQuantity Error:', error.message);
    return { success: false, error: error.message };
  }
}


// =========================================================================
// RETURNS & REFUNDS
// =========================================================================

export async function getReturns() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('returns')
      .select('*, return_items(*, variants(*, products(*))))')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('getReturns Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function approveReturn(returnId: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('returns')
      .update({ status: 'approved' })
      .eq('id', returnId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('approveReturn Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function createRefund(payload: {
  return_id?: string;
  payment_id: string;
  amount: number;
}) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('refunds')
      .insert({
        return_id: payload.return_id || null,
        payment_id: payload.payment_id,
        amount: payload.amount,
        status: 'completed',
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('createRefund Error:', error.message);
    return { success: false, error: error.message };
  }
}


// =========================================================================
// ANALYTICS & REPORTS
// =========================================================================

export async function getDashboardStats() {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Fetch total orders, products count, total sales, pending tickets
    const [ordersRes, productsRes, ticketsRes] = await Promise.all([
      supabase.from('orders').select('total, created_at'),
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('status', 'open')
    ]);

    if (ordersRes.error) throw ordersRes.error;
    if (productsRes.error) throw productsRes.error;
    if (ticketsRes.error) throw ticketsRes.error;

    const totalSales = (ordersRes.data || []).reduce((sum, order) => sum + Number(order.total || 0), 0);
    const totalOrders = ordersRes.data?.length || 0;
    const totalProducts = productsRes.count || 0;
    const openSupportTickets = ticketsRes.count || 0;

    return {
      success: true,
      stats: {
        totalSales,
        totalOrders,
        totalProducts,
        openSupportTickets,
      }
    };
  } catch (error: any) {
    console.error('getDashboardStats Error:', error.message);
    return { success: false, error: error.message };
  }
}


// =========================================================================
// NOTIFICATIONS ACTIONS
// =========================================================================

export async function sendGlobalNotification(payload: {
  title_az: string;
  title_en: string;
  title_ru: string;
  message_az: string;
  message_en: string;
  message_ru: string;
}) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get all users
    const { data: users, error: userError } = await supabase.from('profiles').select('id');
    if (userError) throw userError;

    if (users && users.length > 0) {
      const inserts = users.map((user: any) => ({
        user_id: user.id,
        title_az: payload.title_az,
        title_en: payload.title_en,
        title_ru: payload.title_ru,
        message_az: payload.message_az,
        message_en: payload.message_en,
        message_ru: payload.message_ru,
        is_read: false,
      }));

      const { error } = await supabase.from('notifications').insert(inserts);
      if (error) throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error('sendGlobalNotification Error:', error.message);
    return { success: false, error: error.message };
  }
}


// =========================================================================
// CMS PAGES (CMS)
// =========================================================================

export async function getCMSPages() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .order('title_az', { ascending: true });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('getCMSPages Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function createCMSPage(payload: {
  title_az: string;
  title_en: string;
  title_ru: string;
  slug: string;
  content_az: string;
  content_en: string;
  content_ru: string;
}) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('pages')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    revalidatePath('/[locale]', 'layout');
    return { success: true, data };
  } catch (error: any) {
    console.error('createCMSPage Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function updateCMSPage(id: string, payload: Partial<{
  title_az: string;
  title_en: string;
  title_ru: string;
  slug: string;
  content_az: string;
  content_en: string;
  content_ru: string;
}>) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('pages')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    revalidatePath('/[locale]', 'layout');
    return { success: true, data };
  } catch (error: any) {
    console.error('updateCMSPage Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function deleteCMSPage(id: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.from('pages').delete().eq('id', id);
    if (error) throw error;
    revalidatePath('/[locale]', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error('deleteCMSPage Error:', error.message);
    return { success: false, error: error.message };
  }
}


// =========================================================================
// BANNERS ACTIONS
// =========================================================================

export async function getBanners() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('getBanners Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function createBanner(payload: {
  title_az?: string;
  title_en?: string;
  title_ru?: string;
  subtitle_az?: string;
  subtitle_en?: string;
  subtitle_ru?: string;
  image_url: string;
  link_url?: string;
  location: 'hero' | 'promo' | 'sidebar' | 'footer';
  is_active?: boolean;
}) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('banners')
      .insert({
        ...payload,
        is_active: payload.is_active ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    revalidatePath('/[locale]', 'layout');
    return { success: true, data };
  } catch (error: any) {
    console.error('createBanner Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function updateBanner(id: string, payload: Partial<{
  title_az: string;
  title_en: string;
  title_ru: string;
  subtitle_az: string;
  subtitle_en: string;
  subtitle_ru: string;
  image_url: string;
  link_url: string;
  location: 'hero' | 'promo' | 'sidebar' | 'footer';
  is_active: boolean;
}>) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('banners')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    revalidatePath('/[locale]', 'layout');
    return { success: true, data };
  } catch (error: any) {
    console.error('updateBanner Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function deleteBanner(id: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.from('banners').delete().eq('id', id);
    if (error) throw error;
    revalidatePath('/[locale]', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error('deleteBanner Error:', error.message);
    return { success: false, error: error.message };
  }
}


// =========================================================================
// REGISTER UPLOADED FILES
// =========================================================================

export async function registerUploadedFile(payload: {
  name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
}) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('files')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('registerUploadedFile Error:', error.message);
    return { success: false, error: error.message };
  }
}
