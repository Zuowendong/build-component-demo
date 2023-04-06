import { defineComponent } from "vue";
import { buttonProps, type ButtonProps } from "./button-types";

export default defineComponent({
	name: "WdButton",
	props: buttonProps,
	emits: [],
	setup(props: ButtonProps, ctx) {
		return () => <button class="d-tree">xxx</button>;
	},
});
