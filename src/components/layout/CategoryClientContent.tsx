'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronRight,
  Grid3X3,
  Inbox,
  Home,
  ChevronDown,
  ShoppingBag,
  Sparkles,
  CheckCircle,
  HelpCircle,
  X,
  Star,
  RefreshCw,
  Sliders,
  Check
} from 'lucide-react';
import type { ApplicationDictionary } from '@/types/application.types';
import { useCartStore } from '@/store/useCartStore';
import { ProductCard } from '@/components/ProductCard';

interface Product {
  id: string;
  title: string;
  price_azn: number;
  image_url: string;
  stock_quantity: number;
  category_slug?: string;
  brand?: string;
  mechanics?: 'magnetic' | 'maglev' | 'ball-core' | 'standard' | string;
  created_at?: string;
  slug?: string;
}

interface CategoryClientContentProps {
  initialProducts: Product[];
  categoryItem: {
    id: string;
    slug: string;
    title: { az: string; en: string; ru: string };
    description: { az: string; en: string; ru: string };
  } | null;
  locale: string;
  dict: ApplicationDictionary;
}

const getBrandName = (p: any): string => {
  if (!p) return '';
  
  // Check relational brands object or brand_name if valid string
  if (p.brands && typeof p.brands === 'object' && !Array.isArray(p.brands) && p.brands.name) {
    const bName = String(p.brands.name).trim();
    if (bName && !['OTHER', 'OTHER BRAND', 'UNKNOWN', 'DEFAULTS'].includes(bName.toUpperCase())) return bName;
  }
  if (Array.isArray(p.brands) && p.brands[0]?.name) {
    const bName = String(p.brands[0].name).trim();
    if (bName && !['OTHER', 'OTHER BRAND', 'UNKNOWN', 'DEFAULTS'].includes(bName.toUpperCase())) return bName;
  }
  if (typeof p.brand_name === 'string' && p.brand_name.trim()) {
    const bName = p.brand_name.trim();
    if (bName && !['OTHER', 'OTHER BRAND', 'UNKNOWN', 'DEFAULTS'].includes(bName.toUpperCase())) return bName;
  }
  if (p.brand && typeof p.brand === 'object' && p.brand.name) {
    const bName = String(p.brand.name).trim();
    if (bName && !['OTHER', 'OTHER BRAND', 'UNKNOWN', 'DEFAULTS'].includes(bName.toUpperCase())) return bName;
  }
  if (typeof p.brand === 'string' && p.brand.trim()) {
    const bName = p.brand.trim();
    if (bName && !['OTHER', 'OTHER BRAND', 'UNKNOWN', 'DEFAULTS'].includes(bName.toUpperCase())) return bName;
  }
  
  // Fallback check from product title
  const title = (p.name_az || p.name || p.title_az || p.title || p.title_en || '').toLowerCase();
  if (title.includes('z-cube') || title.includes('zcube') || title.includes('z cube')) return 'Z-Cube';
  if (title.includes('moyu')) return 'MoYu';
  if (title.includes('qiyi')) return 'QiYi';
  if (/\bgan\b/.test(title)) return 'GAN';
  if (title.includes('shengshou')) return 'ShengShou';
  if (title.includes('yuxin')) return 'YuXin';
  if (title.includes('diansheng')) return 'DianSheng';
  if (title.includes('dayan')) return 'DaYan';
  if (title.includes('monster go') || title.includes('monstergo')) return 'Monster Go';
  return '';
};

