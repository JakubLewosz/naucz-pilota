import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
export default tseslint.config({ignores:['**/dist/**','**/generated/**','**/*.generated.*','**/staging/**','node_modules/**','release/**','test-results/**','playwright-report/**']},js.configs.recommended,...tseslint.configs.recommended,{files:['**/*.cjs'],rules:{'@typescript-eslint/no-require-imports':'off'}},{files:['**/*.{js,cjs,ts,tsx}'],languageOptions:{globals:{...globals.browser,...globals.node}},rules:{'@typescript-eslint/no-explicit-any':'error','@typescript-eslint/no-unused-vars':['error',{argsIgnorePattern:'^_',varsIgnorePattern:'^_'}],'no-undef':'off'}});
