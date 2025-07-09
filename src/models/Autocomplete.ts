export interface AutocompleteService<T> {
  getSuggestions(query: string): Promise<T[]>;
}

export interface SuggestionItem {
  id: string | number;
  name: string;
}
