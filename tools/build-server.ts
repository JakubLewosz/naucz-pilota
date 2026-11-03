import { build } from 'esbuild';
await build({entryPoints:['apps/server/src/index.ts'],bundle:true,platform:'node',format:'esm',outfile:'dist/server/index.mjs',external:['express','openai','helmet','cookie-parser','dotenv/config'],sourcemap:false});

await build({entryPoints:['packages/contracts/src/validators.generated.js'],bundle:true,platform:'node',format:'cjs',outfile:'dist/desktop/relay-validator.cjs'});
