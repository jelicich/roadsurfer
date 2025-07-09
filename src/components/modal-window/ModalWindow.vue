<template>
  <transition name="is">
    <div class="ModalWindow" v-if="show" @click.self="$emit('close')">
      <div class="ModalWindow-container">
        <div class="ModalWindow-header">
          <slot name="header">
            <h3>{{ title }}</h3>
          </slot>
          <button class="ModalWindow-close" @click="$emit('close')">×</button>
        </div>

        <div class="ModalWindow-body">
          <slot></slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "ModalWindow",
  props: {
    show: {
      type: Boolean,
      required: true,
      default: false,
    },
    title: {
      type: String,
      default: "",
    },
  },
  mounted() {
    document.body.classList.add("has-modal");
  },
  beforeDestroy() {
    document.body.classList.remove("has-modal");
  },
});
</script>
