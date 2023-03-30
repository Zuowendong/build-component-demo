function alias(options) {
    const entries = normalizeEntries(options.entries);
    return {
        name: "alias",
        /**
         *
         * @param source 当前路径
         * @param importer 父级路径
         * @returns
         */
        resolveId(source, importer) {
            // const key = Object.keys(entries).find((e) => {
            // 	return source.startsWith(e);
            // });
            const entry = entries.find((e) => {
                return e.match(source);
            });
            if (!entry)
                return source;
            // return source.replace(key, entries[key]) + ".js";
            return entry.replace(source);
        },
    };
}
// 规范化格式
function normalizeEntries(entries) {
    if (Array.isArray(entries)) {
        return entries.map(({ find, replacement }) => {
            return new Entry(find, replacement);
        });
    }
    else {
        return Object.keys(entries).map((key) => {
            return new Entry(key, entries[key]);
        });
    }
}
class Entry {
    find;
    replacement;
    constructor(find, replacement) {
        this.find = find;
        this.replacement = replacement;
    }
    match(filePath) {
        return filePath.startsWith(this.find);
    }
    replace(filePath) {
        return filePath.replace(this.find, this.replacement) + ".js";
    }
}

export { alias };
