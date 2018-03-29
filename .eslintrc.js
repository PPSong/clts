module.exports = {
  env: {
    node: true,
    mocha: true,
  },
  extends: 'airbnb-base',
  parser: 'babel-eslint',
  rules: {
    'no-mixed-operators': 'off',
    'no-use-before-define': 'warn',
    'import/prefer-default-export': 'off',
    'class-methods-use-this': 'off',
    radix: 'off',
    'global-require': 'off',
    'import/no-dynamic-require': 'off',
    'no-unused-vars': 'warn',
    'no-plusplus': 'off',
    'no-await-in-loop': 'warn',
    'consistent-return': 'warn',
    camelcase: 'warn',
    'no-case-declarations': 'off',
  },
};
