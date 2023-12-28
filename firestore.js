const { initializeApp,cert} = require('firebase-admin/app');
const { getFirestore} = require('firebase-admin/firestore');
const { google } = require('googleapis');

require('dotenv').config()
const credentialsPath = process.env.NODE_ENV === 'production'
    ? '/etc/secrets/credentials.json'
    : './etc/secrets/credentials.json';
  const serviceAccount = require(credentialsPath);
 const app =  initializeApp({
    credential: cert(serviceAccount)
  });
  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccount,
    scopes: ['https://www.googleapis.com/auth/spreadsheets','https://www.googleapis.com/auth/documents','https://www.googleapis.com/auth/drive'],
  });
const db = getFirestore(app);  
const sheets = google.sheets({ version: 'v4', auth });
const docs = google.docs({ version: 'v1', auth });
const drive = google.drive({ version: 'v3', auth });
module.exports = {db,sheets,docs,drive}