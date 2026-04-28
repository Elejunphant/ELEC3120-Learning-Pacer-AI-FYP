import path from "node:path";

// Constrain Tailwind v4's Oxide scanner to the app source tree. Without
// an explicit `base`, @tailwindcss/postcss walks the entire workspace
// (~1.3 GB of node_modules plus caches) and the scanner spins
// indefinitely on something in that tree — observed as a postcss worker
// pegged at >100 % CPU / 1.7 GB RAM until Turbopack times out. Pointing
// `base` at `src/` reduces the compile from an infinite hang to ~700 ms.
const base = path.join(process.cwd(), "src");

const config = {
  plugins: {
    "@tailwindcss/postcss": { base },
  },
};

export default config;
