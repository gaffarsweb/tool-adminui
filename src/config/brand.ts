export const brand = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME ?? 'TOOLS',
  tagline: 'Admin Command Center',
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
  adminUrl: process.env.NEXT_PUBLIC_ADMIN_URL ?? 'http://localhost:3100',
} as const;
