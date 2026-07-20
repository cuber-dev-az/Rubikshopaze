'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabase/client';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Sparkles, Check, Truck } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthModalStore } from '@/store/useAuthModalStore';
import { createClient } from '@/lib/supabase/client';
import type { ApplicationDictionary } from '@/types/application.types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  dict: ApplicationDictionary;
  locale: string;
}

export function CartDrawer({ isOpen, onClose, dict, locale }: CartDrawerProps) {
  const [user, setUser] = React.useState<any>(null);
  const { openModal } = useAuthModalStore();
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
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

  const subtotal = isMounted ? getTotalPrice() : 0;
  const freeShippingThreshold = 100; // 100 AZN Free Shipping
  const progressToFreeShipping = Math.min((subtotal / freeShippingThreshold) * 100, 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Slider Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-screen max-w-md bg-card border-l border-border shadow-soft-2xl flex flex-col h-full"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-border/80">
                <h2 className="text-base font-black text-foreground flex items-center gap-2.5">
                  <ShoppingBag className="w-5 h-5 text-rubik-brand" />
                  <span>Səbətiniz ({items.length})</span>
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all duration-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free Shipping Progress Indicator */}
              {items.length > 0 && (
                <div className="px-6 py-3.5 bg-muted/40 border-b border-border space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-foreground">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Truck className="h-4 w-4 text-rubik-brand animate-pulse" />
                      {remainingForFreeShipping > 0 ? (
                        <span>
                          Pulsuz çatdırılma üçün daha <span className="text-rubik-brand">{remainingForFreeShipping.toFixed(2)} AZN</span> lazımdır
                        </span>
                      ) : (
                        <span className="text-green-600 font-black flex items-center gap-1">
                          Təbriklər! Pulsuz çatdırılma qazandınız! <Check className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[10px]">{Math.round(progressToFreeShipping)}%</span>
                  </div>
                  <div className="w-full bg-muted border border-border h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-rubik-brand h-full transition-all duration-500"
                      style={{ width: `${progressToFreeShipping}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {!isMounted || items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <div className="p-4 bg-muted rounded-full">
                      <ShoppingBag className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="font-black text-base text-foreground">Səbətiniz boşdur</h3>
                    <p className="text-xs text-muted-foreground max-w-[240px] leading-relaxed">
                      Səbətinizdə hazırda məhsul yoxdur. Sürətli flaqman kublarımıza baxaraq fərqi yaşayın!
                    </p>
                    <button
                      onClick={onClose}
                      className="mt-2 px-5 py-2.5 bg-rubik-brand text-white text-xs font-black rounded-xl hover:bg-rubik-brand-dark transition-colors cursor-pointer"
                    >
                      Alış-verişə davam et
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-border/60">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                        {/* Thumb */}
                        <div className="relative w-16 h-16 rounded-xl bg-muted/30 border border-border flex-shrink-0 overflow-hidden flex items-center justify-center p-1.5">
                          <Image
                            src={item.image_url}
                            alt={item.title}
                            fill
                            referrerPolicy="no-referrer"
                            className="object-contain p-1"
                            sizes="64px"
                          />
                        </div>
                        
                        {/* Core text */}
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-xs font-bold text-foreground hover:text-rubik-brand transition-colors line-clamp-2 leading-snug">
                              {item.title}
                            </h3>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-muted-foreground hover:text-red-500 p-0.5 rounded-lg hover:bg-muted transition-all cursor-pointer shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {/* Ops and price */}
                          <div className="flex items-center justify-between mt-1">
                            {/* Quantity buttons */}
                            <div className="flex items-center border border-border rounded-lg overflow-hidden bg-background">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="p-1 px-2 text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2 text-xs font-black text-foreground min-w-[1.5rem] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-1 px-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            
                            {/* Individual total */}
                            <span className="text-xs font-black text-foreground font-mono">
                              {(item.price_azn * item.quantity).toFixed(2)} AZN
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Drawer Summary / CTA Panel */}
              {isMounted && items.length > 0 && (
                <div className="p-6 border-t border-border bg-muted/30 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                      <span>Məhsul sayı</span>
                      <span>{items.reduce((sum, item) => sum + item.quantity, 0)} ədəd</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-black text-foreground">
                      <span>Yekun Cəm</span>
                      <span className="font-mono text-base">{subtotal.toFixed(2)} AZN</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      * Çatdırılma və endirim kuponları növbəti mərhələdə hesablanacaqdır.
                    </p>
                  </div>
                  
                  {!user && (
                    <button
                      onClick={() => {
                        onClose();
                        openModal('login');
                      }}
                      className="w-full mb-3 py-2.5 text-xs font-black text-rubik-brand bg-rubik-brand/10 hover:bg-rubik-brand/20 rounded-xl transition-colors cursor-pointer block text-center"
                    >
                      Daxil ol və sürətli rəsmiləşdir
                    </button>
                  )}
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href={`/${locale}/cart`}
                      onClick={onClose}
                      className="w-full inline-flex items-center justify-center py-3 bg-muted hover:bg-muted/80 text-foreground text-xs font-black rounded-xl border border-border transition-colors cursor-pointer"
                    >
                      Səbətə bax
                    </Link>
                    <Link
                      href={`/${locale}/checkout`}
                      onClick={onClose}
                      className="w-full inline-flex items-center justify-center py-3 bg-rubik-brand hover:bg-rubik-brand-dark text-white text-xs font-black rounded-xl hover:shadow-soft-md transition-all cursor-pointer flex gap-1 items-center"
                    >
                      <span>Sifariş et</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
