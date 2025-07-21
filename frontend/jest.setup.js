// jest.setup.js

console.log('✅ jest.setup.js loaded!');

// ✅ Import ESSENTIEL qui manquait !
import '@testing-library/jest-dom';



// Configuration du timeout
jest.setTimeout(10000);

// Mock global de window.location
Object.defineProperty(window, 'location', {
  value: {
    reload: jest.fn(),
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000'
  },
  writable: true
});

// Configuration globale pour tous les tests
beforeEach(() => {
  // Éviter les logs de console.error pendant les tests
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  // Nettoyer tous les mocks après chaque test
  jest.restoreAllMocks();
  jest.clearAllMocks();
});