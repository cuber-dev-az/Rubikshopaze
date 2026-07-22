'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import type { ApplicationDictionary } from '@/types/application.types';
import { Heart, Loader2 } from 'lucide-react';
import { toggleWishlist } from '@/lib/actions/wishlist';

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

  const currentPrice = Number(product.price ?? product.price_azn ?? 0);
  const oldPrice = Number(
    product.discount_price ??
    product.compare_at_price ??
    product.old_price ??
    product.compare_at_price_azn ??
    product.original_price_azn ??
    0
  );

  const hasDiscount = oldPrice > currentPrice && currentPrice > 0;
  const discountPercent = hasDiscount
    ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100)
    : (product.discount_percent || 0);

  const rawBrand = product.brands?.name || product.brand_name || product.brand || 'Z-Cube';
  const brandName = (rawBrand && rawBrand.toUpperCase() !== 'OTHER') ? rawBrand : 'Z-Cube';

  const typeLabel = product.product_type || (product.is_magnetic ? 'MAGNETIC' : 'STANDART');
  const badgeSubtitle = `${brandName} • ${typeLabel}`;

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

  const productTitle = product.name || product.title || 'Məhsul';
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
          src={product.image_url || 'https://picsum.photos/seed/default/600/600'}
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

        <h2 className="text-sm md:text-base font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem] group-hover:text-rubik-brand transition-colors">
          {productTitle}
        </h2>
        
        <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
          <span className={`text-lg font-black font-mono ${hasDiscount ? 'text-red-600' : 'text-gray-900'}`}>
            {currentPrice.toFixed(2)} AZN
          </span>
          {hasDiscount && oldPrice > 0 && (
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

