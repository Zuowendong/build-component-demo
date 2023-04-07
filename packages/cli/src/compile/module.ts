import fse from "fs-extra";
import { build } from "vite";
import { resolve } from "path";
import { SRC_DIR, ES_DIR, UMD_DIR, PUBLIC_DIR_INDEXES } from "../shared/constant.js";

const { copy, ensureFileSync, readdir, removeSync, pathExistsSync, lstatSync } = fse;

export const isPublicDir = (dir: string): boolean =>
	PUBLIC_DIR_INDEXES.some((index) => pathExistsSync(resolve(dir, index)));
export async function getPublicDirs(): Promise<string[]> {
	const srcDir: string[] = await readdir(SRC_DIR);
	return srcDir.filter((filename: string) => isPublicDir(resolve(SRC_DIR, filename)));
}
export const isDir = (file: string): boolean => pathExistsSync(file) && lstatSync(file).isDirectory();
export const isDTS = (file: string): boolean => pathExistsSync(file) && file.endsWith(".d.ts");

export async function compileModule() {
	const dest = ES_DIR;
	// 将ui/src复制到es文件夹下
	await copy(SRC_DIR, dest);
	const moduleDir: string[] = await readdir(dest);
	await Promise.all(
		moduleDir.map((filename: string) => {
			const file: string = resolve(dest, filename);
			isDir(file) && ensureFileSync(resolve(file, `./style/index.mjs`));
			return isDir(file) ? compileDir(file) : null;
		})
	);
}

export async function compileDir(dir: string) {
	const dirs = await readdir(dir);
	await Promise.all(
		dirs.map((filename) => {
			const file = resolve(dir, filename);
			if (isDTS(file) || filename === "style") {
				return Promise.resolve();
			}
			return compileFile(file);
		})
	);
}

export async function compileFile(file: string) {
	isDir(file) && (await compileDir(file));
}

export interface BundleBuildOptions {
	fileName: string;
	output: string;
	format: "es" | "cjs" | "umd";
	emptyOutDir: boolean;
}

export async function compileBundle() {
	const buildOptions: BundleBuildOptions[] = [
		{
			format: "es",
			fileName: `ui.esm.js`,
			output: ES_DIR,
			emptyOutDir: false,
		},
		{
			format: "umd",
			fileName: `ui.js`,
			output: UMD_DIR,
			emptyOutDir: true,
		},
	];
	const tasks = buildOptions.map((options) => {
		const { fileName, output, format, emptyOutDir } = options;
		build({
			build: {
				minify: format == "cjs" ? false : "esbuild",
				emptyOutDir,
				copyPublicDir: false,
				lib: {
					name: "ui",
					formats: [format],
					fileName: () => fileName,
					entry: resolve(ES_DIR, "index.bundle.mjs"),
				},
				rollupOptions: {
					external: ["vue"],
					output: {
						dir: output,
						exports: "named",
						globals: {
							vue: "Vue",
						},
					},
				},
			},
		});
	});
	await Promise.all(tasks);
}
