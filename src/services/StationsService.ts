import ApiService from "@/services/ApiService";
import type { Station } from "@/models";

export default class StationsService {
  private static readonly ENDPOINTS = {
    STATIONS: "/stations",
    STATIONS_SUGGESTIONS: (query: string) => `/stations?search=${query}`,
  };

  public async getStations(): Promise<Station[]> {
    try {
      return await ApiService.get<Station[]>(
        StationsService.ENDPOINTS.STATIONS
      );
    } catch (error) {
      console.error("Error fetching stations:", error);
      return [];
    }
  }

  public async getSuggestions(query: string): Promise<Station[]> {
    try {
      const data = await ApiService.get<Station[]>(
        StationsService.ENDPOINTS.STATIONS_SUGGESTIONS(query)
      );
      return data ?? [];
    } catch (error) {
      console.error("Error while fetching stations:", error);
      return [];
    }
  }
}
