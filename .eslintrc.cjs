module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: true,
      node: true,
    },
  },
  plugins: [
    'react',
    '@typescript-eslint',
    'react-hooks',
    'jsx-a11y',
    'import',
  ],
  rules: {
    // General ESLint rules
    'no-unused-vars': 'warn', // Warn about unused variables
    'no-console': 'warn', // Warn about console.log

    // TypeScript ESLint rules
    '@typescript-eslint/no-unused-vars': 'warn', // Warn about unused variables in TS
    '@typescript-eslint/no-explicit-any': 'warn', // Warn about using 'any'

    // React rules
    'react/react-in-jsx-scope': 'off', // Not needed for React 17+ with new JSX transform
    'react/prop-types': 'off', // Disable prop-types checking for TypeScript projects

    // React Hooks rules
    'react-hooks/rules-of-hooks': 'error', // Checks rules of Hooks
    'react-hooks/exhaustive-deps': 'warn', // Checks effect dependencies

    // JSX-a11y rules (can be relaxed or tightened as needed)
    'jsx-a11y/alt-text': 'warn', // Warn about missing alt text

    // Import rules
    'import/no-unresolved': 'error', // Ensure imports resolve
    'import/named': 'error', // Ensure named imports exist
    'import/namespace': 'error', // Ensure namespace imports exist
    'import/default': 'error', // Ensure default import exists
    'import/export': 'error', // Ensure exports are valid
  },
};
