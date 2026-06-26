import { _ as sanitize_props, v as slot, y as spread_props } from "./index-server.js";
import { N as Icon } from "./ui.js";
function House($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "house" },
		sanitize_props($$props),
		{
			iconNode: [["path", { "d": "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" }], ["path", { "d": "M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }]],
			children: ($$renderer$1) => {
				$$renderer$1.push(`<!--[-->`);
				slot($$renderer$1, $$props, "default", {}, null);
				$$renderer$1.push(`<!--]-->`);
			},
			$$slots: { default: true }
		}
	]));
}
export { House as t };
