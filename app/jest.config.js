/**
 * Jest cho lib thuần (src/lib) — không cần môi trường RN.
 * Component/screen test (jest-expo) bổ sung ở GĐ sau.
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/lib'],
  testMatch: ['**/__tests__/**/*.test.ts'],
};
