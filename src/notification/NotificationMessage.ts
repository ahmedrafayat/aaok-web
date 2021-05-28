export class NotificationMessage {
  static readonly DEFAULT_NOTIFICATION_SOUND: 'default' = 'default';

  constructor(
    public title: string = '',
    public body: string = '',
    public data: Record<string, unknown> = {},
    public sound:
      | 'default'
      | null
      | {
          critical?: boolean;
          name?: 'default' | null;
          volume?: number;
        } = NotificationMessage.DEFAULT_NOTIFICATION_SOUND
  ) {}
}
