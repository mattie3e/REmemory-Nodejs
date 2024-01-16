module.exports = {
    extends: ["airbnb-base", "plugin:node/recommended", "prettier"],
    parserOptions: {
      sourceType: "module",
    },
    rules: {
      "node/no-unsupported-features/es-syntax": ["error", { version: ">=14.0.0", ignores: ["modules"] }],
    },
  };  