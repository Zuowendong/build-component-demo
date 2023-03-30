import { defineConfig } from "rollup";
import { alias } from "build-component-demo";

export default defineConfig({
	input: "./index.js",
	output: {
		file: "dist/index.js",
		format: "es",
	},
	plugins: [
		alias({
			// entries: {
			// 	"@": "./utils",
			// },
			entries: [
				{
					find: "@",
					replacement: "./utils",
				},
			],
		}),
	],
});
