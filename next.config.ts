import type { NextConfig } from 'next';

const repo = 'helpmemakechoice';

const nextConfig: NextConfig = {
	allowedDevOrigins: ['192.168.50.195'],
	output: 'export',
	images: {
		unoptimized: true,
	},
	basePath: `/${repo}`,
	assetPrefix: `/${repo}/`,
};

export default nextConfig;
