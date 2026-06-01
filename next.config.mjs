/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // When you swap the placeholder portfolio tiles for real images hosted
  // somewhere remote (e.g. Supabase Storage), add the host here so that
  // next/image is allowed to optimize them. Example:
  //
  // images: {
  //   remotePatterns: [
  //     { protocol: "https", hostname: "your-project.supabase.co" },
  //   ],
  // },
};

export default nextConfig;
