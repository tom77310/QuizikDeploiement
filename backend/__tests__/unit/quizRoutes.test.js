// __tests__/unit/quizRoutes.test.js
const request = require('supertest');
const express = require('express');
const Quiz = require('../../models/Quiz');  
const quizRoutes = require('../../routes/quizRoutes');

// Mock le modèle Quiz pour les tests unitaires
jest.mock('../../models/Quiz');

// Crée une instance d'application Express pour les tests
const app = express();
app.use(express.json());
app.use('/api/quiz', quizRoutes);

describe('Quiz Routes Unit Tests', () => {
  // Nettoie les mocks après chaque test
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test : Récupération réussie d'un quiz
  it('should retrieve a quiz successfully', async () => {
    const mockQuiz = {
      quizTitle: "Test Quiz",
      questions: [{
        id: 1,
        question: "Test Question",
        options: ["A", "B", "C", "D"],
        correctAnswer: "A",
        explanation: "Test explanation"
      }],
      feedback: {
        perfect: { comment: "Perfect!", image: "https://example.com/perfect.gif" }
      }
    };

    // Configure le mock
    Quiz.findOne.mockResolvedValue(mockQuiz);

    // Envoie une requête GET
    const response = await request(app).get('/api/quiz');

    // Vérifications
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(mockQuiz);
    expect(Quiz.findOne).toHaveBeenCalled();
  });

  // Test : Aucun quiz trouvé
  it('should return 404 when no quiz is found', async () => {
    Quiz.findOne.mockResolvedValue(null);

    const response = await request(app).get('/api/quiz');

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({ message: "Aucun quiz trouvé" });
  });

  // Test : Gestion des erreurs
  it('should handle errors', async () => {
    const error = new Error('Database error');
    Quiz.findOne.mockRejectedValue(error);

    const response = await request(app).get('/api/quiz');

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ message: error.message });
  });
});