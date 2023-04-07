import { defineComponent } from "vue";
import { buttonProps, type ButtonProps } from "./button-types";
import "./button.scss";

export default defineComponent({
	name: "WdButton",
	props: buttonProps,
	emits: [],
	setup(props: ButtonProps, ctx) {
		return () => <button class="d-button">xxx</button>;
	},
});
