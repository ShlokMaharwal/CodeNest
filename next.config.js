/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: { tsconfigPath: 'tsconfig.build.json' },
  // CI and the pre-commit verification run ESLint separately.
  eslint: { ignoreDuringBuilds: true },
}

module.exports = nextConfig
