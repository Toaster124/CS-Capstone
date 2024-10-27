// .eslintrc.js
module.exports = {
    env: {
      browser: true,
      es2021: true,
      jest: true,
    },
    extends: ['react-app', 'eslint:recommended', 'plugin:react/recommended', 'plugin:prettier/recommended'],
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      ecmaVersion: 12,
    },
    plugins: ['react', 'prettier'],
    rules: {
      // Custom rules
      'prettier/prettier': 'error',
    },
  };
  