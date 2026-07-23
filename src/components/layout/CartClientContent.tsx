'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import { sanitizeImageUrl } from '@/lib/image';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Bookmark,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Ticket,
  Truck,
  Check,
  Percent,
  TrendingUp,
  RotateCcw,
  ShieldCheck,
  Zap,
  Package
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthModalStore } from '@/store/useAuthModalStore';
import { createClient } from '@/lib/supabase/client';
import { validateCoupon } from '@/lib/actions/coupons';
import type { ApplicationDictionary } from '@/types/application.types';

interface CartClientContentProps {
  locale: string;
  dict: ApplicationDictionary;
}

export function CartClientContent({ locale, dict }: CartClientContentProps) {
  const [user, setUser] = React.useState<any>(null);
  const { openModal } = useAuthModalStore();

  React.useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, [supabase.auth]);
  const {
    items,
    savedItems,
    appliedCoupon,
    discountType,
    discountValue,
    removeItem,
    updateQuantity,
    saveForLater,
    moveToCart,
    removeSavedItem,
    applyCoupon,
    removeCoupon,
    getTotalPrice,
    getDiscountAmount,
    getFinalPrice,
    addItem
  } = useCartStore();

  const [couponInput, setCouponInput] = React.useState('');
  const [couponError, setCouponError] = React.useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = React.useState(false);
  const [shippingMethod, setShippingMethod] = React.useState<'standard' | 'express'>('standard');
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const subtotal = isMounted ? getTotalPrice() : 0;
  const discountAmount = isMounted ? getDiscountAmount() : 0;
  const freeShippingThreshold = 100; // Free above 100 AZN

  // Calculate Shipping Cost
  const shippingCost = React.useMemo(() => {
    if (subtotal >= freeShippingThreshold || subtotal === 0) return 0;
    return shippingMethod === 'express' ? 7 : 3;
  }, [subtotal, shippingMethod]);

  const taxEstimate = React.useMemo(() => {
    return 0; // Standard 0% direct e-comm tax in Azerbaijan currently, let's keep it clear
  }, []);

  const total = React.useMemo(() => {
    const finalProductPrice = isMounted ? getFinalPrice() : 0;
    return finalProductPrice + shippingCost + taxEstimate;
  }, [isMounted, getFinalPrice, shippingCost, taxEstimate]);

  const progressToFreeShipping = Math.min((subtotal / freeShippingThreshold) * 100, 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  // High conversion Cross-sells
  const upsellProducts = [
    {
      id: 'gan-lube-magic-10ml',
      title: 'GAN Lube Magic 10ml Premium Silicone Oil',
      price_azn: 15.0,
      image_url: 'https://picsum.photos/seed/ganlube/300/300',
      brand: 'GAN',
      desc: 'Dönmə sürətini artırır və səsi azaldır.'
    },
    {
      id: 'moyu-stand-base',
      title: 'MoYu Triangular Stand Holder',
      price_azn: 3.0,
      image_url: 'https://picsum.photos/seed/moyustand/300/300',
      brand: 'MoYu',
      desc: 'Kubu rəfdə sərgiləmək üçün xüsusi dayaq.'
    },
    {
      id: 'qiyi-cleaning-cloth',
      title: 'QiYi Cube Microfiber Polish Cloth',
      price_azn: 5.0,
      image_url: 'https://picsum.photos/seed/qiyicloth/300/300',
      brand: 'QiYi',
      desc: 'Kubun xarici səthini təmizləmək üçün.'
    }
  ];

  const [isCouponLoading, setIsCouponLoading] = React.useState(false);
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    setCouponSuccess(false);

    if (!couponInput.trim()) return;
    setIsCouponLoading(true);

    const res = await validateCoupon(couponInput, subtotal);
    if (res.success && res.coupon) {
      applyCoupon(res.coupon.code, res.coupon.discount_type, res.coupon.discount_value);
      setCouponSuccess(true);
      setCouponInput('');
      setTimeout(() => setCouponSuccess(false), 4000);
    } else {
      setCouponError(res.error || 'Kupon keçərsizdir.');
    }
    setIsCouponLoading(false);
  };

  const handleAddUpsell = (up: typeof upsellProducts[0]) => {
    addItem({
      id: up.id,
      title: up.title,
      price_azn: up.price_azn,
      quantity: 1,
      image_url: up.image_url
    });
  };

  if (!isMounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-rubik-brand border-t-transparent rounded-full mx-auto" />
        <p className="mt-4 text-xs text-muted-foreground font-semibold">Səbət yüklənir...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-background pb-24">
      {/* Breadcrumbs */}
      <div className="bg-muted/40 py-4 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Link href={`/${locale}`} className="hover:text-rubik-brand">
            Ana Səhifə
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-semibold">Alış-veriş Səbəti</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12 space-y-12">
        <div className="space-y-1 text-center md:text-left">
          <h1 className="text-2xl md:text-4xl font-black text-foreground">Səbətiniz</h1>
          <p className="text-xs text-muted-foreground">
            Sifarişinizi tamamlamadan öncə məhsullarınızı və fərdi xidmətləri nəzərdən keçirin.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="border border-border rounded-3xl p-12 text-center space-y-5 bg-card max-w-xl mx-auto shadow-soft-sm">
            <div className="p-4 bg-muted w-fit rounded-full mx-auto">
              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="font-black text-xl text-foreground">Səbətiniz boşdur</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Hazırda səbətinizdə heç bir məhsul yoxdur. Professional sürətli kub idmançıları üçün hazırladığımız flaqman kolleksiyamıza nəzər salın!
            </p>
            <Link
              href={`/${locale}`}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-rubik-brand text-white font-black text-xs rounded-xl hover:bg-rubik-brand-dark transition-colors cursor-pointer shadow-soft-md"
            >
              <span>Məhsulları Araşdırın</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left side: Cart Items & Saved items */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Interactive progress bar */}
              <div className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-soft-sm space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-foreground">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4.5 w-4.5 text-rubik-brand animate-pulse" />
                    {remainingForFreeShipping > 0 ? (
                      <span>
                        Daha <span className="text-rubik-brand">{remainingForFreeShipping.toFixed(2)} AZN</span> dəyərində məhsul əlavə et, <span className="underline">Pulsuz Çatdırılma</span> qazan!
                      </span>
                    ) : (
                      <span className="text-green-600 font-black flex items-center gap-1.5">
                        Təbriklər! Pulsuz kuryer çatdırılması üçün tam uyğunsunuz! <Check className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[11px]">{Math.round(progressToFreeShipping)}%</span>
                </div>
                <div className="w-full bg-muted border border-border h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-rubik-brand h-full transition-all duration-500"
                    style={{ width: `${progressToFreeShipping}%` }}
                  />
                </div>
              </div>

              {/* Active Cart items panel */}
              <div className="bg-card border border-border rounded-xl overflow-hidden shadow-md">
                <div className="px-6 py-5 bg-muted/40 border-b border-border flex items-center justify-between">
                  <h2 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                    <Package className="h-4.5 w-4.5 text-rubik-brand" />
                    Səbətdəki məhsullar ({items.reduce((sum, i) => sum + i.quantity, 0)} ədəd)
                  </h2>
                </div>

                <div className="p-6 divide-y divide-border/60">
                  {items.map((item) => (
                    <div key={item.id} className="flex flex-col md:flex-row md:items-center gap-4 py-5 first:pt-0 last:pb-0">
                      {/* Image Thumbnail */}
                      <div className="relative w-16 h-16 rounded-xl bg-muted/30 border border-border flex-shrink-0 overflow-hidden flex items-center justify-center p-1.5 self-start md:self-auto">
                        <Image
                          src={sanitizeImageUrl(item.image_url, item.id)}
                          alt={item.title}
                          fill
                          referrerPolicy="no-referrer"
                          className="object-contain p-1"
                          sizes="64px"
                        />
                      </div>

                      {/* Title & Brand details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs md:text-sm font-bold text-foreground leading-snug line-clamp-2">
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground font-medium">
                          <span>Original Premium</span>
                          <span>•</span>
                          <span className="text-rubik-brand">Professional Setup add-on</span>
                        </div>
                      </div>

                      {/* Operations and prices */}
                      <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pt-2 md:pt-0">
                        
                        {/* Quantity Counter */}
                        <div className="flex items-center border border-border rounded-lg bg-background overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-1 px-2.5 text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 w-3.5" />
                          </button>
                          <span className="px-2.5 text-xs font-black text-foreground min-w-[1.75rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 px-2.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Total item cost */}
                        <div className="text-right min-w-[4.5rem]">
                          <span className="block text-xs font-black text-foreground font-mono">
                            {(item.price_azn * item.quantity).toFixed(2)} AZN
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => saveForLater(item.id)}
                            title="Sonra üçün saxla"
                            className="p-2 text-muted-foreground hover:text-rubik-brand hover:bg-muted rounded-xl transition-all cursor-pointer"
                          >
                            <Bookmark className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            title="Səbətdən sil"
                            className="p-2 text-muted-foreground hover:text-red-500 hover:bg-muted rounded-xl transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save For Later Section */}
              {savedItems.length > 0 && (
                <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-soft-sm">
                  <div className="px-6 py-4 bg-muted/30 border-b border-border flex items-center justify-between">
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                      <Bookmark className="h-4 w-4 text-rubik-brand" />
                      Sonra üçün saxlanılanlar ({savedItems.length})
                    </h3>
                  </div>

                  <div className="p-6 divide-y divide-border/60">
                    {savedItems.map((item) => (
                      <div key={item.id} className="flex flex-col md:flex-row md:items-center gap-4 py-4 first:pt-0 last:pb-0">
                        <div className="relative w-12 h-12 rounded-xl bg-muted/20 border border-border overflow-hidden flex items-center justify-center p-1 flex-shrink-0">
                          <Image
                            src={sanitizeImageUrl(item.image_url, item.id)}
                            alt={item.title}
                            fill
                            referrerPolicy="no-referrer"
                            className="object-contain p-1"
                            sizes="48px"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-foreground leading-snug line-clamp-1">{item.title}</h4>
                          <span className="text-[10px] text-muted-foreground">{item.price_azn.toFixed(2)} AZN</span>
                        </div>

                        <div className="flex items-center gap-3 pt-1 md:pt-0">
                          <button
                            onClick={() => moveToCart(item.id)}
                            className="px-3.5 py-1.5 bg-rubik-brand hover:bg-rubik-brand-dark text-white font-black text-[10px] rounded-lg transition-colors cursor-pointer"
                          >
                            Səbətə at
                          </button>
                          <button
                            onClick={() => removeSavedItem(item.id)}
                            className="p-2 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-muted transition-all cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upsell / Cross-sell Slider */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-rubik-brand animate-bounce" />
                  Səbətinizi tamamlamaq üçün tövsiyələr
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {upsellProducts.map((up) => (
                    <div key={up.id} className="bg-card border border-border/80 p-4 rounded-2xl shadow-soft-sm flex flex-col justify-between hover:border-rubik-brand/40 transition-colors">
                      <div className="space-y-3">
                        <div className="relative aspect-square w-16 h-16 rounded-xl bg-muted/40 mx-auto overflow-hidden flex items-center justify-center p-1.5">
                          <Image
                            src={sanitizeImageUrl(up.image_url, up.id)}
                            alt={up.title}
                            fill
                            referrerPolicy="no-referrer"
                            className="object-contain p-1"
                            sizes="64px"
                          />
                        </div>
                        <div className="text-center space-y-1">
                          <span className="text-[9px] font-bold text-rubik-brand uppercase">{up.brand} Accessary</span>
                          <h4 className="text-[11px] font-bold text-foreground leading-snug line-clamp-2 min-h-[2.2rem]">
                            {up.title}
                          </h4>
                          <p className="text-[9px] text-muted-foreground leading-normal line-clamp-1">{up.desc}</p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border/60 mt-3 flex items-center justify-between">
                        <span className="text-xs font-black text-foreground font-mono">{up.price_azn.toFixed(2)} AZN</span>
                        <button
                          onClick={() => handleAddUpsell(up)}
                          className="px-2.5 py-1 bg-foreground text-card hover:bg-rubik-brand hover:text-white font-black text-[10px] rounded-lg transition-colors cursor-pointer"
                        >
                          + Əlavə et
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right side: Summary panel */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Order Summary card */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-soft-sm space-y-5">
                <h3 className="text-base font-black text-foreground uppercase tracking-wider pb-3 border-b border-border">
                  Sifariş Xülasəsi
                </h3>

                {/* Pricing Breakdowns */}
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Məhsul cəmi (Subtotal)</span>
                    <span className="font-semibold text-foreground font-mono">{subtotal.toFixed(2)} AZN</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between items-center text-green-600 bg-green-50 p-2 rounded-lg">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Percent className="h-3.5 w-3.5" />
                        <span>Kupon ({appliedCoupon} -{discountValue}{discountType === 'percentage' ? '%' : ' AZN'})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">-{discountAmount.toFixed(2)} AZN</span>
                        <button
                          onClick={removeCoupon}
                          className="text-red-500 hover:text-red-700 font-black cursor-pointer text-[10px] uppercase"
                        >
                          [Sil]
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Delivery type select */}
                  <div className="space-y-2 pt-2 border-t border-border/60">
                    <span className="block font-bold text-foreground text-[10px] uppercase tracking-wider">Çatdırılma növü</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setShippingMethod('standard')}
                        className={`p-2.5 text-left border rounded-xl transition-all cursor-pointer ${
                          shippingMethod === 'standard'
                            ? 'border-rubik-brand bg-rubik-brand/5 font-bold'
                            : 'border-border text-muted-foreground hover:border-foreground/10'
                        }`}
                      >
                        <span className="block text-[11px] text-foreground">Kuryer (1-2 gün)</span>
                        <span className="block text-[10px] font-mono mt-0.5 text-muted-foreground">
                          {subtotal >= freeShippingThreshold ? 'Pulsuz' : '3.00 AZN'}
                        </span>
                      </button>

                      <button
                        onClick={() => setShippingMethod('express')}
                        className={`p-2.5 text-left border rounded-xl transition-all cursor-pointer ${
                          shippingMethod === 'express'
                            ? 'border-rubik-brand bg-rubik-brand/5 font-bold'
                            : 'border-border text-muted-foreground hover:border-foreground/10'
                        }`}
                      >
                        <span className="block text-[11px] text-foreground">Express (3 saat)</span>
                        <span className="block text-[10px] font-mono mt-0.5 text-muted-foreground">
                          {subtotal >= freeShippingThreshold ? 'Pulsuz' : '7.00 AZN'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-muted-foreground pt-1.5">
                    <span>Çatdırılma xərci</span>
                    <span className="font-semibold text-foreground font-mono">
                      {shippingCost === 0 ? 'Pulsuz' : `${shippingCost.toFixed(2)} AZN`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>ƏDV (Tax estimate 0%)</span>
                    <span className="font-semibold text-foreground font-mono">0.00 AZN</span>
                  </div>

                  {/* Final Total price */}
                  <div className="flex justify-between items-center text-sm font-black text-foreground pt-4 border-t border-border">
                    <span className="uppercase">Yekun Ödəniş</span>
                    <span className="font-mono text-lg text-rubik-brand">{total.toFixed(2)} AZN</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link
                  href={`/${locale}/checkout`}
                  className="w-full inline-flex items-center justify-center py-4 bg-rubik-brand hover:bg-rubik-brand-dark text-white font-black text-sm rounded-2xl hover:shadow-soft-lg active:scale-98 transition-all cursor-pointer flex gap-2"
                >
                  <Zap className="h-4.5 w-4.5" />
                  <span>Sifarişi Tamamla</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Coupon input application block */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-soft-sm space-y-4">
                <h4 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Ticket className="h-4 w-4 text-rubik-brand" />
                  Kupon və Promo Kod
                </h4>

                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value);
                      setCouponError(null);
                    }}
                    placeholder="Məsələn: RUBIK20"
                    className="flex-1 bg-muted border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-rubik-brand uppercase font-mono tracking-wider placeholder:normal-case placeholder:font-sans"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-foreground text-card hover:bg-rubik-brand hover:text-white font-black text-xs rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Tətbiq Et
                  </button>
                </form>

                {couponError && (
                  <p className="text-[10px] text-red-600 font-bold leading-normal">{couponError}</p>
                )}

                {couponSuccess && (
                  <p className="text-[10px] text-green-600 font-bold leading-normal flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" /> Coupon kodu uğurla tətbiq edildi!
                  </p>
                )}

                <div className="bg-muted/40 p-3.5 rounded-xl border border-border/60 space-y-1">
                  <span className="block text-[10px] font-bold text-foreground">Aktiv Kampaniyalar:</span>
                  <div className="flex justify-between items-center text-[9px] text-muted-foreground font-mono">
                    <span>RUBIK20 (-20% Flaqman)</span>
                    <button
                      type="button"
                      onClick={() => setCouponInput('RUBIK20')}
                      className="text-rubik-brand hover:underline font-black cursor-pointer"
                    >
                      Kopyala
                    </button>
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-muted-foreground font-mono">
                    <span>SPEEDCUBE10 (-10% Hər şey)</span>
                    <button
                      type="button"
                      onClick={() => setCouponInput('SPEEDCUBE10')}
                      className="text-rubik-brand hover:underline font-black cursor-pointer"
                    >
                      Kopyala
                    </button>
                  </div>
                </div>
              </div>

              {/* Secure Trust details */}
              <div className="space-y-3.5 px-2">
                <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                  <ShieldCheck className="h-4.5 w-4.5 text-green-600 shrink-0" />
                  <span className="leading-snug">
                    <strong>Təhlükəsiz alış-veriş zəmanəti:</strong> Bütün fərdi və ödəniş məlumatları SSL şifrələmə sistemi ilə tam qorunur.
                  </span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                  <RotateCcw className="h-4.5 w-4.5 text-blue-500 shrink-0" />
                  <span className="leading-snug">
                    <strong>14 gün geri qaytarma:</strong> Heç bir səbəb göstərmədən istifadə edilməmiş məhsulları tam paketində geri qaytara bilərsiniz.
                  </span>
                </div>
              </div>

            </div>

          </div>
        )}
      </div>
    </div>
  );
}
