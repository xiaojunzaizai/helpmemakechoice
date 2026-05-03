import type { NextConfig } from 'next';

const repo = 'helpmemakechoice';
const isGithubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig: NextConfig = {
	allowedDevOrigins: ['192.168.50.195'],
	output: 'export',
	images: {
		unoptimized: true,
	},
	basePath: isGithubPages ? `/${repo}` : '',
	assetPrefix: isGithubPages ? `/${repo}/` : '',
};

export default nextConfig;
