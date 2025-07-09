<template>
  <div class="StationsSearch">
    <AutocompleteField
      label="Station"
      placeholder="Start typing..."
      :debounce-time="debounceTime"
      :autocomplete-service="service"
      :min-characters="minCharacters"
      @change="onStationSelected"
    />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapActions } from "vuex";
import AutocompleteField from "@/components/autocomplete-field/AutocompleteField.vue";
import StationsService from "@/services/StationsService";
import type { Station } from "@/models";

export default Vue.extend({
  name: "StationsSearch",

  components: {
    AutocompleteField,
  },

  data() {
    return {
      service: new StationsService(),
      debounceTime: 200,
      minCharacters: 2,
    };
  },

  methods: {
    ...mapActions("stations", ["selectStation"]),

    onStationSelected(selectedStation: Station | null) {
      this.selectStation(selectedStation);
    },
  },
});
</script>
