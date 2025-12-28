/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com'], // For Google OAuth profile pictures
  },
  redirects: async () => [
    {
      source: '/student/lectures',
      destination: '/student/video-lectures',
      permanent: true, // Use true for 301 redirect, false for 302
    },
  ],
};

module.exports = nextConfig; 