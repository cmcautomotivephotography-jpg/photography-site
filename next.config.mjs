/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Self-hosted MinIO behind the Cloudflare Tunnel; the bucket has
      // anonymous read so next/image can fetch and optimize portfolio photos.
      {
        protocol: "https",
        hostname: "storage.cmcphotographyslc.com",
        pathname: "/photography-images/**",
      },
    ],
  },
};

export default nextConfig;
