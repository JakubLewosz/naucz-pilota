import {defineConfig} from '@playwright/test';
// Testy e2e mają własny serwer na osobnych portach, zawsze w trybie pokazowym:
// nie podpinają się pod działającą grę z prawdziwym AI, nie wysyłają płatnych zapytań i nie nadpisują checks/.
const WEB=5183,API=3011;
export default defineConfig({testDir:'tests/e2e',timeout:60000,fullyParallel:false,workers:1,
 reporter:[['list'],['json',{outputFile:'test-results/e2e-results.json'}]],
 use:{baseURL:`http://127.0.0.1:${WEB}`,trace:'retain-on-failure',reducedMotion:'reduce'},
 webServer:{command:'npm run dev',url:`http://127.0.0.1:${WEB}`,reuseExistingServer:false,timeout:30000,
  env:{AI_MODE:'demo',STATE_DB_PATH:':memory:',ANTHROPIC_API_KEY:'',OPENAI_API_KEY:'',PIKO_WEB_PORT:String(WEB),SERVER_PORT:String(API),PUBLIC_ORIGIN:`http://127.0.0.1:${WEB}`}}});
