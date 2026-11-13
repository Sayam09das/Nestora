/** @type {import('next').NextConfig} */
const apiUpstream = (process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:4000').replace(/\/$/, '');

const nextConfig = {
  reactStrictMode: true,
  ...(process.env.NODE_ENV === 'production' ? { output: 'standalone' } : {}),
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiUpstream}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
