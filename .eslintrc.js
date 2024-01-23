module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: ["airbnb-base", "plugin:node/recommended", "prettier"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["prettier"],
  rules: {
    "node/no-unsupported-features/es-syntax": [
      "error",
      { version: ">=14.0.0", ignores: ["modules"] },
    ],
    "no-nested-ternary": 0,
    "prettier/prettier": "error",
  },
};
