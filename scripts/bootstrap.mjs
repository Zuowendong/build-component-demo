import execa from "execa";
import { createSpinner } from "nanospinner";
import { resolve } from "path";

const CWD = process.cwd();

const PKG_CLI = resolve(CWD, './packages/cli')
export const buildCli = () => execa('pnpm', ['build'], { cwd: PKG_CLI })

const PKG_SHARED = resolve(CWD, "./packages/shared");
export const buildShared = () => execa("pnpm", ["build"], { cwd: PKG_SHARED });

export async function runTask(taskName, task) {
	const s = createSpinner(`Building ${taskName}`).start();
	try {
		await task();
		s.success({ text: `Build ${taskName} completed!` });
	} catch (e) {
		s.error({ text: `Build ${taskName} failed!` });
		console.error(e.toString());
	}
}

export async function runTaskQueue() {
	await runTask("shared", buildShared);
	await runTask('cli', buildCli)
}

runTaskQueue();
