import type { AutocompleteService } from "@/models";

export default class AutocompleteFieldModule<T> {
  service: AutocompleteService<T>;
  debounceTime: number;
  minCharacters: number;
  private timer: number | null = null;

  constructor(
    service: AutocompleteService<T>,
    debounceTime = 0,
    minCharacters = 3
  ) {
    this.debounceTime = debounceTime;
    this.service = service;
    this.minCharacters = minCharacters;
  }

  public async getSuggestions(query: string): Promise<T[]> {
    return this.debounceTime > 0
      ? this._getSuggestionsDebounced(query)
      : this._getSuggestions(query);
  }

  private async _getSuggestions(query: string): Promise<T[]> {
    if (!query.trim() || query.trim().length < this.minCharacters) {
      return [];
    }
    return await this.service.getSuggestions(query);
  }

  private async _getSuggestionsDebounced(query: string): Promise<T[]> {
    return new Promise((resolve) => {
      if (this.timer) {
        clearTimeout(this.timer);
      }

      this.timer = window.setTimeout(async () => {
        const suggestions = await this._getSuggestions(query);
        resolve(suggestions);
      }, this.debounceTime);
    });
  }

  public destroy() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
}
