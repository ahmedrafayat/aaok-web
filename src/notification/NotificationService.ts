import { Expo, ExpoPushTicket } from 'expo-server-sdk';
import { NotificationMessage } from './NotificationMessage';

class NotificationService {
  private expoInstance: Expo;

  constructor() {
    this.expoInstance = new Expo();
  }

  async sendPushNotification(pushToken: string, message: NotificationMessage) {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      return;
    }

    const tickets: ExpoPushTicket[] = [];

    try {
      const ticket = await this.expoInstance.sendPushNotificationsAsync([
        {
          to: pushToken,
          title: message.title,
          body: message.body,
          data: message.data,
          sound: message.sound,
        },
      ]);
      tickets.push(...ticket);
    } catch (error) {
      console.error(error);
    }

    console.log('-> tickets', tickets);
  }
}

export const notificationService = new NotificationService();
