// firebase.js
const admin = require('firebase-admin');
const path = require('path');

// Path to your service account key JSON file
const serviceAccount = require(path.join(__dirname, 'path/to/service-account-key.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Optionally, specify the database URL if needed
  // databaseURL: 'https://<DATABASE_NAME>.firebaseio.com'
});

module.exports = admin;


// sendNotification.js
const admin = require('./firebase');

// Function to send notification to a topic
const sendNotificationToTopic = async (topic, title, body, data = {}) => {
  const message = {
    notification: {
      title: title,
      body: body,
    },
    data: data, // Optional custom data
    topic: topic,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Example usage
const topic = 'news';
const title = 'Breaking News!';
const body = 'Stay updated with the latest news.';
const data = { url: 'https://news.example.com' };

sendNotificationToTopic(topic, title, body, data);

const message = {
  notification: {
    title: title,
    body: body,
  },
  data: data,
  topic: topic,
  android: {
    priority: 'high',
    notification: {
      clickAction: 'FLUTTER_NOTIFICATION_CLICK', // Example for Android
    },
  },
  apns: {
    payload: {
      aps: {
        sound: 'default',
      },
    },
  },
  webpush: {
    headers: {
      Urgency: 'high',
    },
    notification: {
      requireInteraction: 'true',
    },
  },
};
