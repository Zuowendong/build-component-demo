import { describe, it, expect } from "vitest";
import { alias } from ".";

describe("alias", () => {
	describe("entries is object", () => {
		it("匹配成功时候应该被替换", () => {
			const aliasObj: any = alias({
				entries: {
					"@": "./utils",
					utils: "./utils",
				},
			});
			expect(aliasObj.resolveId("@/sum")).toBe("./utils/sum.js");
			expect(aliasObj.resolveId("utils/sum")).toBe("./utils/sum.js");
		});
		it("匹配失败时候应该直接返回source", () => {
			const aliasObj: any = alias({
				entries: {
					"@": "./utils",
				},
			});
			expect(aliasObj.resolveId("!/sum")).toBe("!/sum");
		});
	});

	describe("entries is array", () => {
		it("匹配成功时候应该被替换", () => {
			const aliasObj: any = alias({
				entries: [
					{ find: "@", replacement: "./utils" },
					{ find: "utils", replacement: "./utils" },
				],
			});
			expect(aliasObj.resolveId("@/sum")).toBe("./utils/sum.js");
			expect(aliasObj.resolveId("utils/sum")).toBe("./utils/sum.js");
		});
		it("匹配失败时候应该直接返回source", () => {
			const aliasObj: any = alias({
				entries: [
					{
						find: "@",
						replacement: "./utils",
					},
				],
			});
			expect(aliasObj.resolveId("!/sum")).toBe("!/sum");
		});
	});
});
