import {defineConfig} from '@playwright/test';
// Testy e2e zawsze w trybie pokazowym, niezależnie od lokalnego .env: bez płatnych zapytań i bez nadpisywania checks/.
export default defineConfig({testDir:'tests/e2e',timeout:60000,fullyParallel:false,workers:1,
 reporter:[['list'],['json',{outputFile:'test-results/e2e-results.json'}]],
 use:{baseURL:'http://127.0.0.1:5173',trace:'retain-on-failure',reducedMotion:'reduce'},
 webServer:{command:'npm run dev',url:'http://127.0.0.1:5173',reuseExistingServer:!process.env.CI,timeout:30000,
  env:{AI_MODE:'demo',STATE_DB_PATH:':memory:',ANTHROPIC_API_KEY:'',OPENAI_API_KEY:''}}});
