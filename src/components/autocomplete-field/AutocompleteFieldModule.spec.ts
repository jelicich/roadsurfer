import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { AutocompleteService } from "@/models";
import AutocompleteFieldModule from "./AutocompleteFieldModule";

// Unit tests for AutocompleteFieldModule
describe("AutocompleteFieldModule", () => {
  // Setup a mock for AutocompleteService
  type TestItem = { id: number; name: string };
  const mockSuggestions: TestItem[] = [
    { id: 1, name: "First item" },
    { id: 2, name: "Second item" },
    { id: 3, name: "Third item" },
  ];

  let mockService: AutocompleteService<TestItem>;
  let getSuggestionsSpy: ReturnType<
    typeof vi.fn<[string], Promise<TestItem[]>>
  >;

  beforeEach(() => {
    // Create a fresh mock service before each test
    getSuggestionsSpy = vi
      .fn<[string], Promise<TestItem[]>>()
      .mockResolvedValue(mockSuggestions);
    mockService = {
      getSuggestions: getSuggestionsSpy,
    };

    // Setup fake timers for debounce tests
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Clean up after each test
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should initialize with default parameters", () => {
    const module = new AutocompleteFieldModule(mockService);

    expect(module.service).toBe(mockService);
    expect(module.debounceTime).toBe(0);
    expect(module.minCharacters).toBe(3);
  });

  it("should initialize with custom parameters", () => {
    const debounceTime = 300;
    const minCharacters = 2;
    const module = new AutocompleteFieldModule(
      mockService,
      debounceTime,
      minCharacters
    );

    expect(module.service).toBe(mockService);
    expect(module.debounceTime).toBe(debounceTime);
    expect(module.minCharacters).toBe(minCharacters);
  });

  it("should return empty array for empty query", async () => {
    const module = new AutocompleteFieldModule<TestItem>(mockService);

    const result = await module.getSuggestions("");

    expect(result).toEqual([]);
    expect(getSuggestionsSpy).not.toHaveBeenCalled();
  });

  it("should return empty array if query is shorter than minCharacters", async () => {
    const module = new AutocompleteFieldModule<TestItem>(mockService, 0, 3);

    const result = await module.getSuggestions("ab");

    expect(result).toEqual([]);
    expect(getSuggestionsSpy).not.toHaveBeenCalled();
  });

  it("should call service.getSuggestions for valid query without debounce", async () => {
    const module = new AutocompleteFieldModule<TestItem>(mockService);
    const query = "valid query";

    const result = await module.getSuggestions(query);

    expect(result).toEqual(mockSuggestions);
    expect(getSuggestionsSpy).toHaveBeenCalledTimes(1);
    expect(getSuggestionsSpy).toHaveBeenCalledWith(query);
  });

  it("should debounce calls to service.getSuggestions", async () => {
    const debounceTime = 300;
    const module = new AutocompleteFieldModule<TestItem>(
      mockService,
      debounceTime
    );
    const query = "valid query";

    // Start the async process but don't await it yet
    const resultPromise = module.getSuggestions(query);

    // The service should not have been called immediately
    expect(getSuggestionsSpy).not.toHaveBeenCalled();

    // Advance time to trigger the debounced function
    vi.advanceTimersByTime(debounceTime);

    // Now await the promise
    const result = await resultPromise;

    expect(result).toEqual(mockSuggestions);
    expect(getSuggestionsSpy).toHaveBeenCalledTimes(1);
    expect(getSuggestionsSpy).toHaveBeenCalledWith(query);
  });

  it("should cancel previous debounced call when calling getSuggestions again", async () => {
    const debounceTime = 300;
    const module = new AutocompleteFieldModule<TestItem>(
      mockService,
      debounceTime
    );

    // Start a first request (intentionally not awaited to test cancellation)
    module.getSuggestions("first query");

    // Advance time a bit, but not enough to trigger the first request
    vi.advanceTimersByTime(100);

    // Start a second request
    const secondPromise = module.getSuggestions("second query");

    // Complete the debounce time
    vi.advanceTimersByTime(debounceTime);

    // Await the second promise
    const result = await secondPromise;

    // Only the second query should have been executed
    expect(result).toEqual(mockSuggestions);
    expect(getSuggestionsSpy).toHaveBeenCalledTimes(1);
    expect(getSuggestionsSpy).toHaveBeenCalledWith("second query");
  });

  it("should clear the timer when destroy is called", () => {
    const debounceTime = 300;
    const module = new AutocompleteFieldModule<TestItem>(
      mockService,
      debounceTime
    );
    const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");

    // Start a debounced request
    module.getSuggestions("test query");

    // Call destroy
    module.destroy();

    // The timer should have been cleared
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
