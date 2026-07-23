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
  ChevronLeft,
  ChevronRight,
  Home,
  MessageSquare,
  Minus,
  Plus,
  Search,
  Filter,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import type { ApplicationDictionary } from '@/types/application.types';
import { useCartStore } from '@/store/useCartStore';
import { addProductReview } from '@/lib/actions/reviews';
import { toggleWishlist } from '@/lib/actions/wishlist';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('ProductDetailClientContent ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-black text-foreground mb-4">Məhsul yoxlanarkən xəta baş verdi</h1>
          <p className="text-muted-foreground mb-8">Məhsul məlumatları yüklənərkən xəta yarandı.</p>
          <Link 
            href="/" 
            className="inline-flex items-center px-6 py-3 bg-rubik-brand text-white font-bold rounded-xl shadow-md hover:bg-rubik-brand-dark transition-colors"
          >
            Ana Səhifəyə Qayıt
          </Link>
        </div>
      );
    }
    return this.props.children;
  }
}

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
    brands?: { name?: string };
    categories?: { name_az?: string; slug?: string };
    brand_name?: string;
    category_name?: string;
    original_price?: number;
    description: string;
    specs: Record<string, string>;
    compatibility: string;
    variants?: any[];
    gallery_images?: any;
    images?: any;
    [key: string]: any;
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

export function ProductDetailClientContent(props: ProductDetailClientContentProps) {
  return (
    <ErrorBoundary>
      <ProductDetailClientContentInner {...props} />
    </ErrorBoundary>
  );
}

