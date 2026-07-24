import { getDictionary } from '@/i18n/dictionaries';
import { ProductDetailClientContent } from '@/components/layout/ProductDetailClientContent';
import { supabase } from '@/lib/supabase/client';
import { getProductReviews } from '@/lib/actions/reviews';
import { sanitizeImageUrl } from '@/lib/image';
import { getProductBySlug } from '@/lib/supabase/queries/products';
import Link from 'next/link';

export const revalidate = 60;

interface ProductPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

function getSmartCategory(dbProduct: any) {
  let name = dbProduct?.categories?.name_az || dbProduct?.category_name;
  let slug = dbProduct?.categories?.slug || dbProduct?.category_slug || dbProduct?.category;

  if (name && slug && name !== 'Açarlıqlar') {
    return { name, slug };
  }

  const titleLower = (dbProduct?.title_az || dbProduct?.name_az || dbProduct?.title || dbProduct?.name || '').toLowerCase();
  
  if (titleLower.includes('mat') || titleLower.includes('pad') || titleLower.includes('xalça') || titleLower.includes('kovrik')) {
    return { name: 'Matlar və Aksesuarlar', slug: 'mats' };
  }
  if (titleLower.includes('açarlıq') || titleLower.includes('brelok') || titleLower.includes('keychain')) {
    return { name: 'Açarlıqlar', slug: 'keychains' };
  }
  if (titleLower.includes('yağ') || titleLower.includes('lube') || titleLower.includes('смазка')) {
    return { name: 'Yağlar və Baxım', slug: 'lubes' };
  }
  if (titleLower.includes('taymer') || titleLower.includes('timer')) {
    return { name: 'Taymerlər', slug: 'timers' };
  }
  if (titleLower.includes('2x2')) return { name: '2x2 Kublar', slug: '2x2' };
  if (titleLower.includes('3x3')) return { name: '3x3 Kublar', slug: '3x3' };
  if (titleLower.includes('4x4')) return { name: '4x4 Kublar', slug: '4x4' };
  if (titleLower.includes('5x5')) return { name: '5x5 Kublar', slug: '5x5' };
  if (titleLower.includes('pyraminx') || titleLower.includes('piramida')) return { name: 'Pyraminx', slug: 'pyraminx' };
  if (titleLower.includes('megaminx')) return { name: 'Megaminx', slug: 'megaminx' };
  if (titleLower.includes('skewb')) return { name: 'Skewb', slug: 'skewb' };
  if (titleLower.includes('square-1') || titleLower.includes('sq-1')) return { name: 'Square-1', slug: 'sq-1' };

  if (name && slug) return { name, slug };
  return { name: 'Sürət Kubları', slug: '3x3' };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { locale, slug } = await params;
  const dict = await getDictionary(locale);

  const rawSlug = decodeURIComponent(slug || '').trim();

  // 1. Fetch matching product safely using getProductBySlug
  let activeProduct = null;
  let siblingProducts: any[] = [];
  try {
    const titleColumn = `title_${locale}`;
    const descColumn = `description_${locale}`;
    const nameColumn = `name_${locale}`;

    let dbProduct = await getProductBySlug(rawSlug);

    if (!dbProduct) {
      // Fallback: fuzzy match on title or name using maybeSingle
      const cleanTerm = rawSlug.replace(/[^a-zA-Z0-9]/g, '%');
      if (cleanTerm.length > 2) {
        const { data: fuzzyData } = await supabase
          .from('products')
          .select('*')
          .or(`slug.ilike.%${cleanTerm}%,name_az.ilike.%${cleanTerm}%,title_az.ilike.%${cleanTerm}%`)
          .limit(1)
          .maybeSingle();
        dbProduct = fuzzyData;
      }
    }

    if (dbProduct) {
      const brandName = dbProduct.brands?.name || dbProduct.brand_name || dbProduct.brand || '';
      const cleanBrandName = (brandName && brandName.toUpperCase() !== 'OTHER') ? brandName : '';

      const smartCat = getSmartCategory(dbProduct);
      const categoryName = smartCat.name;
      const categorySlug = smartCat.slug;

      const titleVal = dbProduct[titleColumn] || dbProduct[nameColumn] || dbProduct.name_az || dbProduct.title_az || dbProduct.title_en || dbProduct.name || dbProduct.title || 'Məhsul';
      const descVal = dbProduct[descColumn] || dbProduct.description_az || dbProduct.description_en || dbProduct.description_ru || dbProduct.description || 'Professional sürətli həll (speedcubing) üçün rəsmi zəmanətli flaqman model.';

      const priceVal = Number(dbProduct.price ?? dbProduct.price_azn ?? 0);
      const origPriceVal = dbProduct.discount_price ?? dbProduct.compare_at_price ?? dbProduct.compare_at_price_azn ?? dbProduct.old_price;

      const activeVariants = (Array.isArray(dbProduct.variants) && dbProduct.variants.length > 0)
        ? dbProduct.variants
        : ((Array.isArray(dbProduct.product_variants) && dbProduct.product_variants.length > 0) ? dbProduct.product_variants : []);

      siblingProducts = [];
      const groupSlugToQuery = dbProduct.group_slug || (activeVariants.length > 0 ? dbProduct.slug : null);
      if (groupSlugToQuery && typeof groupSlugToQuery === 'string' && groupSlugToQuery.trim()) {
        try {
          const cleanGroupSlug = groupSlugToQuery.trim();
          let sibRows: any[] | null = null;
          
          try {
            const { data, error } = await supabase
              .from('products')
              .select('*, brands(name), categories(name_az, slug)')
              .or(`group_slug.eq.${cleanGroupSlug},slug.eq.${cleanGroupSlug}`)
              .eq('is_active', true);
            if (!error && data) {
              sibRows = data;
            }
          } catch {
            sibRows = null;
          }

          if (!sibRows || sibRows.length === 0) {
            const { data: fallbackData } = await supabase
              .from('products')
              .select('*, brands(name), categories(name_az, slug)')
              .eq('group_slug', cleanGroupSlug)
              .eq('is_active', true);
            sibRows = fallbackData;
          }

          if (sibRows && Array.isArray(sibRows) && sibRows.length > 0) {
            siblingProducts = sibRows.map((s: any) => ({
              id: s.id,
              slug: s.slug,
              group_slug: s.group_slug || cleanGroupSlug,
              sku: s.sku || `SKU-${String(s.id).substring(0, 4)}`,
              variant_name: s.variant_name || s.title_az || s.name_az || s.title || s.name || s.sku,
              title: s[`title_${locale}`] || s[`name_${locale}`] || s.title_az || s.name_az || s.title || s.name,
              price_azn: Number(s.price ?? s.price_azn ?? 0),
              original_price: s.discount_price ?? s.compare_at_price_azn ?? s.compare_at_price,
              stock_quantity: Number(s.stock_quantity || 0),
              image_url: sanitizeImageUrl(s.image_url, String(s.id)),
              gallery_images: s.gallery_images || s.images || null,
              is_current: String(s.id) === String(dbProduct.id) || s.slug === dbProduct.slug
            }));
          }
        } catch (e) {
          console.error('Error fetching sibling products:', e);
        }
      }

      activeProduct = {
        id: dbProduct.id,
        slug: dbProduct.slug,
        group_slug: dbProduct.group_slug,
        title: String(titleVal),
        price_azn: priceVal,
        original_price: origPriceVal ? Number(origPriceVal) : undefined,
        image_url: sanitizeImageUrl(dbProduct.image_url, dbProduct.id),
        stock_quantity: Number(dbProduct.stock_quantity || 0),
        brand: cleanBrandName,
        brands: dbProduct.brands,
        category_slug: categorySlug,
        category_name: categoryName,
        categories: dbProduct.categories,
        product_type: dbProduct.product_type,
        is_magnetic: dbProduct.is_magnetic,
        sku: dbProduct.sku || `RS-${String(dbProduct.id).substring(0, 4).toUpperCase()}`,
        description: String(descVal),
        specs: dbProduct.specs || {
          weight: dbProduct.weight_g ? `${dbProduct.weight_g}g` : (dbProduct.weight || '75g'),
          size: dbProduct.size_mm ? `${dbProduct.size_mm}mm` : (dbProduct.size || '56mm'),
          material: 'ABS Safe Plastic',
          core_type: dbProduct.is_magnetic ? 'Magnetic' : 'Standard',
          magnetic_strength: dbProduct.is_magnetic ? 'Adjustable' : 'None',
          tension_system: 'Spring Tension',
          surface_finish: 'Frosted / UV Option'
        },
        compatibility: 'Dünya Kub Assosiasiyasının (WCA) rəsmi tələbləri ilə tam uyğundur və turnirlərdə istifadə edilə bilər.',
        variants: activeVariants,
        gallery_images: dbProduct.gallery_images || dbProduct.images || null,
        add_ons: dbProduct.add_ons,
        has_setup: dbProduct.has_setup
      };
    }
  } catch (err) {
    console.error('Supabase product query error:', err);
  }

  if (!activeProduct) {
    return (
      <div className="min-h-[70vh] bg-background flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-black text-foreground mb-3">Məhsul Tapılmadı</h1>
        <p className="text-muted-foreground mb-6 max-w-md">Axtardığınız məhsul mövcud deyil, silinib və ya ünvan yanlışdır.</p>
        <Link 
          href={`/${locale}`}
          className="px-6 py-3 bg-rubik-brand text-white font-bold rounded-xl shadow-md hover:bg-rubik-brand-dark transition-colors"
        >
          Ana Səhifəyə Qayıt
        </Link>
      </div>
    );
  }

  const reviewsRes = await getProductReviews(activeProduct.id);
  const realReviews = reviewsRes.success ? reviewsRes.data : [];

  const reviewsCount = realReviews.length;
  const ratingSum = realReviews.reduce((acc, r: any) => acc + (r.rating || 0), 0);
  const ratingValue = reviewsCount > 0 ? (ratingSum / reviewsCount).toFixed(1) : null;

  let dbRelatedItems: any[] = [];
  try {
    let relQuery = supabase
      .from('products')
      .select('*, brands(name), categories(name_az, slug)')
      .eq('is_active', true)
      .neq('id', activeProduct.id);

    if (activeProduct.categories?.id || activeProduct.category_id) {
      relQuery = relQuery.eq('category_id', activeProduct.categories?.id || activeProduct.category_id);
    } else if (activeProduct.brand_id) {
      relQuery = relQuery.eq('brand_id', activeProduct.brand_id);
    }

    const { data: matchedRel } = await relQuery.limit(4);
    if (matchedRel && matchedRel.length > 0) {
      dbRelatedItems = matchedRel;
    }

    if (dbRelatedItems.length < 4) {
      const { data: generalRel } = await supabase
        .from('products')
        .select('*, brands(name), categories(name_az, slug)')
        .eq('is_active', true)
        .neq('id', activeProduct.id)
        .limit(8);

      if (generalRel && generalRel.length > 0) {
        const existingIds = new Set(dbRelatedItems.map(p => p.id));
        for (const item of generalRel) {
          if (!existingIds.has(item.id)) {
            dbRelatedItems.push(item);
            if (dbRelatedItems.length >= 4) break;
          }
        }
      }
    }
  } catch (err) {
    console.warn('Related products fetch fallback error:', err);
  }

  const relatedList = dbRelatedItems.map(p => {
    const relBrand = p.brands?.name || p.brand_name || p.brand || '';
    const cleanRelBrand = (relBrand && relBrand.toUpperCase() !== 'OTHER') ? relBrand : '';
    return {
      id: p.id,
      title: (p[`title_${locale}`] || p[`name_${locale}`] || p.title_az || p.name_az || p.title || p.name || '') as string,
      price_azn: Number(p.price ?? p.price_azn ?? 0),
      image_url: sanitizeImageUrl(p.image_url, p.id),
      stock_quantity: Number(p.stock_quantity || 0),
      category_slug: p.categories?.slug || p.category_slug || p.category || '',
      brand: cleanRelBrand
    };
  });

  // JSON-LD Product Schema for outstanding SEO compliance
  const jsonLdSchema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: activeProduct.title,
    image: activeProduct.image_url,
    description: activeProduct.description,
    sku: activeProduct.sku,
    brand: {
      '@type': 'Brand',
      name: activeProduct.brand
    },
    offers: {
      '@type': 'Offer',
      url: `https://rubikshop.az/${locale}/product/${activeProduct.id}`,
      priceCurrency: 'AZN',
      price: activeProduct.price_azn.toString(),
      priceValidUntil: '2028-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: activeProduct.stock_quantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Rubikshop.az'
      }
    }
  };

  if (reviewsCount > 0 && ratingValue) {
    jsonLdSchema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: ratingValue,
      reviewCount: reviewsCount.toString()
    };
  }

  return (
    <>
      {/* Dynamic SEO JSON-LD injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />

      <div className="min-h-screen bg-background">
        <ProductDetailClientContent
          product={activeProduct}
          siblingProducts={siblingProducts}
          relatedProducts={relatedList}
          locale={locale}
          dict={dict}
          initialReviews={realReviews}
        />
      </div>
    </>
  );
}

