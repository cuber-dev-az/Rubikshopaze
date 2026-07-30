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
  ChevronRight,
  ChevronDown,
  Compass,
  HelpCircle,
  PhoneCall,
  MessageCircle,
  Layers,
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
  const [isCubesExpanded, setIsCubesExpanded] = React.useState(false);
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
      <div className="bg-[#D8232A] text-white text-[11px] sm:text-xs font-semibold py-2 px-3 sm:px-6 text-center tracking-wide flex items-center justify-center gap-2 leading-tight shadow-sm">
        <Sparkles className="h-3.5 w-3.5 shrink-0 animate-pulse text-yellow-300" />
        <span className="whitespace-normal break-words">{dict.header?.promo_banner || "Rubikshop AZ — Azərbaycanda 1 nömrəli sürətli kub yarışı mağazası! Sürətli çatdırılma."}</span>
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

        {/* LEFT-ALIGNED SLIDE-OUT OFF-CANVAS NAVIGATION DRAWER */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              {/* Backdrop Overlay (Transparent dark backdrop with blur, top: 0, highest z-index) */}
              <motion.div
                key="left-drawer-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsMenuOpen(false)}
                className="fixed top-0 left-0 inset-0 w-screen h-dvh bg-black/60 backdrop-blur-xs z-[99998]"
                aria-hidden="true"
              />

              {/* Left Side Drawer Container (Top: 0, Left: 0, 100vh, 380px fixed width on desktop) */}
              <motion.div
                key="left-drawer-container"
                initial={{ opacity: 0, x: '-100%' }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: '-100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                className="fixed top-0 left-0 inset-y-0 h-dvh w-[380px] max-w-[88vw] sm:w-[380px] bg-[#FFFFFF] z-[99999] flex flex-col overflow-hidden text-[#17181C] shadow-2xl border-r border-[#EDEDED]"
              >
                {/* 1. Header Block (Sticky Top) */}
                <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-5 py-4 border-b border-[#EDEDED] flex items-center justify-between shrink-0">
                  <Link 
                    href={`/${locale}`} 
                    className="flex items-center gap-2 group"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#D8232A] text-white flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-105 transition-transform">
                      <Package className="w-5 h-5" />
                    </div>
                    <span className="font-sans font-black text-[#D8232A] text-xl tracking-tight">
                      RubikShop<span className="text-[#17181C] text-sm font-bold ml-0.5">.az</span>
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 bg-[#F6F6F8] hover:bg-[#EDEDED] border border-[#E5E7EB] rounded-full text-[#17181C] transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
                    aria-label={t({ az: 'Bağla', en: 'Close', ru: 'Закрыть' })}
                  >
                    <X className="h-5 w-5 text-[#17181C]" />
                  </button>
                </div>

                {/* 2 & 3. Vertical Navigation List & Category Hierarchy (Independent Overflow Scroll) */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 overscroll-contain">
                  
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#9CA3AF] block px-1">
                    {t({ az: 'Menyu və Kateqoriyalar', en: 'Menu & Categories', ru: 'Меню и Категории' })}
                  </span>

                  <nav className="flex flex-col space-y-1">
                    
                    {/* Kataloq (Bütün Məhsullar) */}
                    <Link
                      href={`/${locale}/category`}
                      onClick={() => setIsMenuOpen(false)}
                      className="group flex items-center justify-between py-3 px-3.5 rounded-xl text-sm font-bold text-[#17181C] hover:bg-[#F6F6F8] hover:text-[#D8232A] transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3 group-hover:translate-x-1.5 transition-transform duration-200 min-w-0">
                        <Compass className="h-5 w-5 text-[#D8232A] shrink-0" />
                        <span className="truncate">{t({ az: 'Kataloq (Bütün Məhsullar)', en: 'Catalog (All Products)', ru: 'Каталог (Все товары)' })}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-[#9CA3AF] group-hover:text-[#D8232A] group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                    </Link>

                    {/* Küplər (Accordion with subcategories) */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setIsCubesExpanded(!isCubesExpanded)}
                        className="w-full group flex items-center justify-between py-3 px-3.5 rounded-xl text-sm font-bold text-[#17181C] hover:bg-[#F6F6F8] hover:text-[#D8232A] transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3 group-hover:translate-x-1.5 transition-transform duration-200 min-w-0">
                          <Package className="h-5 w-5 text-[#D8232A] shrink-0" />
                          <span className="truncate">{t({ az: 'Küplər (Speedcubes)', en: 'Speedcubes', ru: 'Кубики (Speedcubes)' })}</span>
                        </div>
                        <ChevronDown className={`h-4 w-4 text-[#9CA3AF] group-hover:text-[#D8232A] transition-transform duration-200 shrink-0 ml-2 ${isCubesExpanded ? 'rotate-180' : ''}`} />
                      </button>
                      
                      <AnimatePresence>
                        {isCubesExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden pl-7 pr-2 py-1 space-y-1 border-l-2 border-[#E5E7EB] ml-5 my-1"
                          >
                            {[
                              { name: t({ az: '3x3 Kublar', en: '3x3 Speedcubes', ru: 'Кубики 3x3' }), slug: '3x3' },
                              { name: t({ az: '2x2 Kublar', en: '2x2 Speedcubes', ru: 'Кубики 2x2' }), slug: '2x2' },
                              { name: t({ az: '4x4 & Böyük Kublar', en: '4x4 & Big Cubes', ru: '4x4 и Большие кубы' }), slug: '4x4' },
                              { name: t({ az: 'Pyraminx & Megaminx', en: 'Pyraminx & Megaminx', ru: 'Пираминкс и Мегаминкс' }), slug: 'pyraminx' },
                              { name: t({ az: 'Skewb & Square-1', en: 'Skewb & Square-1', ru: 'Скьюб и Скуэр-1' }), slug: 'skewb' },
                            ].map((sub) => (
                              <Link
                                key={sub.slug}
                                href={`/${locale}/category/${sub.slug}`}
                                onClick={() => setIsMenuOpen(false)}
                                className="block py-2 px-3 rounded-lg text-xs font-semibold text-[#374151] hover:text-[#D8232A] hover:bg-[#F6F6F8] transition-colors flex items-center justify-between"
                              >
                                <span>{sub.name}</span>
                                <ChevronRight className="h-3.5 w-3.5 text-[#9CA3AF] shrink-0 ml-2" />
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Yağlar və Baxım (Lube) */}
                    <Link
                      href={`/${locale}/category/lube`}
                      onClick={() => setIsMenuOpen(false)}
                      className="group flex items-center justify-between py-3 px-3.5 rounded-xl text-sm font-bold text-[#17181C] hover:bg-[#F6F6F8] hover:text-[#D8232A] transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3 group-hover:translate-x-1.5 transition-transform duration-200 min-w-0">
                        <Sparkles className="h-5 w-5 text-[#D8232A] shrink-0" />
                        <span className="truncate">{t({ az: 'Yağlar və Baxım (Lube)', en: 'Lubes & Care', ru: 'Смазки и Уход' })}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-[#9CA3AF] group-hover:text-[#D8232A] group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                    </Link>

                    {/* Taymerlər və Aksessuarlar */}
                    <Link
                      href={`/${locale}/category/accessories`}
                      onClick={() => setIsMenuOpen(false)}
                      className="group flex items-center justify-between py-3 px-3.5 rounded-xl text-sm font-bold text-[#17181C] hover:bg-[#F6F6F8] hover:text-[#D8232A] transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3 group-hover:translate-x-1.5 transition-transform duration-200 min-w-0">
                        <Layers className="h-5 w-5 text-[#D8232A] shrink-0" />
                        <span className="truncate">{t({ az: 'Taymerlər və Aksessuarlar', en: 'Timers & Accessories', ru: 'Таймеры и Аксессуары' })}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-[#9CA3AF] group-hover:text-[#D8232A] group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                    </Link>

                    {/* Alqoritmlər və Öyrənmə */}
                    <Link
                      href={`/${locale}?category=learning-content`}
                      onClick={() => setIsMenuOpen(false)}
                      className="group flex items-center justify-between py-3 px-3.5 rounded-xl text-sm font-bold text-[#17181C] hover:bg-[#F6F6F8] hover:text-[#D8232A] transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3 group-hover:translate-x-1.5 transition-transform duration-200 min-w-0">
                        <Sparkles className="h-5 w-5 text-[#D8232A] shrink-0" />
                        <span className="truncate">{t({ az: 'Alqoritmlər & Öyrənmə', en: 'Algorithms & Learning', ru: 'Алгоритмы и Обучение' })}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-[#9CA3AF] group-hover:text-[#D8232A] group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                    </Link>

                    {/* Haqqımızda və Çatdırılma */}
                    <Link
                      href={`/${locale}/pages/about`}
                      onClick={() => setIsMenuOpen(false)}
                      className="group flex items-center justify-between py-3 px-3.5 rounded-xl text-sm font-bold text-[#17181C] hover:bg-[#F6F6F8] hover:text-[#D8232A] transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3 group-hover:translate-x-1.5 transition-transform duration-200 min-w-0">
                        <HelpCircle className="h-5 w-5 text-[#D8232A] shrink-0" />
                        <span className="truncate">{t({ az: 'Haqqımızda və Çatdırılma', en: 'About & Delivery', ru: 'О нас и Доставка' })}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-[#9CA3AF] group-hover:text-[#D8232A] group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                    </Link>

                    {/* Əlaqə */}
                    <Link
                      href={`/${locale}/faq`}
                      onClick={() => setIsMenuOpen(false)}
                      className="group flex items-center justify-between py-3 px-3.5 rounded-xl text-sm font-bold text-[#17181C] hover:bg-[#F6F6F8] hover:text-[#D8232A] transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3 group-hover:translate-x-1.5 transition-transform duration-200 min-w-0">
                        <PhoneCall className="h-5 w-5 text-[#D8232A] shrink-0" />
                        <span className="truncate">{t({ az: 'Əlaqə', en: 'Contact', ru: 'Контакты' })}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-[#9CA3AF] group-hover:text-[#D8232A] group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                    </Link>
                  </nav>
                </div>

                {/* 4. Sticky Bottom Footer Block (Prevents clipping with generous bottom padding) */}
                <div className="sticky bottom-0 z-10 bg-white border-t border-[#EDEDED] px-5 py-4 pb-7 space-y-3.5 shrink-0 shadow-lg">
                  
                  {/* Language Switcher */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#6B7280] block">
                      {t({ az: 'Dil seçimi', en: 'Select Language', ru: 'Выбор языка' })}
                    </span>
                    <div className="grid grid-cols-3 gap-1 bg-[#F6F6F8] p-1 rounded-xl border border-[#E5E7EB]">
                      {(['az', 'en', 'ru'] as const).map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => {
                            changeLanguage(lang);
                            setIsMenuOpen(false);
                          }}
                          className={`py-2 text-xs font-black rounded-lg transition-all duration-200 uppercase flex items-center justify-center cursor-pointer ${
                            locale === lang
                              ? 'bg-[#D8232A] text-white shadow-sm'
                              : 'text-[#374151] hover:text-[#17181C] hover:bg-white'
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Login / User Account Primary Button */}
                  <div>
                    {mounted && user ? (
                      <div className="space-y-2">
                        {(userRole === 'admin' || userRole === 'manager') && (
                          <Link
                            href={`/${locale}/admin`}
                            onClick={() => setIsMenuOpen(false)}
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#D8232A]/10 text-[#D8232A] border border-[#D8232A]/30 text-xs font-black rounded-xl hover:bg-[#D8232A]/20 transition-colors cursor-pointer uppercase tracking-wider"
                          >
                            <ShieldCheck className="h-4 w-4" />
                            {t({ az: 'Admin Panel', en: 'Admin Dashboard', ru: 'Админ Панель' })}
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            handleAccountClick();
                          }}
                          className="w-full inline-flex items-center justify-center px-4 py-3.5 bg-[#17181C] text-white text-sm font-black rounded-xl hover:bg-black transition-colors cursor-pointer shadow-sm"
                        >
                          {t({ az: 'Şəxsi Kabinet', en: 'My Account', ru: 'Личный Кабинет' })}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          openModal('login');
                        }}
                        className="w-full inline-flex items-center justify-center px-4 py-3.5 bg-[#D8232A] text-white text-sm font-black rounded-xl hover:bg-[#B31B21] transition-colors cursor-pointer shadow-md"
                      >
                        {t({ az: 'Giriş / Qeydiyyat', en: 'Login / Register', ru: 'Войти / Регистрация' })}
                      </button>
                    )}
                  </div>

                  {/* Social Icons Bar */}
                  <div className="flex items-center justify-center gap-4 pt-1 border-t border-[#F6F6F8]">
                    <a
                      href="https://instagram.com/rubikshop.az"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-[#F6F6F8] hover:bg-[#E5E7EB] text-[#374151] hover:text-[#D8232A] rounded-full transition-colors cursor-pointer"
                      aria-label="Instagram"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                      </svg>
                    </a>
                    <a
                      href="https://wa.me/994506684925"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-[#F6F6F8] hover:bg-[#E5E7EB] text-[#374151] hover:text-[#25D366] rounded-full transition-colors cursor-pointer"
                      aria-label="WhatsApp"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </a>
                    <a
                      href="tel:+994506684925"
                      className="p-2 bg-[#F6F6F8] hover:bg-[#E5E7EB] text-[#374151] hover:text-[#D8232A] rounded-full transition-colors cursor-pointer"
                      aria-label="Telefon"
                    >
                      <PhoneCall className="h-4 w-4" />
                    </a>
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
