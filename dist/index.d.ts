import { Plugin } from "rollup";
interface AliasOptions {
    entries: {
        [k: string]: string;
    } | {
        find: string;
        replacement: string;
    }[];
}
export declare function alias(options: AliasOptions): Plugin;
export {};
