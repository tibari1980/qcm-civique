import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // output: 'export', // Désactivé pour autoriser les API routes (emails, etc.)
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    serverExternalPackages: ['firebase-admin'],
    experimental: {
        optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion'],
    },
    webpack: (config, { isServer }) => {
        if (isServer) {
            // Activation du support WebAssembly pour farmhash (utilisé par firebase-admin)
            config.experiments = {
                ...config.experiments,
                asyncWebAssembly: true,
                layers: true,
            };

            // On définit firebase-admin comme externe pour éviter qu'il ne soit packagé dans le bundle Edge
            // s'il n'est pas utilisé directement dans un contexte Node.
            if (config.externals) {
                config.externals.push('firebase-admin', '@google-cloud/firestore');
            } else {
                config.externals = ['firebase-admin', '@google-cloud/firestore'];
            }

            // Fallbacks exhaustifs pour les modules Node.js
            config.resolve.fallback = {
                ...config.resolve.fallback,
                stream: false,
                fs: false,
                net: false,
                tls: false,
                crypto: false,
                os: false,
                path: false,
                child_process: false,
                http: false,
                https: false,
                zlib: false,
            };
        }
        return config;
    },
};

export default nextConfig;
