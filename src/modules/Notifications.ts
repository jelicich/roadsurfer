import type Notification from "@/modules/Notification";

export default class Notifications {
  static instance: Notifications;
  notifications: Array<Notification> = [];

  constructor() {
    if (Notifications.instance) {
      return Notifications.instance;
    }

    Notifications.instance = this;
  }

  public add(notifications: Notification | Array<Notification>) {
    if (!notifications) return;

    Array.isArray(notifications)
      ? this.notifications.push(...notifications)
      : this.notifications.push(<Notification>notifications);
  }

  public remove(index: number): void {
    this.notifications.splice(index, 1);
  }
}
