import { supabase } from '../client';
import { sanitizeImageUrl } from '@/lib/image';

export interface RawProduct {
  id: string;
  title_az: string;
  title_en: string;
  title_ru: string;
  description_az: string;
  description_en: string;
  description_ru: string;
  price_azn: number;
  image_url: string;
  stock_quantity: number;
  is_active: boolean;
  [key: string]: any;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price_azn: number;
  image_url: string;
  stock_quantity: number;
  compare_at_price_azn?: number;
  original_price_azn?: number;
  discount_percent?: number;
  slug?: string;
  product_variants?: any[];
  variants?: any[];
  family_slug?: string;
  product_family?: string;
  [key: string]: any;
}

export async function getProductById(id: string) {
  if (!id || typeof id !== 'string') return null;
  const cleanId = decodeURIComponent(id).trim();
  const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(cleanId);

  try {
    const selectQuery = '*, group_slug, variant_name, brands(*), product_variants(*), variants(*), categories(name_az, slug)';
    
    let data: any = null;
    try {
      const res = await supabase
        .from('products')
        .select(selectQuery)
        .eq('id', cleanId)
        .maybeSingle();
      data = res.data;
    } catch {
      const fallbackRes = await supabase
        .from('products')
        .select('*, brands(*), variants(*)')
        .eq('id', cleanId)
        .maybeSingle();
      data = fallbackRes.data;
    }

    if (!data && !isUuid) {
      try {
        const slugRes = await supabase
          .from('products')
          .select(selectQuery)
          .eq('slug', cleanId)
          .maybeSingle();
        data = slugRes.data;
      } catch {
        const fallbackSlugRes = await supabase
          .from('products')
          .select('*, brands(*), variants(*)')
          .eq('slug', cleanId)
          .maybeSingle();
        data = fallbackSlugRes.data;
      }
    }

    if (!data) {
      const simpleRes = await supabase
        .from('products')
        .select('*')
        .eq('id', cleanId)
        .maybeSingle();
      data = simpleRes.data;
    }

    if (data) {
      let rawVars = (Array.isArray(data.variants) && data.variants.length > 0)
        ? data.variants
        : ((Array.isArray(data.product_variants) && data.product_variants.length > 0) ? data.product_variants : []);

      if (rawVars.length === 0 && data.id) {
        try {
          const { data: directVars } = await supabase
            .from('variants')
            .select('*')
            .eq('product_id', data.id);
          if (directVars && directVars.length > 0) {
            rawVars = directVars;
          } else {
            const { data: directPVars } = await supabase
              .from('product_variants')
              .select('*')
              .eq('product_id', data.id);
            if (directPVars && directPVars.length > 0) {
              rawVars = directPVars;
            }
          }
        } catch (e) {}
      }

      const normalizedVars = rawVars.map((v: any) => ({
        ...v,
        price_azn: v.price_azn ?? v.price ?? 0,
        compare_at_price_azn: v.compare_at_price_azn ?? v.discount_price ?? v.compare_at_price ?? 0,
        stock_quantity: v.stock_quantity ?? v.stock ?? 0,
        sku: v.sku ?? '',
        name_az: v.name_az ?? v.name ?? v.title_az ?? v.title ?? '',
        name_en: v.name_en ?? v.name ?? v.title_en ?? v.title ?? '',
        name_ru: v.name_ru ?? v.name ?? v.title_ru ?? v.title ?? '',
        image_url: v.image_url ?? v.image ?? null,
      }));

      data.variants = normalizedVars;
      data.product_variants = normalizedVars;
    }

    return data || null;
  } catch (err) {
    console.error('getProductById exception:', err);
    return null;
  }
}

