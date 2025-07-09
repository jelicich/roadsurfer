<template>
  <div id="app">
    <router-view />
    <router-view name="modal" />
    <NotificationsManager />
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import NotificationsManager from "@/components/notifications-manager/NotificationsManager.vue";

export default Vue.extend({
  name: "App",

  components: {
    NotificationsManager,
  },
});
</script>
