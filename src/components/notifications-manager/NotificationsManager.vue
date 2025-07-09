<template>
  <div class="NotificationManager">
    <ul class="NotificationManager-list" v-if="notifications">
      <li
        v-for="(notification, i) in notifications"
        :key="i"
        class="NotificationManager-item"
      >
        <p class="NotificationManager-text">{{ notification.message }}</p>
        <button @click="notificationsModule.remove(i)">×</button>
      </li>
    </ul>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import Notifications from "@/modules/Notifications";
import type Notification from "@/modules/Notification";

export default Vue.extend({
  name: "NotificationsManager",

  computed: {
    notifications(): Array<Notification> {
      return this.notificationsModule.notifications;
    },
  },

  data() {
    return {
      notificationsModule: new Notifications(),
    };
  },
});
</script>
