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

  // Resolve brand name safely
  const rawBrand = (
    raw.brands?.name ||
    raw.brand_name ||
    raw.brand ||
    ''
  ).trim();

  let resolvedBrand = '';
  if (rawBrand && !['OTHER', 'OTHER BRAND', 'UNKNOWN', 'DEFAULTS'].includes(rawBrand.toUpperCase())) {
    resolvedBrand = rawBrand;
  } else {
    const title = (raw[titleKey] || raw.title_az || raw.name || raw.name_az || '').toLowerCase();
    if (title.includes('z-cube') || title.includes('zcube') || title.includes('z cube')) resolvedBrand = 'Z-Cube';
    else if (title.includes('moyu')) resolvedBrand = 'MoYu';
    else if (title.includes('qiyi')) resolvedBrand = 'QiYi';
    else if (/\bgan\b/.test(title)) resolvedBrand = 'GAN';
    else if (title.includes('shengshou')) resolvedBrand = 'ShengShou';
    else if (title.includes('yuxin')) resolvedBrand = 'YuXin';
    else if (title.includes('diansheng')) resolvedBrand = 'DianSheng';
    else if (title.includes('dayan')) resolvedBrand = 'DaYan';
    else if (title.includes('monster go') || title.includes('monstergo')) resolvedBrand = 'Monster Go';
  }

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
    brand: resolvedBrand || undefined,
    brand_name: resolvedBrand || undefined,
    brand_id: raw.brand_id || undefined,
    product_variants: productVariants,
  };
}
