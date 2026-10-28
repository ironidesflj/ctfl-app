import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/purity": "off",
    },
    ignores: [".next/**", "node_modules/**", "bank-source/**", "src/synapse/data/banks/**"],
  },
];

export default eslintConfig;
