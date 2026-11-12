import { MetadataRoute } from 'next';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '@/lib/constants';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://deebakes.ng';

  const staticPages = [
    '',
    '/menu',
    '/custom-cakes',
    '/track',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  const productPages = INITIAL_PRODUCTS.map((product) => ({
    url: `${baseUrl}/menu?category=${product.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...productPages];
}
