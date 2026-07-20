// src/lib/actions/admin.ts

'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// =========================================================================
// ORDERS MANAGEMENT
// =========================================================================

export async function seedMockOrders() {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Check if we already have orders
    const check = await supabase.from('orders').select('id', { count: 'exact', head: true });
    if (check.count && check.count > 0) {
      return { success: true, seeded: false };
    }

    const mockOrders = [
      {
        email: 'orxan@gmail.com',
        phone: '+994 50 123 45 67',
        full_name: 'Orxan Məmmədov',
        shipping_address: 'Elmlər Akademiyası m. | Instagram: @orxan_m',
        city: 'Bakı',
        payment_method: 'card_to_card',
        payment_status: 'paid',
        shipping_status: 'delivered',
        subtotal: 145.00,
        discount: 0.00,
        shipping_fee: 0.00,
        total: 145.00,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        email: 'ayten@gmail.com',
        phone: '+994 55 987 65 43',
        full_name: 'Aytən Əliyeva',
        shipping_address: 'Gənclik parkı yaxınlığı',
        city: 'Bakı',
        payment_method: 'cash_on_delivery',
        payment_status: 'pending',
        shipping_status: 'pending',
        subtotal: 55.00,
        discount: 5.00,
        shipping_fee: 3.00,
        total: 53.00,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        email: 'tural@mail.ru',
        phone: '+994 70 555 44 33',
        full_name: 'Tural Süleymanov',
        shipping_address: '28 May metrosu çıxışı | Instagram: @tural_s',
        city: 'Bakı',
        payment_method: 'card_to_card',
        payment_status: 'paid',
        shipping_status: 'delivered',
        subtotal: 220.00,
        discount: 20.00,
        shipping_fee: 0.00,
        total: 200.00,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        email: 'leyla@box.az',
        phone: '+994 50 444 33 22',
        full_name: 'Leyla Hüseynova',
        shipping_address: 'Nərimanov m. çıxışı',
        city: 'Bakı',
        payment_method: 'cash_on_delivery',
        payment_status: 'pending',
        shipping_status: 'pending',
        subtotal: 45.00,
        discount: 0.00,
        shipping_fee: 0.00,
        total: 45.00,
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        email: 'farid@gmail.com',
        phone: '+994 77 111 22 33',
        full_name: 'Fərid Qasımov',
        shipping_address: 'Xırdalan şəhəri, blok 4',
        city: 'Xırdalan',
        payment_method: 'cash_on_delivery',
        payment_status: 'pending',
        shipping_status: 'pending',
        subtotal: 110.00,
        discount: 0.00,
        shipping_fee: 3.00,
        total: 113.00,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        email: 'gunel@code.edu.az',
        phone: '+994 50 888 77 66',
        full_name: 'Günel Həsənova',
        shipping_address: 'Sumqayıt 10-cu mkr | Instagram: @gunel_h',
        city: 'Sumqayıt',
        payment_method: 'card_to_card',
        payment_status: 'paid',
        shipping_status: 'delivered',
        subtotal: 85.00,
        discount: 0.00,
        shipping_fee: 7.00,
        total: 92.00,
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        email: 'nihad@gmail.com',
        phone: '+994 55 222 33 44',
        full_name: 'Nihad Əlizadə',
        shipping_address: 'İçərişəhər metrosu | Instagram: @nihad_a',
        city: 'Bakı',
        payment_method: 'card_to_card',
        payment_status: 'paid',
        shipping_status: 'delivered',
        subtotal: 130.00,
        discount: 10.00,
        shipping_fee: 0.00,
        total: 120.00,
        created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        email: 'sebiner@gmail.com',
        phone: '+994 50 333 44 55',
        full_name: 'Səbinə Rəhimova',
        shipping_address: 'Yasamal, İnşaatçılar pr.',
        city: 'Bakı',
        payment_method: 'cash_on_delivery',
        payment_status: 'pending',
        shipping_status: 'pending',
        subtotal: 75.00,
        discount: 0.00,
        shipping_fee: 3.00,
        total: 78.00,
        created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        email: 'muradm@gmail.com',
        phone: '+994 50 777 88 99',
        full_name: 'Murad Məmmədov',
        shipping_address: 'Xətai metrosu yaxınlığı',
        city: 'Bakı',
        payment_method: 'card_to_card',
        payment_status: 'paid',
        shipping_status: 'delivered',
        subtotal: 260.00,
        discount: 25.00,
        shipping_fee: 0.00,
        total: 235.00,
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        email: 'elvin@mail.ru',
        phone: '+994 70 999 88 11',
        full_name: 'Elvin Vəliyev',
        shipping_address: 'Badamdar qəsəbəsi',
        city: 'Bakı',
        payment_method: 'cash_on_delivery',
        payment_status: 'pending',
        shipping_status: 'shipped',
        subtotal: 90.00,
        discount: 0.00,
        shipping_fee: 3.00,
        total: 93.00,
        created_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        email: 'nigar@box.az',
        phone: '+994 50 666 55 44',
        full_name: 'Nigar Baxşəliyeva',
        shipping_address: 'Sahil metrosu',
        city: 'Bakı',
        payment_method: 'card_to_card',
        payment_status: 'paid',
        shipping_status: 'delivered',
        subtotal: 155.00,
        discount: 15.00,
        shipping_fee: 0.00,
        total: 140.00,
        created_at: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        email: 'kenan@gmail.com',
        phone: '+994 55 111 44 77',
        full_name: 'Kənan Əsgərov',
        shipping_address: 'Nəsimi r., 3-cü mkr',
        city: 'Bakı',
        payment_method: 'cash_on_delivery',
        payment_status: 'pending',
        shipping_status: 'pending',
        subtotal: 60.00,
        discount: 0.00,
        shipping_fee: 3.00,
        total: 63.00,
        created_at: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        email: 'ayxanr@gmail.com',
        phone: '+994 50 500 11 22',
        full_name: 'Ayxan Rzayev',
        shipping_address: 'Koroğlu metrosu | Instagram: @ayxan_r',
        city: 'Bakı',
        payment_method: 'card_to_card',
        payment_status: 'paid',
        shipping_status: 'delivered',
        subtotal: 195.00,
        discount: 15.00,
        shipping_fee: 0.00,
        total: 180.00,
        created_at: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    const { error } = await supabase.from('orders').insert(mockOrders);
    if (error) throw error;

    return { success: true, seeded: true };
  } catch (error: any) {
    console.error('seedMockOrders Error:', error.message);
    return { success: false, error: error.message };
  }
}

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

    // Write audit log
    try {
      const { createAuditLog } = await import('@/lib/actions/audit');
      await createAuditLog({
        action: `Sifariş statusu yeniləndi: ${status}`,
        table_name: 'orders',
        record_id: orderId,
        new_values: { shipping_status: status }
      });
    } catch (auditErr) {
      console.error('Audit logging failed:', auditErr);
    }

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

    // Write audit log
    try {
      const { createAuditLog } = await import('@/lib/actions/audit');
      await createAuditLog({
        action: `Ödəniş statusu yeniləndi: ${status}`,
        table_name: 'orders',
        record_id: orderId,
        new_values: { payment_status: status }
      });
    } catch (auditErr) {
      console.error('Audit logging failed:', auditErr);
    }

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

    const orders = ordersRes.data || [];

    const totalSales = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const totalOrders = orders.length;
    const totalProducts = productsRes.count || 0;
    const openSupportTickets = ticketsRes.count || 0;
    
    // Helper to format date as DD.MM
    const formatDate = (date: Date) => {
      const d = date.getDate();
      const m = date.getMonth() + 1;
      return `${d < 10 ? '0' : ''}${d}.${m < 10 ? '0' : ''}${m}`;
    };

    const getTrendForDays = (daysCount: number) => {
      const trend = [];
      const now = new Date();
      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        
        const dayOrders = orders.filter(o => {
          if (!o.created_at) return false;
          const orderDate = new Date(o.created_at);
          return orderDate.getFullYear() === d.getFullYear() &&
                 orderDate.getMonth() === d.getMonth() &&
                 orderDate.getDate() === d.getDate();
        });

        const revenue = dayOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
        const count = dayOrders.length;

        trend.push({
          name: formatDate(d),
          revenue,
          orders: count
        });
      }
      return trend;
    };

    const trend7Days = getTrendForDays(7);
    const trend30Days = getTrendForDays(30);

    return {
      success: true,
      stats: {
        totalSales,
        totalOrders,
        totalProducts,
        openSupportTickets,
        trend7Days,
        trend30Days,
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
  meta_title_az?: string;
  meta_title_en?: string;
  meta_title_ru?: string;
  meta_description_az?: string;
  meta_description_en?: string;
  meta_description_ru?: string;
  is_published?: boolean;
}) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('pages')
      .insert({
        ...payload,
        is_published: payload.is_published ?? true,
      })
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
  meta_title_az: string;
  meta_title_en: string;
  meta_title_ru: string;
  meta_description_az: string;
  meta_description_en: string;
  meta_description_ru: string;
  is_published: boolean;
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
      .order('sort_order', { ascending: true })
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
  sort_order?: number;
  is_active?: boolean;
}) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('banners')
      .insert({
        ...payload,
        sort_order: payload.sort_order ?? 0,
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
  sort_order: number;
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
// FAQS ACTIONS
// =========================================================================

export async function getFAQs() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('getFAQs Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function createFAQ(payload: {
  question_az: string;
  question_en: string;
  question_ru: string;
  answer_az: string;
  answer_en: string;
  answer_ru: string;
  sort_order?: number;
  is_active?: boolean;
}) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('faqs')
      .insert({
        ...payload,
        sort_order: payload.sort_order ?? 0,
        is_active: payload.is_active ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('createFAQ Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function updateFAQ(id: string, payload: Partial<{
  question_az: string;
  question_en: string;
  question_ru: string;
  answer_az: string;
  answer_en: string;
  answer_ru: string;
  sort_order: number;
  is_active: boolean;
}>) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('faqs')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('updateFAQ Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function deleteFAQ(id: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.from('faqs').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('deleteFAQ Error:', error.message);
    return { success: false, error: error.message };
  }
}


// =========================================================================
// NAVIGATION ITEMS ACTIONS
// =========================================================================

export async function getNavigationItems() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('navigation_items')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('getNavigationItems Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function createNavigationItem(payload: {
  label_az: string;
  label_en: string;
  label_ru: string;
  link_url: string;
  location: 'header' | 'footer_col1' | 'footer_col2' | 'footer_col3';
  sort_order?: number;
  is_active?: boolean;
}) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('navigation_items')
      .insert({
        ...payload,
        sort_order: payload.sort_order ?? 0,
        is_active: payload.is_active ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('createNavigationItem Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function updateNavigationItem(id: string, payload: Partial<{
  label_az: string;
  label_en: string;
  label_ru: string;
  link_url: string;
  location: 'header' | 'footer_col1' | 'footer_col2' | 'footer_col3';
  sort_order: number;
  is_active: boolean;
}>) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('navigation_items')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('updateNavigationItem Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function deleteNavigationItem(id: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.from('navigation_items').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('deleteNavigationItem Error:', error.message);
    return { success: false, error: error.message };
  }
}


