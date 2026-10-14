import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default [
  // r7: public/ ignorado — public/sw.js roda no contexto de Service Worker
  // (globals self/caches/clients); a sintaxe dele é validada por
  // `node --check` em src/lib/pwa.test.js, não precisa do ESLint.
  { ignores: ["dist", "dev-dist", "node_modules", "public"] },
  js.configs.recommended,
  {
    // r5: inclui .mjs — scripts/split-bank.mjs roda em Node (console,
    // process); sem esta extensão o arquivo caía no js.configs.recommended
    // sem globals e dava 2 erros de no-undef (console).
    files: ["**/*.{js,jsx,mjs}"],
    languageOptions: {
      // P1: "latest" parseia import attributes (`import ... with { type: "json" }`),
      // usados em bank.js e Quiz.jsx — com 2022 o ESLint falhava com erro de
      // parse e esses arquivos ficavam sem cobertura de regras.
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node, __APP_VERSION__: "readonly" },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { react, "react-hooks": reactHooks, "react-refresh": reactRefresh },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-empty": ["error", { allowEmptyCatch: true }],
    },
    settings: { react: { version: "detect" } },
  },
  prettier,
];
