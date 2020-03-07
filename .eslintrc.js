module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
        'plugin:@typescript-eslint/recommended',
    ],
    ignorePatterns:
        ["lib/", "node_modules/"],
    parserOptions: {
        sourceType: 'module',
    },
};
