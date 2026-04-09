import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import("next").NextConfig} */
const nextConfig = {
  reactCompiler: true,
  reactStrictMode: true,
  turbopack: {
    // Ensure Turbopack resolves from this project (not a parent lockfile).
    root: __dirname,
  },
};

export default nextConfig;

