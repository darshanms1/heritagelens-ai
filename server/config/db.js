/**
 * db.js - Database Configuration
 * Supports optional external MongoDB / DocumentDB persistence via MONGODB_URI.
 * By default, HeritageLens AI operates in standalone deterministic mode using
 * verified ASI knowledge bases (knowledgeBase.json, sites.json, monuments.json).
 */

async function initDatabase() {
  const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;

  if (!mongoUri) {
    console.log('[Database] Operating with verified local ASI datasets (knowledgeBase.json, sites.json, monuments.json).');
    return { connected: false, type: 'local-json' };
  }

  try {
    // Try to dynamically load mongoose if installed
    const mongoose = require('mongoose');
    console.log('[Database] Connecting to MongoDB via environment variable...');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('[Database] ✓ Successfully connected to MongoDB.');
    return { connected: true, type: 'mongodb' };
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      console.log('[Database] MONGODB_URI detected. Install mongoose (npm install mongoose) to activate MongoDB persistence.');
    } else {
      console.warn('[Database] Notice: MongoDB connection failed:', err.message);
      console.log('[Database] Falling back to bundled ASI knowledge bases.');
    }
    return { connected: false, type: 'local-json', error: err.message };
  }
}

module.exports = { initDatabase };
