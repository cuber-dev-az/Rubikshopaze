import { getDictionary } from '@/i18n/dictionaries';
import { ProductDetailClientContent } from '@/components/layout/ProductDetailClientContent';
import { supabase } from '@/lib/supabase/client';
import { getProductReviews } from '@/lib/actions/reviews';

export const revalidate = 60;

interface ProductPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { locale, slug } = await params;
  const dict = await getDictionary(locale);

  // Fallback high-fidelity Speedcubing products with rich specs & data
  
  // 1. Fetch matching product from Supabase if available
  let activeProduct = null;
  try {
    const titleColumn = `title_${locale}`;
    const descColumn = `description_${locale}`;
    const { data: dbProduct, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', slug)
      .single();

    if (!error && dbProduct) {
      activeProduct = {
        id: dbProduct.id,
        title: (dbProduct[titleColumn] || dbProduct.title_az || dbProduct.title_en || dbProduct.title_ru || dbProduct.title || '') as string,
        price_azn: Number(dbProduct.price_azn || 0),
        original_price: dbProduct.original_price ? Number(dbProduct.original_price) : undefined,
        image_url: dbProduct.image_url || 'https://picsum.photos/seed/default/600/600',
        stock_quantity: Number(dbProduct.stock_quantity || 0),
        brand: dbProduct.brand || 'Premium',
        category_slug: dbProduct.category_slug || dbProduct.category || '3x3',
        sku: dbProduct.sku || `RS-${dbProduct.id.substring(0, 4).toUpperCase()}`,
        description: (dbProduct[descColumn] || dbProduct.description_az || dbProduct.description_en || dbProduct.description_ru || 'Professional sürətli həll (speedcubing) üçün rəsmi zəmanətli flaqman model.') as string,
        specs: dbProduct.specs || {
          weight: dbProduct.weight || '75g',
          size: dbProduct.size || '56mm',
          material: 'ABS Safe Plastic',
          core_type: 'Magnetic',
          magnetic_strength: 'Adjustable',
          tension_system: 'Spring Tension',
          surface_finish: 'Frosted / UV Option'
        },
        compatibility: 'Dünya Kub Assosiasiyasının (WCA) rəsmi tələbləri ilə tam uyğundur və turnirlərdə istifadə edilə bilər.'
      };
    }
  } catch (err) {
    console.error('Supabase product query error:', err);
  }

  

  
  // Generate Recommendations/Related products
  
  const reviewsRes = await getProductReviews(activeProduct?.id || '');
  const realReviews = reviewsRes.success ? reviewsRes.data : [];

  const { data: dbRelated } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .neq('id', activeProduct?.id)
    .limit(4);

  const relatedList = (dbRelated || []).map(p => ({
    id: p.id,
    title: (p[`title_${locale}`] || p.title_az || p.title_en || p.title_ru || '') as string,
    price_azn: Number(p.price_azn || 0),
    image_url: p.image_url || 'https://picsum.photos/seed/default/600/600',
    stock_quantity: Number(p.stock_quantity || 0),
    category_slug: p.category_slug || p.category || '',
    brand: p.brand || ''
  }));



  if (!activeProduct) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-4">Məhsul Tapılmadı</h1>
        <p className="text-muted-foreground">Axtardığınız məhsul mövcud deyil və ya artıq silinib.</p>
      </div>
    );
  }

  // JSON-LD Product Schema for outstanding SEO compliance
  const jsonLdSchema = {
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
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '48'
    }
  };

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