// =========================================================================
// BLOG POSTS ACTIONS
// =========================================================================

export async function getBlogPosts() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('getBlogPosts Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function createBlogPost(payload: {
  title_az: string;
  title_en: string;
  title_ru: string;
  slug: string;
  content_az: string;
  content_en: string;
  content_ru: string;
  featured_image?: string;
  is_published?: boolean;
}) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        ...payload,
        is_published: payload.is_published ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('createBlogPost Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function updateBlogPost(id: string, payload: Partial<{
  title_az: string;
  title_en: string;
  title_ru: string;
  slug: string;
  content_az: string;
  content_en: string;
  content_ru: string;
  featured_image: string;
  is_published: boolean;
}>) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('updateBlogPost Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function deleteBlogPost(id: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('deleteBlogPost Error:', error.message);
    return { success: false, error: error.message };
  }
}


// =========================================================================
// COLLECTIONS ACTIONS
// =========================================================================

export async function getCollections() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('collections')
      .select('*, collection_products(product_id)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('getCollections Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function createCollection(payload: {
  name_az: string;
  name_en: string;
  name_ru: string;
  slug: string;
  description_az?: string;
  description_en?: string;
  description_ru?: string;
  image_url?: string;
  is_active?: boolean;
  product_ids?: string[];
}) {
  try {
    const supabase = await createServerSupabaseClient();
    const { name_az, name_en, name_ru, slug, description_az, description_en, description_ru, image_url, is_active, product_ids } = payload;
    
    const { data: collection, error: collError } = await supabase
      .from('collections')
      .insert({
        name_az,
        name_en,
        name_ru,
        slug,
        description_az,
        description_en,
        description_ru,
        image_url,
        is_active: is_active ?? true
      })
      .select()
      .single();

    if (collError) throw collError;

    if (product_ids && product_ids.length > 0) {
      const mapping = product_ids.map(pid => ({
        collection_id: collection.id,
        product_id: pid
      }));
      const { error: mapError } = await supabase
        .from('collection_products')
        .insert(mapping);
      if (mapError) throw mapError;
    }

    return { success: true, data: collection };
  } catch (error: any) {
    console.error('createCollection Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function updateCollection(id: string, payload: Partial<{
  name_az: string;
  name_en: string;
  name_ru: string;
  slug: string;
  description_az: string;
  description_en: string;
  description_ru: string;
  image_url: string;
  is_active: boolean;
  product_ids: string[];
}>) {
  try {
    const supabase = await createServerSupabaseClient();
    const { product_ids, ...details } = payload;

    if (Object.keys(details).length > 0) {
      const { error: collError } = await supabase
        .from('collections')
        .update(details)
        .eq('id', id);
      if (collError) throw collError;
    }

    if (product_ids !== undefined) {
      // Delete existing
      await supabase.from('collection_products').delete().eq('collection_id', id);
      
      if (product_ids.length > 0) {
        const mapping = product_ids.map(pid => ({
          collection_id: id,
          product_id: pid
        }));
        const { error: mapError } = await supabase
          .from('collection_products')
          .insert(mapping);
        if (mapError) throw mapError;
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('updateCollection Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function deleteCollection(id: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.from('collections').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('deleteCollection Error:', error.message);
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
