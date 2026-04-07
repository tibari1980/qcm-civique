import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CiviqQuiz — Votre succès à l\'examen civique français',
    short_name: 'CiviqQuiz',
    description: 'La plateforme d\'accompagnement pour réussir votre examen civique obligatoire.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#002395',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icon.png',
        sizes: 'any',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}
