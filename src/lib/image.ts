export function sanitizeImageUrl(url?: string | null, fallbackSeed = 'default'): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return `https://picsum.photos/seed/${fallbackSeed}/600/600`;
  }
  const trimmed = url.trim();

  // If it's a dummy or unresolvable domain (example.com, rubikshop.az, placeholder, etc.)
  if (
    trimmed.includes('rubikshop.az') ||
    trimmed.includes('example.com') ||
    trimmed.includes('example.org') ||
    trimmed.includes('example.net') ||
    trimmed.includes('via.placeholder.com') ||
    trimmed.includes('placeholder.com') ||
    trimmed.includes('dummyimage.com')
  ) {
    const cleanSeed = trimmed.split('/').pop()?.replace(/\.[^/.]+$/, '') || fallbackSeed;
    return `https://picsum.photos/seed/${cleanSeed}/600/600`;
  }

  if (trimmed.startsWith('/') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  return `https://picsum.photos/seed/${fallbackSeed}/600/600`;
}
