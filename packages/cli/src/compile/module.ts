import fse from "fs-extra";
import { build } from "vite";
import { resolve, relative, extname } from "path";
import glob from "glob";
import { SRC_DIR, ES_DIR, UMD_DIR, PUBLIC_DIR_INDEXES, TYPES_DIR } from "../shared/constant.js";
import { compileESEntry } from "./script.js";
import less from "less";

const { render } = less;

const {
	copy,
	ensureFileSync,
	readdir,
	removeSync,
	pathExistsSync,
	lstatSync,
	unlinkSync,
	writeFileSync,
	readFileSync,
} = fse;

export const isPublicDir = (dir: string): boolean =>
	PUBLIC_DIR_INDEXES.some((index) => pathExistsSync(resolve(dir, index)));
export async function getPublicDirs(): Promise<string[]> {
	const srcDir: string[] = await readdir(SRC_DIR);
	return srcDir.filter((filename: string) => isPublicDir(resolve(SRC_DIR, filename)));
}
export const isDir = (file: string): boolean => pathExistsSync(file) && lstatSync(file).isDirectory();
export const isDTS = (file: string): boolean => pathExistsSync(file) && file.endsWith(".d.ts");

export function clearLessFiles(dir: string) {
	const files = glob.sync(`${dir}/**/*.less`);
	files.forEach(unlinkSync);
}

export function generateReference(moduleDir: string) {
	writeFileSync(
		resolve(moduleDir, "index.d.ts"),
		`\
export * from '${relative(moduleDir, TYPES_DIR)}'
`
	);
}

export async function compileModule() {
	const dest = ES_DIR;
	await copy(SRC_DIR, dest);
	const moduleDir: string[] = await readdir(dest);
	await Promise.all(
		moduleDir.map((filename: string) => {
			const file: string = resolve(dest, filename);
			isDir(file) && ensureFileSync(resolve(file, `./style/index.mjs`));
			return isDir(file) ? compileDir(file) : null;
		})
	);
	const publicDirs = await getPublicDirs();
	await compileESEntry(dest, publicDirs);
	clearLessFiles(dest);
	generateReference(dest);
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

export const isLess = (file: string): boolean => pathExistsSync(file) && extname(file) === ".less";
export const replaceExt = (file: string, ext: string): string => file.replace(extname(file), ext);
export const EMPTY_SPACE_RE = /[\s]+/g;
export const EMPTY_LINE_RE = /[\n\r]*/g;
export const clearEmptyLine = (s: string) => s.replace(EMPTY_LINE_RE, "").replace(EMPTY_SPACE_RE, " ");

export async function compileLess(file: string) {
	console.log(1111111, file);
	const source = readFileSync(file, "utf-8");
	const { css } = await render(source, { filename: file });
	writeFileSync(replaceExt(file, ".css"), clearEmptyLine(css), "utf-8");
}

export async function compileFile(file: string) {
	isLess(file) && (await compileLess(file));
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
			fileName: `ui.umd.js`,
			output: UMD_DIR,
			emptyOutDir: true,
		},
	];
	const tasks = buildOptions.map((options) => {
		const { fileName, output, format, emptyOutDir } = options;
		build({
			build: {
				emptyOutDir,
				copyPublicDir: false,
				lib: {
					name: "demo-ui",
					formats: [format],
					fileName: () => fileName,
					entry: resolve(SRC_DIR, "index.ts"),
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
