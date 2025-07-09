import { describe, it, expect, beforeEach } from "vitest";
import Notifications from "./Notifications";
import Notification from "./Notification";

describe("Notifications", () => {
  beforeEach(() => {
    // @ts-expect-error - Accessing private static property for testing
    Notifications.instance = undefined;
  });

  describe("Singleton Pattern", () => {
    it("should return the same instance when creating multiple instances", () => {
      const instance1 = new Notifications();
      const instance2 = new Notifications();

      expect(instance1).toBe(instance2);
    });

    it("should share the notifications array across instances", () => {
      const instance1 = new Notifications();
      const instance2 = new Notifications();

      const notification = new Notification("Test notification");
      instance1.add(notification);

      expect(instance2.notifications).toContain(notification);
      expect(instance2.notifications.length).toBe(1);
    });
  });

  describe("add method", () => {
    it("should add a single notification to the notifications array", () => {
      const notifications = new Notifications();
      const notification = new Notification("Test notification");

      notifications.add(notification);

      expect(notifications.notifications).toContain(notification);
      expect(notifications.notifications.length).toBe(1);
    });

    it("should add multiple notifications to the notifications array", () => {
      const notifications = new Notifications();
      const notification1 = new Notification("First notification");
      const notification2 = new Notification("Second notification");
      const notificationArray = [notification1, notification2];

      notifications.add(notificationArray);

      expect(notifications.notifications).toContain(notification1);
      expect(notifications.notifications).toContain(notification2);
      expect(notifications.notifications.length).toBe(2);
    });

    it("should do nothing when adding undefined or null", () => {
      const notifications = new Notifications();

      // @ts-expect-error - Testing with undefined/null
      notifications.add(undefined);
      expect(notifications.notifications.length).toBe(0);

      // @ts-expect-error - Testing with undefined/null
      notifications.add(null);
      expect(notifications.notifications.length).toBe(0);
    });
  });

  describe("remove method", () => {
    it("should remove a notification at a specific index", () => {
      const notifications = new Notifications();
      const notification1 = new Notification("First notification");
      const notification2 = new Notification("Second notification");

      notifications.add([notification1, notification2]);
      expect(notifications.notifications.length).toBe(2);

      notifications.remove(0);

      expect(notifications.notifications.length).toBe(1);
      expect(notifications.notifications[0]).toBe(notification2);
      expect(notifications.notifications).not.toContain(notification1);
    });

    it("should not throw error and handle different indices as expected", () => {
      const notifications = new Notifications();
      const notification1 = new Notification("First notification");
      const notification2 = new Notification("Second notification");

      notifications.add([notification1, notification2]);
      expect(notifications.notifications.length).toBe(2);

      expect(() => notifications.remove(5)).not.toThrow();
      expect(notifications.notifications.length).toBe(2);

      expect(() => notifications.remove(-1)).not.toThrow();
      expect(notifications.notifications.length).toBe(1);
      expect(notifications.notifications[0]).toBe(notification1);
    });
  });

  describe("integration tests", () => {
    it("should correctly manage notifications with mixed operations", () => {
      const notifications = new Notifications();

      const notification1 = new Notification("First notification");
      const notification2 = new Notification("Second notification");
      const notification3 = new Notification("Third notification");

      notifications.add(notification1);
      notifications.add([notification2, notification3]);

      expect(notifications.notifications.length).toBe(3);

      notifications.remove(1);

      expect(notifications.notifications.length).toBe(2);
      expect(notifications.notifications[0]).toBe(notification1);
      expect(notifications.notifications[1]).toBe(notification3);

      const notification4 = new Notification("Fourth notification");
      notifications.add(notification4);

      expect(notifications.notifications.length).toBe(3);
      expect(notifications.notifications[2]).toBe(notification4);
    });
  });
});
