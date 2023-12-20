const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const app = express();
const port = 3000;

// BodyParser Middleware to handle JSON payloads
app.use(bodyParser.json());

// Initialize Firebase Admin SDK
const serviceAccount = require('./path/to/your/firebase-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://your-firebase-db-url.firebaseio.com'
});

app.post('/add-record', async (req, res) => {
    const db = admin.database();
    const ref = db.ref('records');
    const payload = req.body;

    // Add record with a timestamp
    const newRecordRef = ref.push();
    await newRecordRef.set({...payload, timestamp: admin.database.ServerValue.TIMESTAMP});

    // Set a TTL for the record (1 hour)
    setTimeout(async () => {
        await newRecordRef.remove();
    }, 3600000); // 1 hour in milliseconds

    // Retrieve and count all records
    const snapshot = await ref.once('value');
    const records = snapshot.val();
    const count = records ? Object.keys(records).length : 0;

    res.json({ count });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
