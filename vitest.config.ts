import { configDefaults, defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      pool: 'vmThreads',
      exclude: [
        ...configDefaults.exclude!,
        'e2e/**',
        'src/__tests__/router-mock.ts',
        'src/__tests__/pinia.ts',
        'src/views/__tests__/vitest-canvas.ts'
      ],
      clearMocks: true,
      reporters: ['default', 'json'],
      outputFile: 'results/vitest-results.json',
      sequence: {
        shuffle: true
      },
      coverage: {
        provider: 'istanbul',
        exclude: [...configDefaults.coverage.exclude!, 'src/main.ts', 'src/router.ts', 'src/i18n.ts', 'src/models'],
        reporter: ['json-summary', 'text', 'html'],
        reportOnFailure: true
      }
    }
  })
);
