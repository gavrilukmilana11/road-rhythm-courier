module.exports = {
  preset: 'react-native',
  // only *.test.ts(x) are specs; __tests__/testRun.ts holds shared fixtures
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  transformIgnorePatterns: [
    'node_modules/(?!(?:@react-native|react-native|react-native-linear-gradient|react-native-svg|lucide-react-native)/)',
  ],
};
