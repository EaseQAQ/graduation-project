module.exports = {
  extends: [
    'eslint:recommended',
    '@vue/eslint-config-standard',
    '@vue/eslint-config-typescript'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/multi-word-component-names': 'off'
  }
}