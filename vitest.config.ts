import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // tsconfig usa jsx:'preserve' (Next); para los tests se compila con el runtime automático de React.
  oxc: { jsx: { runtime: 'automatic' } },
  resolve: { alias: { '@': path.resolve(__dirname) } },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.{ts,tsx}'],
    restoreMocks: true
  }
});
