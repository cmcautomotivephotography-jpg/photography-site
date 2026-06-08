/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Vercel Blob public URLs look like:
      //   https://<store-id>.public.blob.vercel-storage.com/<file>
      // Allow any store id so next/image can optimize portfolio photos.
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
