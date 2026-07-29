'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthUser } from '@/hooks/useAuthUser';
import {
  ShoppingCart,
  User,
  Search,
  Menu,
  X,
  Sparkles,
  Package,
  Heart,
  ShieldCheck,
} from 'lucide-react';
import { rubikTaxonomyGroups } from '@/lib/config/catalog';
import { useCartStore } from '@/store/useCartStore';
import { useAuthModalStore } from '@/store/useAuthModalStore';
import type { ApplicationDictionary } from '@/types/application.types';
import { CartDrawer } from '@/components/CartDrawer';

interface HeaderProps {
  dict: ApplicationDictionary;
  locale: 'az' | 'en' | 'ru' | string;
}

export function Header({ dict, locale }: HeaderProps) {
  const [mounted, setMounted] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const { user, userRole, signOut: authSignOut } = useAuthUser();
  const openModal = useAuthModalStore((state) => state.openModal);

  const router = useRouter();
  const pathname = usePathname();

  const items = useCartStore((state) => state.items);
  const totalItems = React.useMemo(() => items.reduce((total, item) => total + (item.quantity || 1), 0), [items]);

  // Determine whether to show the mobile search sub-header
  const showMobileSearch = React.useMemo(() => {
    const cleanPath = pathname || '';
    const isHome = 
      cleanPath === '/' || 
      cleanPath === `/${locale}` || 
      cleanPath === `/${locale}/`;
    const isCategory = cleanPath.includes('/category');
    return isHome || isCategory;
  }, [pathname, locale]);

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
  
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const changeLanguage = (newLocale: string) => {
    const segments = pathname.split('/');
    if (segments[1] === locale) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    router.push(segments.join('/'));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/${locale}?search=${encodeURIComponent(searchQuery)}`);
  };

  React.useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const t = (obj: { az: string; en: string; ru: string }) => {
    return obj[locale as keyof typeof obj] || obj.az;
  };

  React.useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isMenuOpen]);

  return (
    <React.Fragment>
      {/* Top Banner Accent */}
      <div className="bg-[#D8232A] text-white text-xs sm:text-xs font-semibold py-2.5 px-4 sm:px-6 text-center tracking-wide flex items-center justify-center gap-2.5 leading-snug shadow-sm">
        <Sparkles className="h-3.5 w-3.5 shrink-0 animate-pulse text-yellow-300" />
        <span className="truncate sm:whitespace-normal">{dict.header?.promo_banner || "Rubikshop AZ — Azərbaycanda 1 nömrəli sürətli kub yarışı mağazası! Sürətli çatdırılma."}</span>
      </div>

      <header className={`sticky top-0 w-full bg-[#FFFFFF] border-b border-[#EDEDED] shadow-sm backdrop-blur-md ${isMenuOpen ? 'z-[99999]' : 'z-40'}`}>
        
        {/* DESKTOP LAYOUT ARCHITECTURE RULES */}
        <div className="hidden md:flex items-center justify-between bg-[#FFFFFF] border-b border-[#EDEDED] px-6 py-3.5 w-full gap-6">
          
          {/* LEFT SECTION */}
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2.5 text-[#17181C] hover:text-[#D8232A] hover:bg-[#F6F6F8] rounded-lg transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Desktop Menu Toggle"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Brand Logo Link per Section I */}
            <Link href={`/${locale}`} className="flex items-center gap-2 group">
              {/* Mascot Icon */}
              <div className="w-8 h-8 rounded-lg bg-[#D8232A] text-white flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-105 transition-transform">
                <Package className="w-5 h-5" />
              </div>
              <span className="font-sans font-black text-[#D8232A] text-xl md:text-2xl tracking-tight">
                RubikShop<span className="text-[#17181C] text-sm md:text-base font-bold ml-0.5">.az</span>
              </span>
            </Link>
          </div>

          {/* MIDDLE SECTION */}
          <div className="flex-1 max-w-xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
              <Search className="absolute left-4 h-4 w-4 text-[#9CA3AF] pointer-events-none" />
              <input
                type="search"
                placeholder={dict.header?.search_placeholder || "Məhsul axtar..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-24 py-2.5 bg-[#F6F6F8] border border-[#E5E7EB] rounded-xl text-sm text-[#17181C] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#D8232A] focus:bg-white transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 px-4 py-1.5 bg-[#D8232A] hover:bg-[#B31B21] text-white text-xs font-black rounded-lg transition-colors cursor-pointer h-[34px] flex items-center justify-center"
              >
                {dict.header?.search_button || "Axtar"}
              </button>
            </form>
          </div>

          {/* RIGHT SECTION */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Account Shortcut */}
            <button
              onClick={handleAccountClick}
              className="p-3 text-[#17181C] hover:text-[#D8232A] hover:bg-[#F6F6F8] rounded-full transition-all duration-200 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label={dict.navigation.account || "Kabinet"}
            >
              <User className="h-5 w-5" />
            </button>

            {/* Wishlist Shortcut */}
            <Link
              href={`/${locale}/wishlist`}
              className="p-3 text-[#17181C] hover:text-[#D8232A] hover:bg-[#F6F6F8] rounded-full transition-all duration-200 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label={dict.navigation.wishlist || "Seçilmişlər"}
            >
              <Heart className="h-5 w-5" />
            </Link>

            {/* Səbət Shortcut */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-3 text-[#17181C] hover:text-[#D8232A] hover:bg-[#F6F6F8] rounded-full transition-all duration-200 items-center justify-center min-w-[44px] min-h-[44px] cursor-pointer"
              aria-label={dict.navigation.cart || "Səbət"}
            >
              <ShoppingCart className="h-5 w-5" />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-5 h-5 px-1 text-[10px] font-black text-white bg-[#D8232A] border-2 border-[#FFFFFF] rounded-full">
                  {totalItems}
                </span>
              )}
            </button>
          </div>

        </div>

        {/* MOBILE LAYOUT ARCHITECTURE RULES */}
        <div className="flex md:hidden items-center justify-between bg-[#FFFFFF] border-b border-[#EDEDED] px-4 py-3 w-full">
          {/* Left: Brand logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-[#D8232A] text-white flex items-center justify-center font-black text-xs shadow-sm">
              <Package className="w-4 h-4" />
            </div>
            <span className="font-sans font-black text-[#D8232A] text-xl tracking-tight">
              RubikShop<span className="text-[#17181C] text-xs font-bold ml-0.5">.az</span>
            </span>
          </Link>

          {/* Right: Hamburger navigation toggle trigger */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2.5 text-[#17181C] hover:text-[#D8232A] hover:bg-[#F6F6F8] rounded-lg transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={t({ az: 'Menyu', en: 'Menu', ru: 'Меню' })}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Conditional Sub-Row Search visibility (Mobile only) */}
        {showMobileSearch && (
          <div className="md:hidden px-4 pb-3 pt-1 bg-[#FFFFFF]">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
              <Search className="absolute left-3.5 h-4 w-4 text-[#9CA3AF] pointer-events-none" />
              <input
                type="search"
                placeholder={dict.header?.search_placeholder || "Məhsul axtar..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#F6F6F8] border border-[#E5E7EB] rounded-lg text-sm text-[#17181C] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#D8232A] transition-all"
              />
            </form>
          </div>
        )}

        {/* RIGHT-ALIGNED SLIDE-OUT NAVIGATION OVERLAY DRAWER */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              {/* Backdrop Overlay */}
              <motion.div
                key="mobile-drawer-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsMenuOpen(false)}
                className="fixed inset-0 w-screen h-dvh bg-black/60 backdrop-blur-sm z-[99998]"
                aria-hidden="true"
              />

              {/* Side Drawer Container (Full width on mobile, right-docked max-w-md on desktop) */}
              <motion.div
                key="mobile-drawer-container"
                initial={{ opacity: 0, x: '100%' }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: '100%' }}
                transition={{ type: 'spring', damping: 26, stiffness: 240 }}
                className="fixed inset-y-0 right-0 h-dvh w-full md:w-[460px] md:max-w-md bg-[#FFFFFF] z-[99999] p-5 sm:p-6 flex flex-col overflow-y-auto text-[#17181C] overscroll-contain shadow-2xl border-l border-[#EDEDED]"
              >
                <div className="w-full flex flex-col gap-6">
                  
                  {/* Header Row */}
                  <div className="flex items-center justify-between border-b border-[#EDEDED] pb-4">
                    <Link 
                      href={`/${locale}`} 
                      className="flex items-center gap-2 group"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="text-xl font-sans font-black bg-[#D8232A] text-white px-3 py-1.5 rounded-lg tracking-tight shadow-sm">
                        RubikShop<span className="text-yellow-300">.az</span>
                      </span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setIsMenuOpen(false)}
                      className="p-2.5 bg-[#F6F6F8] hover:bg-[#EDEDED] border border-[#E5E7EB] rounded-full text-[#17181C] transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                      aria-label={t({ az: 'Bağla', en: 'Close', ru: 'Закрыть' })}
                    >
                      <X className="h-5 w-5 text-[#17181C]" />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="flex flex-col gap-6 py-2 pb-[calc(5rem+env(safe-area-inset-bottom))]">
                    
                    {/* Language Selection Bar */}
                    <div className="space-y-2.5 w-full">
                      <span className="text-xs font-black uppercase tracking-wider text-[#374151] block">
                        {dict.header?.language_title || "Dil seçimi"}
                      </span>
                      <div className="grid grid-cols-3 gap-1.5 bg-[#F6F6F8] p-1.5 rounded-xl border border-[#E5E7EB] w-full overflow-hidden">
                        {(['az', 'en', 'ru'] as const).map((lang) => (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => {
                              changeLanguage(lang);
                              setIsMenuOpen(false);
                            }}
                            className={`w-full py-2.5 text-xs font-black rounded-lg transition-all duration-200 uppercase min-h-[44px] flex items-center justify-center cursor-pointer ${
                              locale === lang
                                ? 'bg-[#D8232A] text-white shadow-sm'
                                : 'text-[#374151] hover:text-[#17181C] hover:bg-white border border-[#E5E7EB]/50 font-bold'
                            }`}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    </div>

                  {/* Structural Navigation Links */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <span className="text-xs font-black uppercase tracking-wider text-[#374151] block pb-1 border-b border-[#EDEDED]">
                        {dict.header?.pages_title || "Səhifələr"}
                      </span>
                      <nav className="flex flex-col">
                        {[
                          { label: dict.header?.nav_catalog || 'Kataloq', href: `/${locale}/category` },
                          { label: dict.header?.nav_learning || 'Alqoritmlər & Öyrənmə', href: `/${locale}?category=learning-content` },
                          { label: dict.header?.nav_delivery || 'Çatdırılma və Ödəniş', href: `/${locale}/faq` },
                          { label: dict.header?.nav_about || 'Haqqımızda', href: `/${locale}/pages/about` },
                          { label: dict.header?.nav_contact || 'Əlaqə', href: `/${locale}/faq` },
                        ].map((item) => (
                          <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => setIsMenuOpen(false)}
                            className={`block py-3 text-base font-semibold text-[#17181C] border-b border-[#F6F6F8] last:border-0 transition-colors ${
                              pathname === item.href || pathname.startsWith(item.href + '/')
                                ? 'text-[#D8232A] font-black'
                                : 'hover:text-[#D8232A]'
                            }`}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </nav>
                    </div>

                    <div className="space-y-3">
                      <span className="text-xs font-black uppercase tracking-wider text-[#374151] block pb-1 border-b border-[#EDEDED]">
                        {dict.header?.categories_title || "Məhsul Qrupları"}
                      </span>
                      <div className="grid grid-cols-2 gap-2.5">
                        {rubikTaxonomyGroups.map((group, idx) => {
                          const mainCategoryLink = group.items[0]?.slug 
                            ? `/${locale}/category/${encodeURIComponent(group.items[0].slug)}`
                            : `/${locale}/category`;
                          const isLastOdd = idx === rubikTaxonomyGroups.length - 1 && rubikTaxonomyGroups.length % 2 !== 0;
                          return (
                            <Link
                              key={group.id}
                              href={mainCategoryLink}
                              onClick={() => setIsMenuOpen(false)}
                              className={`p-3 bg-[#F6F6F8] border border-[#E5E7EB] rounded-xl hover:border-[#D8232A] hover:bg-white transition-all text-center flex items-center justify-center min-h-[56px] shadow-2xs group ${
                                isLastOdd ? 'col-span-2' : ''
                              }`}
                            >
                              <span className="text-xs font-bold text-[#17181C] group-hover:text-[#D8232A] tracking-wide transition-colors">
                                {t(group.title)}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* User Account & Action Panel */}
                  <div className="space-y-3 pt-6 border-t border-[#EDEDED]">
                    {mounted && user ? (
                      <div className="space-y-2">
                        {(userRole === 'admin' || userRole === 'manager') && (
                          <Link
                            href={`/${locale}/admin`}
                            onClick={() => setIsMenuOpen(false)}
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 bg-[#D8232A]/10 text-[#D8232A] border border-[#D8232A]/30 text-xs font-black rounded-xl hover:bg-[#D8232A]/20 transition-colors cursor-pointer min-h-[48px] uppercase tracking-wider"
                          >
                            <ShieldCheck className="h-4 w-4" />
                            Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            handleAccountClick();
                          }}
                          className="w-full inline-flex items-center justify-center px-4 py-3.5 bg-[#17181C] text-white text-sm font-black rounded-xl hover:bg-black transition-colors cursor-pointer min-h-[48px] shadow-sm"
                        >
                          {dict.header?.my_account || "Şəxsi Kabinet"}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          openModal('login');
                        }}
                        className="w-full inline-flex items-center justify-center px-4 py-3.5 bg-[#D8232A] text-white text-sm font-black rounded-xl hover:bg-[#B31B21] transition-colors cursor-pointer min-h-[48px] shadow-md"
                      >
                        {dict.header?.login_register || "Giriş / Qeydiyyat"}
                      </button>
                    )}
                  </div>

                </div>
              </div>
            </motion.div>
          </>
        )}
        </AnimatePresence>
      </header>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        dict={dict}
        locale={locale}
      />
    </React.Fragment>
  );
}
