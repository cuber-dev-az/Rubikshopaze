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
  LogOut,
  Heart,
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

  return (
    <React.Fragment>
      {/* Top Banner Accent */}
      <div className="bg-rubik-brand text-white text-xs font-sans py-2 px-4 text-center tracking-wide font-medium flex items-center justify-center gap-2">
        <Sparkles className="h-3 w-3 shrink-0 animate-pulse" />
        <span>{dict.header?.promo_banner || "Rubikshop AZ — Azərbaycanda 1 nömrəli sürətli kub yarışı mağazası! Sürətli çatdırılma."}</span>
      </div>

      <header className="sticky top-0 z-40 w-full bg-card border-b border-border shadow-soft-sm backdrop-blur-md bg-opacity-95 dark:bg-opacity-90">
        
        {/* DESKTOP LAYOUT ARCHITECTURE RULES (hidden md:flex structural layer) */}
        <div className="hidden md:flex items-center justify-between bg-[#0d1117] border-b border-gray-800 px-6 py-4 w-full gap-6">
          
          {/* LEFT SECTION */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Standalone 3-lines hamburger menu drawer toggle button component */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Desktop Menu Toggle"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Brand Logo Link */}
            <Link href={`/${locale}`} className="flex items-center gap-2 group">
              <span className="text-xl md:text-2xl font-sans font-black bg-rubik-brand text-white px-3 py-1.5 rounded-lg shadow-soft-sm group-hover:bg-rubik-brand-dark transition-all duration-300 tracking-tight">
                RubikShop<span className="text-rubik-yellow">.az</span>
              </span>
            </Link>
          </div>

          {/* MIDDLE SECTION */}
          <div className="flex-1 max-w-xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
              <Search className="absolute left-4 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                type="search"
                placeholder={dict.header?.search_placeholder || "Məhsul axtar..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-24 py-2.5 bg-[#161b22] border border-gray-800 rounded-xl text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-black rounded-lg transition-colors cursor-pointer h-[34px] flex items-center justify-center"
              >
                {dict.header?.search_button || "Axtar"}
              </button>
            </form>
          </div>

          {/* RIGHT SECTION */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Account Shortcut */}
            <button
              onClick={handleAccountClick}
              className="p-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-full transition-all duration-200 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Kabinet"
            >
              <User className="h-5 w-5" />
            </button>

            {/* Wishlist Shortcut */}
            <Link
              href={`/${locale}/wishlist`}
              className="p-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-full transition-all duration-200 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Seçilmişlər"
            >
              <Heart className="h-5 w-5" />
            </Link>

            {/* Səbət Shortcut */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-full transition-all duration-200 items-center justify-center min-w-[44px] min-h-[44px] cursor-pointer"
              aria-label="Səbət"
            >
              <ShoppingCart className="h-5 w-5" />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-5 h-5 px-1 text-[10px] font-black text-white bg-red-500 border-2 border-[#0d1117] rounded-full animate-bounce">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Admin shortcut if logged in */}
            {mounted && (userRole === 'admin' || userRole === 'manager') && (
              <Link
                href={`/${locale}/admin`}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-black bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-lg border border-red-500/25 transition-all duration-200 uppercase tracking-wider h-[38px]"
              >
                Admin
              </Link>
            )}

            {mounted && user && (
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-black bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all duration-200 border border-red-600/30 cursor-pointer h-[38px]"
                title="Çıxış Et"
              >
                <LogOut className="h-4 w-4" />
                <span>{dict.header?.sign_out || "Çıxış"}</span>
              </button>
            )}
          </div>

        </div>

        {/* MOBILE LAYOUT ARCHITECTURE RULES (flex md:hidden structural layer) */}
        <div className="flex md:hidden items-center justify-between bg-[#0d1117] border-b border-gray-800 px-4 py-3 w-full">
          {/* Left: Brand logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2 group">
            <span className="text-xl font-sans font-black bg-rubik-brand text-white px-3 py-1.5 rounded-lg shadow-soft-sm group-hover:bg-rubik-brand-dark transition-all duration-300 tracking-tight">
              RubikShop<span className="text-rubik-yellow">.az</span>
            </span>
          </Link>

          {/* Right: Hamburger navigation toggle trigger */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Menyu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Conditional Sub-Row Search visibility (Mobile only) */}
        {showMobileSearch && (
          <div className="md:hidden px-4 pb-4 pt-1 bg-[#0d1117]">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
              <Search className="absolute left-3.5 h-4 w-4 text-gray-500 pointer-events-none" />
              <input
                type="search"
                placeholder={dict.header?.search_placeholder || "Məhsul axtar..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#161b22] border border-gray-800 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
              />
            </form>
          </div>
        )}

        {/* FULL-SCREEN NAVIGATION OVERLAY DRAWER */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              key="mobile-drawer-container"
              initial={{ opacity: 0, y: '-100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-0 h-screen w-screen bg-[#0d1117] z-[99999] p-6 flex flex-col overflow-y-auto text-white"
            >
              <div className="w-full max-w-3xl mx-auto flex flex-col flex-1 gap-6">
                
                {/* Header Row */}
                <div className="flex items-center justify-between border-b border-gray-800 pb-5">
                  <Link 
                    href={`/${locale}`} 
                    className="flex items-center gap-2 group"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="text-xl font-sans font-black bg-rubik-brand text-white px-3 py-1.5 rounded-lg tracking-tight">
                      RubikShop<span className="text-rubik-yellow">.az</span>
                    </span>
                  </Link>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-3 bg-gray-800/50 hover:bg-gray-800 rounded-full text-white transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label="Bağla"
                  >
                    <X className="h-5 w-5 text-white" />
                  </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 flex flex-col justify-between pb-6 gap-8">
                  
                  {/* Language Selection Bar - PLACED EXCLUSIVELY HERE */}
                  <div className="space-y-3">
                    <span className="text-xs font-black uppercase tracking-wider text-gray-400 block">
                      {dict.header?.language_title || "Dil seçimi"}
                    </span>
                    <div className="grid grid-cols-3 gap-1.5 bg-[#161b22] p-1.5 rounded-xl border border-gray-800">
                      {(['az', 'en', 'ru'] as const).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => {
                            changeLanguage(lang);
                            setIsMenuOpen(false);
                          }}
                          className={`py-2.5 text-xs font-black rounded-lg transition-all duration-200 uppercase min-h-[44px] flex items-center justify-center cursor-pointer ${
                            locale === lang
                              ? 'bg-red-500 text-white shadow-soft-sm'
                              : 'text-gray-300 hover:text-white hover:bg-white/5'
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
                      <span className="text-xs font-black uppercase tracking-wider text-gray-500 block pb-1 border-b border-gray-800">
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
                            className={`block py-3 text-lg font-medium text-white border-b border-gray-800/40 last:border-0 transition-colors ${
                              pathname === item.href || pathname.startsWith(item.href + '/')
                                ? 'text-red-500 font-bold'
                                : 'hover:text-red-500'
                            }`}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </nav>
                    </div>

                    <div className="space-y-4">
                      <span className="text-xs font-black uppercase tracking-wider text-gray-500 block pb-1 border-b border-gray-800">
                        {dict.header?.categories_title || "Məhsul Qrupları"}
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {rubikTaxonomyGroups.map((group) => {
                          const mainCategoryLink = group.items[0]?.slug 
                            ? `/${locale}/category/${encodeURIComponent(group.items[0].slug)}`
                            : `/${locale}/category`;
                          return (
                            <Link
                              key={group.id}
                              href={mainCategoryLink}
                              onClick={() => setIsMenuOpen(false)}
                              className="p-3 bg-[#161b22] border border-gray-800 rounded-xl hover:border-red-500 hover:bg-gray-800/50 transition-all text-center flex flex-col justify-center min-h-[60px]"
                            >
                              <span className="text-xs font-bold text-white tracking-wide">{t(group.title)}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* User Account & Action Panel */}
                  <div className="space-y-3 pt-6 border-t border-gray-800">
                    {mounted && user ? (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            handleAccountClick();
                          }}
                          className="flex-1 inline-flex items-center justify-center px-4 py-3.5 bg-white text-[#0d1117] text-sm font-black rounded-xl hover:bg-gray-100 transition-colors cursor-pointer min-h-[44px]"
                        >
                          {dict.header?.my_account || "Şəxsi Kabinet"}
                        </button>
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            handleSignOut();
                          }}
                          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-red-600/10 text-red-500 border border-red-500/20 text-sm font-black rounded-xl hover:bg-red-600 hover:text-white transition-all cursor-pointer min-h-[44px]"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>{dict.header?.sign_out_long || "Çıxış Et"}</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          openModal('login');
                        }}
                        className="w-full inline-flex items-center justify-center px-4 py-3.5 bg-red-500 text-white text-sm font-black rounded-xl hover:bg-red-600 transition-colors cursor-pointer min-h-[44px]"
                      >
                        {dict.header?.login_register || "Giriş / Qeydiyyat"}
                      </button>
                    )}
                  </div>

                </div>
              </div>
            </motion.div>
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
