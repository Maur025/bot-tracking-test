import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
	test: {
		globals: false,
		environment: 'node',
		setupFiles: './test/vitest.setup.ts',
		include: ['test/units/**/*.test.ts', '**/*.unit.test.ts'],
	},
	plugins: [tsconfigPaths()],
});
