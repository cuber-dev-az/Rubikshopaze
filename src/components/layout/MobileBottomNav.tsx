'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Home, LayoutGrid, Heart, ShoppingCart, User } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthModalStore } from '@/store/useAuthModalStore';
import { useAuthUser } from '@/hooks/useAuthUser';
import type { ApplicationDictionary } from '@/types/application.types';

export function MobileBottomNav({ dict, locale }: { dict: ApplicationDictionary; locale: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  const items = useCartStore((state) => state.items);
  const totalItems = useMemo(() => items.reduce((total, item) => total + (item.quantity || 1), 0), [items]);
  
  const { user, userRole } = useAuthUser();
  const openModal = useAuthModalStore((state) => state.openModal);

  const handleAccountClick = React.useCallback(() => {
    if (!user) {
      openModal('login');
    } else if (userRole === 'admin' || userRole === 'manager') {
      router.push(`/${locale}/admin`);
    } else {
      router.push(`/${locale}/account`);
    }
  }, [user, userRole, locale, openModal, router]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    {
      id: 'home',
      name: dict.navigation.home || 'Əsas',
      href: `/${locale}`,
      icon: Home,
    },
    {
      id: 'catalog',
      name: dict.navigation.catalog || 'Kataloq', 
      href: `/${locale}/category`, 
      icon: LayoutGrid,
    },
    {
      id: 'wishlist',
      name: dict.navigation.wishlist || 'Seçilmişlər',
      href: `/${locale}/wishlist`,
      icon: Heart,
    },
    {
      id: 'cart',
      name: dict.navigation.cart || 'Səbət',
      href: `/${locale}/cart`,
      icon: ShoppingCart,
      badge: mounted && totalItems > 0 ? totalItems : undefined,
    },
    {
      id: 'account',
      name: dict.navigation.account || 'Kabinet',
      href: `/${locale}/account`,
      icon: User,
    }
  ];

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden bg-[#0d1117] border-t border-gray-800 shadow-[0_-4px_24px_rgba(0,0,0,0.3)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-[64px] px-1 w-full">
        {navItems.map((item) => {
          // Precise active path segment match
          const isActive = item.href === `/${locale}`
            ? pathname === `/${locale}` || pathname === `/${locale}/`
            : pathname.startsWith(item.href);
          
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'account') {
                  handleAccountClick();
                } else {
                  router.push(item.href);
                }
              }}
              className={`relative flex flex-col items-center justify-center w-full h-full min-h-[44px] min-w-[44px] py-1 px-1 transition-all cursor-pointer ${
                isActive ? 'text-red-500 font-semibold' : 'text-gray-300 hover:text-white'
              }`}
              style={{ contentVisibility: 'auto' }}
              aria-label={item.name}
            >
              <div className="relative flex items-center justify-center p-1 rounded-full group-active:scale-95 transition-transform duration-100">
                <Icon className={`w-[22px] h-[22px] transition-transform ${isActive ? 'scale-110 text-red-500' : 'group-hover:scale-105'}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[9px] font-black text-white bg-red-500 border-2 border-[#0d1117] rounded-full animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-black tracking-wider uppercase mt-1 transition-all">
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
