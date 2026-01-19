import { defineConfig } from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineConfig({
  plugins: [
    cssInjectedByJsPlugin()  // CSS inline no bundle
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'OctopChatWidget',  // Global var name
      fileName: () => 'widget.js',
      formats: ['iife']  // IIFE = Immediately Invoked Function Expression
    },
    outDir: 'dist',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        entryFileNames: 'widget.js',
        assetFileNames: 'widget.[ext]'
      }
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  }
});
