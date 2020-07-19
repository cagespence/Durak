module.exports = {
  'env': {
    'es6': true,
    'node': true,
  },
  'extends': [
    "eslint:recommended",
    'google',
  ],
  'globals': {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly',
  },
  'parser': '@typescript-eslint/parser',
  "parserOptions": {
    "ecmaVersion": 6,
    "sourceType": "module",
    "ecmaFeatures": {
      "modules": true
    }
  },
  'plugins': [
    '@typescript-eslint',
  ],
  'rules': {
    "linebreak-style": "off",
    "no-unused-vars": "off",
    "react-hooks/exhaustive-deps": "disabled"
  },
};
