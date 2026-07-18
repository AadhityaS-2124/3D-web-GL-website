import { defineConfig } from 'vite';

export default defineConfig({
  // This ensures assets are referenced relative to your GitHub repository path
  base: '/3D-web-GL-website/', 
  build: {
    outDir: 'dist',
  }
});
