import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
// Porty można zmienić zmiennymi (testy e2e używają osobnych, żeby nie trafić na działającą grę).
const webPort=Number(process.env.PIKO_WEB_PORT??5173),apiPort=Number(process.env.SERVER_PORT??3001);
export default defineConfig({root:path.resolve('apps/web'),base:'./',plugins:[react()],server:{host:'127.0.0.1',port:webPort,strictPort:true,proxy:{'/api':`http://127.0.0.1:${apiPort}`}},build:{sourcemap:false,outDir:'dist'}});
