import { defineConfig, globalIgnores } from "eslint/config";
import js from "@eslint/js";

export default defineConfig([
  js.configs.recommended,
  globalIgnores(["node_modules", "dist", "build", ".git"]),
]);
