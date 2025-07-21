const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Configuration avant tous les tests
beforeAll(async () => {
  console.log('🔄 Démarrage MongoDB Memory Server...');
  
  try {
    // Configuration optimisée pour éviter les timeouts
    mongoServer = await MongoMemoryServer.create({
      binary: {
        version: '6.0.0', // Version stable
      },
      instance: {
        dbName: 'quizzik_test',
        port: undefined, // Port automatique
      }
    });
    
    const mongoUri = mongoServer.getUri();
    console.log(`📍 URI: ${mongoUri}`);
    
    // Options de connexion optimisées
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 20000, // 20s pour sélectionner le serveur
      socketTimeoutMS: 30000, // 30s pour les opérations
    });
    
    console.log('✅ MongoDB Memory Server connecté');
  } catch (error) {
    console.error('❌ Erreur MongoDB Memory Server:', error.message);
    throw error;
  }
}, 90000); // Timeout de 90 secondes (cohérent avec jest.config)

// Nettoyage avant chaque test
beforeEach(async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      try {
        await collections[key].deleteMany({});
      } catch (error) {
        console.warn(`⚠️ Nettoyage ${key}:`, error.message);
      }
    }
  }
});

// Fermeture après tous les tests
afterAll(async () => {
  try {
    console.log('🔄 Fermeture MongoDB...');
    
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    if (mongoServer) {
      await mongoServer.stop();
    }
    
    console.log('✅ MongoDB fermé');
  } catch (error) {
    console.error('❌ Erreur fermeture:', error.message);
  }
}, 30000); // 30 secondes pour la fermeture