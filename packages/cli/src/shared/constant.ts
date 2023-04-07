import { resolve } from "path";

export const CWD = process.cwd();

export const SRC_DIR = resolve(CWD, "src");
export const ES_DIR = resolve(CWD, "es");
export const UMD_DIR = resolve(CWD, "umd");
export const PUBLIC_DIR_INDEXES = ["index.vue", "index.tsx", "index.ts", "index.jsx", "index.js"];
