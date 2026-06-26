import { _ as sanitize_props, v as slot, y as spread_props } from "./index-server.js";
import { N as Icon } from "./ui.js";
function Locate($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "locate" },
		sanitize_props($$props),
		{
			iconNode: [
				["line", {
					"x1": "2",
					"x2": "5",
					"y1": "12",
					"y2": "12"
				}],
				["line", {
					"x1": "19",
					"x2": "22",
					"y1": "12",
					"y2": "12"
				}],
				["line", {
					"x1": "12",
					"x2": "12",
					"y1": "2",
					"y2": "5"
				}],
				["line", {
					"x1": "12",
					"x2": "12",
					"y1": "19",
					"y2": "22"
				}],
				["circle", {
					"cx": "12",
					"cy": "12",
					"r": "7"
				}]
			],
			children: ($$renderer$1) => {
				$$renderer$1.push(`<!--[-->`);
				slot($$renderer$1, $$props, "default", {}, null);
				$$renderer$1.push(`<!--]-->`);
			},
			$$slots: { default: true }
		}
	]));
}
function Moon($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "moon" },
		sanitize_props($$props),
		{
			iconNode: [["path", { "d": "M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" }]],
			children: ($$renderer$1) => {
				$$renderer$1.push(`<!--[-->`);
				slot($$renderer$1, $$props, "default", {}, null);
				$$renderer$1.push(`<!--]-->`);
			},
			$$slots: { default: true }
		}
	]));
}
function Sun($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "sun" },
		sanitize_props($$props),
		{
			iconNode: [
				["circle", {
					"cx": "12",
					"cy": "12",
					"r": "4"
				}],
				["path", { "d": "M12 2v2" }],
				["path", { "d": "M12 20v2" }],
				["path", { "d": "m4.93 4.93 1.41 1.41" }],
				["path", { "d": "m17.66 17.66 1.41 1.41" }],
				["path", { "d": "M2 12h2" }],
				["path", { "d": "M20 12h2" }],
				["path", { "d": "m6.34 17.66-1.41 1.41" }],
				["path", { "d": "m19.07 4.93-1.41 1.41" }]
			],
			children: ($$renderer$1) => {
				$$renderer$1.push(`<!--[-->`);
				slot($$renderer$1, $$props, "default", {}, null);
				$$renderer$1.push(`<!--]-->`);
			},
			$$slots: { default: true }
		}
	]));
}
export { Moon as n, Locate as r, Sun as t };
