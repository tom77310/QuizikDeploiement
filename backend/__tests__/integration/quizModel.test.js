// __tests__/integration/QuizModel.test.js
const mongoose = require('mongoose');
const Quiz = require('../../models/Quiz');

// ✅ Pas besoin de beforeAll/afterAll - setup.js s'en charge !

describe('Quiz Model Integration Tests', () => {

  // Test 1: Vérifier la connexion à la base de données
  it('should have active database connection', () => {
    expect(mongoose.connection.readyState).toBe(1); // 1 = connecté
  });

  // Test 2: Créer et sauvegarder un quiz complet
  it('should create and save a complete quiz successfully', async () => {
    const quizData = {
      quizTitle: "Test Integration Quiz",
      questions: [{
        id: 1,
        question: "Question d'intégration complète ?",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: "Option A",
        explanation: "Explication complète d'intégration"
      }],
      feedback: {
        perfect:   { comment: "Perfect score!",    image: "https://example.com/perfect.gif" },
        excellent: { comment: "Excellent!",        image: "https://example.com/excellent.gif" },
        veryGood:  { comment: "Very Good!",        image: "https://example.com/verygood.gif" },
        good:      { comment: "Good!",             image: "https://example.com/good.gif" },
        average:   { comment: "Average",           image: "https://example.com/average.gif" },
        poor:      { comment: "Poor",              image: "https://example.com/poor.gif" }
      }
    };

    const quiz = new Quiz(quizData);
    const savedQuiz = await quiz.save();

    expect(savedQuiz._id).toBeDefined();
    expect(savedQuiz.quizTitle).toBe(quizData.quizTitle);
    expect(savedQuiz.questions).toHaveLength(1);
    expect(savedQuiz.feedback.perfect.comment).toBe("Perfect score!");
  });

  // Test 3: Récupérer un quiz de la base de données
  it('should retrieve a quiz from the database and verify structure', async () => {
    const quizData = {
      quizTitle: "Retrieved Quiz",
      questions: [{
        id: 1,
        question: "What is Mongoose?",
        options: ["ODM", "Database", "Server", "Framework"],
        correctAnswer: "ODM",
        explanation: "Mongoose is an ODM for MongoDB"
      }],
      feedback: {
        perfect: { comment: "MongoDB Master!", image: "https://example.com/master.gif" },
        poor:    { comment: "Study more!",      image: "https://example.com/study.gif" }
      }
    };

    await new Quiz(quizData).save();

    const retrievedQuiz = await Quiz.findOne({ quizTitle: "Retrieved Quiz" });

    expect(retrievedQuiz).not.toBeNull();
    expect(retrievedQuiz.questions[0].question).toBe("What is Mongoose?");
    expect(retrievedQuiz.feedback.perfect.comment).toBe("MongoDB Master!");
  });

  // Test 4: Mettre à jour un quiz existant
  it('should update an existing quiz', async () => {
    const quiz = new Quiz({
      quizTitle: "Original Title",
      questions: [{
        id: 1,
        question: "Original Question",
        options: ["A", "B", "C", "D"],
        correctAnswer: "A",
        explanation: "Original explanation"
      }]
    });
    await quiz.save();

    // Modification
    quiz.quizTitle = "Updated Quiz Title";
    quiz.questions[0].question = "Updated Question";
    await quiz.save();

    // Vérification
    const updatedQuiz = await Quiz.findOne({ _id: quiz._id });
    expect(updatedQuiz.quizTitle).toBe("Updated Quiz Title");
    expect(updatedQuiz.questions[0].question).toBe("Updated Question");
  });

  // Test 5: Comportement par défaut avec données manquantes
  it('should allow saving a quiz without title and empty questions by default', async () => {
    const invalidQuiz = new Quiz({
      // quizTitle manquant
      questions: []
    });

    const savedQuiz = await invalidQuiz.save();
    expect(savedQuiz._id).toBeDefined();
    expect(Array.isArray(savedQuiz.questions)).toBe(true);
    expect(savedQuiz.questions).toHaveLength(0);
    expect(savedQuiz.quizTitle).toBeUndefined();
  });
});
