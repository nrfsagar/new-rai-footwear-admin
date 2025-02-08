import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';
import axios from 'axios';

// Initialize Firebase (place your config)
const firebaseConfig = {
  // Your Firebase config here
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Function to send push notification
export async function sendPushNotification(expoPushToken:string, title:string, body:string) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: title,
    body: body,
    // data: data,
  };

  try {
    const response = await axios.post('https://exp.host/--/api/v2/push/send', message, {
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error sending notification:', error);
   
  }
}