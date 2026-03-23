/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kwefkeqvltaiixylcewm.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  
  async redirects() {
    if (process.env.VERCEL) {
      return [
        {
          source: '/:path*',
          destination: 'https://all-dding.pages.dev/:path*',
          permanent: true, 
        },
      ];
    }
    return [];
  },
};

export default nextConfig;