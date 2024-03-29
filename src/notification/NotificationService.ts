import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { NotificationMessage } from './NotificationMessage';

class NotificationService {
  private expoInstance: Expo;

  constructor() {
    this.expoInstance = new Expo();
  }

  async sendPushNotification(pushTokens: string[], message: NotificationMessage, onError?: () => void) {
    const notifications: ExpoPushMessage[] = [];
    pushTokens.forEach((token) => {
      if (!Expo.isExpoPushToken(token)) {
        console.error(`Push token ${token} is not a valid Expo push token`);
      } else {
        notifications.push({
          to: token,
          title: message.title,
          body: message.body,
          data: message.data,
          sound: message.sound,
        });
      }
    });

    if (notifications.length < 1) {
      return;
    }

    // const tickets: ExpoPushTicket[] = [];
    const chunks = this.expoInstance.chunkPushNotifications(notifications);
    // TODO: do something with failed tickets
    const tickets: ExpoPushTicket[] = [];

    await (async () => {
      for (const chunk of chunks) {
        try {
          const receipts = await this.expoInstance.sendPushNotificationsAsync(chunk);
          tickets.push(...receipts);
        } catch (error) {
          console.error(error);
        }
      }
    })();

    tickets.forEach((ticket) => {
      if (ticket.status === 'ok') {
        console.log('NOTIFICATION SERVICE: Successfully sent ticket' + ticket.id);
      } else if (ticket.status === 'error') {
        console.error(
          'NOTIFICATION SERVICE: Failed to send ticket MESSAGE:' +
            ticket.message +
            '\n ERROR: ' +
            (ticket.details?.error || 'Unknown Error')
        );
      }
    });

    if (tickets.some((ticket) => ticket.status === 'error') && onError) {
      onError();
    }
  }
}

export const notificationService = new NotificationService();
