// src/__tests__/App.test.js
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';  // ✅ Chemin correct : App.js est dans src/
import * as api from '../services/api';

// Mock de l'API pour éviter les appels réels
jest.mock('../services/api');

describe('<App />', () => {
  beforeEach(() => {
    // Mock simple pour éviter les erreurs
    api.fetchQuiz.mockResolvedValue({
      quizTitle: 'Test Quiz',
      questions: [],
      feedback: {}
    });
  });

  it('rend le titre principal', () => {
    render(<App />);
    
    expect(screen.getByText('Quizzik')).toBeInTheDocument();
  });

  it('rend le composant Quiz', () => {
    render(<App />);
    
    // Le composant Quiz devrait être présent (même si en cours de chargement)
    expect(screen.getByText(/Chargement/i)).toBeInTheDocument();
  });

  it('a la structure HTML correcte', () => {
    const { container } = render(<App />);
    
    // Vérifier la présence du header
    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
    
    // Vérifier la présence du main
    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
  });
});