import { getDictionary } from '@/i18n/dictionaries';
import { ProductDetailClientContent } from '@/components/layout/ProductDetailClientContent';
import { supabase } from '@/lib/supabase/client';
import { getProductReviews } from '@/lib/actions/reviews';
import Link from 'next/link';

export const revalidate = 60;

interface ProductPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { locale, slug: rawParamSlug } = await params;
  const dict = await getDictionary(locale);

  const rawSlug = decodeURIComponent(rawParamSlug || '').trim();
  const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(rawSlug);

  // 1. Fetch matching product from Supabase if available
  let activeProduct = null;
  try {
    const titleColumn = `title_${locale}`;
    const descColumn = `description_${locale}`;
    const nameColumn = `name_${locale}`;

    let dbProduct = null;

    // Primary query with joins
    const selectQuery = '*, variants(*), brands(name, slug), categories(name_az, slug)';
    const filterCond = isUuid
      ? `id.eq.${rawSlug},slug.eq.${rawSlug}`
      : `slug.eq.${rawSlug},slug.ilike.${rawSlug}`;

    const { data: primaryData, error: primaryErr } = await supabase
      .from('products')
      .select(selectQuery)
      .or(filterCond)
      .maybeSingle();

    if (!primaryErr && primaryData) {
      dbProduct = primaryData;
    } else {
      // Fallback 1: Simple select without joins to prevent FK embed errors
      const { data: fallbackData } = await supabase
        .from('products')
        .select('*')
        .or(filterCond)
        .maybeSingle();

      if (fallbackData) {
        dbProduct = fallbackData;
      } else {
        // Fallback 2: Fuzzy slug / title match
        const cleanTerm = rawSlug.replace(/[^a-zA-Z0-9]/g, '%');
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
      const brandName = dbProduct.brands?.name || dbProduct.brand_name || dbProduct.brand || 'Z-Cube';
      const cleanBrandName = (brandName && brandName.toUpperCase() !== 'OTHER') ? brandName : 'Z-Cube';

      const categoryName = dbProduct.categories?.name_az || dbProduct.category_name || 'Açarlıqlar';
      const categorySlug = dbProduct.categories?.slug || dbProduct.category_slug || dbProduct.category || '3x3';

      const titleVal = dbProduct[titleColumn] || dbProduct[nameColumn] || dbProduct.name_az || dbProduct.title_az || dbProduct.title_en || dbProduct.name || dbProduct.title || 'Məhsul';
      const descVal = dbProduct[descColumn] || dbProduct.description_az || dbProduct.description_en || dbProduct.description_ru || dbProduct.description || 'Professional sürətli həll (speedcubing) üçün rəsmi zəmanətli flaqman model.';

      const priceVal = Number(dbProduct.price ?? dbProduct.price_azn ?? 0);
      const origPriceVal = dbProduct.discount_price ?? dbProduct.compare_at_price ?? dbProduct.compare_at_price_azn ?? dbProduct.old_price;

      activeProduct = {
        id: dbProduct.id,
        title: String(titleVal),
        price_azn: priceVal,
        original_price: origPriceVal ? Number(origPriceVal) : undefined,
        image_url: dbProduct.image_url || 'https://picsum.photos/seed/default/600/600',
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
        variants: dbProduct.variants || [],
        gallery_images: dbProduct.gallery_images || dbProduct.images || null,
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

  const { data: dbRelated } = await supabase
    .from('products')
    .select('*, brands(name), categories(name_az, slug)')
    .eq('is_active', true)
    .neq('id', activeProduct.id)
    .limit(4);

  const relatedList = (dbRelated || []).map(p => {
    const relBrand = p.brands?.name || p.brand_name || p.brand || 'Z-Cube';
    const cleanRelBrand = (relBrand && relBrand.toUpperCase() !== 'OTHER') ? relBrand : 'Z-Cube';
    return {
      id: p.id,
      title: (p[`title_${locale}`] || p[`name_${locale}`] || p.title_az || p.name_az || p.title || p.name || '') as string,
      price_azn: Number(p.price ?? p.price_azn ?? 0),
      image_url: p.image_url || 'https://picsum.photos/seed/default/600/600',
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
          relatedProducts={relatedList}
          locale={locale}
          dict={dict}
          initialReviews={realReviews}
        />
      </div>
    </>
  );
}

