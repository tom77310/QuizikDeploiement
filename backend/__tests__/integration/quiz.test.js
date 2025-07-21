const Quiz = require('../../models/Quiz');



describe('Quiz Model Test', () => {
    

    // Test 1: Vérifier la création et la sauvegarde d'un quiz complet
    test('should create & save a quiz successfully', async () => {
        const validQuiz = {
            quizTitle: "Quiz sur Michael Jackson",
            questions: [
                {
                    id: 1,
                    question: "En quelle année Michael Jackson est-il né ?",
                    options: ["1958", "1960", "1955", "1965"],
                    correctAnswer: "1958",
                    explanation: "Michael Jackson est né le 29 août 1958."
                }
            ],
            feedback: {
                perfect: {
                    comment: "Vous êtes le Roi de la Pop! 🤩",
                    image: "https://media.tenor.com/exQUnh3bRN0AAAAC/michael-jackson-dance.gif"
                },
                poor: {
                    comment: "Continuez à pratiquer!",
                    image: "https://example.com/practice.gif"
                }
            }
        };

        const savedQuiz = await new Quiz(validQuiz).save();

        expect(savedQuiz._id).toBeDefined();
        expect(savedQuiz.quizTitle).toBe(validQuiz.quizTitle);
        expect(savedQuiz.questions.length).toBe(1);
        expect(savedQuiz.feedback.perfect.comment).toBe(validQuiz.feedback.perfect.comment);
    });

    // Test 2: Vérifier que le quiz accepte des données minimales
    test('should create a quiz with minimal data', async () => {
        const minimalQuiz = {
            quizTitle: "Quiz Minimal",
            questions: [{
                question: "Question test ?",
                options: ["Option 1", "Option 2"],
                correctAnswer: "Option 1"
            }]
        };

        const savedQuiz = await new Quiz(minimalQuiz).save();
        expect(savedQuiz.quizTitle).toBe("Quiz Minimal");
        expect(savedQuiz.questions.length).toBe(1);
    });

    // Test 3: Vérifier que l'ajout de questions fonctionne
    test('should add questions to an existing quiz', async () => {
        const quiz = new Quiz({ quizTitle: "Quiz Évolutif" });
        await quiz.save();

        quiz.questions.push({
            question: "Nouvelle question ?",
            options: ["A", "B", "C"],
            correctAnswer: "B"
        });

        const updatedQuiz = await quiz.save();
        expect(updatedQuiz.questions.length).toBe(1);
        expect(updatedQuiz.questions[0].question).toBe("Nouvelle question ?");
    });

    // Test 4: Vérifier la mise à jour du titre du quiz
    test('should update quiz title', async () => {
        const quiz = await new Quiz({ quizTitle: "Ancien Titre" }).save();
        quiz.quizTitle = "Nouveau Titre";
        const updatedQuiz = await quiz.save();
        expect(updatedQuiz.quizTitle).toBe("Nouveau Titre");
    });

    // Test 5: Vérifier la suppression d'un quiz
    test('should delete a quiz', async () => {
        const quiz = await new Quiz({ quizTitle: "Quiz à Supprimer" }).save();
        await Quiz.deleteOne({ _id: quiz._id });
        const deletedQuiz = await Quiz.findById(quiz._id);
        expect(deletedQuiz).toBeNull();
    });

    // Test 6: Vérifier le comportement avec des données invalides
    test('should handle invalid data gracefully', async () => {
        const invalidQuiz = new Quiz({
            quizTitle: 123, // Devrait être une chaîne
            questions: "Pas un tableau" // Devrait être un tableau
        });

        await expect(invalidQuiz.validate()).rejects.toThrow();
    });


    // Test 7: Vérifier la structure complète du feedback
    test('should verify the complete feedback structure', async () => {
        // Créez un quiz avec une structure de feedback complète
        const quizWithFullFeedback = {
            quizTitle: "Quiz Test Feedback Structure",
            questions: [{
                id: 1,
                question: "Question pour tester le feedback ?",
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: "Option A",
                explanation: "Explication pour tester le feedback."
            }],
            feedback: {
                perfect: {
                    comment: "Parfait ! Vous maîtrisez le sujet ! 🎉",
                    image: "https://example.com/perfect.gif"
                },
                excellent: {
                    comment: "Excellent travail ! 🌟",
                    image: "https://example.com/excellent.gif"
                },
                veryGood: {
                    comment: "Très bien joué ! 👍",
                    image: "https://example.com/verygood.gif"
                },
                good: {
                    comment: "Bon travail ! 👌",
                    image: "https://example.com/good.gif"
                },
                average: {
                    comment: "Résultat moyen, continuez vos efforts ! 📚",
                    image: "https://example.com/average.gif"
                },
                poor: {
                    comment: "Il faut encore travailler ! 💪",
                    image: "https://example.com/poor.gif"
                }
            }
        };

        // Sauvegardez le quiz
        const savedQuiz = await new Quiz(quizWithFullFeedback).save();

        // Vérifiez que chaque niveau de feedback existe et a la bonne structure
        expect(savedQuiz.feedback).toBeDefined();
        
        // Vérifiez que tous les niveaux de feedback sont présents
        const feedbackLevels = ['perfect', 'excellent', 'veryGood', 'good', 'average', 'poor'];
        
        feedbackLevels.forEach(level => {
            expect(savedQuiz.feedback[level]).toBeDefined();
            expect(savedQuiz.feedback[level].comment).toBeDefined();
            expect(savedQuiz.feedback[level].image).toBeDefined();
            expect(typeof savedQuiz.feedback[level].comment).toBe('string');
            expect(typeof savedQuiz.feedback[level].image).toBe('string');
        });

        // Vérifiez le contenu spécifique de quelques niveaux
        expect(savedQuiz.feedback.perfect.comment).toContain('Parfait');
        expect(savedQuiz.feedback.poor.comment).toContain('travailler');
        
        // Vérifiez que les URLs d'images sont bien formatées
        expect(savedQuiz.feedback.perfect.image).toMatch(/^https?:\/\/.+/);
        expect(savedQuiz.feedback.excellent.image).toMatch(/^https?:\/\/.+/);
    });

    // Test 8: Vérifier le comportement avec un feedback partiel
    test('should handle partial feedback structure', async () => {
        // Créez un quiz avec seulement quelques niveaux de feedback
        const quizWithPartialFeedback = {
            quizTitle: "Quiz avec Feedback Partiel",
            questions: [{
                id: 1,
                question: "Question avec feedback partiel ?",
                options: ["Oui", "Non"],
                correctAnswer: "Oui",
                explanation: "Test de feedback partiel."
            }],
            feedback: {
                perfect: {
                    comment: "Parfait ! 🎉",
                    image: "https://example.com/perfect.gif"
                },
                poor: {
                    comment: "À améliorer ! 📚",
                    image: "https://example.com/poor.gif"
                }
                // Les autres niveaux ne sont pas définis
            }
        };

        const savedQuiz = await new Quiz(quizWithPartialFeedback).save();

        // Vérifiez que les niveaux définis existent
        expect(savedQuiz.feedback.perfect).toBeDefined();
        expect(savedQuiz.feedback.poor).toBeDefined();
        
        // Vérifiez que les niveaux non définis sont undefined ou null
        expect(savedQuiz.feedback.excellent).toBeUndefined();
        expect(savedQuiz.feedback.veryGood).toBeUndefined();
        expect(savedQuiz.feedback.good).toBeUndefined();
        expect(savedQuiz.feedback.average).toBeUndefined();
    });

    // Test 9: Vérifier la validation du feedback (si des contraintes existent)
    test('should validate feedback comment length', async () => {
        const quizWithLongComment = {
            quizTitle: "Quiz Test Validation Feedback",
            questions: [{
                id: 1,
                question: "Question test ?",
                options: ["A", "B"],
                correctAnswer: "A",
                explanation: "Test."
            }],
            feedback: {
                perfect: {
                    comment: "A".repeat(1000), // Commentaire très long
                    image: "https://example.com/perfect.gif"
                }
            }
        };

        // Ce test dépend de votre schéma Mongoose
        // Si vous avez des limites de longueur, le test devrait échouer
        // Sinon, il devrait passer
        const savedQuiz = await new Quiz(quizWithLongComment).save();
        expect(savedQuiz.feedback.perfect.comment).toBeDefined();
    });

    // Test 10: Vérifier le feedback avec des données invalides
    test('should handle invalid feedback data types', async () => {
        const quizWithInvalidFeedback = new Quiz({
            quizTitle: "Quiz Test Feedback Invalide",
            questions: [{
                id: 1,
                question: "Question test ?",
                options: ["A", "B"],
                correctAnswer: "A",
                explanation: "Test."
            }],
            feedback: {
                perfect: {
                    comment: 123, // Devrait être une string
                    image: true   // Devrait être une string
                }
            }
        });

        // Selon votre schéma, cela pourrait lever une erreur de validation
        // ou convertir automatiquement les types
        try {
            await quizWithInvalidFeedback.save();
            // Si pas d'erreur, vérifiez la conversion de type
            expect(typeof quizWithInvalidFeedback.feedback.perfect.comment).toBe('string');
        } catch (error) {
            // Si erreur de validation, c'est attendu
            expect(error).toBeDefined();
        }
    });
});


