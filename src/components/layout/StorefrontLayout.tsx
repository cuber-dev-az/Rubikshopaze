'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { AuthModal } from '@/components/auth/AuthModal';
import type { ApplicationDictionary } from '@/types/application.types';

interface StorefrontLayoutProps {
  children: React.ReactNode;
  dict: ApplicationDictionary;
  locale: string;
}

export function StorefrontLayout({ children, dict, locale }: StorefrontLayoutProps) {
  const [mounted, setMounted] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isAdmin = pathname ? pathname.split('/').includes('admin') : false;

  if (isAdmin) {
    return <>{children}</>;
  }

  if (!mounted) {
    return (
      <div className="flex flex-col min-h-screen pb-[60px] md:pb-0">
        <main className="flex-grow">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-[60px] md:pb-0">
      <Header dict={dict} locale={locale} />
      <main className="flex-grow">{children}</main>
      <Footer dict={dict} locale={locale} />
      <MobileBottomNav dict={dict} locale={locale} />
      <AuthModal />
    </div>
  );
}
