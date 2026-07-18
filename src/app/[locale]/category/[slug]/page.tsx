import { getDictionary } from '@/i18n/dictionaries';
import { CategoryClientContent } from '@/components/layout/CategoryClientContent';
import { rubikTaxonomyGroups } from '@/lib/config/catalog';
import { getActiveProducts, mapProductToLocale, Product } from '@/lib/supabase/queries/products';

export const revalidate = 60;

interface CategoryPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { locale, slug } = await params;
  const dict = await getDictionary(locale);

  // Find matching taxonomy category item across all groups
  let categoryItem = null;
  for (const group of rubikTaxonomyGroups) {
    const found = group.items.find((item) => item.slug === slug);
    if (found) {
      categoryItem = {
        id: found.id,
        slug: found.slug,
        title: found.title,
        description: found.description
      };
      break;
    }
  }

  let formattedProducts: Product[] = [];
  try {
    const products = await getActiveProducts();
    // Add additional fields used by CategoryClientContent
    formattedProducts = products.map((p) => ({
      ...mapProductToLocale(p, locale),
      category_slug: p.category_slug || p.category || undefined,
      brand: p.brand || undefined,
      mechanics: p.mechanics || undefined
    }));
  } catch (err) {
    console.error('Failed to load products:', err);
  }

  return (
    <div className="min-h-screen bg-background">
      <CategoryClientContent
        initialProducts={formattedProducts}
        categoryItem={categoryItem}
        locale={locale}
        dict={dict}
      />
    </div>
  );
}
