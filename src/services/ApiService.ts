import Notification from "@/modules/Notification";
import Notifications from "@/modules/Notifications";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default class ApiService {
  private static baseUrl = BASE_URL;
  private static notificationModule = new Notifications();

  private static _buildUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint}`;
  }

  static async get<T>(endpoint: string): Promise<T> {
    const url = this._buildUrl(endpoint);

    const response = await fetch(url, {
      method: "GET",
    });

    // Assume every 404 is no results due to the lack of info in the response
    if (response.status === 404) {
      return null as unknown as T;
    }

    if (!response.ok) {
      const notification = new Notification(
        `HTTP ${response.status}: ${response.statusText}`
      );
      this.notificationModule.add(notification);

      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
}
