import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: false,
		environment: 'node',
		setupFiles: './test/vitest.setup.ts',
		include: ['test/units/**/*.test.ts', '**/*.unit.test.ts'],
	},
	resolve: {
		alias: {
			'@models': path.resolve(__dirname, 'src/models'),
			'@controllers': path.resolve(__dirname, 'src/controllers'),
			'@services': path.resolve(__dirname, 'src/services'),
			'@util': path.resolve(__dirname, 'src/util'),
			'@middlewares': path.resolve(__dirname, 'src/middlewares'),
			'@config': path.resolve(__dirname, 'src/config'),
			'@routes': path.resolve(__dirname, 'src/routes'),
			'@socket': path.resolve(__dirname, 'src/socket'),
			'@cache': path.resolve(__dirname, 'src/cache'),
			'@command': path.resolve(__dirname, 'src/command'),
		},
	},
});
