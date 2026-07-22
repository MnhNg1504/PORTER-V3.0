/**
 * Jest cho server (checklist §8).
 * GHIM major 29: jest@29 + ts-jest@29 + @types/jest@29 — jest 30 xung khắc
 * ts-jest (đã gặp ở app/), KHÔNG tự nâng.
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/__tests__/**/*.test.ts'],
  // Decorator NestJS/TypeORM cần polyfill Reflect trước khi import module
  setupFiles: ['reflect-metadata'],
};
