import type { MetadataRoute } from 'next';

const siteUrl = 'https://nischalbhandari.com.np';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name:             'Nischal Bhandari — Portfolio',
    short_name:       'Nischal.XP',
    description:      'Windows XP themed interactive portfolio of Nischal Bhandari — Full Stack Developer & IT Professional.',
    start_url:        '/',
    display:          'standalone',
    background_color: '#000000',
    theme_color:      '#1244a8',
    orientation:      'any',
    scope:            '/',
    lang:             'en',
    categories:       ['portfolio', 'developer', 'technology'],
    icons: [
      {
        src:     `${siteUrl}/api/icon?size=192`,
        sizes:   '192x192',
        type:    'image/png',
        purpose: 'any',
      },
      {
        src:     `${siteUrl}/api/icon?size=512`,
        sizes:   '512x512',
        type:    'image/png',
        purpose: 'maskable',
      },
    ],
    screenshots: [
      {
        src:   `${siteUrl}/api/og`,
        sizes: '1200x630',
        type:  'image/png',
        label: 'Nischal Bhandari Portfolio — Windows XP Desktop',
      },
    ],
  };
}
