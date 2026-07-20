'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function CategoryPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'az';

  useEffect(() => {
    router.replace(`/${locale}/category/3x3`);
  }, [router, locale]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rubik-brand"></div>
    </div>
  );
}
