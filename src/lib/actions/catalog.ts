// src/lib/actions/catalog.ts

'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// =========================================================================
// PRODUCTS ACTIONS
// =========================================================================

export async function getProducts(options?: {
  categoryId?: string;
  brandId?: string;
  collectionId?: string;
  limit?: number;
  offset?: number;
  isActive?: boolean;
}) {
  try {
    const supabase = await createServerSupabaseClient();
    let query = supabase.from('products').select(`
      *,
      brands (*),
      product_categories!inner(category_id),
      variants (*)
    `, { count: 'exact' });

    if (options?.isActive !== undefined) {
      query = query.eq('is_active', options.isActive);
    }

    if (options?.brandId) {
      query = query.eq('brand_id', options.brandId);
    }

    if (options?.categoryId) {
      query = query.eq('product_categories.category_id', options.categoryId);
    }

    if (options?.limit) {
      query = query.range(options.offset || 0, (options.offset || 0) + options.limit - 1);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { success: true, data, count };
  } catch (error: any) {
    console.error('getProducts Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        brands (*),
        variants (*, variant_attribute_values (attribute_values (*, attributes (*))))
      `)
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('getProductBySlug Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function getProductById(id: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        brands (*),
        variants (*),
        product_categories (category_id)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('getProductById Error:', error.message);
    return { success: false, error: error.message };
  }
}

import * as adminActions from '@/lib/actions/admin';

export async function createProduct(payload: any) {
  return adminActions.createProduct(payload);
}

export async function updateProduct(id: string, payload: any) {
  return adminActions.updateProduct(id, payload);
}

export async function saveProduct(productId: string | null | undefined, payload: any) {
  return adminActions.saveProduct(productId, payload);
}

export async function deleteProduct(id: string) {
  return adminActions.deleteProduct(id);
}




// =========================================================================
// CATEGORIES ACTIONS
// =========================================================================

export async function getCategories() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name_az', { ascending: true });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('getCategories Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function createCategory(payload: {
  name_az: string;
  name_en: string;
  name_ru: string;
  slug_az: string;
  slug_en: string;
  slug_ru: string;
  parent_id?: string | null;
  image_url?: string;
}) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name_az: payload.name_az,
        name_en: payload.name_en,
        name_ru: payload.name_ru,
        slug_az: payload.slug_az,
        slug_en: payload.slug_en,
        slug_ru: payload.slug_ru,
        parent_id: payload.parent_id || null,
        image_url: payload.image_url,
      })
      .select()
      .single();

    if (error) throw error;
    revalidatePath('/[locale]', 'layout');
    return { success: true, data };
  } catch (error: any) {
    console.error('createCategory Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function updateCategory(id: string, payload: Partial<{
  name_az: string;
  name_en: string;
  name_ru: string;
  slug_az: string;
  slug_en: string;
  slug_ru: string;
  parent_id: string | null;
  image_url: string;
}>) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('categories')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    revalidatePath('/[locale]', 'layout');
    return { success: true, data };
  } catch (error: any) {
    console.error('updateCategory Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function deleteCategory(id: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    revalidatePath('/[locale]', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error('deleteCategory Error:', error.message);
    return { success: false, error: error.message };
  }
}


// =========================================================================
// BRANDS ACTIONS
// =========================================================================

export async function getBrands() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('getBrands Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function createBrand(payload: {
  name: string;
  slug: string;
  logo_url?: string;
  description?: string;
}) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('brands')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    revalidatePath('/[locale]', 'layout');
    return { success: true, data };
  } catch (error: any) {
    console.error('createBrand Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function updateBrand(id: string, payload: Partial<{
  name: string;
  slug: string;
  logo_url: string;
  description: string;
}>) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('brands')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    revalidatePath('/[locale]', 'layout');
    return { success: true, data };
  } catch (error: any) {
    console.error('updateBrand Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function deleteBrand(id: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.from('brands').delete().eq('id', id);
    if (error) throw error;
    revalidatePath('/[locale]', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error('deleteBrand Error:', error.message);
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
      .select('*')
      .order('name_az', { ascending: true });

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
  image_url?: string;
  is_active?: boolean;
}) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('collections')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    revalidatePath('/[locale]', 'layout');
    return { success: true, data };
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
  image_url: string;
  is_active: boolean;
}>) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('collections')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    revalidatePath('/[locale]', 'layout');
    return { success: true, data };
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
    revalidatePath('/[locale]', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error('deleteCollection Error:', error.message);
    return { success: false, error: error.message };
  }
}


// =========================================================================
// REVIEWS ACTIONS
// =========================================================================

export async function getReviews(productId: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('reviews')
      .select('*, profiles(full_name)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('getReviews Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function createReview(payload: {
  product_id: string;
  user_id: string;
  rating: number;
  comment?: string;
}) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        product_id: payload.product_id,
        user_id: payload.user_id,
        rating: payload.rating,
        comment: payload.comment,
        is_approved: false, // Default requires moderation
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data, message: 'Rəyiniz qəbul olundu, təsdiqləndikdən sonra görünəcək.' };
  } catch (error: any) {
    console.error('createReview Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function approveReview(id: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('reviews')
      .update({ is_approved: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('approveReview Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function deleteReview(id: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('deleteReview Error:', error.message);
    return { success: false, error: error.message };
  }
}
