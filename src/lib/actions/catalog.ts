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

export async function createProduct(payload: {
  title_az: string;
  title_en: string;
  title_ru: string;
  description_az: string;
  description_en: string;
  description_ru: string;
  slug: string;
  price_azn: number;
  compare_at_price_azn?: number;
  brand_id?: string;
  is_active?: boolean;
  status?: string;
  image_url?: string;
  video_url?: string;
  stock_quantity?: number;
  category_ids?: string[];
  variants?: any[];
  is_featured?: boolean;
  product_type?: string;
  tags?: string[];
  seo_title?: string;
  seo_description?: string;
  weight_g?: number;
  is_magnetic?: boolean;
  size_mm?: number;
  difficulty_level?: string;
}) {
  try {
    const supabase = await createServerSupabaseClient();

    const insertObj: any = {
      title_az: payload.title_az,
      title_en: payload.title_en,
      title_ru: payload.title_ru,
      description_az: payload.description_az,
      description_en: payload.description_en,
      description_ru: payload.description_ru,
      slug: payload.slug,
      price_azn: payload.price_azn,
      compare_at_price_azn: payload.compare_at_price_azn,
      brand_id: payload.brand_id,
      is_active: payload.is_active ?? true,
      status: payload.status ?? (payload.is_active ? 'publish' : 'draft'),
      image_url: payload.image_url,
      video_url: payload.video_url,
      stock_quantity: payload.stock_quantity ?? 0,
      is_featured: payload.is_featured ?? false,
      product_type: payload.product_type ?? 'speedcube',
      tags: payload.tags ?? [],
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
      const mappings = payload.category_ids.map((catId) => ({
        product_id: product.id,
        category_id: catId,
      }));
      const { error: catError } = await supabase.from('product_categories').insert(mappings);
      if (catError) throw catError;
    }

    if (payload.variants && payload.variants.length > 0) {
      const variantsToInsert = payload.variants.map((v: any) => ({
        product_id: product.id,
        sku: v.sku,
        name: v.name,
        price: v.price,
        stock: v.stock,
        is_active: true
      }));
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

export async function updateProduct(id: string, payload: Partial<{
  title_az: string;
  title_en: string;
  title_ru: string;
  description_az: string;
  description_en: string;
  description_ru: string;
  slug: string;
  price_azn: number;
  compare_at_price_azn: number;
  brand_id: string;
  is_active: boolean;
  status: string;
  image_url: string;
  video_url: string;
  stock_quantity: number;
  category_ids: string[];
  variants: any[];
  is_featured: boolean;
  product_type: string;
  tags: string[];
  seo_title: string;
  seo_description: string;
  weight_g: number;
  is_magnetic: boolean;
  size_mm: number;
  difficulty_level: string;
}>) {
  try {
    const supabase = await createServerSupabaseClient();
    const { category_ids, variants, ...directFields } = payload;

    const { data: product, error: prodError } = await supabase
      .from('products')
      .update(directFields)
      .eq('id', id)
      .select()
      .single();

    if (prodError) throw prodError;

    if (category_ids !== undefined) {
      // Clear existing and rewrite
      await supabase.from('product_categories').delete().eq('product_id', id);
      if (category_ids.length > 0) {
        const mappings = category_ids.map((catId) => ({
          product_id: id,
          category_id: catId,
        }));
        const { error: catError } = await supabase.from('product_categories').insert(mappings);
        if (catError) throw catError;
      }
    }

    if (variants !== undefined) {
      // Clear existing and rewrite
      const { error: delVarError } = await supabase.from('variants').delete().eq('product_id', id);
      if (delVarError) throw delVarError;

      if (variants.length > 0) {
        const variantsToInsert = variants.map((v: any) => ({
          product_id: id,
          sku: v.sku,
          name: v.name,
          price: v.price,
          stock: v.stock,
          is_active: true
        }));
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

export async function deleteProduct(id: string) {
  try {
    const supabase = await createServerSupabaseClient();
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
