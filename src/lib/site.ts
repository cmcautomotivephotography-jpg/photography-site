/**
 * Central place for all brand / contact details.
 * Change these values to rebrand the whole site in one spot.
 */
export const siteConfig = {
  name: "CMCphotography.slc",
  tagline: "Vision That Sells",
  description:
    "CMCphotography.slc — real estate and commercial product photography in the Salt Lake City area. Vision That Sells.",
  heroSubtitle:
    "Crisp, magazine-quality images for listings, products, and brands. Booked online, delivered fast.",
  /**
   * Optional hardcoded hero background image. Paste a Vercel Blob URL here to
   * pin a specific photo. Leave it as "" to automatically use the most recent
   * image uploaded to Blob storage.
   * Example: "https://xxxx.public.blob.vercel-storage.com/real-estate-foo.jpg"
   */
  heroImage: "",
  email: "cmcautomotivephotography@gmail.com",
  phone: "385-787-9568",
  location: "South Jordan, UT",
  social: {
    instagram: "https://www.instagram.com/cmc___photographyslc",
  },
} as const;
