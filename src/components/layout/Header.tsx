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
  ChevronDown,
  Globe,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isDesktopCategoryMenuOpen, setIsDesktopCategoryMenuOpen] = React.useState(false);
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
    setIsMobileMenuOpen(false);
    setIsDesktopCategoryMenuOpen(false);
  }, [pathname]);

  const t = (obj: { az: string; en: string; ru: string }) => {
    return obj[locale as keyof typeof obj] || obj.az;
  };

  return (
    <React.Fragment>
      {/* Top Banner Accent */}
      <div className="bg-rubik-brand text-white text-xs font-sans py-2 px-4 text-center tracking-wide font-medium flex items-center justify-center gap-2">
        <Sparkles className="h-3 w-3 shrink-0 animate-pulse" />
        <span>Rubikshop AZ — Azərbaycanda 1 nömrəli sürətli kub yarışı mağazası! Sürətli çatdırılma.</span>
      </div>

      <header className="sticky top-0 z-40 w-full bg-card border-b border-border shadow-soft-sm backdrop-blur-md bg-opacity-95 dark:bg-opacity-90">
        
        {/* DESKTOP LAYOUT ARCHITECTURE RULES (hidden md:flex structural layer) */}
        <div className="hidden md:flex items-center justify-between bg-[#0d1117] border-b border-gray-800 px-6 py-4 w-full gap-6">
          
          {/* LEFT-ALIGNED BLOCK */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Standalone 3-lines hamburger menu drawer toggle button component */}
            <button
              onClick={() => setIsDesktopCategoryMenuOpen(!isDesktopCategoryMenuOpen)}
              className="p-2.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Desktop Menu Toggle"
            >
              {isDesktopCategoryMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Brand Logo Link */}
            <Link href={`/${locale}`} className="flex items-center gap-2 group">
              <span className="text-xl md:text-2xl font-sans font-black bg-rubik-brand text-white px-3 py-1.5 rounded-lg shadow-soft-sm group-hover:bg-rubik-brand-dark transition-all duration-300 tracking-tight">
                RubikShop<span className="text-rubik-yellow">.az</span>
              </span>
            </Link>
          </div>

          {/* MIDDLE-ALIGNED BLOCK */}
          <div className="flex-1 max-w-xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
              <Search className="absolute left-4 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                type="search"
                placeholder="Məhsul axtar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-24 py-2.5 bg-[#161b22] border border-gray-800 rounded-xl text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-black rounded-lg transition-colors cursor-pointer h-[34px] flex items-center justify-center"
              >
                Axtar
              </button>
            </form>
          </div>

          {/* RIGHT-ALIGNED BLOCK */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Language Selection Bar (Desktop only) */}
            <div className="flex items-center gap-1 bg-[#161b22] px-2 py-1 rounded-lg border border-gray-800">
              {(['az', 'en', 'ru'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => changeLanguage(lang)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded transition-all duration-200 uppercase min-h-[32px] min-w-[32px] flex items-center justify-center cursor-pointer ${
                    locale === lang
                      ? 'bg-red-500 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Kabinet (Account) */}
            <button
              onClick={handleAccountClick}
              className="p-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-full transition-all duration-200 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Kabinet"
            >
              <User className="h-5 w-5" />
            </button>

            {/* Seçilmişlər (Favorites/Wishlist) */}
            <Link
              href={`/${locale}/wishlist`}
              className="p-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-full transition-all duration-200 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Seçilmişlər"
            >
              <Heart className="h-5 w-5" />
            </Link>

            {/* Səbət (Shopping Cart) */}
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
                <span>Çıxış</span>
              </button>
            )}
          </div>

        </div>

        {/* MOBILE LAYOUT ARCHITECTURE RULES (flex md:hidden structural layer) */}
        <div className="flex md:hidden items-center justify-between bg-[#0d1117] border-b border-gray-800 px-4 py-3 w-full">
          {/* Left: Brand text logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2 group">
            <span className="text-xl font-sans font-black bg-rubik-brand text-white px-3 py-1.5 rounded-lg shadow-soft-sm group-hover:bg-rubik-brand-dark transition-all duration-300 tracking-tight">
              RubikShop<span className="text-rubik-yellow">.az</span>
            </span>
          </Link>

          {/* Right: Hamburger button (Strictly clean header bar, no extra utility clutter icons) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Menyu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Conditional Sub-Row Search visibility (Mobile only) */}
        {showMobileSearch && (
          <div className="md:hidden px-4 pb-4 pt-1 bg-[#0d1117]">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
              <Search className="absolute left-3.5 h-4 w-4 text-gray-500 pointer-events-none" />
              <input
                type="search"
                placeholder="Məhsul axtar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#161b22] border border-gray-800 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
              />
            </form>
          </div>
        )}

        {/* DESKTOP CATEGORY MENU OVERLAY DRAWER */}
        <AnimatePresence>
          {isDesktopCategoryMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 bg-[#0d1117] border-b border-gray-800 shadow-xl z-50 p-8 hidden md:block"
            >
              <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {rubikTaxonomyGroups.map((group) => (
                  <div key={group.id} className="space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-wider text-red-500 border-b border-gray-800 pb-2">
                      {t(group.title)}
                    </h3>
                    <div className="grid gap-2">
                      {group.items.map((item) => {
                        const ItemIcon = item.icon || Package;
                        return (
                          <Link
                            key={item.id}
                            href={`/${locale}/category/${encodeURIComponent(item.slug)}`}
                            onClick={() => setIsDesktopCategoryMenuOpen(false)}
                            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-800/50 transition-colors text-gray-300 hover:text-white"
                          >
                            <div className="bg-red-500/10 p-2 rounded-lg text-red-500 shrink-0">
                              <ItemIcon className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="text-sm font-bold">{t(item.title)}</div>
                              <div className="text-xs text-gray-400 line-clamp-1">{t(item.description)}</div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FULL-SCREEN MOBILE OVERLAY NAV DRAWER */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              key="mobile-drawer-container"
              initial={{ opacity: 0, y: '-100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-0 h-screen w-screen bg-[#0d1117] z-[99999] p-6 flex flex-col md:hidden overflow-y-auto text-white"
            >
              {/* Header Row */}
              <div className="flex items-center justify-between border-b border-gray-800 pb-5">
                <Link 
                  href={`/${locale}`} 
                  className="flex items-center gap-2 group"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="text-xl font-sans font-black bg-rubik-brand text-white px-3 py-1.5 rounded-lg tracking-tight">
                    RubikShop<span className="text-rubik-yellow">.az</span>
                  </span>
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-3 bg-gray-800/50 hover:bg-gray-800 rounded-full text-white transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Bağla"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>

              {/* Body Content */}
              <div className="flex-1 flex flex-col justify-between pt-6 pb-10 gap-8">
                
                {/* Navigation List */}
                <nav className="flex flex-col">
                  {[
                    { label: 'Kataloq', href: `/${locale}/category` },
                    { label: 'Alqoritmlər & Öyrənmə', href: `/${locale}?category=learning-content` },
                    { label: 'Çatdırılma və Ödəniş', href: `/${locale}/faq` },
                    { label: 'Haqqımızda', href: `/${locale}/pages/about` },
                    { label: 'Əlaqə', href: `/${locale}/faq` },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block py-3 text-xl font-medium text-white border-b border-gray-800 transition-colors ${
                        pathname === item.href || pathname.startsWith(item.href + '/')
                          ? 'text-red-500 font-bold border-red-500/40'
                          : 'hover:text-red-500'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>

                {/* Language Selection & User state */}
                <div className="space-y-6">
                  {/* Dil Seçimi */}
                  <div className="space-y-3">
                    <span className="text-xs font-black uppercase tracking-wider text-gray-400 block">
                      {t({ az: 'Dil seçimi', en: 'Language', ru: 'Язык' })}
                    </span>
                    <div className="grid grid-cols-3 gap-1.5 bg-[#161b22] p-1 rounded-xl border border-gray-800">
                      {(['az', 'en', 'ru'] as const).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => {
                            changeLanguage(lang);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`py-2.5 text-xs font-black rounded-lg transition-all duration-200 uppercase min-h-[40px] flex items-center justify-center cursor-pointer ${
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

                  {/* User State & Action Panel */}
                  <div className="space-y-3 pt-4 border-t border-gray-800/60">
                    {mounted && user ? (
                      <React.Fragment>
                        <button
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            handleAccountClick();
                          }}
                          className="w-full inline-flex items-center justify-center px-4 py-3.5 bg-white text-[#0d1117] text-sm font-black rounded-xl hover:bg-gray-100 transition-colors cursor-pointer min-h-[44px]"
                        >
                          Şəxsi Kabinet
                        </button>
                        <button
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            handleSignOut();
                          }}
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 bg-red-600/10 text-red-500 border border-red-500/20 text-sm font-black rounded-xl hover:bg-red-600 hover:text-white transition-all cursor-pointer min-h-[44px]"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Çıxış Et</span>
                        </button>
                      </React.Fragment>
                    ) : (
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          openModal('login');
                        }}
                        className="w-full inline-flex items-center justify-center px-4 py-3.5 bg-red-500 text-white text-sm font-black rounded-xl hover:bg-red-600 transition-colors cursor-pointer min-h-[44px]"
                      >
                        Giriş / Qeydiyyat
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
