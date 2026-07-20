'use client';

import { useEffect } from 'react';

export default function LocalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Check if error is a Next.js redirect or not found, if so rethrow it so Next.js can handle it
  if (
    error.message === 'NEXT_REDIRECT' ||
    error.digest?.startsWith('NEXT_REDIRECT') ||
    error.message?.includes('NEXT_REDIRECT') ||
    error.message === 'NEXT_NOT_FOUND' ||
    error.digest?.startsWith('NEXT_NOT_FOUND')
  ) {
    throw error;
  }

  useEffect(() => {
    console.error('Local Area Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl max-w-md">
        <h2 className="text-xl font-bold text-red-600 mb-2">Xəta baş verdi</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Səhifə yüklənərkən problem yarandı. Zəhmət olmasa yenidən cəhd edin.
        </p>
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 bg-rubik-brand text-white font-bold rounded-xl hover:bg-rubik-brand-dark transition-colors cursor-pointer"
        >
          Yenidən cəhd et
        </button>
      </div>
    </div>
  );
}
