import * as admin from 'firebase-admin';
import { env } from '../config/env';

class FirebaseService {
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private init() {
    try {
      // If no credentials, we gracefully skip initialization
      if (!env.FIREBASE_PROJECT_ID || !env.FIREBASE_CLIENT_EMAIL || !env.FIREBASE_PRIVATE_KEY) {
        console.warn('Firebase Service: Missing credentials in .env. FCM push notifications will be disabled.');
        return;
      }

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: env.FIREBASE_PROJECT_ID,
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
          // Replace escaped newlines with actual newlines
          privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });

      this.isInitialized = true;
      console.log('Firebase Service initialized successfully.');
    } catch (error) {
      console.error('Firebase Service initialization failed:', error);
    }
  }

  /**
   * Send a push notification to a specific FCM device token
   */
  public async sendPushNotification(deviceToken: string, title: string, body: string, data?: any) {
    if (!this.isInitialized) {
      console.warn('Firebase Service is not initialized. Skipping push notification.');
      return;
    }

    try {
      await admin.messaging().send({
        token: deviceToken,
        notification: {
          title,
          body,
        },
        data: data || {},
      });
      console.log(`Push notification sent successfully to ${deviceToken}`);
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  /**
   * Send a push notification to multiple FCM device tokens
   */
  public async sendMulticastNotification(deviceTokens: string[], title: string, body: string, data?: any) {
    if (!this.isInitialized) {
      console.warn('Firebase Service is not initialized. Skipping multicast push notification.');
      return;
    }

    if (deviceTokens.length === 0) return;

    try {
      const response = await admin.messaging().sendEachForMulticast({
        tokens: deviceTokens,
        notification: {
          title,
          body,
        },
        data: data || {},
      });
      console.log(`Multicast push notification sent. Success: ${response.successCount}, Failure: ${response.failureCount}`);
    } catch (error) {
      console.error('Error sending multicast push notification:', error);
    }
  }
}

export const firebaseService = new FirebaseService();
