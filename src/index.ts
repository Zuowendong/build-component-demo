// https://rollupjs.org/plugin-development/#resolveid
import { Plugin } from "rollup";

interface AliasOptions {
	entries:
		| {
				[k: string]: string;
		  }
		| { find: string; replacement: string }[];
}

export function alias(options: AliasOptions): Plugin {
	const entries = normalizeEntries(options.entries);

	return {
		name: "alias",
		/**
		 *
		 * @param source 当前路径
		 * @param importer 父级路径
		 * @returns
		 */
		resolveId(source: string, importer: string | undefined) {
			// const key = Object.keys(entries).find((e) => {
			// 	return source.startsWith(e);
			// });

			const entry = entries.find((e) => {
				return e.match(source);
			});

			if (!entry) return source;
			// return source.replace(key, entries[key]) + ".js";

			return entry.replace(source);
		},
	};
}

// 规范化格式
function normalizeEntries(entries: AliasOptions["entries"]) {
	if (Array.isArray(entries)) {
		return entries.map(({ find, replacement }) => {
			return new Entry(find, replacement);
		});
	} else {
		return Object.keys(entries).map((key) => {
			return new Entry(key, entries[key]);
		});
	}
}

class Entry {
	constructor(private find: string, private replacement: string) {}

	match(filePath: string) {
		return filePath.startsWith(this.find);
	}

	replace(filePath: string) {
		return filePath.replace(this.find, this.replacement) + ".js";
	}
}
