'use client';

import * as React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('Global Error Caught:', error);
  }, [error]);

  return (
    <html lang="az">
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
          <h1 className="text-3xl font-black mb-4">Sistem Xətası</h1>
          <p className="text-muted-foreground mb-6">Gözlənilməz bir xəta baş verdi.</p>
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors cursor-pointer"
          >
            Yenidən cəhd et
          </button>
        </div>
      </body>
    </html>
  );
}
