import { shallowMount, mount, type Wrapper } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type Vue from "vue";
import AutocompleteField from "./AutocompleteField.vue";
import AutocompleteFieldModule from "./AutocompleteFieldModule";
import type { AutocompleteService } from "@/models";

// Interface for the Vue component instance
interface AutocompleteFieldVue<T> extends Vue {
  autocompleteModule: {
    getSuggestions: (query: string) => Promise<T[]>;
    destroy: () => void;
  };
  suggestions: T[];
  inputValue: string;
}

// Mock the AutocompleteFieldModule
vi.mock("./AutocompleteFieldModule", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      getSuggestions: vi.fn(),
      destroy: vi.fn(),
    })),
  };
});

describe("AutocompleteField", () => {
  // Mock data
  type TestItem = { id: number; name: string };

  const mockSuggestions: TestItem[] = [
    { id: 1, name: "First suggestion" },
    { id: 2, name: "Second suggestion" },
    { id: 3, name: "Third suggestion" },
  ];

  let mockAutocompleteService: AutocompleteService<TestItem>;
  let wrapper: Wrapper<Vue>;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Create a mock autocomplete service
    mockAutocompleteService = {
      getSuggestions: vi.fn().mockResolvedValue(mockSuggestions),
    };
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
  });

  it("renders properly with default props", () => {
    wrapper = shallowMount(AutocompleteField, {
      propsData: {
        autocompleteService: mockAutocompleteService,
      },
    });

    // Input should exist
    expect(wrapper.find("input.AutocompleteField-input").exists()).toBe(true);

    // Label should not exist (default is empty string)
    expect(wrapper.find("label.AutocompleteField-label").exists()).toBe(false);

    // Suggestions list should not exist initially
    expect(wrapper.find("ul.AutocompleteField-list").exists()).toBe(false);
  });

  it("renders label when provided", () => {
    const label = "Test Label";
    wrapper = shallowMount(AutocompleteField, {
      propsData: {
        autocompleteService: mockAutocompleteService,
        label,
      },
    });

    const labelElement = wrapper.find("label.AutocompleteField-label");
    expect(labelElement.exists()).toBe(true);
    expect(labelElement.text()).toBe(label);
  });

  it("applies placeholder to input when provided", () => {
    const placeholder = "Type to search...";
    wrapper = shallowMount(AutocompleteField, {
      propsData: {
        autocompleteService: mockAutocompleteService,
        placeholder,
      },
    });

    const input = wrapper.find("input.AutocompleteField-input");
    expect(input.attributes("placeholder")).toBe(placeholder);
  });

  it("initializes AutocompleteFieldModule with correct parameters", () => {
    const debounceTime = 300;
    const minCharacters = 2;

    wrapper = shallowMount(AutocompleteField, {
      propsData: {
        autocompleteService: mockAutocompleteService,
        debounceTime,
        minCharacters,
      },
    });

    // Check that AutocompleteFieldModule was constructed with the right params
    expect(AutocompleteFieldModule).toHaveBeenCalledWith(
      mockAutocompleteService,
      debounceTime,
      minCharacters
    );
  });

  it("calls getSuggestions when input value changes", async () => {
    // Use mount instead of shallowMount to test the interaction
    wrapper = mount(AutocompleteField, {
      propsData: {
        autocompleteService: mockAutocompleteService,
      },
    });

    // Get the mocked autocompleteModule
    const vm = wrapper.vm as AutocompleteFieldVue<TestItem>;
    const mockGetSuggestions = vi.fn().mockResolvedValue(mockSuggestions);
    vm.autocompleteModule.getSuggestions = mockGetSuggestions;

    // Simulate user input
    const input = wrapper.find("input.AutocompleteField-input");
    await input.setValue("test");
    await input.trigger("input");

    // Check that getSuggestions was called
    expect(mockGetSuggestions).toHaveBeenCalledWith("test");
  });

  it("displays suggestions when available", async () => {
    wrapper = shallowMount(AutocompleteField, {
      propsData: {
        autocompleteService: mockAutocompleteService,
      },
    });

    // Set suggestions directly
    await wrapper.setData({ suggestions: mockSuggestions });

    // Suggestions list should now be visible
    const suggestionsList = wrapper.find("ul.AutocompleteField-list");
    expect(suggestionsList.exists()).toBe(true);

    // Should have the correct number of items
    const items = wrapper.findAll("li.AutocompleteField-item");
    expect(items.length).toBe(mockSuggestions.length);

    // Items should display the correct names
    for (let i = 0; i < mockSuggestions.length; i++) {
      expect(items.at(i).text()).toBe(mockSuggestions[i].name);
    }
  });

  it("selects an item when clicked", async () => {
    wrapper = mount(AutocompleteField, {
      propsData: {
        autocompleteService: mockAutocompleteService,
      },
    });

    // Set suggestions directly
    await wrapper.setData({ suggestions: mockSuggestions });

    // Click the first suggestion
    const firstItem = wrapper.findAll(".AutocompleteField-button").at(0);
    await firstItem.trigger("click");

    // Input value should be updated
    expect((wrapper.vm as AutocompleteFieldVue<TestItem>).inputValue).toBe(
      mockSuggestions[0].name
    );

    // Suggestions should be cleared
    expect((wrapper.vm as AutocompleteFieldVue<TestItem>).suggestions).toEqual(
      []
    );

    // Change event should be emitted with the selected item
    const changeEvents = wrapper.emitted().change;
    expect(changeEvents).toBeTruthy();
    expect(changeEvents?.[0][0]).toEqual(mockSuggestions[0]);
  });

  it("clears the field when clear button is clicked", async () => {
    wrapper = mount(AutocompleteField, {
      propsData: {
        autocompleteService: mockAutocompleteService,
      },
    });

    // Set initial input value and suggestions
    await wrapper.setData({
      inputValue: "some value",
      suggestions: mockSuggestions,
    });

    // Click the clear button
    const clearButton = wrapper.find(".AutocompleteField-clear");
    await clearButton.trigger("click");

    // Input value should be cleared
    expect((wrapper.vm as AutocompleteFieldVue<TestItem>).inputValue).toBe("");

    // Suggestions should be cleared
    expect((wrapper.vm as AutocompleteFieldVue<TestItem>).suggestions).toEqual(
      []
    );

    // Change event should be emitted with null
    const changeEvents = wrapper.emitted().change;
    expect(changeEvents).toBeTruthy();
    expect(changeEvents?.[0][0]).toBeNull();
  });

  it("destroys the autocompleteModule when component is destroyed", () => {
    wrapper = shallowMount(AutocompleteField, {
      propsData: {
        autocompleteService: mockAutocompleteService,
      },
    });

    const vm = wrapper.vm as AutocompleteFieldVue<TestItem>;
    const destroySpy = vi.spyOn(vm.autocompleteModule, "destroy");

    // Destroy the component
    wrapper.destroy();

    // Ensure destroy was called
    expect(destroySpy).toHaveBeenCalled();
  });
});
