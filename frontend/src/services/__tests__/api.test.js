// src/services/__tests__/api.test.js
import '@testing-library/jest-dom';
import { fetchQuiz } from '../api';

// Mock global fetch
global.fetch = jest.fn();

describe('API Service', () => {
  beforeEach(() => {
    // Reset fetch mock
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fetchQuiz réussit avec des données valides', async () => {
    const mockData = { quizTitle: 'Test Quiz' };
    
    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockData)
    });

    const result = await fetchQuiz();
    
    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/quiz');
  });

  it('fetchQuiz gère les erreurs HTTP', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 404
    });

    await expect(fetchQuiz()).rejects.toThrow('HTTP error! status: 404');
  });

  it('fetchQuiz gère les erreurs réseau', async () => {
    global.fetch.mockRejectedValue(new Error('Network error'));

    await expect(fetchQuiz()).rejects.toThrow('Network error');
  });

  it('utilise la bonne URL avec variable d\'environnement', async () => {
    // Temporairement changer l'URL
    const originalURL = process.env.REACT_APP_API_URL;
    process.env.REACT_APP_API_URL = 'https://production-api.com';
    
    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({})
    });

    // Réimporter le module pour prendre en compte la nouvelle variable
    jest.resetModules();
    const { fetchQuiz: newFetchQuiz } = require('../api');
    
    await newFetchQuiz();
    
    expect(global.fetch).toHaveBeenCalledWith('https://production-api.com/api/quiz');
    
    // Restaurer la variable d'environnement
    process.env.REACT_APP_API_URL = originalURL;
  });
});