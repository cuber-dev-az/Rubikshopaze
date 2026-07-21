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
    title: string;
    price_azn: number;
    image_url: string;
    stock_quantity: number;
    discount_percent?: number;
    original_price_azn?: number;
  };
  dict: ApplicationDictionary;
}

export function ProductCard({ product, dict }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const isOutOfStock = product.stock_quantity <= 0;
  
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addItem({
      id: product.id,
      title: product.title,
      price_azn: product.price_azn,
      quantity: 1,
      image_url: product.image_url,
    });
  };

  const productTitle = (product as any).name || product.title;
  const productSlug = product.slug ? encodeURIComponent(product.slug.trim()) : product.id;
  const productUrl = `/${locale}/product/${productSlug}`;

  return (
    <Link 
      href={productUrl} 
      className="flex flex-col bg-white border border-gray-100 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 relative group cursor-pointer block"
    >
      {product.discount_percent && product.discount_percent > 0 ? (
        <div className="absolute top-3 left-3 z-20 bg-rubik-brand text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-xl tracking-wider shadow-md pointer-events-none">
          -{product.discount_percent}%
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
          src={product.image_url}
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
        <h2 className="text-sm md:text-base font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem] group-hover:text-rubik-brand transition-colors">
          {productTitle}
        </h2>
        
        {product.discount_percent && product.discount_percent > 0 ? (
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-black text-rubik-brand font-mono">
              {product.price_azn.toFixed(2)} AZN
            </span>
            <span className="text-xs text-gray-500 line-through font-mono">
              {product.original_price_azn?.toFixed(2)} AZN
            </span>
          </div>
        ) : (
          <p className="mt-2 text-lg font-bold text-gray-900">
            {product.price_azn.toFixed(2)} AZN
          </p>
        )}
        
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
