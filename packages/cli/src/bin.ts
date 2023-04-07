#!/usr/bin/env node

import { Command } from "commander";

const program = new Command();
program
	.command("compile")
	.description("Compile demo components library code")
	.action(async () => {
		console.log("执行组件打包构建流程...");

		const { compile } = await import("./commands/compile.js");
		return compile();
	});

program.parse();
