import { supabase } from '../client';

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
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true);
    
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  
  return data as RawProduct[];
}

export function mapProductToLocale(raw: RawProduct, locale: string): Product {
  const titleKey = `title_${locale}` as keyof RawProduct;
  const descKey = `description_${locale}` as keyof RawProduct;
  
  return {
    id: raw.id,
    title: (raw[titleKey] || raw.title_az || '') as string,
    description: (raw[descKey] || raw.description_az || '') as string,
    price_azn: Number(raw.price_azn || 0),
    image_url: raw.image_url || 'https://picsum.photos/seed/default/600/600',
    stock_quantity: Number(raw.stock_quantity || 0),
    compare_at_price_azn: raw.compare_at_price_azn ? Number(raw.compare_at_price_azn) : undefined,
    original_price_azn: raw.original_price_azn ? Number(raw.original_price_azn) : undefined,
    discount_percent: raw.discount_percent ? Number(raw.discount_percent) : undefined,
    slug: raw.slug || undefined,
  };
}
