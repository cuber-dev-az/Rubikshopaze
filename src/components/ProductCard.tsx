'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import type { ApplicationDictionary } from '@/types/application.types';
import { Heart, Loader2 } from 'lucide-react';
import { toggleWishlist } from '@/lib/actions/wishlist';
import { sanitizeImageUrl } from '@/lib/image';

interface ProductCardProps {
  product: {
    id: string;
    slug?: string;
    title?: string;
    name?: string;
    price_azn?: number;
    price?: number;
    discount_price?: number;
    compare_at_price?: number;
    old_price?: number;
    compare_at_price_azn?: number;
    original_price_azn?: number;
    discount_percent?: number;
    image_url: string;
    stock_quantity: number;
    brands?: { name?: string };
    brand_name?: string;
    brand?: string;
    product_type?: string;
    is_magnetic?: boolean;
    [key: string]: any;
  };
  dict: ApplicationDictionary;
}

export function ProductCard({ product, dict }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const isOutOfStock = (product.stock_quantity ?? 0) <= 0;
  
  const params = useParams();
  const locale = params?.locale || 'az';

  const [isWishlisted, setIsWishlisted] = React.useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = React.useState(false);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlistLoading(true);
    const res = await toggleWishlist(product.id);
    if (res.success) {
      setIsWishlisted(res.wishlisted || false);
    } else {
      console.error(res.error);
    }
    setIsWishlistLoading(false);
  };

  const basePrice = Number(product.price_azn ?? product.price ?? 0);
  const rawCompareCandidates = [
    product.compare_at_price_azn,
    product.compare_at_price,
    product.original_price_azn,
    product.original_price,
    product.discount_price,
    product.old_price,
  ]
    .map(v => (v !== undefined && v !== null && v !== '') ? Number(v) : NaN)
    .filter(v => !isNaN(v) && v > 0);

  const oldPriceCandidate = rawCompareCandidates.find(v => v !== basePrice);

  let currentPrice = basePrice;
  let oldPrice = 0;

  if (oldPriceCandidate) {
    if (oldPriceCandidate > basePrice) {
      currentPrice = basePrice;
      oldPrice = oldPriceCandidate;
    } else if (oldPriceCandidate < basePrice) {
      currentPrice = oldPriceCandidate;
      oldPrice = basePrice;
    }
  } else if (product.discount_percent && Number(product.discount_percent) > 0 && basePrice > 0) {
    currentPrice = basePrice;
    oldPrice = Math.round((basePrice / (1 - Number(product.discount_percent) / 100)) * 100) / 100;
  }

  const hasDiscount = oldPrice > currentPrice && currentPrice > 0;
  const discountPercent = hasDiscount
    ? (product.discount_percent && Number(product.discount_percent) > 0 
        ? Math.round(Number(product.discount_percent)) 
        : Math.round(((oldPrice - currentPrice) / oldPrice) * 100))
    : 0;

  // 1. Resolve Brand Name safely (Never show 'OTHER')
  const rawBrand = (
    product.brands?.name ||
    product.brand_name ||
    product.brand ||
    ''
  ).trim();

  let brandName = '';
  if (rawBrand && !['OTHER', 'OTHER BRAND', 'UNKNOWN', 'DEFAULTS'].includes(rawBrand.toUpperCase())) {
    brandName = rawBrand;
  }

  const productTitle = product.name || product.title || 'Məhsul';
  const titleLower = productTitle.toLowerCase();

  if (!brandName) {
    if (titleLower.includes('z-cube') || titleLower.includes('zcube') || titleLower.includes('z cube')) brandName = 'Z-Cube';
    else if (titleLower.includes('moyu')) brandName = 'MoYu';
    else if (titleLower.includes('qiyi')) brandName = 'QiYi';
    else if (/\bgan\b/.test(titleLower)) brandName = 'GAN';
    else if (titleLower.includes('shengshou')) brandName = 'ShengShou';
    else if (titleLower.includes('yuxin')) brandName = 'YuXin';
    else if (titleLower.includes('diansheng')) brandName = 'DianSheng';
    else if (titleLower.includes('dayan')) brandName = 'DaYan';
    else if (titleLower.includes('monster go') || titleLower.includes('monstergo')) brandName = 'Monster Go';
    else brandName = 'Z-Cube';
  }

  // 2. Resolve Type / Magnetic label accurately
  let typeLabel = '';

  if (titleLower.includes('açarlıq') || titleLower.includes('keychain') || titleLower.includes('key chain') || titleLower.includes('acarliq') || titleLower.includes('brelok') || titleLower.includes('брелок')) {
    typeLabel = 'Açarlıq';
  } else if (titleLower.includes('mat') || titleLower.includes('pad') || titleLower.includes('xalça') || titleLower.includes('xalca') || titleLower.includes('kovrik') || titleLower.includes('коврик')) {
    typeLabel = 'Mat';
  } else if (titleLower.includes('yağ') || titleLower.includes('yag') || titleLower.includes('lube') || titleLower.includes('lubricant') || titleLower.includes('смазка')) {
    typeLabel = 'Yağ';
  } else if (titleLower.includes('taymer') || titleLower.includes('timer') || titleLower.includes('секундомер')) {
    typeLabel = 'Taymer';
  } else if (titleLower.includes('aksessuar') || titleLower.includes('accessory') || titleLower.includes('stend') || titleLower.includes('stand') || titleLower.includes('çanta') || titleLower.includes('canta') || titleLower.includes('bag') || titleLower.includes('box') || titleLower.includes('подставка')) {
    typeLabel = 'Aksessuar';
  } else if (product.product_type && !['speedcube', 'other', 'default', 'puzzle', 'magnetic', 'maqnitli', 'standart', 'standard'].includes(product.product_type.toLowerCase())) {
    typeLabel = product.product_type;
  } else {
    const isExplicitlyNonMagnetic = product.is_magnetic === false || String(product.is_magnetic) === 'false';
    const hasMagneticText = 
      titleLower.includes('magnetic') ||
      titleLower.includes('maqnit') ||
      titleLower.includes('maglev') ||
      titleLower.includes('ball-core') ||
      /\b\d+x\d+\s*m\b/i.test(productTitle);

    const isMagnetic = !isExplicitlyNonMagnetic && ((product.is_magnetic === true || String(product.is_magnetic) === 'true') || hasMagneticText);

    typeLabel = isMagnetic ? 'Maqnitli' : 'Standart';
  }

  const badgeSubtitle = [brandName, typeLabel].filter(Boolean).join(' • ');

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addItem({
      id: product.id,
      title: product.name || product.title || 'Məhsul',
      price_azn: currentPrice,
      quantity: 1,
      image_url: product.image_url,
    });
  };

  const productSlug = product.slug ? encodeURIComponent(product.slug.trim()) : product.id;
  const productUrl = `/${locale}/product/${productSlug}`;

  return (
    <Link 
      href={productUrl} 
      className="flex flex-col bg-white border border-gray-100 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 relative group cursor-pointer block"
    >
      {hasDiscount && discountPercent > 0 ? (
        <div className="absolute top-3 left-3 z-20 bg-red-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-xl tracking-wider shadow-md pointer-events-none">
          -{discountPercent}%
        </div>
      ) : null}

      <div className="absolute top-3 right-3 z-20">
        <button
          onClick={handleWishlistToggle}
          disabled={isWishlistLoading}
          className="p-2 bg-white/80 backdrop-blur-md rounded-full shadow hover:scale-110 transition-transform flex items-center justify-center text-rubik-brand cursor-pointer relative z-20"
          aria-label={isWishlisted ? "Seçilmişlərdən sil" : "Seçilmişlərə əlavə et"}
        >
          {isWishlistLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          )}
        </button>
      </div>

      <div className="relative aspect-square w-full bg-gray-50">
        <Image
          src={sanitizeImageUrl(product.image_url, product.id || 'default')}
          alt={productTitle}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
          className="object-cover p-4 transition-transform duration-300 group-hover:scale-[1.03]"
          priority={false}
          referrerPolicy="no-referrer"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px] z-20 pointer-events-none">
            <span className="text-white font-bold tracking-wider px-3 py-1 bg-rubik-brand rounded-xl">
              {dict.product.out_of_stock}
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-grow relative">
        <div className="text-[10px] uppercase font-bold text-rubik-brand tracking-wider mb-1 line-clamp-1">
          {badgeSubtitle}
        </div>

        <h2 className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 line-clamp-3 min-h-[3rem] sm:min-h-[2.5rem] md:min-h-[3rem] group-hover:text-rubik-brand transition-colors leading-snug">
          {productTitle}
        </h2>
        
        <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
          <span className={`text-lg font-black font-mono ${hasDiscount ? 'text-red-600' : 'text-gray-900'}`}>
            {currentPrice.toFixed(2)} AZN
          </span>
          {hasDiscount && (
            <span className="line-through text-gray-400 text-xs font-mono ml-2">
              {oldPrice.toFixed(2)} AZN
            </span>
          )}
        </div>
        
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`mt-4 w-full py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200 relative z-20 cursor-pointer ${
            isOutOfStock
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-rubik-brand text-white hover:bg-rubik-brand-dark active:scale-[0.98]'
          }`}
        >
          {isOutOfStock ? dict.product.out_of_stock : dict.product.add_to_cart}
        </button>
      </div>
    </Link>
  );
}

