'use client';

import { useEffect } from 'react';

export default function Error({
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
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      <button
        onClick={() => reset()}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
      >
        Try again
      </button>
    </div>
  );
}
