import type { App } from "vue";
import TreeInstall, { Tree } from "./tree";
import ButtonInstall, { Button } from "./button";

export { Tree, Button };

const installs = [TreeInstall, ButtonInstall];

export default {
	install(app: App): void {
		installs.forEach((p) => app.use(p as any));
	},
};
