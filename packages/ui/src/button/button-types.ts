import type { ExtractPropTypes } from "vue";

export const buttonProps = {
	data: {
		type: String,
	},
} as const; // 确保用户不能修改 treeProps内部属性

export type ButtonProps = ExtractPropTypes<typeof buttonProps>;
