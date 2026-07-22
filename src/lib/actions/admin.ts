// src/lib/actions/admin.ts

'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// =========================================================================
// ORDERS MANAGEMENT
// =========================================================================

export async function seedMockOrders() {
  if (process.env.NODE_ENV === 'production') {
    return { success: false, error: 'Order seeding is strictly disabled in production environments.' };
  }

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

    const slugsToSeed = ['return-policy', 'privacy-policy', 'terms-of-service'];
    const slugs = data ? data.map((p: any) => p.slug) : [];
    const missingSlugs = slugsToSeed.filter(s => !slugs.includes(s));

    if (missingSlugs.length > 0) {
      const seeds = [];
      if (missingSlugs.includes('return-policy')) {
        seeds.push({
          title_az: 'Geri Qaytarma Qaydaları',
          title_en: 'Return and Exchange Policy',
          title_ru: 'Правила возврата',
          slug: 'return-policy',
          content_az: `<p><strong>RubikShop.az</strong> internet mağazasından alınan hər bir məhsul bizim üçün dəyərlidir. Biz müştərilərimizə yüksək səviyyəli xidmət və keyfiyyətli məhsullar təqdim etməyi hədəfləyirik.</p>

<h3>1. Geri Qaytarma Şərtləri:</h3>
<ul>
  <li>Məhsulu istifadə etmədiyiniz, qutusuna, etiketlərinə və aksesuarlarına xələl gətirmədiyiniz təqdirdə, <strong>14 təqvim günü</strong> müddətində heç bir əlavə ödəniş etmədən tam geri qaytara və ya başqa modelə dəyişə bilərsiniz.</li>
  <li>Professional sürətli Rubik kubları (speedcubing puzzle-ları) və onların aksesuarları yalnız zavod defekti olduğu halda geri qaytarıla və ya dəyişdirilə bilər.</li>
  <li>İstifadə olunmuş, yağlanmış, tənzimlənmiş və ya mexaniki zədə görmüş məhsulların geri qaytarılması qəbul edilmir.</li>
</ul>

<h3>2. Çatdırılma və Geri Qaytarma Xərcləri:</h3>
<ul>
  <li>Əgər geri qaytarma məhsulun zavod qüsuru (defekti) ilə bağlıdırsa, geri qaytarma və ya dəyişdirilmə xərcləri tamamilə RubikShop.az tərəfindən qarşılanır.</li>
  <li>Müştərinin şəxsi seçimi və ya qərar dəyişikliyi ilə bağlı geri qaytarmalarda kuryer xidməti haqqı müştəri tərəfindən ödənilir.</li>
</ul>

<h3>3. Sifarişin Qəbulu və Əlaqə:</h3>
<p>Sifarişləriniz həm veb-saytımız, həm də rəsmi <strong>WhatsApp</strong> və ya <strong>Instagram (@rubikshop.az)</strong> hesablarımız vasitəsilə qəbul edilir. Sual və ya geri qaytarma müraciəti üçün bizimlə dərhal əlaqə saxlaya bilərsiniz.</p>

<p><strong>Əlaqə nömrəsi (WhatsApp):</strong> +994 50 668 49 25<br>
<strong>Instagram:</strong> <a href="https://instagram.com/rubikshop.az" target="_blank">@rubikshop.az</a></p>`,
          content_en: `<p>Every product purchased from <strong>RubikShop.az</strong> is valuable to us. We aim to provide our customers with high-level service and high-quality products.</p>

<h3>1. Return Conditions:</h3>
<ul>
  <li>If you have not used the product and have not damaged its box, labels, and accessories, you can return or exchange it for another model within <strong>14 calendar days</strong> without any additional charge.</li>
  <li>Professional fast Rubik's cubes (speedcubing puzzles) and their accessories can only be returned or exchanged in case of a factory defect.</li>
</ul>`,
          content_ru: `<p>Каждый товар, приобретенный в интернет-магазине <strong>RubikShop.az</strong>, важен для нас. Мы стремимся предоставить нашим клиентам высокий уровень сервиса и качественную продукцию.</p>

<h3>1. Условия возврата:</h3>
<ul>
  <li>Если вы не пользовались товаром и не повредили его коробку, этикетки и аксессуары, вы можете вернуть или обменять его на другую модель в течение <strong>14 календарных дней</strong> без какой-либо дополнительной оплаты.</li>
</ul>`,
          is_published: true
        });
      }
      if (missingSlugs.includes('privacy-policy')) {
        seeds.push({
          title_az: 'Məxfilik Siyasəti',
          title_en: 'Privacy Policy',
          title_ru: 'Политика конфиденциальности',
          slug: 'privacy-policy',
          content_az: `<p><strong>RubikShop.az</strong> olaraq istifadəçilərimizin fərdi məlumatlarının qorunmasına və gizliliyinə böyük önəm veririk. Bu sənəd, saytımızda topladığımız məlumatların hansı məqsədlərlə istifadə olunduğunu izah edir.</p>

<h3>1. Toplanan Məlumatlar:</h3>
<ul>
  <li>Sifariş zamanı daxil etdiyiniz ad, soyad, əlaqə nömrəsi (telefon), çatdırılma ünvanı və sosial media (Instagram) istifadəçi adı kimi məlumatlar qeydə alınır.</li>
  <li>Ödəniş məlumatları (kart məlumatları) bizim sistemlərdə saxlanılmır.</li>
</ul>

<h3>2. Məlumatların İstifadə Məqsədi:</h3>
<ul>
  <li>Sifarişlərin hazırlanması və Azərbaycanda (Bakı daxili və rayonlara) çatdırılması.</li>
  <li>Sifariş və ya çatdırılma ilə bağlı sizinlə WhatsApp və ya Instagram vasitəsilə əlaqə saxlamaq.</li>
</ul>`,
          content_en: `<p>As <strong>RubikShop.az</strong>, we attach great importance to the protection and privacy of our users' personal data.</p>`,
          content_ru: `<p>Мы в <strong>RubikShop.az</strong> придаем большое значение защите и конфиденциальности персональных данных наших пользователей.</p>`,
          is_published: true
        });
      }
      if (missingSlugs.includes('terms-of-service')) {
        seeds.push({
          title_az: 'İstifadə Şərtləri',
          title_en: 'Terms of Service',
          title_ru: 'Условия использования',
          slug: 'terms-of-service',
          content_az: `<p><strong>RubikShop.az</strong> internet mağazasına xoş gəlmisiniz! Bu şərtlər veb-saytımızdan istifadə və məhsul alışı qaydalarını tənzimləyir.</p>

<h3>1. Fəaliyyət Sahəmiz:</h3>
<p>RubikShop.az rəsmi olaraq Azərbaycanda fəaliqqət göstərən, professional Rubik kubları, twisty puzzle-lar, kub yağları və tənzimləmə aksesuarlarının satışı ilə məşğul olan ixtisaslaşmış mağazadır.</p>

<h3>2. Sifariş Qaydaları:</h3>
<ul>
  <li>Müştərilər sayt vasitəsilə sifariş yerləşdirə bilərlər. Sifariş təsdiqi üçün menecerimiz sizinlə WhatsApp və ya zəng vasitəsilə əlaqə saxlayacaqdır.</li>
  <li>Sifarişlər həmçinin rəsmi <strong>Instagram (@rubikshop.az)</strong> və <strong>WhatsApp (+994 50 668 49 25)</strong> üzərindən də birbaşa qəbul edilir.</li>
</ul>`,
          content_en: `<p>Welcome to <strong>RubikShop.az</strong>! These terms govern your use of our website and purchase of products.</p>`,
          content_ru: `<p>Добро пожаловать в <strong>RubikShop.az</strong>! Эти условия регулируют использование нашего веб-сайта и покупку товаров.</p>`,
          is_published: true
        });
      }

      await supabase.from('pages').insert(seeds);
      
      const refetched = await supabase
        .from('pages')
        .select('*')
        .order('title_az', { ascending: true });
      return { success: true, data: refetched.data };
    }

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

export async function getOrderDetail(orderId: string) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(*, variants(*, products(*))))')
      .eq('id', orderId)
      .maybeSingle();

    if (orderError) throw orderError;
    if (!order) return { success: false, error: 'Sifariş tapılmadı' };

    // Fetch shipment for tracking number
    const { data: shipment } = await supabase
      .from('shipments')
      .select('*')
      .eq('order_id', orderId)
      .maybeSingle();

    // Map database enterprise schema columns back to expected frontend fields
    const shippingAddressStr = order.shipping_address || '';
    const hasInstagram = shippingAddressStr.includes(' | Instagram: @');
    const deliveryAddress = hasInstagram 
      ? shippingAddressStr.split(' | Instagram: @')[0] 
      : shippingAddressStr;
    const customerInstagram = hasInstagram 
      ? shippingAddressStr.split(' | Instagram: @')[1] 
      : 'Yoxdur';

    const mappedOrder = {
      ...order,
      customer_name: order.full_name,
      customer_phone: order.phone,
      customer_instagram: customerInstagram,
      delivery_address: deliveryAddress,
      delivery_method: deliveryAddress.includes('Metrosu') ? 'Metro' : 'Courier',
      total_amount_azn: Number(order.total),
      checkout_platform: 'whatsapp',
      status: order.shipping_status === 'pending' ? 'pending' : (order.shipping_status === 'delivered' ? 'completed' : 'cancelled'),
      tracking_number: shipment?.tracking_number || '',
      carrier: shipment?.carrier || '',
      order_items: order.order_items?.map((item: any) => ({
        ...item,
        product_title: item.variants?.products?.title_az || 'Məhsul',
        unit_price_azn: Number(item.price_azn),
        subtotal_azn: Number(item.total_azn),
        sku: item.variants?.sku || item.variants?.products?.id || 'SKU-NONE',
        image_url: item.variants?.products?.image_url || 'https://picsum.photos/seed/boxart/200/200'
      })) || []
    };

    // Fetch audit logs for history/notes
    const { data: logs } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('record_id', orderId)
      .eq('table_name', 'orders')
      .order('created_at', { ascending: false });

    return { success: true, order: mappedOrder, logs: logs || [] };
  } catch (error: any) {
    console.error('getOrderDetail Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function updateOrderTracking(orderId: string, trackingNumber: string, carrier?: string) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Upsert into shipments
    const { error } = await supabase
      .from('shipments')
      .upsert({
        order_id: orderId,
        tracking_number: trackingNumber || null,
        carrier: carrier || 'post_delivery',
        status: 'shipped'
      }, { onConflict: 'order_id' });

    if (error) throw error;

    // Also write an audit log
    try {
      const { createAuditLog } = await import('@/lib/actions/audit');
      await createAuditLog({
        action: `İzləmə nömrəsi yeniləndi: ${trackingNumber}`,
        table_name: 'orders',
        record_id: orderId,
        new_values: { tracking_number: trackingNumber }
      });
    } catch (auditErr) {
      console.error('Audit logging failed:', auditErr);
    }

    revalidatePath('/[locale]/admin/orders', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error('updateOrderTracking Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function addOrderInternalNote(orderId: string, note: string) {
  try {
    if (!note.trim()) return { success: false, error: 'Qeyd boş ola bilməz' };
    
    const { createAuditLog } = await import('@/lib/actions/audit');
    const res = await createAuditLog({
      action: 'Internal Note Added',
      table_name: 'orders',
      record_id: orderId,
      new_values: { note: note }
    });

    if (!res.success) throw new Error(res.error);

    revalidatePath('/[locale]/admin/orders', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error('addOrderInternalNote Error:', error.message);
    return { success: false, error: error.message };
  }
}

// =========================================================================
// PRODUCTS MANAGEMENT (ADMIN SERVER ACTIONS)
// =========================================================================

export async function strictSlugify(text: string): Promise<string> {
  if (!text) return '';
  let str = text.toLowerCase();

  // Explicitly map Azerbaijani and special characters
  const charMap: Record<string, string> = {
    'ə': 'e',
    'ı': 'i',
    'ö': 'o',
    'ü': 'u',
    'ğ': 'g',
    'ç': 'c',
    'ş': 's',
    'Ə': 'e',
    'I': 'i',
    'İ': 'i',
    'Ö': 'o',
    'Ü': 'u',
    'Ğ': 'g',
    'Ç': 'c',
    'Ş': 's',
  };

  str = str.replace(/[əıöüğçşƏIİÖÜĞÇŞ]/g, (m) => charMap[m] || m);

  // Strip parentheses, brackets, and special punctuation completely
  str = str.replace(/[\(\)\[\]\{\}\/\\#\?!\.,;:'"<>@$%^&*+=~`]/g, ' ');

  // Keep only alphanumeric and whitespace / hyphens
  str = str.replace(/[^a-z0-9\s-]/g, '');

  // Collapse spaces and multiple hyphens into a single hyphen
  str = str.trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-');

  return str;
}

async function resolveUniqueSlug(supabase: any, rawSlug: string, productId?: string) {
  let cleanSlug = await strictSlugify(rawSlug);
  if (!cleanSlug) {
    cleanSlug = `product-${Date.now()}`;
  }

  let slug = cleanSlug;
  let counter = 1;

  while (counter < 100) {
    let query = supabase.from('products').select('id').eq('slug', slug);
    if (productId) {
      query = query.neq('id', productId);
    }

    const { data: existing } = await query.maybeSingle();
    if (!existing) {
      break;
    }
    counter++;
    slug = `${cleanSlug}-${counter}`;
  }

  return slug;
}

function formatGalleryImages(gallery_images: any): string[] {
  if (!gallery_images) return [];
  if (Array.isArray(gallery_images)) {
    return gallery_images.map((img: any) => String(img).trim()).filter(Boolean);
  }
  if (typeof gallery_images === 'string') {
    try {
      const parsed = JSON.parse(gallery_images);
      if (Array.isArray(parsed)) {
        return parsed.map((img: any) => String(img).trim()).filter(Boolean);
      }
    } catch {
      return gallery_images.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
  }
  return [];
}

function mapVariantsPayload(variants: any[], basePrice: number, productId?: string, productSlug?: string) {
  if (!variants || !Array.isArray(variants) || variants.length === 0) {
    return [];
  }
  const seenSkus = new Set<string>();
  const slugPrefix = productSlug || (productId ? productId.slice(0, 8) : 'var');

  return variants.map((v: any, idx: number) => {
    const variantPrice = Number(v.price_azn || v.price || basePrice || 0);
    let rawSku = v.sku ? String(v.sku).trim() : '';
    if (!rawSku) {
      rawSku = `${slugPrefix}-v${idx + 1}-${Date.now().toString().slice(-4)}`;
    }

    let uniqueSku = rawSku;
    let counter = 1;
    while (seenSkus.has(uniqueSku)) {
      uniqueSku = `${rawSku}-${counter}-${Date.now().toString().slice(-3)}`;
      counter++;
    }
    seenSkus.add(uniqueSku);

    const item: any = {
      sku: uniqueSku,
      name: v.name || `Variant ${idx + 1}`,
      price_azn: variantPrice,
      price: variantPrice,
      stock: Number(v.stock ?? v.stock_quantity ?? 0),
      is_active: v.is_active ?? true
    };
    if (productId) {
      item.product_id = productId;
    }
    return item;
  });
}

export async function createProduct(payload: any) {
  try {
    const supabase = await createServerSupabaseClient();
    const rawSlug = payload.slug || payload.title_az || payload.title_en || 'product';
    const finalSlug = await resolveUniqueSlug(supabase, rawSlug);
    const safeGallery = formatGalleryImages(payload.gallery_images);
    const basePrice = Number(payload.price_azn || payload.price || 0);

    const insertObj: any = {
      title_az: payload.title_az,
      title_en: payload.title_en,
      title_ru: payload.title_ru,
      description_az: payload.description_az,
      description_en: payload.description_en,
      description_ru: payload.description_ru,
      slug: finalSlug,
      price_azn: basePrice,
      compare_at_price_azn: payload.compare_at_price_azn,
      brand_id: payload.brand_id,
      is_active: payload.is_active ?? true,
      status: payload.status === 'active' ? 'publish' : (payload.status || 'publish'),
      image_url: payload.image_url,
      video_url: payload.video_url,
      stock_quantity: payload.stock_quantity ?? 0,
      is_featured: payload.is_featured ?? false,
      product_type: payload.product_type ?? 'speedcube',
      tags: payload.tags ?? [],
      gallery_images: safeGallery,
      seo_title: payload.seo_title,
      seo_description: payload.seo_description,
      weight_g: payload.weight_g,
      is_magnetic: payload.is_magnetic ?? false,
      size_mm: payload.size_mm,
      difficulty_level: payload.difficulty_level ?? 'başlanğıc',
    };

    const { data: product, error: prodError } = await supabase
      .from('products')
      .insert(insertObj)
      .select()
      .single();

    if (prodError) throw prodError;

    if (payload.category_ids && payload.category_ids.length > 0) {
      const mappings = payload.category_ids.map((catId: string) => ({
        product_id: product.id,
        category_id: catId,
      }));
      const { error: catError } = await supabase.from('product_categories').insert(mappings);
      if (catError) throw catError;
    }

    const variantsToInsert = mapVariantsPayload(payload.variants || [], basePrice, product.id, product.slug);
    if (variantsToInsert.length > 0) {
      const { error: varError } = await supabase.from('variants').insert(variantsToInsert);
      if (varError) throw varError;
    }

    revalidatePath('/[locale]', 'layout');
    return { success: true, data: product };
  } catch (error: any) {
    console.error('createProduct Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function updateProduct(id: string, payload: any) {
  try {
    const supabase = await createServerSupabaseClient();
    const { category_ids, variants, ...directFields } = payload;

    if (directFields.slug || directFields.title_az || directFields.title_en) {
      const rawSlug = directFields.slug || directFields.title_az || directFields.title_en || '';
      if (rawSlug) {
        directFields.slug = await resolveUniqueSlug(supabase, rawSlug, id);
      }
    }

    if (directFields.gallery_images !== undefined) {
      directFields.gallery_images = formatGalleryImages(directFields.gallery_images);
    }

    if (directFields.is_active === undefined) {
      directFields.is_active = true;
    }
    if (!directFields.status || directFields.status === 'active') {
      directFields.status = 'publish';
    }

    const basePrice = Number(directFields.price_azn || directFields.price || 0);

    const { data: product, error: prodError } = await supabase
      .from('products')
      .update(directFields)
      .eq('id', id)
      .select()
      .single();

    if (prodError) throw prodError;

    if (category_ids !== undefined) {
      await supabase.from('product_categories').delete().eq('product_id', id);
      if (category_ids.length > 0) {
        const mappings = category_ids.map((catId: string) => ({
          product_id: id,
          category_id: catId,
        }));
        const { error: catError } = await supabase.from('product_categories').insert(mappings);
        if (catError) throw catError;
      }
    }

    if (variants !== undefined) {
      const { error: delVarError } = await supabase.from('variants').delete().eq('product_id', id);
      if (delVarError) throw delVarError;

      const variantsToInsert = mapVariantsPayload(variants || [], basePrice, id, product.slug);
      if (variantsToInsert.length > 0) {
        const { error: varError } = await supabase.from('variants').insert(variantsToInsert);
        if (varError) throw varError;
      }
    }

    revalidatePath('/[locale]', 'layout');
    return { success: true, data: product };
  } catch (error: any) {
    console.error('updateProduct Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function saveProduct(productId: string | null | undefined, payload: any) {
  if (productId) {
    return updateProduct(productId, payload);
  } else {
    return createProduct(payload);
  }
}

export async function upsertProduct(payload: any, productId?: string) {
  return saveProduct(productId, payload);
}

export async function deleteProduct(id: string) {
  try {
    const supabase = await createServerSupabaseClient();
    try {
      const { createAuditLog } = await import('@/lib/actions/audit');
      await createAuditLog({
        action: 'Məhsul silindi',
        table_name: 'products',
        record_id: id,
      });
    } catch {}

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    revalidatePath('/[locale]', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error('deleteProduct Error:', error.message);
    return { success: false, error: error.message };
  }
}

// =========================================================================
// BULK IMPORT INFRASTRUCTURE & SERVER ACTIONS
// =========================================================================

export interface BulkImportResult {
  success: boolean;
  count: number;
  skipped: number;
  errors: string[];
}

function toAzSlug(text: string): string {
  if (!text) return '';

  const charMap: Record<string, string> = {
    'İ': 'i',
    'I': 'i',
    'ə': 'e',
    'Ə': 'e',
    'ö': 'o',
    'Ö': 'o',
    'ü': 'u',
    'Ü': 'u',
    'ç': 'c',
    'Ç': 'c',
    'ş': 's',
    'Ş': 's',
    'ğ': 'g',
    'Ğ': 'g',
    'ı': 'i',
  };

  let str = text.replace(/[İIəƏöÖüÜçÇşŞğĞı]/g, (match) => charMap[match] || match);
  str = str.toLowerCase();
  str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  str = str.replace(/[\(\)\[\]\{\}\/\\#\?!\.,;:'"<>@$%^&*+=~`]/g, ' ');
  str = str.replace(/[^a-z0-9\s-]/g, '');
  str = str.trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-');

  return str;
}

export async function bulkImportCategoriesAction(categories: any[]): Promise<BulkImportResult> {
  const result: BulkImportResult = {
    success: false,
    count: 0,
    skipped: 0,
    errors: [],
  };

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      result.errors.push('İcazəsiz giriş (Unauthorized)');
      return result;
    }

    if (!Array.isArray(categories) || categories.length === 0) {
      result.errors.push('Daxil edilən məlumat massiv (array) deyil və ya boşdur.');
      return result;
    }

    for (let i = 0; i < categories.length; i++) {
      const item = categories[i];
      const nameAz = (item.name_az || item.name || '').toString().trim();

      if (!nameAz) {
        result.skipped++;
        result.errors.push(`№${i + 1}: Kateqoriya adı daxil edilməyib.`);
        continue;
      }

      const rawSlug = item.slug_az || item.slug || nameAz;
      const baseSlug = toAzSlug(rawSlug) || 'category';

      let finalSlugAz = baseSlug;
      let counter = 1;
      while (true) {
        const { data: existing } = await supabase
          .from('categories')
          .select('id')
          .eq('slug_az', finalSlugAz)
          .maybeSingle();

        if (!existing) break;
        finalSlugAz = `${baseSlug}-${counter}`;
        counter++;
      }

      const nameEn = (item.name_en || nameAz).trim();
      const nameRu = (item.name_ru || nameAz).trim();
      const slugEn = item.slug_en ? toAzSlug(item.slug_en) : finalSlugAz;
      const slugRu = item.slug_ru ? toAzSlug(item.slug_ru) : finalSlugAz;

      const insertPayload = {
        name_az: nameAz,
        name_en: nameEn,
        name_ru: nameRu,
        slug_az: finalSlugAz,
        slug_en: slugEn,
        slug_ru: slugRu,
        parent_id: item.parent_id || null,
        image_url: item.image_url || null,
      };

      const { error: insertError } = await supabase.from('categories').insert(insertPayload);
      if (insertError) {
        result.skipped++;
        result.errors.push(`"${nameAz}" əlavə edilərkən xəta: ${insertError.message}`);
      } else {
        result.count++;
      }
    }

    revalidatePath('/[locale]/admin/categories', 'layout');
    revalidatePath('/[locale]', 'layout');

    result.success = result.count > 0;
    return result;
  } catch (err: any) {
    result.errors.push(`Server xətası: ${err.message || 'Gözlənilməz xəta'}`);
    return result;
  }
}

export async function bulkImportBrandsAction(brands: any[]): Promise<BulkImportResult> {
  const result: BulkImportResult = {
    success: false,
    count: 0,
    skipped: 0,
    errors: [],
  };

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      result.errors.push('İcazəsiz giriş (Unauthorized)');
      return result;
    }

    if (!Array.isArray(brands) || brands.length === 0) {
      result.errors.push('Daxil edilən məlumat massiv (array) deyil və ya boşdur.');
      return result;
    }

    for (let i = 0; i < brands.length; i++) {
      const item = brands[i];
      const name = (item.name || item.title || '').toString().trim();

      if (!name) {
        result.skipped++;
        result.errors.push(`№${i + 1}: Brend adı daxil edilməyib.`);
        continue;
      }

      const rawSlug = item.slug || name;
      const baseSlug = toAzSlug(rawSlug) || 'brand';

      let finalSlug = baseSlug;
      let counter = 1;
      while (true) {
        const { data: existing } = await supabase
          .from('brands')
          .select('id')
          .eq('slug', finalSlug)
          .maybeSingle();

        if (!existing) break;
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      const insertPayload = {
        name,
        slug: finalSlug,
        logo_url: item.logo_url || item.logo || null,
        description: item.description || null,
      };

      const { error: insertError } = await supabase.from('brands').insert(insertPayload);
      if (insertError) {
        result.skipped++;
        result.errors.push(`"${name}" əlavə edilərkən xəta: ${insertError.message}`);
      } else {
        result.count++;
      }
    }

    revalidatePath('/[locale]/admin/brands', 'layout');
    revalidatePath('/[locale]', 'layout');

    result.success = result.count > 0;
    return result;
  } catch (err: any) {
    result.errors.push(`Server xətası: ${err.message || 'Gözlənilməz xəta'}`);
    return result;
  }
}

export async function bulkImportProductsAction(products: any[]): Promise<BulkImportResult> {
  const result: BulkImportResult = {
    success: false,
    count: 0,
    skipped: 0,
    errors: [],
  };

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      result.errors.push('İcazəsiz giriş (Unauthorized)');
      return result;
    }

    if (!Array.isArray(products) || products.length === 0) {
      result.errors.push('Daxil edilən məlumat massiv (array) deyil və ya boşdur.');
      return result;
    }

    // Pre-fetch all categories and brands for trimmed, case-insensitive resolution
    const { data: allCategories } = await supabase
      .from('categories')
      .select('id, name_az, name_en, name_ru, slug_az, slug_en, slug_ru');

    const { data: allBrands } = await supabase
      .from('brands')
      .select('id, name, slug');

    const findCategoryId = (input: string): string | null => {
      if (!input || !allCategories) return null;
      const norm = input.toString().trim().toLowerCase();
      const slugNorm = toAzSlug(input);

      for (const cat of allCategories) {
        if (cat.id === input) return cat.id;
        if (cat.slug_az?.toLowerCase().trim() === norm || cat.slug_az === slugNorm) return cat.id;
        if (cat.slug_en?.toLowerCase().trim() === norm || cat.slug_en === slugNorm) return cat.id;
        if (cat.slug_ru?.toLowerCase().trim() === norm || cat.slug_ru === slugNorm) return cat.id;
        if (cat.name_az?.toLowerCase().trim() === norm || toAzSlug(cat.name_az) === slugNorm) return cat.id;
        if (cat.name_en?.toLowerCase().trim() === norm || toAzSlug(cat.name_en) === slugNorm) return cat.id;
        if (cat.name_ru?.toLowerCase().trim() === norm || toAzSlug(cat.name_ru) === slugNorm) return cat.id;
      }
      return null;
    };

    const findBrandId = (input: string): string | null => {
      if (!input || !allBrands) return null;
      const norm = input.toString().trim().toLowerCase();
      const slugNorm = toAzSlug(input);

      for (const b of allBrands) {
        if (b.id === input) return b.id;
        if (b.slug?.toLowerCase().trim() === norm || b.slug === slugNorm) return b.id;
        if (b.name?.toLowerCase().trim() === norm || toAzSlug(b.name) === slugNorm) return b.id;
      }
      return null;
    };

    for (let i = 0; i < products.length; i++) {
      const item = products[i];
      try {
        const nameAz = (item.name_az || item.title_az || item.name || item.title || '').toString().trim();
        const rawPrice = item.price ?? item.price_azn;
        const priceVal = rawPrice !== undefined && rawPrice !== null && rawPrice !== ''
          ? parseFloat(String(rawPrice).replace(/[^0-9.]/g, ''))
          : NaN;

        // STRICT VALIDATION: name_az non-empty, price positive number
        if (!nameAz || isNaN(priceVal) || priceVal <= 0) {
          result.skipped++;
          result.errors.push(`Məhsul adı və ya qiyməti yoxdur/yanlışdır: [${nameAz || `№${i + 1}`}]`);
          continue;
        }

        // Map "Endirimdən əvvəlki qiymət" to discount_price
        const rawCompare = item.discount_price ?? item.compare_at_price ?? item.old_price ?? item.compare_at_price_azn;
        const discount_price = rawCompare !== undefined && rawCompare !== null && rawCompare !== ''
          ? parseFloat(String(rawCompare).replace(/[^0-9.]/g, ''))
          : null;

        // Map SEO fields to meta_title and meta_description
        const meta_title = item.meta_title || item.seo_title || `${nameAz || item.name_en || 'Məhsul'} | Rubikshop.az`;
        const meta_description = item.meta_description || item.seo_description || item.description_az || item.description_en || '';

        // Calculate clean slug and check DB collisions
        const rawSlug = item.slug || item.slug_az || nameAz;
        const baseSlug = toAzSlug(rawSlug) || 'product';

        let finalSlug = baseSlug;
        let counter = 1;
        while (true) {
          const { data: existing } = await supabase
            .from('products')
            .select('id')
            .eq('slug', finalSlug)
            .maybeSingle();

          if (!existing) break;
          finalSlug = `${baseSlug}-${counter}`;
          counter++;
        }

        // Brand resolution
        let brandId = item.brand_id || null;
        if (!brandId) {
          const brandQuery = item.brand_slug || item.brand_name || item.brand;
          if (brandQuery) {
            brandId = findBrandId(String(brandQuery));
            if (!brandId) {
              const rawBrandStr = String(brandQuery).trim();
              const brandSlug = toAzSlug(rawBrandStr) || rawBrandStr.toLowerCase();
              const brandName = item.brand_name || (
                rawBrandStr.includes('-')
                  ? rawBrandStr.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('-')
                  : (rawBrandStr.charAt(0).toUpperCase() + rawBrandStr.slice(1))
              );

              const { data: newBrand, error: brandErr } = await supabase
                .from('brands')
                .insert({ name: brandName, slug: brandSlug })
                .select('id, name, slug')
                .single();

              if (!brandErr && newBrand) {
                brandId = newBrand.id;
                if (allBrands) {
                  allBrands.push({ id: newBrand.id, name: newBrand.name, slug: newBrand.slug });
                }
              } else {
                const { data: existingBrand } = await supabase
                  .from('brands')
                  .select('id, name, slug')
                  .or(`slug.eq.${brandSlug},name.ilike.${brandName}`)
                  .maybeSingle();

                if (existingBrand) {
                  brandId = existingBrand.id;
                  if (allBrands) {
                    allBrands.push({ id: existingBrand.id, name: existingBrand.name, slug: existingBrand.slug });
                  }
                }
              }
            }
          }
        }

        // Category resolution
        let categoryIds: string[] = [];
        if (Array.isArray(item.category_ids)) {
          categoryIds = item.category_ids;
        } else if (item.category_id) {
          categoryIds = [item.category_id];
        }
        const catQuery = item.category_slug || item.category_name || item.category || item.categories || item.category_slugs;
        if (catQuery) {
          const catList = Array.isArray(catQuery) ? catQuery : String(catQuery).split(',');
          for (const cVal of catList) {
            const matchedId = findCategoryId(String(cVal));
            if (matchedId && !categoryIds.includes(matchedId)) {
              categoryIds.push(matchedId);
            }
          }
        }
        const categoryId = categoryIds.length > 0 ? categoryIds[0] : (item.category_id || null);

        const rawStock = item.stock_quantity ?? item.stock ?? 0;
        const parsedStock = parseInt(String(rawStock).replace(/[^0-9]/g, ''), 10);
        const stock_quantity = isNaN(parsedStock) ? 0 : parsedStock;

        // Construct primary insertion payload using exact specified column keys
        const primaryInsertObj: any = {
          name_az: nameAz,
          name_en: item.name_en || nameAz,
          name_ru: item.name_ru || nameAz,
          slug: finalSlug,
          description_az: item.description_az || null,
          description_en: item.description_en || null,
          description_ru: item.description_ru || null,
          price: priceVal,
          discount_price: discount_price,
          stock_quantity: stock_quantity,
          category_id: categoryId,
          brand_id: brandId,
          image_url: item.image_url || null,
          tags: Array.isArray(item.tags) ? item.tags : [],
          product_type: item.product_type || null,
          size_mm: item.size_mm ? parseFloat(String(item.size_mm).replace(/[^0-9.]/g, '')) : null,
          weight_g: item.weight_g ? parseFloat(String(item.weight_g).replace(/[^0-9.]/g, '')) : null,
          difficulty_level: item.difficulty_level || null,
          is_magnetic: Boolean(item.is_magnetic),
          status: item.status || 'published',
          meta_title: meta_title,
          meta_description: meta_description
        };

        let { data: newProd, error: prodError } = await supabase
          .from('products')
          .insert(primaryInsertObj)
          .select('id, slug')
          .single();

        // Fallback for title_az/price_azn schema if primary column schema differs
        if (prodError && (prodError.message?.includes('column') || prodError.code === 'PGRST204')) {
          const fallbackInsertObj: any = {
            title_az: nameAz,
            title_en: item.name_en || nameAz,
            title_ru: item.name_ru || nameAz,
            slug: finalSlug,
            description_az: item.description_az || null,
            description_en: item.description_en || null,
            description_ru: item.description_ru || null,
            price_azn: priceVal,
            compare_at_price_azn: discount_price,
            stock_quantity: stock_quantity,
            brand_id: brandId,
            image_url: item.image_url || null,
            tags: Array.isArray(item.tags) ? item.tags : [],
            product_type: item.product_type || null,
            size_mm: item.size_mm ? parseFloat(String(item.size_mm).replace(/[^0-9.]/g, '')) : null,
            weight_g: item.weight_g ? parseFloat(String(item.weight_g).replace(/[^0-9.]/g, '')) : null,
            difficulty_level: item.difficulty_level || null,
            is_magnetic: Boolean(item.is_magnetic),
            status: item.status === 'published' ? 'publish' : (item.status || 'publish'),
            seo_title: meta_title,
            seo_description: meta_description
          };

          const fallbackRes = await supabase
            .from('products')
            .insert(fallbackInsertObj)
            .select('id, slug')
            .single();

          newProd = fallbackRes.data;
          prodError = fallbackRes.error;
        }

        if (prodError) {
          result.skipped++;
          result.errors.push(`"${nameAz}" xətası: ${prodError.message}`);
          continue;
        }

        // Map product to categories if resolved
        if (categoryIds.length > 0) {
          const mappings = categoryIds.map((cId) => ({
            product_id: newProd.id,
            category_id: cId,
          }));
          await supabase.from('product_categories').insert(mappings);
        }

        // Map variants if provided
        if (item.variants && Array.isArray(item.variants) && item.variants.length > 0) {
          const variantsToInsert = mapVariantsPayload(item.variants, priceVal, newProd.id, newProd.slug);
          if (variantsToInsert.length > 0) {
            await supabase.from('variants').insert(variantsToInsert);
          }
        }

        result.count++;
      } catch (itemErr: any) {
        result.skipped++;
        result.errors.push(`Xəta [№${i + 1}]: ${itemErr?.message || 'Bilinməyən xəta'}`);
      }
    }

    revalidatePath('/[locale]/admin/categories', 'layout');
    revalidatePath('/[locale]/admin/brands', 'layout');
    revalidatePath('/[locale]/admin/products', 'layout');
    revalidatePath('/[locale]', 'layout');

    result.success = result.count > 0;
    return result;
  } catch (err: any) {
    result.errors.push(`Server xətası: ${err.message || 'Gözlənilməz xəta'}`);
    return result;
  }
}


