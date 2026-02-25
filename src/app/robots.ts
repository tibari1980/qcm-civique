import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/api/', '/dashboard/', '/profile/', '/onboarding/'],
            },
        ],
        sitemap: 'https://civiqquiz.com/sitemap.xml',
    };
}
