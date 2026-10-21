import { metadata } from './layout';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/chat', '/profile', '/apikeys', '/api/', '/auth/'],
      },
    ],
    sitemap: 'https://aicombiner.net/sitemap.xml',
  };
}
