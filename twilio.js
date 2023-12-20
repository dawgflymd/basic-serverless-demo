const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = Runtime.getAssets()['/firebase-service-account-key.json'].path;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://nexuslink-prod2.firebaseio.com'
});

exports.handler = async function(context, event, callback) {
    const db = admin.database();
    const ref = db.ref('records');
    console.log(event);

    // Handling POST request
    if (context.REQUEST_METHOD === 'POST') {
        const payload = event;
        console.log(payload);

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

        return callback(null, count.toString());
    } else {
        return callback(null, 'Only POST requests are accepted');
    }
};
