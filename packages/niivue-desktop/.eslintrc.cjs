module.exports = {
  parserOptions: {
    project: require('path').resolve(__dirname, 'tsconfig.eslint.json'),
    tsconfigRootDir: __dirname
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    '@electron-toolkit/eslint-config-ts/recommended',
    '@electron-toolkit/eslint-config-prettier'
  ]
}
