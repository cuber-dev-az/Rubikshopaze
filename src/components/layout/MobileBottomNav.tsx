'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Home, LayoutGrid, ShoppingCart, User, LogOut } from 'lucide-react';
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
  
  const { user, userRole, signOut: authSignOut } = useAuthUser();
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

  const handleSignOut = React.useCallback(async () => {
    await authSignOut(locale, router);
  }, [authSignOut, locale, router]);

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
      href: `/${locale}/category/3x3`, 
      icon: LayoutGrid,
    },
    {
      name: dict.navigation.cart,
      href: `/${locale}/cart`,
      icon: ShoppingCart,
      badge: mounted && totalItems > 0 ? totalItems : undefined,
    },
    {
      name: 'Şəxsi Kabinet',
      href: `/${locale}/account`,
      icon: User,
    }
  ];

  if (mounted && user) {
    navItems.push({
      name: 'Çıxış Et',
      href: '#sign-out',
      icon: LogOut,
    });
  }

  return (
    <div 
      className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-[60px] px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== `/${locale}` && pathname.startsWith(item.href) && !item.href.includes('category'));
          
          return (
            <button
              key={item.name}
              onClick={() => {
                if (item.name === 'Şəxsi Kabinet') {
                  handleAccountClick();
                } else if (item.name === 'Çıxış Et') {
                  handleSignOut();
                } else if (item.name === 'Kataloq') {
                  router.push(item.href);
                } else {
                  router.push(item.href);
                }
              }}
              className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors cursor-pointer ${
                isActive ? 'text-rubik-brand' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="relative">
                <item.icon className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black text-white bg-rubik-brand border-2 border-card rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-semibold tracking-wide">
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