export async function getProductBySlug(slug: string) {
  if (!slug || typeof slug !== 'string') return null;
  const cleanSlug = decodeURIComponent(slug).trim();
  const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(cleanSlug);

  try {
    const selectQuery = '*, group_slug, variant_name, brands(*), product_variants(*), variants(*), categories(name_az, slug)';
    
    let data: any = null;
    try {
      const res = await supabase
        .from('products')
        .select(selectQuery)
        .eq('slug', cleanSlug)
        .maybeSingle();
      data = res.data;
    } catch {
      const fallbackRes = await supabase
        .from('products')
        .select('*, brands(*), variants(*)')
        .eq('slug', cleanSlug)
        .maybeSingle();
      data = fallbackRes.data;
    }

    if (!data && isUuid) {
      try {
        const idRes = await supabase
          .from('products')
          .select(selectQuery)
          .eq('id', cleanSlug)
          .maybeSingle();
        data = idRes.data;
      } catch {
        const fallbackIdRes = await supabase
          .from('products')
          .select('*, brands(*), variants(*)')
          .eq('id', cleanSlug)
          .maybeSingle();
        data = fallbackIdRes.data;
      }
    }

    if (!data) {
      const simpleSlugRes = await supabase
        .from('products')
        .select('*')
        .eq('slug', cleanSlug)
        .maybeSingle();
      data = simpleSlugRes.data;

      if (!data && isUuid) {
        const simpleIdRes = await supabase
          .from('products')
          .select('*')
          .eq('id', cleanSlug)
          .maybeSingle();
        data = simpleIdRes.data;
      }
    }

    if (data) {
      let rawVars = (Array.isArray(data.variants) && data.variants.length > 0)
        ? data.variants
        : ((Array.isArray(data.product_variants) && data.product_variants.length > 0) ? data.product_variants : []);

      if (rawVars.length === 0 && data.id) {
        try {
          const { data: directVars } = await supabase
            .from('variants')
            .select('*')
            .eq('product_id', data.id);
          if (directVars && directVars.length > 0) {
            rawVars = directVars;
          } else {
            const { data: directPVars } = await supabase
              .from('product_variants')
              .select('*')
              .eq('product_id', data.id);
            if (directPVars && directPVars.length > 0) {
              rawVars = directPVars;
            }
          }
        } catch (e) {}
      }

      const normalizedVars = rawVars.map((v: any) => ({
        ...v,
        price_azn: v.price_azn ?? v.price ?? 0,
        compare_at_price_azn: v.compare_at_price_azn ?? v.discount_price ?? v.compare_at_price ?? 0,
        stock_quantity: v.stock_quantity ?? v.stock ?? 0,
        sku: v.sku ?? '',
        name_az: v.name_az ?? v.name ?? v.title_az ?? v.title ?? '',
        name_en: v.name_en ?? v.name ?? v.title_en ?? v.title ?? '',
        name_ru: v.name_ru ?? v.name ?? v.title_ru ?? v.title ?? '',
        image_url: v.image_url ?? v.image ?? null,
      }));

      data.variants = normalizedVars;
      data.product_variants = normalizedVars;
    }

    return data || null;
  } catch (err) {
    console.error('getProductBySlug exception:', err);
    return null;
  }
}

export async function getActiveProducts() {
  try {
    // Primary query using 'variants (*)' table relationship
    let { data, error } = await supabase
      .from('products')
      .select('*, brands (*), variants (*)')
      .eq('is_active', true);
      
    if (error) {
      // Secondary fallback query if variants relationship is named product_variants
      const fallbackResult = await supabase
        .from('products')
        .select('*, brands (*), product_variants (*)')
        .eq('is_active', true);

      if (!fallbackResult.error && fallbackResult.data) {
        data = fallbackResult.data;
        error = null;
      } else {
        const simpleResult = await supabase
          .from('products')
          .select('*, brands (*)')
          .eq('is_active', true);
        data = simpleResult.data;
        error = simpleResult.error;
      }
    }
    
    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }
    
    if (!data || !Array.isArray(data)) return [];
    const uniqueProducts = Array.from(new Map(data.map((p: any) => [p.id, p])).values());
    return uniqueProducts as RawProduct[];
  } catch (err) {
    console.error('getActiveProducts exception:', err);
    return [];
  }
}

/**
 * Fetch all sibling products sharing a group_slug.
 */
export async function getSiblingProductsByGroupSlug(groupSlug: string) {
  if (!groupSlug || typeof groupSlug !== 'string') return [];
  try {
    let { data, error } = await supabase
      .from('products')
      .select('*, group_slug, variant_name, brands(*), categories(name_az, slug)')
      .eq('group_slug', groupSlug)
      .eq('is_active', true)
      .eq('status', 'published');

    if (error || !data || data.length === 0) {
      const fallback = await supabase
        .from('products')
        .select('*, group_slug, variant_name, brands(*), categories(name_az, slug)')
        .eq('group_slug', groupSlug)
        .eq('is_active', true);
      data = fallback.data;
    }
    return data || [];
  } catch (err) {
    console.error('getSiblingProductsByGroupSlug exception:', err);
    return [];
  }
}

/**
 * Fetch all sibling products belonging to a family (e.g., family_slug or product_family).
 */
export async function getProductFamilySiblings(familyIdentifier: string) {
  if (!familyIdentifier || typeof familyIdentifier !== 'string') return [];
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, brands (*), variants (*)')
      .or(`family_slug.eq.${familyIdentifier},product_family.eq.${familyIdentifier}`)
      .eq('is_active', true);

    if (error || !data) return [];
    return data;
  } catch (err) {
    console.error('getProductFamilySiblings exception:', err);
    return [];
  }
}

/**
 * Flattens products with variants into individual catalog items for grid rendering.
 */
