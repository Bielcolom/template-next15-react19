import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,  // includes browser globals
        ...globals.node,     // add Node.js globals (process, global, etc.)
        es2021: true,        // enable ECMAScript 2021
      },
      parserOptions: {
        ecmaVersion: 12,     // same as in your previous config
        sourceType: "module",// same as in your previous config
      },
    },
  },
  pluginJs.configs.recommended, // recommended rules from @eslint/js
  pluginReact.configs.flat.recommended, // recommended rules for React
  {
    rules: {
      semi: ["error", "always"],
      quotes: ["error", "double"],
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
    },
  },
];
