// jest.config.js
module.exports = {
  // Environnement DOM pour React
  testEnvironment: 'jsdom',

  // ✅ Chemin correct vers notre setup file
  setupFilesAfterEnv: ['<rootDir>./jest.setup.js'],

  // Mapping des fichiers CSS et autres assets
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': 'jest-transform-stub'
  },

  // Configuration de la couverture de code
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/reportWebVitals.js',
    '!**/*.test.{js,jsx}',
    '!**/__tests__/**'
  ],

  // Seuils de couverture pour vos étudiants
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },

  // Timeout global
  testTimeout: 10000,

  // Patterns de fichiers de test
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx}'
  ],

  // Améliorer les performances
  maxWorkers: '50%'
};