import path from "node:path";
import { defineConfig } from "vitest/config";

const alias = { "@": path.resolve(__dirname) };

export default defineConfig({
  resolve: { alias },
  oxc: { jsx: { runtime: "automatic" } },
  test: {
    globals: false,
    server: { deps: { inline: ["next-auth"] } },
    projects: [
      {
        extends: true,
        test: {
          name: "node",
          environment: "node",
          include: ["__tests__/**/*.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "jsdom",
          environment: "jsdom",
          include: ["__tests__/**/*.test.tsx"],
          setupFiles: ["./vitest.setup.ts"],
        },
      },
    ],
  },
});