export function CategoryClientContent({
  initialProducts,
  categoryItem,
  locale,
  dict
}: CategoryClientContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Cart operations
  const addItem = useCartStore((state) => state.addItem);

  

  
  // Merge database items if any
  const baseProducts = React.useMemo(() => {
    const dbMapped = initialProducts.map(p => {
      const pTitle = p.title || (p as any).name || '';
      const resolvedBrand = getBrandName(p) || p.brand || 'Other';
      return {
        ...p,
        category_slug: p.category_slug || null,
        brand: resolvedBrand,
        mechanics: p.mechanics || (pTitle.toLowerCase().includes('maglev') ? 'maglev' : pTitle.toLowerCase().includes('ball-core') ? 'ball-core' : pTitle.toLowerCase().includes('magnetic') ? 'magnetic' : 'standard')
      };
    });

    if (dbMapped.length > 0) {
      if (categoryItem) {
        const targetSlug = categoryItem.slug.toLowerCase();
        const targetId = categoryItem.id.toLowerCase();

        return dbMapped.filter(p => {
          if (!p.category_slug) return true;
          const pCat = p.category_slug.toLowerCase();
          return (
            pCat === targetSlug ||
            pCat === targetId ||
            (targetSlug === '3x3' && (pCat === '3x3-kub' || pCat === '3x3-kublar')) ||
            (targetSlug === '2x2' && (pCat === '2x2-kub' || pCat === '2x2-kublar')) ||
            (targetSlug === '4x4' && (pCat === '4x4-kub' || pCat === '4x4-kublar')) ||
            (targetSlug === '5x5' && (pCat === '5x5-kub' || pCat === '5x5-kublar'))
          );
        });
      }
      return dbMapped;
    }
    return [];
  }, [initialProducts, categoryItem]);


  // Read filters from SearchParams for absolute URL persistence
  const initialMinPrice = Number(searchParams.get('min_price')) || 0;
  const initialMaxPrice = Number(searchParams.get('max_price')) || 250;
  const initialSort = searchParams.get('sort') || 'newest';
  const initialBrands = searchParams.get('brands') ? searchParams.get('brands')!.split(',') : [];
  const initialMechanics = searchParams.get('mechanics') ? searchParams.get('mechanics')!.split(',') : [];

  // Filter States
  const [minPrice, setMinPrice] = React.useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = React.useState(initialMaxPrice);
  const [selectedBrands, setSelectedBrands] = React.useState<string[]>(initialBrands);
  const [selectedMechanics, setSelectedMechanics] = React.useState<string[]>(initialMechanics);
  const [sortOption, setSortOption] = React.useState(initialSort);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = React.useState(false);
  const [isMobileSortOpen, setIsMobileSortOpen] = React.useState(false);

  // Available brands and mechanics dynamically based on category products (filtering empty/Other)
  const availableBrands = React.useMemo(() => {
    const brandsSet = new Set<string>();
    baseProducts.forEach(p => {
      const bName = getBrandName(p);
      if (bName) {
        const upper = bName.toUpperCase();
        if (!['OTHER', 'OTHER BRAND', 'UNKNOWN', 'DEFAULTS'].includes(upper)) {
          brandsSet.add(bName);
        }
      }
    });
    return Array.from(brandsSet);
  }, [baseProducts]);

  const availableMechanics = React.useMemo(() => {
    const mechanicsSet = new Set<string>();
    baseProducts.forEach(p => p.mechanics && mechanicsSet.add(p.mechanics));
    return Array.from(mechanicsSet);
  }, [baseProducts]);

  // Sync state changes with URL Search Params
  const updateUrlParams = React.useCallback(() => {
    const params = new URLSearchParams();
    if (minPrice > 0) params.set('min_price', minPrice.toString());
    if (maxPrice < 250) params.set('max_price', maxPrice.toString());
    if (selectedBrands.length > 0) params.set('brands', selectedBrands.join(','));
    if (selectedMechanics.length > 0) params.set('mechanics', selectedMechanics.join(','));
    if (sortOption !== 'newest') params.set('sort', sortOption);

    window.history.replaceState(null, '', `${pathname}?${params.toString()}`);
  }, [minPrice, maxPrice, selectedBrands, selectedMechanics, sortOption, pathname]);

  React.useEffect(() => {
    updateUrlParams();
  }, [minPrice, maxPrice, selectedBrands, selectedMechanics, sortOption, updateUrlParams]);

  // Filter & Sort Logic
  const filteredProducts = React.useMemo(() => {
    let result = [...baseProducts];

    // Filter by Price range
    result = result.filter(p => p.price_azn >= minPrice && p.price_azn <= maxPrice);

    // Filter by Brand
    if (selectedBrands.length > 0) {
      result = result.filter(p => {
        const bName = getBrandName(p);
        return Boolean(bName && selectedBrands.includes(bName));
      });
    }

    // Filter by Mechanics
    if (selectedMechanics.length > 0) {
      result = result.filter(p => p.mechanics && selectedMechanics.includes(p.mechanics));
    }

    // Sorting options
    if (sortOption === 'price_asc') {
      result.sort((a, b) => a.price_azn - b.price_azn);
    } else if (sortOption === 'price_desc') {
      result.sort((a, b) => b.price_azn - a.price_azn);
    } else if (sortOption === 'stock_high') {
      result.sort((a, b) => b.stock_quantity - a.stock_quantity);
    } else {
      // sort by newest (created_at descending)
      result.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
    }

    return result;
  }, [baseProducts, minPrice, maxPrice, selectedBrands, selectedMechanics, sortOption]);

  const handleBrandChange = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const handleMechanicsChange = (mech: string) => {
    setSelectedMechanics(prev =>
      prev.includes(mech) ? prev.filter(m => m !== mech) : [...prev, mech]
    );
  };

  const clearAllFilters = () => {
    setMinPrice(0);
    setMaxPrice(250);
    setSelectedBrands([]);
    setSelectedMechanics([]);
    setSortOption('newest');
  };

  const t = (obj: { az: string; en: string; ru: string }) => {
    return obj[locale as keyof typeof obj] || obj.az;
  };

  // Get active Category title
  const categoryTitle = categoryItem ? t(categoryItem.title) : t({ az: 'Kataloq', en: 'All Products', ru: 'Каталог' });
  const categoryDesc = categoryItem ? t(categoryItem.description) : t({
    az: 'Professional turnir kublarından tutmuş, sürətli fırlatma yağlarına qədər hər şey.',
    en: 'Everything from professional tournament speedcubes to silicon lubrication formulas.',
    ru: 'Все от профессиональных кубов для соревнований до силиконовых смазок.'
  });

  return (
    <div className="w-full bg-background pb-20">
      {/* Dynamic Breadcrumbs */}
      <div className="bg-muted/40 py-4 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Link href={`/${locale}`} className="hover:text-rubik-brand flex items-center gap-1">
            <Home className="h-3 w-3" />
            <span>{dict.navigation.home}</span>
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-semibold">{categoryTitle}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12 space-y-10">
        {/* Page Header Title */}
        <div className="space-y-3 max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight flex items-center gap-2.5">
            <span className="bg-rubik-brand w-2.5 h-10 rounded-md block shrink-0" />
            <span>{categoryTitle}</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            {categoryDesc}
          </p>
        </div>

        {/* Dynamic Campaign Banner inside layout */}
        <div className="bg-gradient-to-r from-rubik-brand to-rubik-brand-dark rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden shadow-soft-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
          <div className="space-y-2 relative z-10 text-center md:text-left">
            <span className="px-2.5 py-1 bg-white/10 text-white text-[10px] font-black tracking-widest rounded-full uppercase">
              SEZON ENDİRİMİ
            </span>
            <h2 className="text-lg md:text-2xl font-black">
              Bütün GAN və MoYu flaqmanlarına xüsusi 15% Endirim!
            </h2>
            <p className="text-xs text-blue-100 max-w-lg">
              Sifariş zamanı rəsmi Rubikshop Premium Setup xidmətindən pulsuz yararlanın. Peşəkarlarımız sizin üçün kubu nizama salacaq.
            </p>
          </div>
          <span className="bg-white text-rubik-brand font-black text-xs md:text-sm px-5 py-3 rounded-xl shadow-soft-md cursor-default whitespace-nowrap shrink-0">
            KOD: CFOP15
          </span>
        </div>

        {/* Catalog Main Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* A. Sticky Filter Panel (Desktop only) */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-28 bg-card border border-border rounded-2xl p-6 shadow-soft-sm space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="font-bold text-lg text-foreground flex items-center gap-2">
                <Sliders className="h-4 w-4 text-rubik-brand" />
                <span>Filtrlər</span>
              </h2>
              {(selectedBrands.length > 0 || selectedMechanics.length > 0 || minPrice > 0 || maxPrice < 250) && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-red-500 font-bold hover:underline"
                >
                  Təmizlə
                </button>
              )}
            </div>

            {/* Brand Checkbox filter */}
            {availableBrands.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Brend</h4>
                <div className="space-y-2">
                  {availableBrands.map(brand => (
                    <label key={brand} className="flex items-center gap-2.5 text-sm font-medium text-foreground cursor-pointer group">
                      <div className={`h-4.5 w-4.5 rounded border flex items-center justify-center transition-all ${
                        selectedBrands.includes(brand)
                          ? 'bg-rubik-brand border-rubik-brand text-white'
                          : 'border-border group-hover:border-foreground/30 bg-muted/40'
                      }`}>
                        {selectedBrands.includes(brand) && <Check className="h-3.5 w-3.5" />}
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => handleBrandChange(brand)}
                        className="sr-only"
                      />
                      <span>{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Mechanics Checkbox filter */}
            {availableMechanics.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mexanika</h4>
                <div className="space-y-2">
                  {availableMechanics.map(mech => (
                    <label key={mech} className="flex items-center gap-2.5 text-sm font-medium text-foreground cursor-pointer group">
                      <div className={`h-4.5 w-4.5 rounded border flex items-center justify-center transition-all ${
                        selectedMechanics.includes(mech)
                          ? 'bg-rubik-brand border-rubik-brand text-white'
                          : 'border-border group-hover:border-foreground/30 bg-muted/40'
                      }`}>
                        {selectedMechanics.includes(mech) && <Check className="h-3.5 w-3.5" />}
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedMechanics.includes(mech)}
                        onChange={() => handleMechanicsChange(mech)}
                        className="sr-only"
                      />
                      <span className="capitalize">{mech === 'maglev' ? 'MagLev' : mech === 'ball-core' ? 'Ball-Core' : mech === 'magnetic' ? 'Magnetic' : 'Standard'}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Price Range Filter */}
            <div className="space-y-4 pt-2 border-t border-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Qiymət aralığı</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{minPrice} AZN</span>
                  <span>{maxPrice} AZN</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="250"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="w-full accent-rubik-brand cursor-pointer"
                />
              </div>
            </div>
          </aside>

          {/* B. Catalog Results and Grid */}
          <main className="col-span-1 lg:col-span-9 space-y-6">
            {/* Control Bar: Sort and Mobile triggers */}
            <div className="bg-card border border-border p-4 rounded-xl shadow-soft-sm flex items-center justify-between gap-4 flex-wrap">
              <span className="text-sm font-bold text-muted-foreground">
                <span className="text-foreground font-black">{filteredProducts.length}</span> məhsul tapıldı
              </span>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
                {/* Mobile Filter Trigger */}
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-4 py-2.5 bg-muted hover:bg-muted-dark border border-border rounded-xl text-sm font-semibold text-foreground cursor-pointer"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Filtrlər</span>
                </button>

                {/* Sort Logic */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="hidden lg:block h-4 w-4 text-muted-foreground" />
                  {/* Desktop Select */}
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="hidden lg:block bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-rubik-brand font-semibold cursor-pointer"
                  >
                    <option value="newest">Ən Yenilər</option>
                    <option value="price_asc">Qiymət: Ucuzdan bahaya</option>
                    <option value="price_desc">Qiymət: Bahadan ucuza</option>
                    <option value="stock_high">Anbarda olanlar</option>
                  </select>

                  {/* Mobile Sort Trigger */}
                  <button
                    onClick={() => setIsMobileSortOpen(true)}
                    className="lg:hidden flex items-center gap-1.5 px-4 py-2.5 bg-muted hover:bg-muted-dark border border-border rounded-xl text-sm font-semibold text-foreground cursor-pointer"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                    <span>Sıralama</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Grid display with empty state logic */}
            {filteredProducts.length === 0 ? (
              <div className="bg-card border border-border rounded-3xl p-16 text-center space-y-6 shadow-soft-sm flex flex-col items-center justify-center">
                <div className="p-4 bg-muted rounded-full text-muted-foreground shrink-0 animate-bounce">
                  <Inbox className="h-10 w-10" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-foreground">Axtarışa uyğun məhsul tapılmadı</h2>
                  <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mx-auto">
                    Seçdiyiniz qiymət və ya brend filtri üzrə anbarda heç bir məhsul yoxdur. Zəhmət olmasa filtrləri təmizləyib yenidən sınayın.
                  </p>
                </div>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-3 bg-rubik-brand text-white font-bold rounded-xl text-sm hover:bg-rubik-brand-dark transition-all cursor-pointer"
                >
                  Filtrləri Sıfırla
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} dict={dict} />
                ))}
              </div>
            )}

            {/* Pagination Placeholder */}
            {filteredProducts.length > 0 && (
              <div className="pt-8 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Səhifə 1 / 1</span>
                <div className="flex gap-2">
                  <button className="px-4 py-2 border border-border rounded-xl text-xs font-semibold text-muted-foreground cursor-not-allowed" disabled>Əvvəlki</button>
                  <button className="px-4 py-2 bg-foreground text-card rounded-xl text-xs font-semibold hover:bg-foreground/90 transition-all cursor-pointer">Növbəti</button>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* SEO Category Article & Information block */}
        <section className="bg-card border border-border rounded-3xl p-8 lg:p-12 space-y-6">
          <h2 className="text-xl md:text-2xl font-black text-foreground">
            {categoryTitle} Haqqında Ətraflı Məlumat
          </h2>
          <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
            Hər bir sürətli həll (speedcubing) həvəskarının ehtiyac duyduğu premium modellər Rubikshop-da bir araya gəlir. GAN, MoYu və QiYi brendlərinin flaqman məhsulları maqnit gücü və sürtünmə dərəcəsinə görə xüsusi olaraq qruplaşdırılmışdır. Bu məhsulların hamısı Dünya Kub Assosiasiyasının (WCA) rəsmi tələbləri ilə tam uyğundur və rəsmi turnirlərdə istifadə edilə bilər.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-muted p-4 rounded-xl border border-border/40">
              <span className="block font-bold text-foreground mb-1">Maqnit Tənzimlənməsi</span>
              <span className="text-muted-foreground leading-relaxed">Yeni nəsil flaqman kubların daxili kapsullarında yer alan maqnitlər sayəsində hər dönmə tam düzgün bucaq altında dayanır və kilidlənmələrin qarşısını alır.</span>
            </div>
            <div className="bg-muted p-4 rounded-xl border border-border/40">
              <span className="block font-bold text-foreground mb-1">Düzgün Qulluq Qaydaları</span>
              <span className="text-muted-foreground leading-relaxed">Kubun sürətini və fırlanma hissini qorumaq üçün hər 1000 həlldən bir silikon tərkibli xüsusi yağlama maddələrindən istifadə edilməlidir.</span>
            </div>
          </div>
        </section>

        {/* Targeted Accordion FAQ block */}
        <section className="space-y-6">
          <h2 className="text-xl md:text-2xl font-black text-foreground text-center">
            Məhsullar Haqqında Sual-Cavablar
          </h2>
          <div className="max-w-3xl mx-auto space-y-3">
            {[
              { q: 'Bizdə satılan məhsullar zəmanətlidir?', a: 'Bəli, Rubikshop-da satılan hər bir professional sürətli kub modelinə rəsmi istehsalçı və orijinallıq zəmanəti verilir.' },
              { q: 'Sifarişdən sonra kub necə yağlanır və ayarlanır?', a: 'Sifariş qeydində kubu istədiyiniz gərginlikdə və sürətdə tələb edə bilərsiniz. Professional mütəxəssislərimiz GAN/MoYu yağları ilə kubu tam hazır edərək göndərəcək.' },
              { q: 'Kuryerlərlə qapıda yoxlamaq olar?', a: 'Əlbəttə. Kuryer sifarişi çatdırdıqda məhsulun qutusunu açıb fırlatma tərzini və aksesuarlarını tam yoxladıqdan sonra nağd və ya terminal ilə ödəniş edə bilərsiniz.' }
            ].map((faq, index) => (
              <div key={index} className="bg-card border border-border rounded-xl p-4 space-y-2">
                <span className="block font-bold text-sm md:text-base text-foreground">{faq.q}</span>
                <span className="block text-xs md:text-sm text-muted-foreground leading-relaxed">{faq.a}</span>
              </div>
                ))}
          </div>
        </section>
      </div>

      {/* Slide-up Mobile Filter Bottom Sheet */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div key="backdrop-filter"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 lg:hidden"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-50 w-full max-h-[85vh] bg-[#111827] text-white rounded-t-3xl border-t border-gray-800 shadow-2xl flex flex-col p-6 lg:hidden"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-700 rounded-full mt-3" />
              
              <div className="flex items-center justify-between border-b border-gray-800 pb-4 mt-2">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-[#ef4444]" />
                  <h3 className="font-bold text-lg text-white">Filtrlər</h3>
                </div>
                <div className="flex items-center gap-3">
                  {(selectedBrands.length > 0 || selectedMechanics.length > 0 || minPrice > 0 || maxPrice < 250) && (
                    <button
                      onClick={clearAllFilters}
                      className="text-xs text-[#ef4444] font-bold hover:underline cursor-pointer"
                    >
                      Təmizlə
                    </button>
                  )}
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded-full text-gray-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto py-6 space-y-6">
                {/* Brand Filter (Mobile) */}
                {availableBrands.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Brend</h4>
                    <div className="space-y-2.5">
                      {availableBrands.map(brand => (
                        <label key={brand} className="flex items-center gap-2.5 text-sm font-medium text-gray-200 cursor-pointer group">
                          <div className={`h-4.5 w-4.5 rounded border flex items-center justify-center transition-all ${
                            selectedBrands.includes(brand)
                              ? 'bg-[#ef4444] border-[#ef4444] text-white'
                              : 'border-gray-700 group-hover:border-gray-500 bg-gray-800/60'
                          }`}>
                            {selectedBrands.includes(brand) && <Check className="h-3.5 w-3.5" />}
                          </div>
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(brand)}
                            onChange={() => handleBrandChange(brand)}
                            className="sr-only"
                          />
                          <span>{brand}</span>
                        </label>
                        ))}
                    </div>
                  </div>
                )}

                {/* Mechanics Filter (Mobile) */}
                {availableMechanics.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-gray-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Mexanika</h4>
                    <div className="space-y-2.5">
                      {availableMechanics.map(mech => (
                        <label key={mech} className="flex items-center gap-2.5 text-sm font-medium text-gray-200 cursor-pointer group">
                          <div className={`h-4.5 w-4.5 rounded border flex items-center justify-center transition-all ${
                            selectedMechanics.includes(mech)
                              ? 'bg-[#ef4444] border-[#ef4444] text-white'
                              : 'border-gray-700 group-hover:border-gray-500 bg-gray-800/60'
                          }`}>
                            {selectedMechanics.includes(mech) && <Check className="h-3.5 w-3.5" />}
                          </div>
                          <input
                            type="checkbox"
                            checked={selectedMechanics.includes(mech)}
                            onChange={() => handleMechanicsChange(mech)}
                            className="sr-only"
                          />
                          <span className="capitalize">{mech === 'maglev' ? 'MagLev' : mech === 'ball-core' ? 'Ball-Core' : mech === 'magnetic' ? 'Magnetic' : 'Standard'}</span>
                        </label>
                        ))}
                    </div>
                  </div>
                )}

                {/* Price Filter (Mobile) */}
                <div className="space-y-4 pt-4 border-t border-gray-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Qiymət</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
                      <span>{minPrice} AZN</span>
                      <span>{maxPrice} AZN</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="250"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                      className="w-full accent-[#ef4444] cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-800 space-y-2">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full py-3 bg-[#ef4444] text-white font-bold rounded-xl text-sm hover:bg-[#dc2626] transition-colors cursor-pointer"
                >
                  Təsdiqlə
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isMobileSortOpen && (
          <>
            <motion.div
              key="sort-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSortOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 lg:hidden"
            />
            <motion.div
              key="sort-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 z-50 bg-[#111827] text-white rounded-t-3xl overflow-hidden lg:hidden flex flex-col max-h-[85vh] shadow-2xl border-t border-gray-800"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/50">
                <h3 className="font-bold text-lg text-white">Sıralama</h3>
                <button 
                  onClick={() => setIsMobileSortOpen(false)} 
                  className="p-1.5 bg-gray-800 border border-gray-700 rounded-full text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto space-y-2 pb-[100px]">
                {[
                  { id: 'newest', label: 'Ən Yenilər' },
                  { id: 'price_asc', label: 'Qiymət: Ucuzdan bahaya' },
                  { id: 'price_desc', label: 'Qiymət: Bahadan ucuza' },
                  { id: 'stock_high', label: 'Çox satılanlar' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setSortOption(opt.id);
                      setIsMobileSortOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border ${
                      sortOption === opt.id 
                        ? 'border-[#ef4444] bg-[#ef4444]/10 text-[#ef4444] font-bold' 
                        : 'border-gray-800 bg-gray-900/60 hover:bg-gray-800 text-gray-300'
                    } transition-colors cursor-pointer`}
                  >
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
