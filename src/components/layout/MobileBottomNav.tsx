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
      name: dict.navigation.home,
      href: `/${locale}`,
      icon: Home,
    },
    {
      name: 'Kataloq', 
      href: `/${locale}/category`, 
      icon: LayoutGrid,
    },
    {
      name: 'Seçilmişlər',
      href: `/${locale}/wishlist`,
      icon: Heart,
    },
    {
      name: dict.navigation.cart,
      href: `/${locale}/cart`,
      icon: ShoppingCart,
      badge: mounted && totalItems > 0 ? totalItems : undefined,
    },
    {
      name: 'Kabinet',
      href: `/${locale}/account`,
      icon: User,
    }
  ];

  return (
    <div 
      className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0d1117] border-t border-gray-800 z-50 shadow-[0_-4px_24px_rgba(0,0,0,0.3)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-[64px] px-1">
        {navItems.map((item) => {
          // Precise active path segment match
          const isActive = item.href === `/${locale}`
            ? pathname === `/${locale}` || pathname === `/${locale}/`
            : pathname.startsWith(item.href);
          
          const Icon = item.icon;

          return (
            <button
              key={item.name}
              onClick={() => {
                if (item.name === 'Kabinet') {
                  handleAccountClick();
                } else {
                  router.push(item.href);
                }
              }}
              className={`relative flex flex-col items-center justify-center w-full h-full min-h-[48px] min-w-[48px] py-1 px-2.5 transition-all cursor-pointer ${
                isActive ? 'text-rubik-brand' : 'text-gray-400 hover:text-white'
              }`}
              style={{ contentVisibility: 'auto' }}
              aria-label={item.name}
            >
              <div className="relative flex items-center justify-center p-1 rounded-full group-active:scale-95 transition-transform duration-100">
                <Icon className={`w-[22px] h-[22px] transition-transform ${isActive ? 'scale-110 text-rubik-brand' : 'group-hover:scale-105'}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[9px] font-black text-white bg-rubik-brand border-2 border-[#0d1117] rounded-full">
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
