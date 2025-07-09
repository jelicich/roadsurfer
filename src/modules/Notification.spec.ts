import { describe, it, expect } from "vitest";
import Notification from "./Notification";

describe("Notification", () => {
  it("should create a notification with a message", () => {
    const message = "Test notification message";
    const notification = new Notification(message);

    expect(notification).toBeDefined();
    expect(notification.message).toBe(message);
  });

  it("should store the message exactly as provided", () => {
    const messages = [
      "Simple message",
      "Message with numbers 123",
      "Message with symbols !@#$%^&*()",
      "Multi-line\nmessage",
      "",
      " Message with whitespace ",
    ];

    messages.forEach((message) => {
      const notification = new Notification(message);
      expect(notification.message).toBe(message);
    });
  });

  it("should be instantiable multiple times with different messages", () => {
    const notification1 = new Notification("First message");
    const notification2 = new Notification("Second message");

    expect(notification1.message).toBe("First message");
    expect(notification2.message).toBe("Second message");

    expect(notification1).not.toBe(notification2);
  });
});
