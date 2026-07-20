import type { Metadata } from 'next';
import { getDictionary } from '@/i18n/dictionaries';
import { StorefrontLayout } from '@/components/layout/StorefrontLayout';

export const metadata: Metadata = {
  title: 'Rubikshop.az | Speedcubing E-Commerce',
  description: 'Premium speedcubing products.',
  manifest: '/manifest.json',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <html lang={locale}>
      <body>
        <StorefrontLayout dict={dict} locale={locale}>{children}</StorefrontLayout>
      </body>
    </html>
  );
}
