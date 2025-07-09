<template>
  <div class="AutocompleteField">
    <label
      v-if="label"
      for="autocomplete-input"
      class="AutocompleteField-label"
    >
      {{ label }}
    </label>
    <div class="AutocompleteField-inputWrapper">
      <!-- TODO: set unique id -->
      <input
        v-model="inputValue"
        type="text"
        class="AutocompleteField-input"
        :placeholder="placeholder"
        id="autocomplete-input"
        @input="getSuggestions($event)"
      />
      <button class="AutocompleteField-clear" @click="clearField()">×</button>
    </div>
    <ul v-if="hasSuggestions" class="AutocompleteField-list" role="listbox">
      <li
        v-for="suggestion in suggestions"
        :key="suggestion.id"
        class="AutocompleteField-item"
        role="option"
      >
        <button
          class="AutocompleteField-button"
          @click="selectItem(suggestion)"
          tabindex="-1"
        >
          {{ suggestion.name }}
        </button>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import type { PropType } from "vue";
import AutocompleteFieldModule from "@/components/autocomplete-field/AutocompleteFieldModule";
import type { AutocompleteService, SuggestionItem } from "@/models";

export default Vue.extend({
  name: "AutocompleteField",

  props: {
    autocompleteService: {
      type: Object as PropType<AutocompleteService<SuggestionItem>>,
      required: true,
    },
    label: {
      type: String,
      required: false,
      default: "",
    },
    placeholder: {
      type: String,
      required: false,
      default: "",
    },
    debounceTime: {
      type: Number,
      required: false,
      default: 0,
    },
    minCharacters: {
      type: Number,
      required: false,
      default: 3,
    },
  },

  computed: {
    hasSuggestions(): boolean {
      return Boolean((this.suggestions as SuggestionItem[]).length);
    },
  },

  data() {
    return {
      autocompleteModule: new AutocompleteFieldModule<SuggestionItem>(
        this.autocompleteService,
        this.debounceTime,
        this.minCharacters
      ),
      suggestions: [] as SuggestionItem[],
      inputValue: "",
    };
  },

  beforeDestroy() {
    this.autocompleteModule.destroy();
  },

  methods: {
    async getSuggestions(event: Event) {
      const target = event.target as HTMLInputElement;
      this.suggestions = await this.autocompleteModule.getSuggestions(
        target.value
      );
    },
    selectItem(selectedItem: SuggestionItem) {
      this.inputValue = selectedItem.name;
      this.suggestions = [];
      this.$emit("change", selectedItem);
    },
    clearField() {
      this.inputValue = "";
      this.suggestions = [];
      this.$emit("change", null);
    },
    // TODO: handle keyboard events
  },
});
</script>