function ProductDetailClientContentInner({
  product,
  relatedProducts,
  locale,
  dict,
  initialReviews = []
}: ProductDetailClientContentProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  // Database-driven variants selection setup
  const dbVariants = React.useMemo(() => product?.variants || [], [product?.variants]);
  const [selectedVariantId, setSelectedVariantId] = React.useState<string | null>(
    dbVariants.length > 0 ? dbVariants[0].id : null
  );

  const selectedVariant = React.useMemo(() => {
    if (dbVariants.length === 0) return null;
    return dbVariants.find(v => v.id === selectedVariantId) || dbVariants[0];
  }, [dbVariants, selectedVariantId]);

  // Category-aware setup service detection
  const isCubeCategory = React.useMemo(() => {
    if (!product) return false;
    if ((product as any).has_setup === true) return true;
    const cat = (product.category_slug || (product as any).category || '').toLowerCase();
    if (!cat) return true;
    const nonCubeKeywords = ['lube', 'yag', 'mat', 'bag', 'canta', 'timer', 'accessory', 'accessories', 'stand', 'parts'];
    if (nonCubeKeywords.some(k => cat.includes(k))) return false;
    return true;
  }, [product]);

  // Core configuration selections
  const [activeImage, setActiveImage] = React.useState(product?.image_url || '');
  const [addonSetup, setAddonSetup] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'description' | 'specs' | 'compatibility' | 'shipping' | 'return' | 'faq'>('description');

  // Sync activeImage if product.image_url changes
  React.useEffect(() => {
    if (product?.image_url) {
      setActiveImage(product.image_url);
    }
  }, [product?.image_url]);

  // Interactive video modal
  const [showVideoModal, setShowVideoModal] = React.useState(false);

  // Selected purchase quantity
  const [quantity, setQuantity] = React.useState<number>(1);

  // Sticky bottom mini-bar observer ref and state
  const mainAddToCartRef = React.useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = React.useState(false);

  // Review search, sort, and helpful voting states
  const [reviewSearch, setReviewSearch] = React.useState('');
  const [reviewSort, setReviewSort] = React.useState<'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'>('newest');
  const [helpfulState, setHelpfulState] = React.useState<Record<string, { up: number; down: number; userVote: 'up' | 'down' | null }>>({});

  // Dynamic estimated shipping date
  const estimatedShipDate = React.useMemo(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const months = ['İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr', 'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun'];
    const monthName = months[tomorrow.getMonth()];
    const dateNum = tomorrow.getDate();
    return `sabah (${dateNum} ${monthName})`;
  }, []);

  // Intersection Observer for sticky bottom bar
  React.useEffect(() => {
    const target = mainAddToCartRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
          setShowStickyBar(true);
        } else {
          setShowStickyBar(false);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  // Auto-scrolling Trust Banner state & slides
  const trustSlides = React.useMemo(() => [
    {
      icon: Truck,
      color: 'text-rubik-brand',
      bg: 'bg-rubik-brand/10',
      title: 'Bakı daxili Sürətli Çatdırılma',
      desc: '1-3 saat ərzində sürətli kuryer vasitəsilə birbaşa ünvanınıza təhvil verilir.'
    },
    {
      icon: Award,
      color: 'text-emerald-600',
      bg: 'bg-emerald-500/10',
      title: '100% Orijinal & Rəsmi Zəmanət',
      desc: 'Rəsmi istehsalçı zəmanəti ilə sertifikatlaşdırılmış orijinal Z-Cube və GAN məhsulları.'
    },
    {
      icon: RotateCcw,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      title: '14 Gün Geri Qaytarma Zəmanəti',
      desc: 'İstifadə olunmamış və qutusu zədələnməmiş məhsulların heç bir sual verilmədən dəyişdirilməsi.'
    },
    {
      icon: Zap,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      title: 'Metrolara Ödənişsiz Çatdırılma',
      desc: 'Sifarişlərinizi Bakı metro stansiyalarına tam pulsuz təhvil ala bilərsiniz.'
    }
  ], []);

  const [trustSlideIndex, setTrustSlideIndex] = React.useState(0);
  const [isTrustBannerPaused, setIsTrustBannerPaused] = React.useState(false);

  React.useEffect(() => {
    if (isTrustBannerPaused) return;
    const interval = setInterval(() => {
      setTrustSlideIndex((prev) => (prev + 1) % trustSlides.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isTrustBannerPaused, trustSlides.length]);

  // Social action toggles
  const [isWishlisted, setIsWishlisted] = React.useState(false);
  const [isCompared, setIsCompared] = React.useState(false);
  const [showAddedToCartToast, setShowAddedToCartToast] = React.useState(false);

  // Dynamic pricing directly from product object
  const basePrice = Number(product?.price_azn || (product as any)?.price || 0);
  const addonCost = (isCubeCategory && addonSetup) ? 5 : 0;
  
  const finalPrice = selectedVariant 
    ? Number(selectedVariant.price_azn || selectedVariant.price || basePrice)
    : basePrice + addonCost;

  const originalPrice = product?.original_price || (product as any)?.discount_price || (product as any)?.compare_at_price_azn;

  // Dynamic Discount calculation
  const numOriginalPrice = Number(originalPrice || 0);
  const numBasePrice = Number(basePrice || 0);
  const hasDiscount = numOriginalPrice > numBasePrice && numBasePrice > 0;
  const discountPercent = hasDiscount
    ? Math.round(((numOriginalPrice - numBasePrice) / numOriginalPrice) * 100)
    : 0;

  // Resolve Brand and Product Type for Badges
  const rawBrand = (
    product?.brands?.name ||
    (product as any)?.brand_name ||
    product?.brand ||
    ''
  ).trim();

  let resolvedBrand = '';
  if (rawBrand && !['OTHER', 'OTHER BRAND', 'UNKNOWN', 'DEFAULTS'].includes(rawBrand.toUpperCase())) {
    resolvedBrand = rawBrand;
  }

  const pTitleLower = (product?.title || '').toLowerCase();
  if (!resolvedBrand) {
    if (pTitleLower.includes('moyu')) resolvedBrand = 'MoYu';
    else if (pTitleLower.includes('qiyi')) resolvedBrand = 'QiYi';
    else if (/\bgan\b/.test(pTitleLower)) resolvedBrand = 'GAN';
    else if (pTitleLower.includes('z-cube') || pTitleLower.includes('zcube')) resolvedBrand = 'Z-Cube';
    else if (pTitleLower.includes('shengshou')) resolvedBrand = 'ShengShou';
    else if (pTitleLower.includes('yuxin')) resolvedBrand = 'YuXin';
    else if (pTitleLower.includes('diansheng')) resolvedBrand = 'DianSheng';
    else if (pTitleLower.includes('dayan')) resolvedBrand = 'DaYan';
    else if (pTitleLower.includes('monster go') || pTitleLower.includes('monstergo')) resolvedBrand = 'Monster Go';
    else resolvedBrand = 'Orijinal Brend';
  }

  let typeBadge = '';
  if (pTitleLower.includes('açarlıq') || pTitleLower.includes('keychain') || pTitleLower.includes('brelok')) {
    typeBadge = 'Açarlıq';
  } else if (pTitleLower.includes('mat') || pTitleLower.includes('pad') || pTitleLower.includes('xalça') || pTitleLower.includes('kovrik')) {
    typeBadge = 'Aksessuar Matı';
  } else if (pTitleLower.includes('yağ') || pTitleLower.includes('lube')) {
    typeBadge = 'Baxım Yağı';
  } else if (pTitleLower.includes('taymer') || pTitleLower.includes('timer')) {
    typeBadge = 'Yarış Taymeri';
  } else if (product?.product_type) {
    typeBadge = product.product_type;
  }

  const currentSku = selectedVariant 
    ? selectedVariant.sku 
    : (product?.sku || (product?.id ? `RS-${product.id.substring(0, 4).toUpperCase()}` : 'RS-0000'));

  // Frequently Bought Together (Tez-tez Birlikdə Alınır) Bundle State
  const [bundleChecked2, setBundleChecked2] = React.useState(true);
  const [bundleChecked3, setBundleChecked3] = React.useState(true);

  const bundleItem1 = React.useMemo(() => ({
    id: product?.id || '',
    title: product?.title || 'Məhsul',
    price: finalPrice || 0,
    image: activeImage || product?.image_url || 'https://picsum.photos/seed/default/600/600',
    required: true
  }), [product?.id, product?.title, finalPrice, activeImage, product?.image_url]);

  const bundleItem2 = React.useMemo(() => {
    if (relatedProducts && relatedProducts.length > 0) {
      const rel = relatedProducts[0];
      return {
        id: rel.id,
        title: rel.title,
        price: rel.price_azn,
        image: rel.image_url,
        required: false
      };
    }
    return {
      id: 'bundle-acc-lube',
      title: 'QiYi M-Lube Professional Speedcube Yağı (10ml)',
      price: 6.00,
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80',
      required: false
    };
  }, [relatedProducts]);

  const bundleItem3 = React.useMemo(() => {
    if (relatedProducts && relatedProducts.length > 1) {
      const rel = relatedProducts[1];
      return {
        id: rel.id,
        title: rel.title,
        price: rel.price_azn,
        image: rel.image_url,
        required: false
      };
    }
    return {
      id: 'bundle-acc-mat',
      title: 'Rubikshop Pro Speedcube Rezin Mat Altlıq',
      price: 12.00,
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=300&auto=format&fit=crop&q=80',
      required: false
    };
  }, [relatedProducts]);

  const bundleTotalPrice = React.useMemo(() => {
    let total = bundleItem1.price;
    if (bundleChecked2) total += bundleItem2.price;
    if (bundleChecked3) total += bundleItem3.price;
    return total;
  }, [bundleItem1.price, bundleItem2.price, bundleItem3.price, bundleChecked2, bundleChecked3]);

  const bundleSavings = React.useMemo(() => {
    let savings = 0;
    if (bundleChecked2) savings += 1.50;
    if (bundleChecked3) savings += 2.50;
    return savings;
  }, [bundleChecked2, bundleChecked3]);

  const handleAddBundleToCart = () => {
    addItem({
      id: bundleItem1.id,
      title: bundleItem1.title,
      price_azn: bundleItem1.price,
      quantity: 1,
      image_url: bundleItem1.image
    });
    if (bundleChecked2) {
      addItem({
        id: bundleItem2.id,
        title: bundleItem2.title,
        price_azn: Math.max(1, bundleItem2.price - 1.50),
        quantity: 1,
        image_url: bundleItem2.image
      });
    }
    if (bundleChecked3) {
      addItem({
        id: bundleItem3.id,
        title: bundleItem3.title,
        price_azn: Math.max(1, bundleItem3.price - 2.50),
        quantity: 1,
        image_url: bundleItem3.image
      });
    }
    setShowAddedToCartToast(true);
    setTimeout(() => setShowAddedToCartToast(false), 3000);
  };

  // Live Interactive Review Module
  const [reviews, setReviews] = React.useState(initialReviews.length > 0 ? initialReviews : []);
  const [newReviewName, setNewReviewName] = React.useState('');
  const [newReviewRating, setNewReviewRating] = React.useState(5);
  const [newReviewComment, setNewReviewComment] = React.useState('');
  const [reviewSubmitted, setReviewSubmitted] = React.useState(false);

  // Calculated Ratings Summary
  const averageRating = React.useMemo(() => {
    if (!reviews || reviews.length === 0) return null;
    const total = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  // Smart Category Information for Breadcrumbs
  const categoryInfo = React.useMemo(() => {
    let name = product?.category_name || product?.categories?.name_az;
    let slug = product?.category_slug || product?.categories?.slug || product?.category;

    if (name && slug && name !== 'Açarlıqlar') {
      return { name, slug };
    }

    const titleLower = (product?.title || '').toLowerCase();
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
    
    if (name && slug) return { name, slug };
    return { name: 'Sürət Kubları', slug: '3x3' };
  }, [product]);

  // Dynamic Related Products with Client-side Fallback
  const [displayRelated, setDisplayRelated] = React.useState(relatedProducts || []);

  React.useEffect(() => {
    if (relatedProducts && relatedProducts.length > 0) {
      setDisplayRelated(relatedProducts);
    } else {
      async function loadFallbackRelated() {
        try {
          const { getActiveProducts } = await import('@/lib/supabase/queries/products');
          const allProds = await getActiveProducts();
          if (allProds && allProds.length > 0) {
            const filtered = allProds
              .filter(p => p.id !== product?.id)
              .slice(0, 4)
              .map(p => ({
                id: p.id,
                title: p.title_az || p.name_az || p.title || p.name || 'Məhsul',
                price_azn: Number(p.price || p.price_azn || 0),
                image_url: p.image_url || 'https://picsum.photos/seed/default/600/600',
                stock_quantity: Number(p.stock_quantity || 0),
                brand: p.brands?.name || p.brand || 'Z-Cube'
              }));
            setDisplayRelated(filtered);
          }
        } catch (err) {
          console.error("Error loading fallback related products:", err);
        }
      }
      loadFallbackRelated();
    }
  }, [relatedProducts, product?.id]);

  // Gallery images with dynamic variation
  const galleryImages = React.useMemo(() => {
    if (!product) return [];
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
  }, [product]);

  const specsToDisplay = React.useMemo(() => {
    if (!product) return {};
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

  const effectiveStock = React.useMemo(() => {
    if (selectedVariant) {
      const vStock = selectedVariant.stock ?? selectedVariant.stock_quantity;
      return typeof vStock === 'number' ? vStock : (parseInt(String(vStock), 10) || 0);
    }
    const pStock = product?.stock_quantity ?? product?.stock;
    return typeof pStock === 'number' ? pStock : (parseInt(String(pStock), 10) || 0);
  }, [selectedVariant, product?.stock_quantity, product?.stock]);

  const isOutOfStock = effectiveStock <= 0;

  // Sync quantity if selected variant or stock changes
  React.useEffect(() => {
    if (effectiveStock > 0 && quantity > effectiveStock) {
      setQuantity(effectiveStock);
    } else if (effectiveStock <= 0) {
      setQuantity(1);
    }
  }, [effectiveStock, quantity]);

  if (!product || !product.id) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-black text-foreground mb-4">Məhsul tapılmadı</h1>
        <p className="text-muted-foreground mb-8">Axtardığınız məhsul mövcud deyil, gizlədilib və ya silinib.</p>
        <Link 
          href={`/${locale}`} 
          className="inline-flex items-center px-6 py-3 bg-rubik-brand text-white font-bold rounded-xl shadow-md hover:bg-rubik-brand-dark transition-colors"
        >
          Ana Səhifəyə Qayıt
        </Link>
      </div>
    );
  }

  const handleAddToCart = (redirect = false) => {
    const currentQty = isOutOfStock 
      ? 1 
      : Math.max(1, Math.min(quantity, effectiveStock > 0 ? effectiveStock : 1));

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
      quantity: currentQty,
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
          <Link href={`/${locale}/category/${categoryInfo.slug}`} className="hover:text-rubik-brand capitalize">
            {categoryInfo.name}
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
                  <span>Baxış Videosu</span>
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
              {/* Dynamic Product Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 bg-rubik-brand/10 text-rubik-brand font-black text-xs tracking-wider rounded-full uppercase">
                  {resolvedBrand} {typeBadge ? `• ${typeBadge}` : ''}
                </span>

                {hasDiscount && (
                  <span className="px-2.5 py-1 bg-red-600 text-white font-black text-xs rounded-full uppercase tracking-wider shadow-sm">
                    -{discountPercent}% ENDİRİM
                  </span>
                )}

                {product?.is_featured && (
                  <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 border border-amber-500/20 font-bold text-xs rounded-full uppercase">
                    ⭐ FLAQMAN
                  </span>
                )}

                {!isOutOfStock && (
                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold text-xs rounded-full uppercase">
                    ⚡ STOKDA VAR
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-4xl font-black tracking-tight text-foreground">
                {product.title}
              </h1>

              {/* Review Aggregate */}
              <div className="flex items-center gap-3">
                {reviews.length > 0 && averageRating ? (
                  <>
                    <div className="flex items-center">
                      {renderStars(Number(averageRating))}
                    </div>
                    <span className="text-sm font-black text-foreground">{averageRating}</span>
                    <span className="text-muted-foreground text-xs">• ({reviews.length} müştəri rəyi)</span>
                  </>
                ) : (
                  <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-md">
                    Hələ rəy yoxdur
                  </span>
                )}
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

            {/* Dynamic Stock & Delivery Urgency Notice */}
            <div className="pt-1">
              {isOutOfStock ? (
                <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-3.5 rounded-2xl flex items-center gap-3 text-xs md:text-sm font-semibold">
                  <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                  <span>Stokda müvəqqəti yoxdur — Məhsul gələndə xəbərdar olmaq üçün bizimlə əlaqə saxlayın.</span>
                </div>
              ) : effectiveStock <= 5 ? (
                <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs md:text-sm font-extrabold animate-pulse">
                  <div className="flex items-center gap-2.5">
                    <Zap className="h-5 w-5 text-red-500 shrink-0 fill-red-500" />
                    <span>Yalnız <u className="underline decoration-2">{effectiveStock} ədəd</u> qaldı — {estimatedShipDate} tarixində göndəriləcək</span>
                  </div>
                  <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-black tracking-wider uppercase shrink-0">TƏCİLİ</span>
                </div>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 p-3.5 rounded-2xl flex items-center gap-3 text-xs md:text-sm font-semibold">
                  <Check className="h-5 w-5 text-emerald-600 shrink-0" />
                  <span>Anbarda: <strong className="font-extrabold">{effectiveStock} ədəd</strong> var — {estimatedShipDate} tarixində göndəriləcək</span>
                </div>
              )}
            </div>

            {/* Action Hub with Quantity Selector */}
            <div ref={mainAddToCartRef} className="space-y-4 pt-2">
              {/* Quantity Selector Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-muted/30 border border-border/80 p-3.5 rounded-2xl">
                <div className="space-y-0.5">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-foreground block">
                    Miqdar
                  </span>
                  <span className="text-[11px] text-muted-foreground font-medium block">
                    {isOutOfStock ? (
                      <span className="text-red-500 font-bold">Stokda yoxdur</span>
                    ) : (
                      <>Anbarda: <strong className="text-foreground font-bold">{effectiveStock} ədəd</strong> var</>
                    )}
                  </span>
                </div>

                <div className="flex items-center border border-border bg-card rounded-xl p-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-foreground hover:bg-muted active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>

                  <input
                    type="number"
                    min={1}
                    max={effectiveStock > 0 ? effectiveStock : 1}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (isNaN(val) || val < 1) {
                        setQuantity(1);
                      } else if (effectiveStock > 0 && val > effectiveStock) {
                        setQuantity(effectiveStock);
                      } else {
                        setQuantity(val);
                      }
                    }}
                    disabled={isOutOfStock}
                    className="w-12 text-center font-black text-sm bg-transparent text-foreground focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />

                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(effectiveStock > 0 ? effectiveStock : 1, q + 1))}
                    disabled={quantity >= effectiveStock || isOutOfStock}
                    className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-foreground hover:bg-muted active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleAddToCart(false)}
                  disabled={isOutOfStock}
                  className={`flex-1 py-4 px-4 font-black rounded-2xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isOutOfStock
                      ? 'bg-muted text-muted-foreground cursor-not-allowed border border-border'
                      : 'bg-foreground text-card hover:bg-rubik-brand hover:text-white hover:shadow-soft-lg active:scale-98'
                  }`}
                >
                  <ShoppingBag className="h-5 w-5 shrink-0" />
                  <span>Səbətə Əlavə Et {quantity > 1 ? `(${quantity})` : ''}</span>
                </button>

                <button
                  onClick={() => handleAddToCart(true)}
                  disabled={isOutOfStock}
                  className={`flex-1 py-4 px-4 font-black rounded-2xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isOutOfStock
                      ? 'bg-muted/50 text-muted-foreground cursor-not-allowed border border-border'
                      : 'bg-rubik-brand text-white hover:bg-rubik-brand-dark hover:shadow-soft-lg active:scale-98'
                  }`}
                >
                  <Zap className="h-5 w-5 shrink-0" />
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

            {/* Auto-scroll Trust Banner with dot slide indicators */}
            <div
              onMouseEnter={() => setIsTrustBannerPaused(true)}
              onMouseLeave={() => setIsTrustBannerPaused(false)}
              className="bg-card border border-border/80 rounded-2xl p-4 shadow-soft-sm overflow-hidden space-y-3"
            >
              <div className="flex items-center justify-between gap-3 min-h-[50px]">
                <button
                  type="button"
                  onClick={() => setTrustSlideIndex((prev) => (prev - 1 + trustSlides.length) % trustSlides.length)}
                  className="p-1.5 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer shrink-0"
                  aria-label="Əvvəlki slayd"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="flex-1 flex items-center gap-3 overflow-hidden px-1">
                  {(() => {
                    const slide = trustSlides[trustSlideIndex];
                    const SlideIcon = slide.icon;
                    return (
                      <div className="flex items-center gap-3 w-full transition-all duration-300">
                        <div className={`p-2.5 rounded-xl ${slide.bg} shrink-0`}>
                          <SlideIcon className={`h-5 w-5 ${slide.color}`} />
                        </div>
                        <div className="min-w-0">
                          <span className="block font-black text-xs md:text-sm text-foreground truncate">
                            {slide.title}
                          </span>
                          <span className="block text-[11px] text-muted-foreground line-clamp-1 leading-snug">
                            {slide.desc}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <button
                  type="button"
                  onClick={() => setTrustSlideIndex((prev) => (prev + 1) % trustSlides.length)}
                  className="p-1.5 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer shrink-0"
                  aria-label="Növbəti slayd"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Dot slide indicators */}
              <div className="flex items-center justify-center gap-1.5 pt-1">
                {trustSlides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTrustSlideIndex(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      trustSlideIndex === idx
                        ? 'w-6 bg-rubik-brand'
                        : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                    aria-label={`Slayd ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Quick trust metrics grid */}
            <div className="grid grid-cols-3 gap-3 pt-1 border-t border-border">
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

        {/* 2. Tez-tez Birlikdə Alınır (Frequently Bought Together Bundle) Section */}
        <div className="bg-card border border-border/90 rounded-3xl p-5 md:p-6 shadow-soft-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-rubik-brand/10 text-rubik-brand rounded-xl">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-black text-base md:text-lg text-foreground tracking-tight">
                  Tez-tez Birlikdə Alınır
                </h3>
                <p className="text-xs text-muted-foreground">
                  Bu məhsulla birlikdə ən çox seçilən peşəkar aksesuarlar və xüsusi endirimli paket
                </p>
              </div>
            </div>
            {bundleSavings > 0 && (
              <span className="text-xs font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full w-fit">
                🔥 {bundleSavings.toFixed(2)} AZN Qənaət
              </span>
            )}
          </div>

          {/* Bundle Items Visual Row with Real Thumbnails */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 flex flex-col md:flex-row items-center gap-3">
              {/* Item 1 (Main product) */}
              <div className="flex items-center gap-3 bg-muted/30 border border-border/80 rounded-2xl p-3 w-full md:w-1/3 min-h-[95px]">
                <div className="relative h-16 w-16 shrink-0 bg-background rounded-xl overflow-hidden border border-border p-1.5">
                  <Image
                    src={bundleItem1.image}
                    alt={bundleItem1.title}
                    fill
                    referrerPolicy="no-referrer"
                    className="object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-wider text-rubik-brand block">Əsas Məhsul</span>
                  <span className="text-xs font-bold text-foreground line-clamp-2 leading-tight block">
                    {bundleItem1.title}
                  </span>
                  <span className="text-xs font-black text-foreground block">
                    {bundleItem1.price.toFixed(2)} AZN
                  </span>
                </div>
              </div>

              <span className="text-muted-foreground font-black text-lg hidden md:inline shrink-0">+</span>

              {/* Item 2 */}
              <label className={`flex items-center gap-3 border rounded-2xl p-3 w-full md:w-1/3 min-h-[95px] cursor-pointer transition-all select-none ${
                bundleChecked2 ? 'bg-muted/30 border-rubik-brand/60' : 'bg-background border-border/50 opacity-60'
              }`}>
                <input
                  type="checkbox"
                  checked={bundleChecked2}
                  onChange={(e) => setBundleChecked2(e.target.checked)}
                  className="h-4 w-4 rounded text-rubik-brand focus:ring-rubik-brand cursor-pointer shrink-0"
                />
                <div className="relative h-16 w-16 shrink-0 bg-background rounded-xl overflow-hidden border border-border p-1.5">
                  <Image
                    src={bundleItem2.image}
                    alt={bundleItem2.title}
                    fill
                    referrerPolicy="no-referrer"
                    className="object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 block">Tövsiyə Olunan</span>
                  <span className="text-xs font-bold text-foreground line-clamp-2 leading-tight block">
                    {bundleItem2.title}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="font-black text-rubik-brand">
                      {Math.max(1, bundleItem2.price - 1.50).toFixed(2)} AZN
                    </span>
                    <span className="text-[10px] text-muted-foreground line-through">
                      {bundleItem2.price.toFixed(2)} AZN
                    </span>
                  </div>
                </div>
              </label>

              <span className="text-muted-foreground font-black text-lg hidden md:inline shrink-0">+</span>

              {/* Item 3 */}
              <label className={`flex items-center gap-3 border rounded-2xl p-3 w-full md:w-1/3 min-h-[95px] cursor-pointer transition-all select-none ${
                bundleChecked3 ? 'bg-muted/30 border-rubik-brand/60' : 'bg-background border-border/50 opacity-60'
              }`}>
                <input
                  type="checkbox"
                  checked={bundleChecked3}
                  onChange={(e) => setBundleChecked3(e.target.checked)}
                  className="h-4 w-4 rounded text-rubik-brand focus:ring-rubik-brand cursor-pointer shrink-0"
                />
                <div className="relative h-16 w-16 shrink-0 bg-background rounded-xl overflow-hidden border border-border p-1.5">
                  <Image
                    src={bundleItem3.image}
                    alt={bundleItem3.title}
                    fill
                    referrerPolicy="no-referrer"
                    className="object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-wider text-blue-500 block">Aksesuar</span>
                  <span className="text-xs font-bold text-foreground line-clamp-2 leading-tight block">
                    {bundleItem3.title}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="font-black text-rubik-brand">
                      {Math.max(1, bundleItem3.price - 2.50).toFixed(2)} AZN
                    </span>
                    <span className="text-[10px] text-muted-foreground line-through">
                      {bundleItem3.price.toFixed(2)} AZN
                    </span>
                  </div>
                </div>
              </label>
            </div>

            {/* Bundle CTA Box */}
            <div className="lg:col-span-4 bg-muted/40 border border-border/80 rounded-2xl p-4 flex flex-col justify-between gap-3 h-full">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-semibold block">Paket Cəmi Məbləğ:</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl md:text-2xl font-black text-foreground">
                    {(bundleTotalPrice - bundleSavings).toFixed(2)} AZN
                  </span>
                  {bundleSavings > 0 && (
                    <span className="text-xs text-muted-foreground line-through font-bold">
                      {bundleTotalPrice.toFixed(2)} AZN
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddBundleToCart}
                className="w-full py-3 px-4 bg-rubik-brand text-white font-black text-xs md:text-sm rounded-xl hover:bg-rubik-brand-dark transition-all flex items-center justify-center gap-2 shadow-soft-sm cursor-pointer active:scale-98"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Seçilənləri Birlikdə Səbətə Əlavə Et</span>
              </button>
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
        <section className="bg-card border border-border rounded-3xl p-6 md:p-8 space-y-8">
          <div className="flex flex-col md:flex-row gap-6 items-start justify-between border-b border-border pb-6">
            <div className="space-y-1">
              <h3 className="text-xl md:text-2xl font-black text-foreground">Müştəri Rəyləri</h3>
              <p className="text-xs text-muted-foreground">Müştərilərimizin bu məhsul haqqında qeyd etdiyi rəsmi fikirlər və reytinqlər</p>
            </div>
            
            {/* Rating summary badge */}
            <div className="flex items-center gap-4 bg-muted/40 p-4 rounded-2xl border border-border/60 shrink-0">
              {reviews.length > 0 && averageRating ? (
                <>
                  <span className="text-4xl font-black text-foreground">{averageRating}</span>
                  <div>
                    <div className="flex items-center mb-0.5">{renderStars(Number(averageRating))}</div>
                    <span className="text-xs text-muted-foreground">{reviews.length} həqiqi alıcı rəyi</span>
                  </div>
                </>
              ) : (
                <div className="text-left">
                  <span className="text-sm font-bold text-amber-500 block">Hələ rəy yoxdur</span>
                  <span className="text-xs text-muted-foreground">İlk rəyi siz yazın!</span>
                </div>
              )}
            </div>
          </div>

          {/* Star Distribution Bar Chart */}
          <div className="bg-muted/20 border border-border/60 p-5 rounded-2xl space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-foreground">Reytinq Paylanması</h4>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = starCounts[star as keyof typeof starCounts] || 0;
                const total = reviews.length;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs bg-card/60 p-2.5 rounded-xl border border-border/40">
                    <span className="font-bold shrink-0 flex items-center gap-1 text-foreground min-w-[2.5rem]">
                      {star} <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    </span>
                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden border border-border/40">
                      <div
                        className="bg-amber-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono font-bold shrink-0">
                      {count} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rəylərdə axtarış et..."
                value={reviewSearch}
                onChange={(e) => setReviewSearch(e.target.value)}
                className="w-full bg-background border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-rubik-brand"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">Sıralama:</span>
              <select
                value={reviewSort}
                onChange={(e) => setReviewSort(e.target.value as any)}
                className="bg-background border border-border rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-rubik-brand cursor-pointer"
              >
                <option value="newest">Ən Yeni</option>
                <option value="oldest">Ən Qədim</option>
                <option value="highest">Ən Yüksək Reytinq</option>
                <option value="lowest">Ən Aşağı Reytinq</option>
                <option value="helpful">Ən Faydalı</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Reviews display list */}
            <div className="lg:col-span-7 space-y-4 max-h-[460px] overflow-y-auto pr-2">
              {filteredAndSortedReviews.length === 0 ? (
                <div className="p-6 bg-muted/20 border border-border/40 rounded-2xl text-center text-xs md:text-sm text-muted-foreground">
                  {reviewSearch ? 'Axtarışa uyğun rəy tapılmadı.' : 'Bu məhsul üçün hələ ki heç bir rəy yazılmayıb. İlk rəyi siz göndərə bilərsiniz!'}
                </div>
              ) : (
                filteredAndSortedReviews.map((rev) => {
                  const rId = String(rev.id);
                  const vote = helpfulState[rId];
                  return (
                    <div key={rev.id} className="bg-muted/30 border border-border/40 p-4 rounded-2xl space-y-2.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-foreground flex items-center gap-1.5">
                          <MessageSquare className="h-3.5 w-3.5 text-rubik-brand" />
                          {rev.profiles?.full_name || rev.name || 'Anonim Müştəri'}
                        </span>
                        <span className="text-muted-foreground text-[11px] font-mono">
                          {rev.date || new Date(rev.created_at).toLocaleDateString('az-AZ')}
                        </span>
                      </div>
                      <div className="flex items-center">{renderStars(rev.rating)}</div>
                      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{rev.comment}</p>
                      
                      {/* Helpful / Unhelpful voting bar */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                        <span className="font-medium text-[10px]">Bu rəy sizin üçün faydalı oldu?</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleVoteHelpful(rev.id, 'up')}
                            className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                              vote?.userVote === 'up'
                                ? 'bg-green-500/10 border-green-500/40 text-green-600 dark:text-green-400 shadow-sm'
                                : 'bg-background border-border hover:bg-muted text-muted-foreground'
                            }`}
                          >
                            <ThumbsUp className="h-3.5 w-3.5 text-green-600" />
                            <span>Faydalıdır ({vote?.up || 0})</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleVoteHelpful(rev.id, 'down')}
                            className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                              vote?.userVote === 'down'
                                ? 'bg-red-500/10 border-red-500/40 text-red-600 dark:text-red-400 shadow-sm'
                                : 'bg-background border-border hover:bg-muted text-muted-foreground'
                            }`}
                          >
                            <ThumbsDown className="h-3.5 w-3.5 text-red-500" />
                            <span>({vote?.down || 0})</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
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

          {displayRelated.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {displayRelated.slice(0, 4).map((rel) => {
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
          ) : (
            <div className="bg-card border border-border/80 rounded-2xl p-8 text-center space-y-3">
              <p className="text-xs font-bold text-muted-foreground">Tövsiyə olunan digər populyar sürət kubları yüklənir...</p>
              <Link
                href={`/${locale}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-rubik-brand text-white text-xs font-black rounded-xl hover:bg-rubik-brand-dark transition-colors"
              >
                Kataloqa Keçin
              </Link>
            </div>
          )}
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
                <h3 className="font-bold text-foreground text-sm md:text-base">Məhsulun Baxış Videosu</h3>
                <button onClick={() => setShowVideoModal(false)} className="p-1 hover:bg-muted rounded-lg text-foreground cursor-pointer">X</button>
              </div>
              <div className="relative aspect-video w-full bg-slate-950 rounded-2xl flex flex-col items-center justify-center gap-3 overflow-hidden text-center p-4 border border-border/80">
                <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${product.image_url})` }} />
                <div className="p-4 bg-rubik-brand rounded-full text-white cursor-pointer relative z-10 animate-pulse">
                  <Play className="h-8 w-8 fill-white" />
                </div>
                <span className="text-white text-xs font-black relative z-10 uppercase tracking-widest">
                  Rubikshop Rəsmi Baxış Kanalı
                </span>
                <p className="text-[10px] text-gray-300 max-w-xs relative z-10">
                  Bu video Azərbaycanın ən məşhur sürətli kub idmançısı tərəfindən test edilərək hazırlanmışdır.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Sticky Bottom Mini-Bar for Mobile/Desktop on Scroll */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-[58px] md:bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border shadow-2xl p-3 sm:px-6"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative h-10 w-10 shrink-0 bg-muted rounded-xl overflow-hidden border border-border p-1">
                  <Image
                    src={activeImage || product.image_url}
                    alt={product.title}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-black text-foreground truncate max-w-[140px] sm:max-w-[300px]">
                    {product.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-rubik-brand">
                      {finalPrice.toFixed(2)} AZN
                    </span>
                    {selectedVariant && (
                      <span className="text-[10px] text-muted-foreground truncate hidden sm:inline">
                        • {selectedVariant.name || selectedVariant.sku}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleAddToCart(false)}
                disabled={isOutOfStock}
                className="py-2.5 px-4 bg-rubik-brand text-white font-extrabold text-xs sm:text-sm rounded-xl hover:bg-rubik-brand-dark active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2 shadow-soft-sm cursor-pointer shrink-0"
              >
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden xs:inline">Səbətə Əlavə Et</span>
                <span className="xs:hidden">Əlavə et</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
