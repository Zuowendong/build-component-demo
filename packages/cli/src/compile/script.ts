import fse from "fs-extra";
import { resolve } from "path";
import { transformAsync, type BabelFileResult } from "@babel/core";

const { writeFileSync, readdirSync, readFileSync, removeSync, writeFile, pathExistsSync } = fse;

export function getScriptExtname() {
	return ".mjs";
}

export const bigCamelize = (s: string): string => camelize(s).replace(s.charAt(0), s.charAt(0).toUpperCase());
export const camelize = (s: string): string => s.replace(/-(\w)/g, (_: any, p: string) => p.toUpperCase());

export async function compileESEntry(dir: string, publicDirs: string[]) {
	const imports: string[] = [];
	const plugins: string[] = [];
	const exports: string[] = [];
	const cssImports: string[] = [];
	const publicComponents: string[] = [];
	const scriptExtname = getScriptExtname();

	publicDirs.forEach((dirname: string) => {
		const publicComponent = bigCamelize(dirname);
		const module = `'./${dirname}/index${scriptExtname}'`;

		publicComponents.push(publicComponent);
		imports.push(`import ${publicComponent} from ${module}`);
		exports.push(`export * from ${module}`);
		plugins.push(`${publicComponent}.install && app.use(${publicComponent})`);
		cssImports.push(`import './${dirname}/style/index${scriptExtname}'`);
	});

	const install = `
function install(app) {
  ${plugins.join("\n  ")}
}
`;

	const indexTemplate = `\
${imports.join("\n")}\n
${exports.join("\n")}\n
${install}
export {
  version,
  install,
  ${publicComponents.join(",\n  ")}
}

export default {
  version,
  install,
  ${publicComponents.join(",\n  ")}
}
`;

	const styleTemplate = `\
${cssImports.join("\n")}
`;

	const bundleTemplate = `\
${imports.join("\n")}\n
${exports.join("\n")}\n
${cssImports.join("\n")}\n
${install}
export {
  version,
  install,
  ${publicComponents.join(",\n  ")}
}

export default {
  version,
  install,
  ${publicComponents.join(",\n  ")}
}
`;

	await Promise.all([
		writeFile(resolve(dir, "index.mjs"), indexTemplate, "utf-8"),
		writeFile(resolve(dir, "index.bundle.mjs"), bundleTemplate, "utf-8"),
		writeFile(resolve(dir, "style.mjs"), styleTemplate, "utf-8"),
	]);
}

export async function compileScript(script: string, file: string) {
	let { code } = (await transformAsync(script, {
		filename: file,
	})) as BabelFileResult;

	// if (code) {
	// 	code = resolveDependence(file, code);
	// 	code = extractStyleDependencies(file, code, IMPORT_CSS_RE);
	// 	code = extractStyleDependencies(file, code, IMPORT_LESS_RE);
	// 	removeSync(file);
	// 	writeFileSync(replaceExt(file, getScriptExtname()), code, "utf8");
	// }
}

export async function compileScriptFile(file: string) {
	const sources = readFileSync(file, "utf-8");
	await compileScript(sources, file);
}
