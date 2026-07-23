/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  optimizeFonts: false,
  transpilePackages: ['motion'],
  experimental: {
    allowedDevOrigins: [
      'ais-dev-it2ks6ixwbbhx5sgpejwyo-633299802861.europe-west2.run.app',
      'ais-pre-it2ks6ixwbbhx5sgpejwyo-633299802861.europe-west2.run.app',
      '*.run.app'
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rubikshop.az',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'rubikshop.az',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.rubikshop.az',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'npqecrxvllvuoxaybnoq.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.puzzlewholesale.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
