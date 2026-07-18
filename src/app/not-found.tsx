export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <h2 className="text-2xl font-bold">404 - Səhifə Tapılmadı</h2>
      <a href="/" className="mt-4 px-4 py-2 bg-rubik-brand text-white font-medium rounded-lg hover:bg-rubik-brand-dark transition-colors">
        Ana Səhifəyə Qayıt
      </a>
    </div>
  );
}

