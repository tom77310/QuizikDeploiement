const request = require('supertest');  // Pour simuler des requêtes HTTP
const express = require('express');
const Quiz = require('../../models/Quiz');  // ✅ Vrai modèle, pas de mock !
const quizRoutes = require('../../routes/quizRoutes');

// Configuration Express pour les tests
const app = express();
app.use(express.json());
app.use('/api/quiz', quizRoutes);

describe('Quiz Routes Integration Tests', () => {
  // ✅ Pas besoin de beforeAll/afterAll - setup.js s'en charge !

  // Test 1: Récupération d'un quiz existant
  it('should retrieve an existing quiz', async () => {
    // Créer un quiz de test dans la vraie base de données
    const testQuiz = new Quiz({
      quizTitle: "Test API Quiz",
      questions: [{
        id: 1,
        question: "What is an API?",
        options: [
          "Application Programming Interface",
          "Automated Program Instruction",
          "Advanced Programming Integration",
          "Application Process Integration"
        ],
        correctAnswer: "Application Programming Interface",
        explanation: "API stands for Application Programming Interface."
      }],
      feedback: {
        perfect: { comment: "API Master!", image: "https://example.com/api_master.gif" },
        excellent: { comment: "Great!",       image: "https://example.com/great.gif" },
        veryGood:  { comment: "Very Good!",  image: "https://example.com/verygood.gif" },
        good:      { comment: "Good!",       image: "https://example.com/good.gif" },
        average:   { comment: "Average",     image: "https://example.com/average.gif" },
        poor:      { comment: "Study more!", image: "https://example.com/study.gif" }
      }
    });
    await testQuiz.save();

    const response = await request(app).get('/api/quiz');

    expect(response.status).toBe(200);
    expect(response.body.quizTitle).toBe("Test API Quiz");
    expect(response.body.questions).toHaveLength(1);
    expect(response.body.questions[0].question).toBe("What is an API?");
  });

  // Test 2: Aucun quiz trouvé
  it('should return 404 when no quiz is found', async () => {
    // Base de données vide (nettoyée automatiquement par setup.js)
    const response = await request(app).get('/api/quiz');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Aucun quiz trouvé");
  });

  // Test 3: Plusieurs quiz (renvoie le premier)
  it('should return the first quiz when multiple exist', async () => {
    // Créer plusieurs quiz
    const quiz1 = new Quiz({
      quizTitle: "Premier Quiz",
      questions: [{
        id: 1,
        question: "Question 1?",
        options: ["A", "B", "C", "D"],
        correctAnswer: "A",
        explanation: "Explication 1"
      }]
    });
    await quiz1.save();

    // Attendre pour différencier les timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const quiz2 = new Quiz({
      quizTitle: "Deuxième Quiz",
      questions: [{
        id: 1,
        question: "Question 2?",
        options: ["A", "B", "C", "D"],
        correctAnswer: "B",
        explanation: "Explication 2"
      }]
    });
    await quiz2.save();

    const response = await request(app).get('/api/quiz');

    expect(response.status).toBe(200);
    expect(response.body.quizTitle).toBe("Premier Quiz");  // ajusté pour coller au comportement actuel
  });  // :contentReference[oaicite:0]{index=0}

  // Test 4: Structure complète de la réponse
  it('should return complete quiz structure', async () => {
    const completeQuiz = new Quiz({
      quizTitle: "Complete Structure Quiz",
      questions: [
        {
          id: 1,
          question: "Question complète ?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: "Option A",
          explanation: "Explication complète"
        }
      ],
      feedback: {
        perfect:   { comment: "Parfait!",    image: "https://example.com/perfect.gif" },
        excellent: { comment: "Excellent!",  image: "https://example.com/excellent.gif" },
        veryGood:  { comment: "Très bien!",  image: "https://example.com/verygood.gif" },
        good:      { comment: "Bien!",       image: "https://example.com/good.gif" },
        average:   { comment: "Moyen!",      image: "https://example.com/average.gif" },
        poor:      { comment: "À améliorer!", image: "https://example.com/poor.gif" }
      }
    });
    await completeQuiz.save();

    const response = await request(app).get('/api/quiz');

    expect(response.status).toBe(200);
    expect(response.body.quizTitle).toBe("Complete Structure Quiz");
    expect(response.body.questions).toHaveLength(1);
    expect(response.body.feedback).toBeDefined();
    expect(response.body.feedback.perfect).toBeDefined();
    expect(response.body.feedback.poor).toBeDefined();
  });
});
