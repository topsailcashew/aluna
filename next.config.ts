
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Fix for OpenTelemetry and Node.js built-in modules on client side
    if (!isServer) {
      // Provide fallbacks for Node.js built-in modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'async_hooks': false,
        'fs': false,
        'net': false,
        'tls': false,
        'child_process': false,
        'http2': false,
        'dns': false,
        'os': false,
        'crypto': false,
        'stream': false,
        'util': false,
        'buffer': false,
        'events': false,
        'path': false,
      };

      // Exclude OpenTelemetry packages from client bundle
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push({
          '@opentelemetry/context-async-hooks': 'commonjs @opentelemetry/context-async-hooks',
          '@opentelemetry/api': 'commonjs @opentelemetry/api',
        });
      }
    }
    return config;
  }
};

export default nextConfig;
