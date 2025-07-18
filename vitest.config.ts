import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue2";
import { fileURLToPath } from "node:url";
import { mergeConfig } from "vite";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    plugins: [vue()],
    test: {
      environment: "jsdom",
      globals: true,
      include: ["**/*.spec.ts"],
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  })
);
