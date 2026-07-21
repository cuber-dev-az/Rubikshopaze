'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag,
  Zap,
  Heart,
  GitCompare,
  Check,
  Star,
  Info,
  Truck,
  RotateCcw,
  HelpCircle,
  Play,
  Maximize2,
  AlertCircle,
  Sparkles,
  Award,
  ChevronRight,
  Home,
  MessageSquare
} from 'lucide-react';
import type { ApplicationDictionary } from '@/types/application.types';
import { useCartStore } from '@/store/useCartStore';
import { addProductReview } from '@/lib/actions/reviews';
import { toggleWishlist } from '@/lib/actions/wishlist';

interface ProductDetailClientContentProps {
  product: {
    id: string;
    title: string;
    price_azn: number;
    image_url: string;
    stock_quantity: number;
    brand: string;
    category_slug: string;
    sku: string;
    original_price?: number;
    description: string;
    specs: Record<string, string>;
    compatibility: string;
    variants?: any[];
    gallery_images?: any;
    images?: any;
  };
  relatedProducts: Array<{
    id: string;
    title: string;
    price_azn: number;
    image_url: string;
    stock_quantity: number;
    brand: string;
  }>;
  locale: string;
  dict: ApplicationDictionary;
  initialReviews?: any[];
}

export function ProductDetailClientContent({
  product,
  relatedProducts,
  locale,
  dict,
  initialReviews = []
}: ProductDetailClientContentProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  // Database-driven variants selection setup
  const dbVariants = React.useMemo(() => product.variants || [], [product.variants]);
  const [selectedVariantId, setSelectedVariantId] = React.useState<string | null>(
    dbVariants.length > 0 ? dbVariants[0].id : null
  );

  const selectedVariant = React.useMemo(() => {
    if (dbVariants.length === 0) return null;
    return dbVariants.find(v => v.id === selectedVariantId) || dbVariants[0];
  }, [dbVariants, selectedVariantId]);

  // Category-aware setup service detection
  const isCubeCategory = React.useMemo(() => {
    if ((product as any).has_setup === true) return true;
    const cat = (product.category_slug || (product as any).category || '').toLowerCase();
    if (!cat) return true;
    const nonCubeKeywords = ['lube', 'yag', 'mat', 'bag', 'canta', 'timer', 'accessory', 'accessories', 'stand', 'parts'];
    if (nonCubeKeywords.some(k => cat.includes(k))) return false;
    return true;
  }, [product]);

  // Core configuration selections
  const [activeImage, setActiveImage] = React.useState(product.image_url);
  const [addonSetup, setAddonSetup] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'description' | 'specs' | 'compatibility' | 'shipping' | 'return' | 'faq'>('description');

  // Sync activeImage if product.image_url changes
  React.useEffect(() => {
    setActiveImage(product.image_url);
  }, [product.image_url]);

  // Interactive video modal
  const [showVideoModal, setShowVideoModal] = React.useState(false);

  // Social action toggles
  const [isWishlisted, setIsWishlisted] = React.useState(false);
  const [isCompared, setIsCompared] = React.useState(false);
  const [showAddedToCartToast, setShowAddedToCartToast] = React.useState(false);

  // Live Interactive Review Module
  const [reviews, setReviews] = React.useState(initialReviews.length > 0 ? initialReviews : []);
  const [newReviewName, setNewReviewName] = React.useState('');
  const [newReviewRating, setNewReviewRating] = React.useState(5);
  const [newReviewComment, setNewReviewComment] = React.useState('');
  const [reviewSubmitted, setReviewSubmitted] = React.useState(false);

  // Dynamic pricing directly from product object
  const basePrice = Number(product.price_azn || (product as any).price || 0);
  const addonCost = (isCubeCategory && addonSetup) ? 5 : 0;
  
  const finalPrice = selectedVariant 
    ? Number(selectedVariant.price_azn || selectedVariant.price || basePrice)
    : basePrice + addonCost;

  const originalPrice = product.original_price || (product as any).discount_price || (product as any).compare_at_price_azn;

  const currentSku = selectedVariant 
    ? selectedVariant.sku 
    : product.sku || `RS-${product.id.substring(0, 4).toUpperCase()}`;

  // Calculated Ratings Summary
  const averageRating = React.useMemo(() => {
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    return reviews.length > 0 ? (total / reviews.length).toFixed(1) : '5.0';
  }, [reviews]);

  // Gallery images with dynamic variation
  const galleryImages = React.useMemo(() => {
    const secondaryImages = product.gallery_images || product.images || [];
    let extraImages: string[] = [];
    if (Array.isArray(secondaryImages)) {
      extraImages = secondaryImages;
    } else if (typeof secondaryImages === 'string') {
      const trimmed = secondaryImages.trim();
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          extraImages = JSON.parse(trimmed);
        } catch {
          extraImages = trimmed.split(',').map((img: string) => img.trim()).filter(Boolean);
        }
      } else {
        extraImages = trimmed.split(',').map((img: string) => img.trim()).filter(Boolean);
      }
    }
    
    // Completely purge any placeholder picsum.photos URLs from the secondary images
    const cleanExtraImages = extraImages.filter((img: string) => img && typeof img === 'string' && !img.includes('picsum.photos'));
    
    const list = [product.image_url, ...cleanExtraImages].filter(Boolean);
    // Dedup array
    return Array.from(new Set(list)) as string[];
  }, [product.image_url, product.gallery_images, product.images]);

  const specsToDisplay = React.useMemo(() => {
    const baseSpecs: Record<string, string> = {};
    if (product.brand) baseSpecs['Brend'] = product.brand;
    if (product.sku) baseSpecs['SKU'] = product.sku;
    if (product.category_slug) baseSpecs['Kateqoriya'] = product.category_slug;
    if (product.stock_quantity !== undefined) baseSpecs['Anbardakı Sayı'] = `${product.stock_quantity} ədəd`;
    
    let parsedSpecs: Record<string, string> = {};
    if (typeof product.specs === 'object' && product.specs !== null) {
      parsedSpecs = product.specs;
    } else if (typeof product.specs === 'string') {
      try {
        parsedSpecs = JSON.parse(product.specs);
      } catch {
        // Ignore parsing error
      }
    }
    
    const mergedSpecs = { ...baseSpecs, ...parsedSpecs };
    const translatedSpecs: Record<string, string> = {};
    
    Object.entries(mergedSpecs).forEach(([key, val]) => {
      let displayKey = key;
      if (key === 'weight') displayKey = 'Çəki';
      else if (key === 'size') displayKey = 'Ölçü';
      else if (key === 'material') displayKey = 'Material';
      else if (key === 'core_type') displayKey = 'Daxili Növü';
      else if (key === 'magnetic_strength') displayKey = 'Maqnit Gücü';
      else if (key === 'tension_system') displayKey = 'Gərginlik Sistemi';
      else if (key === 'surface_finish') displayKey = 'Səth Örtüyü';
      translatedSpecs[displayKey] = String(val);
    });
    
    return translatedSpecs;
  }, [product]);

  const handleAddToCart = (redirect = false) => {
    const titleAddition = selectedVariant 
      ? ` (${selectedVariant.name || selectedVariant.sku})`
      : (isCubeCategory && addonSetup) ? ' (+ Premium Setup)' : '';

    const cartItemId = selectedVariant 
      ? `${product.id}__variant__${selectedVariant.id}`
      : `${product.id}${(isCubeCategory && addonSetup) ? '-setup' : ''}`;

    const cartItem = {
      id: cartItemId,
      title: `${product.title}${titleAddition}`,
      price_azn: finalPrice,
      quantity: 1,
      image_url: product.image_url
    };

    addItem(cartItem);

    if (redirect) {
      router.push(`/${locale}/checkout`);
    } else {
      setShowAddedToCartToast(true);
      setTimeout(() => setShowAddedToCartToast(false), 3000);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment.trim()) return;

    // We no longer require the user to type their name if they are logged in, 
    // but we can pass newReviewName as a fallback if desired, though DB profile name is used.
    const res = await addProductReview(product.id, newReviewRating, newReviewComment);
    if (res.success) {
      setReviews([{
        id: Date.now(),
        rating: newReviewRating,
        comment: newReviewComment,
        created_at: new Date().toISOString(),
        profiles: { full_name: newReviewName || 'Mən' }
      }, ...reviews]);
      setReviewSubmitted(true);
      setNewReviewName('');
      setNewReviewComment('');
      setTimeout(() => setReviewSubmitted(false), 4000);
    } else {
      alert(res.error || 'Xəta baş verdi.');
    }
  };

  const isOutOfStock = selectedVariant 
    ? (selectedVariant.stock <= 0) 
    : (product.stock_quantity <= 0);

  // Render Stars helper
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.round(rating)
            ? 'text-yellow-500 fill-yellow-500'
            : 'text-muted border-muted-foreground'
        }`}
      />
    ));
  };

  return (
    <div className="w-full bg-background pb-24">
      {/* Dynamic Breadcrumbs */}
      <div className="bg-muted/40 py-4 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Link href={`/${locale}`} className="hover:text-rubik-brand flex items-center gap-1">
            <Home className="h-3.5 w-3.5" />
            <span>{dict.navigation.home}</span>
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={`/${locale}/category/${product.category_slug}`} className="hover:text-rubik-brand capitalize">
            {product.category_slug}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-semibold line-clamp-1">{product.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12 space-y-12">
        
        {/* Core Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* 1. Media Gallery (Left Column) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square w-full bg-muted/30 border border-border/80 rounded-3xl overflow-hidden flex items-center justify-center p-6 group">
              <Image
                src={activeImage}
                alt={product.title}
                fill
                priority
                referrerPolicy="no-referrer"
                className="object-contain p-8 transform group-hover:scale-102 transition-transform duration-500"
              />

              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1.5px] flex items-center justify-center">
                  <span className="text-white text-sm font-black tracking-widest px-4 py-2 bg-red-600 rounded-xl shadow-lg uppercase">
                    {dict.product.out_of_stock}
                  </span>
                </div>
              )}

              {/* Media Overlays */}
              <div className="absolute bottom-4 left-4 flex gap-2">
                <button
                  onClick={() => setShowVideoModal(true)}
                  className="bg-background/90 hover:bg-background backdrop-blur-sm border border-border px-3.5 py-2 rounded-xl text-xs font-bold text-foreground flex items-center gap-1.5 shadow-soft-sm cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5 text-rubik-brand fill-rubik-brand" />
                  <span>İnceleme Videosu</span>
                </button>
              </div>
            </div>

            {/* Gallery Thumbnails */}
            {galleryImages.length > 1 && (
              <div className="flex flex-wrap gap-3">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`relative w-16 h-16 rounded-2xl bg-muted/40 border-2 overflow-hidden transition-all duration-200 cursor-pointer ${
                      activeImage === img ? 'border-rubik-brand ring-2 ring-rubik-brand/20 shadow-soft-md scale-95' : 'border-transparent hover:border-border'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.title} - ${idx}`}
                      fill
                      referrerPolicy="no-referrer"
                      className="object-contain p-2"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Core Details & Operations (Right Column) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2.5">
              <span className="px-3 py-1 bg-rubik-brand/10 text-rubik-brand font-black text-[10px] tracking-wider rounded-full uppercase inline-block">
                {product.brand} Flaqman
              </span>
              <h1 className="text-2xl md:text-4xl font-black tracking-tight text-foreground">
                {product.title}
              </h1>

              {/* Review Aggregate */}
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  {renderStars(Number(averageRating))}
                </div>
                <span className="text-sm font-black text-foreground">{averageRating}</span>
                <span className="text-muted-foreground text-xs">• ({reviews.length} müştəri rəyi)</span>
                <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded border border-border">
                  SKU: {currentSku}
                </span>
              </div>
            </div>

            {/* Price Segment */}
            <div className="bg-muted/40 border border-border/60 p-5 rounded-2xl flex items-baseline justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-muted-foreground block uppercase tracking-wider">
                  Qiymət
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-foreground">
                    {finalPrice.toFixed(2)} AZN
                  </span>
                  {originalPrice && (
                    <span className="text-lg text-muted-foreground line-through font-semibold">
                      {(Number(originalPrice) + addonCost).toFixed(2)} AZN
                    </span>
                  )}
                </div>
              </div>

              {/* Stock Badge */}
              <div className="text-right">
                <span className="text-xs font-bold text-muted-foreground block uppercase tracking-wider mb-1">
                  Status
                </span>
                {isOutOfStock ? (
                  <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
                    Müvəqqəti Bitib (Sifarişlə)
                  </span>
                ) : (
                  <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
                    Anbarda Sürətli Çatdırılma
                  </span>
                )}
              </div>
            </div>

            {/* Selection Engine - Admin-driven Variant selectors (ONLY if dbVariants exists and has items) */}
            {dbVariants.length > 0 && (
              <div className="space-y-4">
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-foreground block uppercase tracking-wider">
                    Məhsul Variantı Seçin
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    {dbVariants.map((v) => {
                      const vStock = v.stock ?? 0;
                      const isVSelected = selectedVariantId === v.id;
                      const vPrice = Number(v.price_azn || v.price || product.price_azn);
                      return (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariantId(v.id)}
                          className={`p-3.5 text-left border rounded-xl transition-all cursor-pointer flex flex-col justify-between min-h-[4.5rem] ${
                            isVSelected
                              ? 'border-rubik-brand bg-rubik-brand text-white shadow-soft-sm'
                              : 'border-border bg-card text-foreground hover:border-foreground/20'
                          }`}
                        >
                          <span className="font-bold text-sm flex items-center justify-between gap-2">
                            <span className="truncate">{v.name || v.sku}</span>
                            {isVSelected && <Check className="h-4 w-4 text-white shrink-0" />}
                          </span>
                          <span className="flex items-center justify-between text-[10px] mt-1">
                            <span className={isVSelected ? 'text-white/80' : 'text-muted-foreground'}>
                              {vStock > 0 ? `Stokda: ${vStock} ədəd` : 'Bitib (Sifarişlə)'}
                            </span>
                            <span className="font-bold">
                              {vPrice.toFixed(2)} AZN
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Service Option Toggle Addon (ONLY for Cube/Puzzle categories or has_setup) */}
            {isCubeCategory && (
              <div className="border border-dashed border-rubik-brand rounded-2xl p-4 bg-rubik-brand/5 space-y-2.5">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <div className="pt-0.5">
                    <div className={`h-5 w-5 rounded border flex items-center justify-center transition-all ${
                      addonSetup
                        ? 'bg-rubik-brand border-rubik-brand text-white'
                        : 'border-rubik-brand/40 bg-white'
                    }`}>
                      {addonSetup && <Check className="h-4 w-4" />}
                    </div>
                    <input
                      type="checkbox"
                      checked={addonSetup}
                      onChange={(e) => setAddonSetup(e.target.checked)}
                      className="sr-only"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="font-black text-sm text-foreground flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-rubik-brand" />
                      Rubikshop Premium Setup xidməti istəyirəm (+5.00 AZN)
                    </span>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Kubun hər tərəfli yağlanması, maqnit qüvvələrinin optimallaşdırılması və gərginliyin rəsmi WCA turnirləri standartlarına uyğunlaşdırılması xidməti.
                    </p>
                  </div>
                </label>
              </div>
            )}

            {/* Action Hub */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-3">
                <button
                  onClick={() => handleAddToCart(false)}
                  disabled={isOutOfStock}
                  className={`flex-1 py-4 font-black rounded-2xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isOutOfStock
                      ? 'bg-muted text-muted-foreground cursor-not-allowed border border-border'
                      : 'bg-foreground text-card hover:bg-rubik-brand hover:text-white hover:shadow-soft-lg active:scale-98'
                  }`}
                >
                  <ShoppingBag className="h-5 w-5" />
                  <span>Səbətə Əlavə Et</span>
                </button>

                <button
                  onClick={() => handleAddToCart(true)}
                  disabled={isOutOfStock}
                  className={`flex-1 py-4 font-black rounded-2xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isOutOfStock
                      ? 'bg-muted/50 text-muted-foreground cursor-not-allowed border border-border'
                      : 'bg-rubik-brand text-white hover:bg-rubik-brand-dark hover:shadow-soft-lg active:scale-98'
                  }`}
                >
                  <Zap className="h-5 w-5" />
                  <span>İndi Al (Sifariş et)</span>
                </button>
              </div>

              {/* Auxiliary actions */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 px-1">
                <button
                  onClick={async () => {
                    const res = await toggleWishlist(product.id);
                    if (res.success) {
                      setIsWishlisted(res.wishlisted || false);
                    }
                  }}
                  className="hover:text-foreground font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Heart className={`h-4.5 w-4.5 ${isWishlisted ? 'text-red-500 fill-red-500' : ''}`} />
                  <span>{isWishlisted ? 'İstək Siyahısında' : 'İstək Siyahısına At'}</span>
                </button>
                <button
                  onClick={() => {
                    setIsCompared(true);
                    setTimeout(() => setIsCompared(false), 2500);
                  }}
                  className="hover:text-foreground font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <GitCompare className="h-4.5 w-4.5 text-blue-500" />
                  <span>{isCompared ? 'Müqayisəyə əlavə edildi!' : 'Müqayisə Et'}</span>
                </button>
              </div>
            </div>

            {/* Added to cart popup notifier */}
            <AnimatePresence>
              {showAddedToCartToast && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="bg-green-600 text-white font-bold text-xs p-4 rounded-xl flex items-center justify-between shadow-soft-xl"
                >
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0" />
                    <span>Məhsul səbətinizə uğurla əlavə edildi!</span>
                  </div>
                  <Link href={`/${locale}/checkout`} className="underline hover:no-underline font-black ml-4 shrink-0">
                    Səbətə bax
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick trust metrics */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
              <div className="text-center p-3 bg-muted/30 rounded-xl space-y-1">
                <Truck className="h-5 w-5 text-rubik-brand mx-auto" />
                <span className="block font-black text-[10px] text-foreground">Sürətli Çatdırılma</span>
                <span className="block text-[8px] text-muted-foreground">Bakı daxili 1-3 saat</span>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-xl space-y-1">
                <Award className="h-5 w-5 text-green-600 mx-auto" />
                <span className="block font-black text-[10px] text-foreground">100% Orijinal</span>
                <span className="block text-[8px] text-muted-foreground">Rəsmi istehsalçı zəmanəti</span>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-xl space-y-1">
                <RotateCcw className="h-5 w-5 text-blue-500 mx-auto" />
                <span className="block font-black text-[10px] text-foreground">Asan Geri Qaytarma</span>
                <span className="block text-[8px] text-muted-foreground">14 gün daxilində dəyişmə</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Information Tabs Accordion (Specifications, Compatibility, Return policy) */}
        <div className="border border-border rounded-3xl bg-card overflow-hidden shadow-soft-sm">
          {/* Tab Headers */}
          <div className="bg-muted border-b border-border flex flex-wrap">
            {[
              { id: 'description', label: 'Məhsul Təsviri', icon: Info },
              { id: 'specs', label: 'Spesifikasiyalar', icon: Award },
              { id: 'compatibility', label: 'Uyğunluq', icon: AlertCircle },
              { id: 'shipping', label: 'Çatdırılma Şərtləri', icon: Truck },
              { id: 'return', label: 'Zəmanət və Geri Qaytarma', icon: RotateCcw },
              { id: 'faq', label: 'Sual-Cavab', icon: HelpCircle }
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-5 py-4 text-xs md:text-sm font-bold border-r border-border transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-background text-rubik-brand'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <TabIcon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content body */}
          <div className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'description' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="space-y-4 text-sm text-muted-foreground leading-relaxed"
                >
                  <h4 className="text-base font-bold text-foreground">Məhsul Təsviri</h4>
                  <p>{product.description}</p>
                </motion.div>
              )}

              {activeTab === 'specs' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="space-y-4"
                >
                  <h4 className="text-base font-bold text-foreground">Texniki Spesifikasiyalar</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(specsToDisplay).map(([key, val]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-border/60 text-xs md:text-sm">
                        <span className="text-muted-foreground capitalize font-semibold">{key}</span>
                        <span className="text-foreground font-black font-mono">{val}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'compatibility' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="space-y-3 text-sm text-muted-foreground leading-relaxed"
                >
                  <h4 className="text-base font-bold text-foreground">Uyğunluq Şərtləri</h4>
                  <p>{product.compatibility}</p>
                  <div className="bg-muted p-4 rounded-xl border border-border flex items-center gap-3 mt-2">
                    <Info className="h-5 w-5 text-rubik-brand shrink-0" />
                    <span className="text-xs leading-relaxed text-foreground">
                      WCA (World Cube Association) standartlarına tam cavab verir. Hər hansı rəsmi turnirdə limitsiz istifadə edilə bilər.
                    </span>
                  </div>
                </motion.div>
              )}

              {activeTab === 'shipping' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="space-y-4 text-sm text-muted-foreground leading-relaxed"
                >
                  <h4 className="text-base font-bold text-foreground">Sürətli Çatdırılma Qaydaları</h4>
                  <p>
                    Rubikshop Azərbaycan daxilində ən sürətli kuryer şəbəkəsinə malikdir. Sifarişlərin çatdırılması aşağıdakı kimi təyin edilmişdir:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-xs">
                    <li><strong>Bakı daxili express çatdırılma:</strong> 1-3 saat ərzində (kuryer ilə birbaşa qapıya).</li>
                    <li><strong>Sumqayıt və Abşeron yarımadası:</strong> Eyni gün daxilində (4-6 saat ərzində).</li>
                    <li><strong>Azərbaycanın digər rayon və şəhərləri:</strong> Azərpoçt və ya xüsusi poçt xidmətləri vasitəsilə 24-48 saat ərzində.</li>
                  </ul>
                </motion.div>
              )}

              {activeTab === 'return' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="space-y-4 text-sm text-muted-foreground leading-relaxed"
                >
                  <h4 className="text-base font-bold text-foreground">Geri Qaytarma və Müştəri Təminatı</h4>
                  <p>
                    Alınan hər bir məhsul istehsalçı tərəfindən rəsmi qorunma qutusundadır və orijinallıq zəmanəti daşıyır.
                  </p>
                  <p className="text-xs">
                    Məhsulu istifadə etmədiyiniz, qutusuna və aksesuarlarına xələl gətirmədiyiniz təqdirdə 14 gün müddətində heç bir əlavə ödəniş etmədən tam geri qaytara və ya başqa modelə dəyişə bilərsiniz.
                  </p>
                </motion.div>
              )}

              {activeTab === 'faq' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="space-y-4"
                >
                  <h4 className="text-base font-bold text-foreground">Ən Çox Verilən Suallar</h4>
                  <div className="space-y-3">
                    <div className="bg-muted p-4 rounded-xl border border-border/60">
                      <span className="block font-bold text-foreground text-xs mb-1">Məhsul yağlanmış gəlir?</span>
                      <span className="text-xs text-muted-foreground">Xeyr, standart zavod qutusu daxilində az miqdarda qoruyucu yağ olur. Əlavə setupsız tam professional sürət üçün rəsmi yağlama variantımızı seçməyi tövsiyə edirik.</span>
                    </div>
                    <div className="bg-muted p-4 rounded-xl border border-border/60">
                      <span className="block font-bold text-foreground text-xs mb-1">Dönmə gərginliyini necə nizamlaya bilərəm?</span>
                      <span className="text-xs text-muted-foreground">Qutudan çıxan xüsusi tənzimləmə açarları vasitəsilə yayların sıxlığını və maqnit gərginliyini daxili çarxlardan tənzimləmək olar.</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 4. Interactive Review/Rating Module (Interactive read & write) */}
        <section className="bg-card border border-border rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row gap-6 items-start justify-between border-b border-border pb-6">
            <div className="space-y-1">
              <h3 className="text-xl md:text-2xl font-black text-foreground">Müştəri Rəyləri</h3>
              <p className="text-xs text-muted-foreground">Müştərilərimizin bu məhsul haqqında qeyd etdiyi rəsmi fikirlər</p>
            </div>
            
            {/* Rating distribution info */}
            <div className="flex items-center gap-4 bg-muted/40 p-4 rounded-2xl border border-border/60 shrink-0">
              <span className="text-4xl font-black text-foreground">{averageRating}</span>
              <div>
                <div className="flex items-center mb-0.5">{renderStars(Number(averageRating))}</div>
                <span className="text-xs text-muted-foreground">{reviews.length} həqiqi alıcı rəyi</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Reviews display */}
            <div className="lg:col-span-7 space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {reviews.map((rev) => (
                <div key={rev.id} className="bg-muted/30 border border-border/40 p-4 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-foreground flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5 text-rubik-brand" />
                      {rev.profiles?.full_name || rev.name || 'Anonim'}
                    </span>
                    <span className="text-muted-foreground">{rev.date || new Date(rev.created_at).toLocaleDateString('az-AZ')}</span>
                  </div>
                  <div className="flex items-center">{renderStars(rev.rating)}</div>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>

            {/* Write a review form */}
            <div className="lg:col-span-5 bg-muted/20 border border-border p-6 rounded-2xl space-y-4">
              <h4 className="font-black text-sm text-foreground uppercase tracking-wider">Rəy Bildirin</h4>
              
              {reviewSubmitted ? (
                <div className="bg-green-50 border border-green-200 text-green-800 text-xs font-bold p-4 rounded-xl flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600 shrink-0" />
                  <span>Rəyiniz uğurla əlavə edildi! Paylaşımınız üçün təşəkkür edirik.</span>
                </div>
              ) : (
                <form onSubmit={handleAddReview} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Adınız</label>
                    <input
                      type="text"
                      required
                      value={newReviewName}
                      onChange={(e) => setNewReviewName(e.target.value)}
                      placeholder="Məsələn, Məmməd"
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-rubik-brand"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Qiymətləndirmə</label>
                    <select
                      value={newReviewRating}
                      onChange={(e) => setNewReviewRating(Number(e.target.value))}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-rubik-brand"
                    >
                      <option value="5">5 Ulduz - Möhtəşəm</option>
                      <option value="4">4 Ulduz - Çox yaxşı</option>
                      <option value="3">3 Ulduz - Orta</option>
                      <option value="2">2 Ulduz - Qənaətbəxş deyil</option>
                      <option value="1">1 Ulduz - Zəif</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Rəyiniz</label>
                    <textarea
                      required
                      rows={3}
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      placeholder="Məhsul haqqında fikirlərinizi bölüşün..."
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-rubik-brand"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-rubik-brand text-white font-black text-xs rounded-xl hover:bg-rubik-brand-dark transition-colors cursor-pointer"
                  >
                    Rəyi Göndər
                  </button>
                </form>
              )}
            </div>

          </div>
        </section>



        {/* 6. Recommendations / Related products list */}
        <section className="space-y-6">
          <h3 className="text-xl md:text-2xl font-black text-foreground text-center md:text-left flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-rubik-brand" />
            Oxşar və Tövsiyə Edilən Məhsullar
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.slice(0, 4).map((rel) => {
              const outOfStock = rel.stock_quantity <= 0;
              return (
                <div
                  key={rel.id}
                  className="flex flex-col bg-card border border-border/80 rounded-2xl overflow-hidden shadow-soft-sm hover:shadow-soft-md hover:border-foreground/10 transition-all duration-300 group"
                >
                  <Link href={`/${locale}/product/${rel.id}`} className="relative aspect-square w-full bg-muted/40 flex items-center justify-center p-4">
                    <Image
                      src={rel.image_url}
                      alt={rel.title}
                      fill
                      referrerPolicy="no-referrer"
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-contain p-6 transform group-hover:scale-105 transition-transform duration-300"
                    />
                    {outOfStock && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white text-[10px] font-black tracking-wider px-2 py-0.5 bg-red-600 rounded-md">
                          {dict.product.out_of_stock}
                        </span>
                      </div>
                    )}
                  </Link>

                  <div className="p-4 flex flex-col flex-grow space-y-2">
                    <span className="text-[9px] uppercase font-bold text-rubik-brand tracking-wider">
                      {rel.brand}
                    </span>
                    <Link
                      href={`/${locale}/product/${rel.id}`}
                      className="text-xs md:text-sm font-bold text-foreground line-clamp-2 min-h-[2.5rem] hover:text-rubik-brand transition-colors"
                    >
                      {rel.title}
                    </Link>

                    <div className="flex items-baseline gap-2 mt-auto">
                      <span className="text-sm md:text-base font-black text-foreground">
                        {rel.price_azn.toFixed(2)} AZN
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        if (!outOfStock) {
                          addItem({
                            id: rel.id,
                            title: rel.title,
                            price_azn: rel.price_azn,
                            quantity: 1,
                            image_url: rel.image_url
                          });
                        }
                      }}
                      disabled={outOfStock}
                      className={`w-full py-2 rounded-xl text-[10px] md:text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        outOfStock
                          ? 'bg-muted text-muted-foreground cursor-not-allowed'
                          : 'bg-foreground text-card hover:bg-rubik-brand hover:text-white'
                      }`}
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      <span>{outOfStock ? dict.product.out_of_stock : dict.product.add_to_cart}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>

      {/* Video Modal Placeholder */}
      <AnimatePresence>
        {showVideoModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowVideoModal(false)}
              className="fixed inset-0 bg-black z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 m-auto z-50 max-w-xl h-fit max-h-[90vh] bg-card border border-border p-6 rounded-3xl shadow-soft-2xl space-y-4"
            >
              <div className="flex justify-between items-center border-b border-border pb-3">
                <h3 className="font-bold text-foreground text-sm md:text-base">Məhsul İnceleme Videosu</h3>
                <button onClick={() => setShowVideoModal(false)} className="p-1 hover:bg-muted rounded-lg text-foreground cursor-pointer">X</button>
              </div>
              <div className="relative aspect-video w-full bg-slate-950 rounded-2xl flex flex-col items-center justify-center gap-3 overflow-hidden text-center p-4 border border-border/80">
                <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${product.image_url})` }} />
                <div className="p-4 bg-rubik-brand rounded-full text-white cursor-pointer relative z-10 animate-pulse">
                  <Play className="h-8 w-8 fill-white" />
                </div>
                <span className="text-white text-xs font-black relative z-10 uppercase tracking-widest">
                  Rubikshop Official Review Channel
                </span>
                <p className="text-[10px] text-gray-300 max-w-xs relative z-10">
                  Bu video Azərbaycanın ən məşhur sürətli kub idmançısı tərəfindən test edilərək hazırlanmışdır.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
