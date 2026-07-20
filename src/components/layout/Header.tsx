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
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = React.useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const { user, userRole, signOut: authSignOut } = useAuthUser();
  
  const openModal = useAuthModalStore((state) => state.openModal);
  const [isCatalogOpen, setIsCatalogOpen] = React.useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const items = useCartStore((state) => state.items);
  const totalItems = React.useMemo(() => items.reduce((total, item) => total + (item.quantity || 1), 0), [items]);

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
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  React.useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveMegaMenu(null);
    setIsSearchOpen(false);
  }, [pathname]);

  const t = (obj: { az: string; en: string; ru: string }) => {
    return obj[locale as keyof typeof obj] || obj.az;
  };

  return (
    <React.Fragment>
      {/* Top Banner Accent */}
      <div className="bg-rubik-brand text-white text-xs font-sans py-2 px-4 text-center tracking-wide font-medium flex items-center justify-center gap-2">
        <Sparkles className="h-3 w-3 animate-pulse" />
        <span>Rubikshop AZ — Azərbaycanda 1 nömrəli sürətli kub yarışı mağazası! Sürətli çatdırılma.</span>
      </div>

      <header className="sticky top-0 z-40 w-full bg-card border-b border-border shadow-soft-sm backdrop-blur-md bg-opacity-95 dark:bg-opacity-90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center">
              <Link href={`/${locale}`} className="flex items-center gap-2.5 group">
                <span className="text-xl md:text-2xl font-sans font-black bg-rubik-brand text-white px-3 py-1.5 rounded-lg shadow-soft-sm group-hover:bg-rubik-brand-dark transition-all duration-300 tracking-tight">
                  RubikShop<span className="text-rubik-yellow">.az</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation (Mega Menus) */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              <Link
                href={`/${locale}`}
                className="px-3 py-2 text-sm font-medium text-foreground hover:text-rubik-brand transition-colors"
              >
                {dict.navigation.home}
              </Link>

              {rubikTaxonomyGroups.map((group) => (
                <div
                  key={group.id}
                  className="relative"
                  onMouseEnter={() => setActiveMegaMenu(group.id)}
                  onMouseLeave={() => setActiveMegaMenu(null)}
                >
                  <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground hover:text-rubik-brand transition-colors cursor-pointer">
                    <span>{t(group.title)}</span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                  </button>

                  <AnimatePresence>
                    {activeMegaMenu === group.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-[480px] sm:w-[600px] z-50 pointer-events-auto"
                      >
                        <div className="bg-card border border-border rounded-xl shadow-soft-xl overflow-hidden grid grid-cols-2 p-5 gap-4">
                          <div className="col-span-2 border-b border-border/60 pb-2 mb-1 flex items-center justify-between">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                              {t(group.title)}
                            </h4>
                            <span className="text-[10px] text-rubik-brand font-medium">Rubikshop Premium</span>
                          </div>

                          {group.items.map((item) => {
                            const ItemIcon = item.icon || Package;
                            return (
                              <Link
                                key={item.id}
                                href={`/${locale}/category/${encodeURIComponent(item.slug)}`}
                                className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors"
                              >
                                <div className="bg-rubik-brand/10 p-2 rounded-lg text-rubik-brand shrink-0">
                                  <ItemIcon className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold text-foreground hover:text-rubik-brand">
                                    {t(item.title)}
                                  </span>
                                  <span className="text-xs text-muted-foreground line-clamp-1">
                                    {t(item.description)}
                                  </span>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Icons, Multi-Language, Search */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Search Bar Button */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-3 text-foreground hover:text-rubik-brand hover:bg-muted rounded-full transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Axtarış"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Language Selector Dropdown (Desktop) */}
              <div className="hidden md:flex items-center gap-1.5 bg-muted px-2.5 py-1.5 rounded-lg border border-border">
                <Globe className="h-4 w-4 text-muted-foreground mr-1" />
                {(['az', 'en', 'ru'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => changeLanguage(lang)}
                    className={`px-2.5 py-1 text-xs font-bold rounded transition-all duration-200 uppercase min-h-[36px] min-w-[36px] flex items-center justify-center ${
                      locale === lang
                        ? 'bg-rubik-brand text-white shadow-soft-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              {mounted && (userRole === 'admin' || userRole === 'manager') && (
                <Link
                  href={`/${locale}/admin`}
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-black bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-lg border border-red-500/25 transition-all duration-200 uppercase tracking-wider"
                >
                  Admin Panel
                </Link>
              )}

              {/* User Profile */}
              <button
                onClick={handleAccountClick}
                className="hidden md:flex p-3 text-foreground hover:text-rubik-brand hover:bg-muted rounded-full transition-all duration-200 cursor-pointer min-w-[44px] min-h-[44px] items-center justify-center"
                aria-label="Account profile"
              >
                <User className="h-5 w-5" />
              </button>

              {mounted && user && (
                <button
                  onClick={handleSignOut}
                  className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-black bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 shadow-soft-sm cursor-pointer"
                  title="Çıxış Et"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Çıxış Et</span>
                </button>
              )}

              {/* Cart Toggle */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-3 text-foreground hover:text-rubik-brand hover:bg-muted rounded-full transition-all duration-200 flex items-center justify-center min-w-[44px] min-h-[44px]"
                aria-label="Səbət"
              >
                <ShoppingCart className="h-5 w-5" />
                {mounted && totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-5 h-5 px-1 text-[10px] font-black text-white bg-rubik-brand border-2 border-card rounded-full animate-bounce">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-3 text-foreground hover:text-rubik-brand hover:bg-muted rounded-full transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Menyu"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Interactive Search Banner */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-border bg-card overflow-hidden"
            >
              <div className="max-w-3xl mx-auto px-4 py-4 md:py-6">
                <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                  <Search className="absolute left-4 h-5 w-5 text-muted-foreground pointer-events-none" />
                  <input
                    type="search"
                    placeholder="Kub, marka, yağ və ya aksessuar axtarın..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-24 py-3 bg-muted border border-border rounded-xl text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rubik-brand"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="absolute right-2 px-4 py-1.5 bg-rubik-brand text-white text-sm font-medium rounded-lg hover:bg-rubik-brand-dark transition-colors"
                  >
                    Axtar
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <React.Fragment>
              <motion.div
                key="menu-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm lg:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <motion.div
                key="menu-drawer"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-card z-50 shadow-2xl flex flex-col lg:hidden border-r border-border"
              >
                <div className="flex-1 overflow-y-auto">
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <span className="font-bold text-xl text-foreground">Menu</span>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-3 bg-muted rounded-full text-foreground hover:bg-muted/80 transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Bağla">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="p-4 space-y-6">
                    <div className="space-y-1">
                      <button 
                        onClick={() => setIsCatalogOpen(!isCatalogOpen)}
                        className="flex items-center justify-between w-full text-base font-bold text-foreground hover:text-rubik-brand transition-colors cursor-pointer py-2 animate-none"
                      >
                        <span>Kataloq</span>
                        <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${isCatalogOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence initial={false}>
                        {isCatalogOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden pl-2"
                          >
                            <div className="mt-2 space-y-4 border-l-2 border-border/60 pl-3">
                              {rubikTaxonomyGroups.map((group) => (
                                <div key={group.id} className="space-y-2">
                                  <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground/75 pt-1">
                                    {t(group.title)}
                                  </h4>
                                  <div className="space-y-1">
                                    {group.items.map((item) => {
                                      const ItemIcon = item.icon || Package;
                                      return (
                                        <Link
                                          key={item.id}
                                          href={`/${locale}/category/${encodeURIComponent(item.slug)}`}
                                          onClick={() => setIsMobileMenuOpen(false)}
                                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted text-sm font-semibold text-foreground hover:text-rubik-brand transition-colors"
                                        >
                                          <ItemIcon className="h-4 w-4 text-rubik-brand" />
                                          <span>{t(item.title)}</span>
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
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-border bg-muted/10 space-y-4 pb-[80px]">
                  {/* Mobile Language Switcher */}
                  <div className="space-y-2 mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-muted-foreground/75 block">
                      {t({ az: 'Dil seçimi', en: 'Language', ru: 'Язык' })}
                    </span>
                    <div className="grid grid-cols-3 gap-2 bg-muted p-1 rounded-xl border border-border">
                      {(['az', 'en', 'ru'] as const).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => changeLanguage(lang)}
                          className={`py-3 text-sm font-black rounded-lg transition-all duration-200 uppercase min-h-[44px] flex items-center justify-center ${
                            locale === lang
                              ? 'bg-rubik-brand text-white shadow-soft-sm'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleAccountClick();
                    }}
                    className="w-full inline-flex items-center justify-center px-4 py-3.5 bg-foreground text-card text-sm font-black rounded-lg hover:bg-foreground/90 transition-colors cursor-pointer min-h-[44px]"
                  >
                    Şəxsi Kabinet
                  </button>

                  {mounted && user && (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleSignOut();
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 bg-red-600 text-white text-sm font-black rounded-lg hover:bg-red-700 transition-colors cursor-pointer min-h-[44px]"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Çıxış Et</span>
                    </button>
                  )}
                </div>
              </motion.div>
            </React.Fragment>
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
