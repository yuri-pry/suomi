import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // relative base: the same build runs on a static host subpath and inside the APK
  base: './',
  plugins: [react()],
  test: { include: ['tests/**/*.test.ts'] },
});
