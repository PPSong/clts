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
    'no-await-in-loop': 'off',
    'prefer-destructuring': 'off',
    'func-names': 'off',
    'no-empty-function': 'off',
    'max-len': 'off',
    'no-restricted-syntax': 'off',
    'no-lonely-if': 'off',
    'guard-for-in': 'off',
    'no-loop-func': 'off',
  },
};
