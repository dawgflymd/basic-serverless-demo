const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');

admin.initializeApp();

const app = express();
app.use(bodyParser.json());

app.post('/add-record', async (req, res) => {
    const payload = req.body;
    const db = admin.database();
    const ref = db.ref('records');

    // Add the record with a timestamp
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

    res.send({ count });
});

exports.api = functions.https.onRequest(app);
