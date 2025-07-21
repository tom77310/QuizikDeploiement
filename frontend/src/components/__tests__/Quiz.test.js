// src/components/__tests__/Quiz.test.js
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Quiz from '../Quiz';
import * as api from '../../services/api';

// Mock de l'API
jest.mock('../../services/api');

describe('<Quiz />', () => {
  const mockQuiz = {
    quizTitle: 'Quiz Test',
    questions: [
      {
        id: 1,
        question: 'Capitale de la France ?',
        options: ['Paris', 'Londres', 'Berlin', 'Madrid'],
        correctAnswer: 'Paris',
        explanation: 'Paris est la capitale.'
      }
    ],
    feedback: {
      perfect:   { comment: 'Parfait !',    image: 'perfect.gif' },
      excellent: { comment: 'Excellent !',  image: 'excellent.gif' },
      veryGood:  { comment: 'Très bien !',  image: 'verygood.gif' },
      good:      { comment: 'Bien !',       image: 'good.gif' },
      average:   { comment: 'Moyen !',      image: 'average.gif' },
      poor:      { comment: 'À améliorer…', image: 'poor.gif' }
    }
  };

  beforeEach(() => {
    // Reset des mocks
    jest.clearAllMocks();
    
    // Mock simple de window.location.reload
    Object.defineProperty(window, 'location', {
      value: { reload: jest.fn() },
      writable: true
    });
  });

  describe('Affichage de base', () => {
    it('affiche le loader pendant le chargement', () => {
      // Promise qui ne se résout jamais = état de loading
      api.fetchQuiz.mockImplementation(() => new Promise(() => {}));
      
      render(<Quiz />);
      
      // Vérification simple avec du texte qui existe vraiment
      expect(screen.getByText(/Chargement/i)).toBeInTheDocument();
    });

    it('affiche une erreur si le fetch échoue', async () => {
      // Mock console.error pour éviter les logs
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock d'une erreur
      api.fetchQuiz.mockRejectedValue(new Error('Erreur test'));
      
      render(<Quiz />);
      
      // Attendre que l'erreur apparaisse
      await waitFor(() => {
        expect(screen.getByText(/Impossible de charger/i)).toBeInTheDocument();
      });
      
      consoleSpy.mockRestore();
    });

    it('affiche le quiz une fois chargé', async () => {
      // Mock du quiz qui fonctionne
      api.fetchQuiz.mockResolvedValue(mockQuiz);
      
      render(<Quiz />);
      
      // Attendre que le titre apparaisse
      await waitFor(() => {
        expect(screen.getByText('Quiz Test')).toBeInTheDocument();
      });
      
      // Vérifier la question
      expect(screen.getByText('Capitale de la France ?')).toBeInTheDocument();
      
      // Vérifier les options
      expect(screen.getByText('Paris')).toBeInTheDocument();
      expect(screen.getByText('Londres')).toBeInTheDocument();
    });
  });

  describe('Interactions utilisateur', () => {
    beforeEach(() => {
      api.fetchQuiz.mockResolvedValue(mockQuiz);
    });

    it('permet de sélectionner une réponse', async () => {
      render(<Quiz />);
      
      // Attendre le chargement
      await waitFor(() => {
        expect(screen.getByText('Quiz Test')).toBeInTheDocument();
      });
      
      // Cliquer sur une réponse
      const parisButton = screen.getByRole('button', { name: 'Paris' });
      fireEvent.click(parisButton);
      
      // Vérifier que le bouton a la bonne classe
      expect(parisButton).toHaveClass('bg-violet-600');
    });

    it('active le bouton Terminer après sélection', async () => {
      render(<Quiz />);
      
      await waitFor(() => {
        expect(screen.getByText('Quiz Test')).toBeInTheDocument();
      });
      
      // Au début, le bouton est désactivé
      const nextButton = screen.getByRole('button', { name: /Terminer/i });
      expect(nextButton).toBeDisabled();
      
      // Sélectionner une réponse
      fireEvent.click(screen.getByRole('button', { name: 'Paris' }));
      
      // Maintenant le bouton est activé
      expect(nextButton).not.toBeDisabled();
    });

    it('affiche le feedback pour une bonne réponse', async () => {
      render(<Quiz />);
      
      await waitFor(() => {
        expect(screen.getByText('Quiz Test')).toBeInTheDocument();
      });
      
      // Sélectionner la bonne réponse
      fireEvent.click(screen.getByRole('button', { name: 'Paris' }));
      
      // Vérifier le feedback positif
      expect(screen.getByText(/Correct/i)).toBeInTheDocument();
      expect(screen.getByText('Paris est la capitale.')).toBeInTheDocument();
    });

    it('affiche le feedback pour une mauvaise réponse', async () => {
      render(<Quiz />);
      
      await waitFor(() => {
        expect(screen.getByText('Quiz Test')).toBeInTheDocument();
      });
      
      // Sélectionner une mauvaise réponse
      fireEvent.click(screen.getByRole('button', { name: 'Londres' }));
      
      // Vérifier le feedback négatif
      expect(screen.getByText(/Incorrect/i)).toBeInTheDocument();
      expect(screen.getByText(/La bonne réponse était: Paris/i)).toBeInTheDocument();
    });
  });

  describe('Résultats du quiz', () => {
    beforeEach(() => {
      api.fetchQuiz.mockResolvedValue(mockQuiz);
    });

    it('affiche le score pour une bonne réponse', async () => {
      render(<Quiz />);
      
      await waitFor(() => {
        expect(screen.getByText('Quiz Test')).toBeInTheDocument();
      });
      
      // Répondre correctement
      fireEvent.click(screen.getByRole('button', { name: 'Paris' }));
      fireEvent.click(screen.getByRole('button', { name: /Terminer/i }));
      
      // Vérifier les résultats
      await waitFor(() => {
        expect(screen.getByText(/Quiz terminé/i)).toBeInTheDocument();
      });
      
      expect(screen.getByText(/Votre score: 1 \/ 1/i)).toBeInTheDocument();
      expect(screen.getByText('Parfait !')).toBeInTheDocument();
    });

    it('affiche le score pour une mauvaise réponse', async () => {
      render(<Quiz />);
      
      await waitFor(() => {
        expect(screen.getByText('Quiz Test')).toBeInTheDocument();
      });
      
      // Répondre incorrectement
      fireEvent.click(screen.getByRole('button', { name: 'Londres' }));
      fireEvent.click(screen.getByRole('button', { name: /Terminer/i }));
      
      // Vérifier les résultats
      await waitFor(() => {
        expect(screen.getByText(/Quiz terminé/i)).toBeInTheDocument();
      });
      
      expect(screen.getByText(/Votre score: 0 \/ 1/i)).toBeInTheDocument();
      expect(screen.getByText('À améliorer…')).toBeInTheDocument();
    });

    it('affiche l\'image de feedback', async () => {
      render(<Quiz />);
      
      await waitFor(() => {
        expect(screen.getByText('Quiz Test')).toBeInTheDocument();
      });
      
      // Compléter le quiz
      fireEvent.click(screen.getByRole('button', { name: 'Paris' }));
      fireEvent.click(screen.getByRole('button', { name: /Terminer/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/Quiz terminé/i)).toBeInTheDocument();
      });
      
      // Vérifier l'image
      const feedbackImg = screen.getByAltText('Feedback GIF');
      expect(feedbackImg).toHaveAttribute('src', 'perfect.gif');
    });

    it('permet de recommencer le quiz', async () => {
      render(<Quiz />);
      
      await waitFor(() => {
        expect(screen.getByText('Quiz Test')).toBeInTheDocument();
      });
      
      // Compléter le quiz
      fireEvent.click(screen.getByRole('button', { name: 'Paris' }));
      fireEvent.click(screen.getByRole('button', { name: /Terminer/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/Quiz terminé/i)).toBeInTheDocument();
      });
      
      // Cliquer sur recommencer
      const restartButton = screen.getByRole('button', { name: /Recommencer/i });
      fireEvent.click(restartButton);
      
      // Vérifier que reload est appelé
      expect(window.location.reload).toHaveBeenCalled();
    });
  });

  describe('Quiz avec plusieurs questions', () => {
    const multiQuestionQuiz = {
      quizTitle: 'Quiz Multiple',
      questions: [
        {
          id: 1,
          question: 'Question 1 ?',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 'A',
          explanation: 'A est correct.'
        },
        {
          id: 2,
          question: 'Question 2 ?',
          options: ['X', 'Y', 'Z', 'W'],
          correctAnswer: 'Y',
          explanation: 'Y est correct.'
        }
      ],
      feedback: mockQuiz.feedback
    };

    it('navigue entre les questions', async () => {
      api.fetchQuiz.mockResolvedValue(multiQuestionQuiz);
      render(<Quiz />);
      
      await waitFor(() => {
        expect(screen.getByText('Quiz Multiple')).toBeInTheDocument();
      });
      
      // Vérifier qu'on est à la question 1
      expect(screen.getByText(/Question 1 \/ 2/i)).toBeInTheDocument();
      expect(screen.getByText('Question 1 ?')).toBeInTheDocument();
      
      // Répondre et passer à la suivante
      fireEvent.click(screen.getByRole('button', { name: 'A' }));
      fireEvent.click(screen.getByRole('button', { name: /Suivant/i }));
      
      // Vérifier qu'on est à la question 2
      expect(screen.getByText(/Question 2 \/ 2/i)).toBeInTheDocument();
      expect(screen.getByText('Question 2 ?')).toBeInTheDocument();
      
      // Sur la dernière question, le bouton dit "Terminer"
      fireEvent.click(screen.getByRole('button', { name: 'Y' }));
      expect(screen.getByRole('button', { name: /Terminer/i })).toBeInTheDocument();
    });

    it('calcule le score final correctement', async () => {
      api.fetchQuiz.mockResolvedValue(multiQuestionQuiz);
      render(<Quiz />);
      
      await waitFor(() => {
        expect(screen.getByText('Quiz Multiple')).toBeInTheDocument();
      });
      
      // Répondre correctement aux 2 questions
      fireEvent.click(screen.getByRole('button', { name: 'A' }));
      fireEvent.click(screen.getByRole('button', { name: /Suivant/i }));
      
      fireEvent.click(screen.getByRole('button', { name: 'Y' }));
      fireEvent.click(screen.getByRole('button', { name: /Terminer/i }));
      
      // Vérifier le score parfait
      await waitFor(() => {
        expect(screen.getByText(/Quiz terminé/i)).toBeInTheDocument();
      });
      
      expect(screen.getByText(/Votre score: 2 \/ 2/i)).toBeInTheDocument();
      expect(screen.getByText('Parfait !')).toBeInTheDocument();
    });
  });
});