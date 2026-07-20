'use client';

import * as React from 'react';
import { HomepageContent } from '@/components/layout/HomepageContent';
import { getActiveProducts, mapProductToLocale, Product } from '@/lib/supabase/queries/products';
import { applyCampaignDiscounts } from '@/lib/actions/campaigns';
import { createClient } from '@/lib/supabase/client';
import azDict from '../../../messages/az.json';
import enDict from '../../../messages/en.json';
import ruDict from '../../../messages/ru.json';

const dictionaries: Record<string, any> = {
  az: azDict,
  en: enDict,
  ru: ruDict,
};

interface PageProps {
  params: Promise<{
    locale: string;
  }> | {
    locale: string;
  };
}

export default function StorefrontPage({ params }: PageProps) {
  const resolvedParams = params && typeof (params as any).then === 'function'
    ? React.use(params as any) as any
    : params;
  
  const locale = resolvedParams?.locale || 'az';
  const dict = dictionaries[locale] || dictionaries.az;

  const [products, setProducts] = React.useState<Product[]>([]);
  const [banners, setBanners] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        
        // Fetch banners
        const { data: bannersData } = await supabase
          .from('banners')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });
          
        setBanners(bannersData || []);
        
        // Fetch products
        const rawProducts = await getActiveProducts();
        const formatted = rawProducts.map((p) => mapProductToLocale(p, locale));
        const withDiscounts = await applyCampaignDiscounts(formatted);
        setProducts(withDiscounts);
      } catch (err) {
        console.error('Error loading storefront data:', err);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [locale]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-rubik-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HomepageContent
        products={products}
        dict={dict}
        locale={locale}
        banners={banners}
      />
    </div>
  );
}

