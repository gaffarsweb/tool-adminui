import { GeistSans } from 'geist/font/sans';
import { Inter } from 'next/font/google';

export const geist = GeistSans;

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600'],
  display: 'swap',
});
