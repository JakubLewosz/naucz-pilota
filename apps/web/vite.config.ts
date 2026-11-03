import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
export default defineConfig({root:path.resolve('apps/web'),base:'./',plugins:[react()],server:{host:'127.0.0.1',proxy:{'/api':'http://127.0.0.1:3001'}},build:{sourcemap:false,outDir:'dist'}});