export function flattenProductsWithVariants(products: Product[]): Product[] {
  if (!products || !Array.isArray(products)) return [];

  const flattened: Product[] = [];

  for (const product of products) {
    const rawVariants = product.product_variants || product.variants || [];

    if (Array.isArray(rawVariants) && rawVariants.length > 1) {
      const parentTitle = product.title || (product as any).name || '';
      const parentSlug = product.slug || product.id;

      rawVariants.forEach((v: any, index: number) => {
        const variantName = v.name || v.title_az || v.title || v.name_az || `Variant ${index + 1}`;
        const fullTitle = variantName.toLowerCase().includes(parentTitle.toLowerCase())
          ? variantName
          : `${parentTitle} (${variantName})`;

        const vPrice = v.price !== undefined && v.price !== null && v.price !== ''
          ? Number(v.price)
          : (v.price_azn !== undefined ? Number(v.price_azn) : Number(product.price_azn || 0));

        const vComparePrice = v.compare_at_price_azn || v.discount_price || v.original_price || product.compare_at_price_azn;

        const vStock = v.stock !== undefined && v.stock !== null
          ? Number(v.stock)
          : (v.stock_quantity !== undefined ? Number(v.stock_quantity) : Number(product.stock_quantity || 0));

        const vImage = v.image_url || v.image || (Array.isArray(v.images) ? v.images[0] : null) || product.image_url;
        const vSku = v.sku || `${product.sku || 'SKU'}-${index + 1}`;

        // Embed searchParam into slug so ProductCard automatically opens the variant
        const variantSlugParam = v.sku ? v.sku : (v.id || index);
        const cardSlug = `${parentSlug}?variant=${encodeURIComponent(variantSlugParam)}`;

        flattened.push({
          ...product,
          id: `${product.id}__var_${v.id || v.sku || index}`,
          original_product_id: product.id,
          variant_id: v.id,
          title: fullTitle,
          name: fullTitle,
          price_azn: vPrice,
          compare_at_price_azn: vComparePrice ? Number(vComparePrice) : undefined,
          original_price_azn: vComparePrice ? Number(vComparePrice) : undefined,
          image_url: sanitizeImageUrl(vImage, product.id),
          stock_quantity: vStock,
          sku: vSku,
          variant_sku: vSku,
          slug: cardSlug,
          is_variant_card: true,
          variant_name: variantName,
        });
      });
    } else {
      flattened.push(product);
    }
  }

  return flattened;
}

export function mapProductToLocale(raw: RawProduct, locale: string): Product & { [key: string]: any } {
  const titleKey = `title_${locale}` as keyof RawProduct;
  const descKey = `description_${locale}` as keyof RawProduct;
  
  const currentPrice = Number(raw.price_azn || raw.price || 0);

  // Extract all potential old/compare price fields
  const rawCompareCandidates = [
    raw.compare_at_price_azn,
    raw.compare_at_price,
    raw.discount_price,
    raw.old_price,
    raw.original_price_azn,
    raw.original_price
  ]
    .map(v => (v !== undefined && v !== null && v !== '') ? Number(v) : NaN)
    .filter(v => !isNaN(v) && v > 0);

  // Find candidate different from current price
  const oldPriceCandidate = rawCompareCandidates.find(v => v !== currentPrice);

  let finalPrice = currentPrice;
  let finalOldPrice: number | undefined = undefined;

  if (oldPriceCandidate) {
    if (oldPriceCandidate > currentPrice) {
      finalPrice = currentPrice;
      finalOldPrice = oldPriceCandidate;
    } else if (oldPriceCandidate < currentPrice) {
      finalPrice = oldPriceCandidate;
      finalOldPrice = currentPrice;
    }
  } else if (raw.discount_percent && Number(raw.discount_percent) > 0 && currentPrice > 0) {
    finalPrice = currentPrice;
    finalOldPrice = Math.round((currentPrice / (1 - Number(raw.discount_percent) / 100)) * 100) / 100;
  }

  const calculatedPercent = (finalOldPrice && finalOldPrice > finalPrice && finalPrice > 0)
    ? Math.round(((finalOldPrice - finalPrice) / finalOldPrice) * 100)
    : (raw.discount_percent ? Number(raw.discount_percent) : undefined);

  // Universal Brand Resolution directly from database properties (Zero hardcoding)
  const resolvedBrand = (
    raw.brands?.name ||
    raw.brand_name ||
    raw.brand ||
    ''
  ).toString().trim();

  const cleanBrand = (resolvedBrand && !['OTHER', 'OTHER BRAND', 'UNKNOWN', 'DEFAULTS'].includes(resolvedBrand.toUpperCase()))
    ? resolvedBrand
    : '';

  const productVariants = raw.product_variants || raw.variants || [];

  return {
    ...raw,
    id: raw.id,
    title: (raw[titleKey] || raw.title_az || raw.name || raw.name_az || '') as string,
    description: (raw[descKey] || raw.description_az || '') as string,
    price_azn: finalPrice,
    compare_at_price_azn: finalOldPrice,
    original_price_azn: finalOldPrice,
    compare_at_price: finalOldPrice,
    discount_price: finalOldPrice,
    old_price: finalOldPrice,
    discount_percent: calculatedPercent,
    image_url: sanitizeImageUrl(raw.image_url, raw.id || 'default'),
    stock_quantity: Number(raw.stock_quantity || 0),
    slug: raw.slug || undefined,
    brands: raw.brands || undefined,
    brand: cleanBrand || undefined,
    brand_name: cleanBrand || undefined,
    brand_id: raw.brand_id || undefined,
    product_variants: productVariants,
    variants: productVariants,
    family_slug: raw.family_slug || raw.product_family || undefined,
    product_family: raw.product_family || raw.family_slug || undefined,
  };
}
