import type { NextConfig } from "next";

// Loader path from orchids-visual-edits - use direct resolve to get the actual file
const loaderPath = require.resolve('orchids-visual-edits/loader.js');

const nextConfig: NextConfig = {
  distDir: ".next",
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Externalize packages to avoid bundling issues with version conflicts
  serverExternalPackages: [
    '@composio/core',
    '@composio/openai', 
    '@composio/openai-agents',
    'openai',
    '@openai/agents',
    '@openai/agents-core',
    '@openai/agents-openai'
  ],
  webpack: (config, { isServer }) => {
    // Externalize these packages on server to prevent bundling issues
    if (isServer) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push(
          '@composio/core',
          '@composio/openai',
          '@composio/openai-agents',
          'openai',
          '@openai/agents'
        );
      } else if (typeof config.externals === 'object') {
        config.externals = [
          ...(Array.isArray(config.externals) ? config.externals : [config.externals]),
          '@composio/core',
          '@composio/openai',
          '@composio/openai-agents',
          'openai',
          '@openai/agents'
        ];
      }
    }
    return config;
  },
  turbopack: {
    rules: {
      "*.{jsx,tsx}": {
        loaders: [loaderPath]
      }
    }
  }
} as NextConfig;

export default nextConfig;
