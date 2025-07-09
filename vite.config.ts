import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import legacy from "@vitejs/plugin-legacy";
import vue2 from "@vitejs/plugin-vue2";
import postcssNesting from "postcss-nesting";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    base: env.VITE_BASE_URL,
    plugins: [
      vue2(),
      legacy({
        targets: ["ie >= 11", "chrome >= 61"],
        additionalLegacyPolyfills: ["regenerator-runtime/runtime"],
      }),
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    css: {
      postcss: {
        plugins: [
          require("@tailwindcss/postcss"),
          require("autoprefixer"),
          postcssNesting,
        ],
      },
    },
  };
});
