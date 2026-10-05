const process = require('node:process');
const { initializeApp, cert } = require('firebase-admin/app');
const dotenv = require('dotenv');
dotenv.config();

const isTestEnv = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;

let adminApp;

if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
  try {
    const path = require('path');
    const serviceAccountPath = path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    const serviceAccount = require(serviceAccountPath);
    adminApp = initializeApp({
      credential: cert(serviceAccount)
    });
    console.log("Firebase Admin Initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
  }
} else if (!isTestEnv) {
  console.warn("FIREBASE_SERVICE_ACCOUNT_PATH not found in environment. Firebase Admin not initialized.");
}

module.exports = adminApp;
