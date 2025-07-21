module.exports = {
  displayName: 'Backend Tests',
  testEnvironment: 'node',
  rootDir: './',
  testMatch: ['<rootDir>/__tests__/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
  testTimeout: 90000,
  detectOpenHandles: true,
  forceExit: true,
  maxWorkers: 1, // Important pour MongoDB Memory Server
  collectCoverageFrom: [
    'models/**/*.js',
    'routes/**/*.js',
    'controllers/**/*.js',
    '!**/*.test.js'
  ]
};