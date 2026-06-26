import { A as on, B as noop$1, C as setContext, E as escape_html, F as create_element, H as run, L as ATTACHMENT_KEY, N as effect_root, O as createClassComponent, P as render_effect, R as rune_outside_svelte, S as hasContext, T as clsx$1, V as object_keys, _ as sanitize_props, a as unmount, b as getAllContexts, c as attributes, d as element, f as ensure_array_like, g as rest_props, i as tick, k as append, l as bind_props, m as props_id, n as mount, o as attr_class, s as attr_style, u as derived, v as slot, w as attr, x as getContext, y as spread_props, z as fallback } from "./index-server.js";
import { t as false_default } from "./false.js";
import { clsx } from "clsx";
import parse from "style-to-object";
import { focusable, isFocusable, tabbable } from "tabbable";
import { arrow, autoUpdate, computePosition, flip, hide, limitShift, offset, shift, size } from "@floating-ui/dom";
var defaultAttributes_default = {
	xmlns: "http://www.w3.org/2000/svg",
	width: 24,
	height: 24,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	"stroke-width": 2,
	"stroke-linecap": "round",
	"stroke-linejoin": "round"
};
/**
* @license lucide-svelte v1.0.1 - ISC
*
* ISC License
* 
* Copyright (c) 2026 Lucide Icons and Contributors
* 
* Permission to use, copy, modify, and/or distribute this software for any
* purpose with or without fee is hereby granted, provided that the above
* copyright notice and this permission notice appear in all copies.
* 
* THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
* WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
* MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
* ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
* WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
* ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
* OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
* 
* ---
* 
* The following Lucide icons are derived from the Feather project:
* 
* airplay, alert-circle, alert-octagon, alert-triangle, aperture, arrow-down-circle, arrow-down-left, arrow-down-right, arrow-down, arrow-left-circle, arrow-left, arrow-right-circle, arrow-right, arrow-up-circle, arrow-up-left, arrow-up-right, arrow-up, at-sign, calendar, cast, check, chevron-down, chevron-left, chevron-right, chevron-up, chevrons-down, chevrons-left, chevrons-right, chevrons-up, circle, clipboard, clock, code, columns, command, compass, corner-down-left, corner-down-right, corner-left-down, corner-left-up, corner-right-down, corner-right-up, corner-up-left, corner-up-right, crosshair, database, divide-circle, divide-square, dollar-sign, download, external-link, feather, frown, hash, headphones, help-circle, info, italic, key, layout, life-buoy, link-2, link, loader, lock, log-in, log-out, maximize, meh, minimize, minimize-2, minus-circle, minus-square, minus, monitor, moon, more-horizontal, more-vertical, move, music, navigation-2, navigation, octagon, pause-circle, percent, plus-circle, plus-square, plus, power, radio, rss, search, server, share, shopping-bag, sidebar, smartphone, smile, square, table-2, tablet, target, terminal, trash-2, trash, triangle, tv, type, upload, x-circle, x-octagon, x-square, x, zoom-in, zoom-out
* 
* The MIT License (MIT) (for the icons listed above)
* 
* Copyright (c) 2013-present Cole Bemis
* 
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
* 
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
* 
*/
const hasA11yProp = (props) => {
	for (const prop in props) if (prop.startsWith("aria-") || prop === "role" || prop === "title") return true;
	return false;
};
/**
* @license lucide-svelte v1.0.1 - ISC
*
* ISC License
* 
* Copyright (c) 2026 Lucide Icons and Contributors
* 
* Permission to use, copy, modify, and/or distribute this software for any
* purpose with or without fee is hereby granted, provided that the above
* copyright notice and this permission notice appear in all copies.
* 
* THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
* WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
* MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
* ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
* WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
* ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
* OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
* 
* ---
* 
* The following Lucide icons are derived from the Feather project:
* 
* airplay, alert-circle, alert-octagon, alert-triangle, aperture, arrow-down-circle, arrow-down-left, arrow-down-right, arrow-down, arrow-left-circle, arrow-left, arrow-right-circle, arrow-right, arrow-up-circle, arrow-up-left, arrow-up-right, arrow-up, at-sign, calendar, cast, check, chevron-down, chevron-left, chevron-right, chevron-up, chevrons-down, chevrons-left, chevrons-right, chevrons-up, circle, clipboard, clock, code, columns, command, compass, corner-down-left, corner-down-right, corner-left-down, corner-left-up, corner-right-down, corner-right-up, corner-up-left, corner-up-right, crosshair, database, divide-circle, divide-square, dollar-sign, download, external-link, feather, frown, hash, headphones, help-circle, info, italic, key, layout, life-buoy, link-2, link, loader, lock, log-in, log-out, maximize, meh, minimize, minimize-2, minus-circle, minus-square, minus, monitor, moon, more-horizontal, more-vertical, move, music, navigation-2, navigation, octagon, pause-circle, percent, plus-circle, plus-square, plus, power, radio, rss, search, server, share, shopping-bag, sidebar, smartphone, smile, square, table-2, tablet, target, terminal, trash-2, trash, triangle, tv, type, upload, x-circle, x-octagon, x-square, x, zoom-in, zoom-out
* 
* The MIT License (MIT) (for the icons listed above)
* 
* Copyright (c) 2013-present Cole Bemis
* 
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
* 
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
* 
*/
const mergeClasses = (...classes) => classes.filter((className, index, array) => {
	return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
}).join(" ").trim();
function Icon($$renderer, $$props) {
	const $$sanitized_props = sanitize_props($$props);
	const $$restProps = rest_props($$sanitized_props, [
		"name",
		"color",
		"size",
		"strokeWidth",
		"absoluteStrokeWidth",
		"iconNode"
	]);
	$$renderer.component(($$renderer$1) => {
		let name = fallback($$props["name"], void 0);
		let color = fallback($$props["color"], "currentColor");
		let size$1 = fallback($$props["size"], 24);
		let strokeWidth = fallback($$props["strokeWidth"], 2);
		let absoluteStrokeWidth = fallback($$props["absoluteStrokeWidth"], false);
		let iconNode = fallback($$props["iconNode"], () => [], true);
		$$renderer$1.push(`<svg${attributes({
			...defaultAttributes_default,
			...!hasA11yProp($$restProps) ? { "aria-hidden": "true" } : void 0,
			...$$restProps,
			width: size$1,
			height: size$1,
			stroke: color,
			"stroke-width": absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size$1) : strokeWidth,
			class: clsx$1(mergeClasses("lucide-icon", "lucide", name ? `lucide-${name}` : "", $$sanitized_props.class))
		}, void 0, void 0, void 0, 3)}><!--[-->`);
		const each_array = ensure_array_like(iconNode);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let [tag, attrs] = each_array[$$index];
			element($$renderer$1, tag, () => {
				$$renderer$1.push(`${attributes({ ...attrs }, void 0, void 0, void 0, 3)}`);
			});
		}
		$$renderer$1.push(`<!--]--><!--[-->`);
		slot($$renderer$1, $$props, "default", {}, null);
		$$renderer$1.push(`<!--]--></svg>`);
		bind_props($$props, {
			name,
			color,
			size: size$1,
			strokeWidth,
			absoluteStrokeWidth,
			iconNode
		});
	});
}
function Bus($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "bus" },
		sanitize_props($$props),
		{
			iconNode: [
				["path", { "d": "M8 6v6" }],
				["path", { "d": "M15 6v6" }],
				["path", { "d": "M2 12h19.6" }],
				["path", { "d": "M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3" }],
				["circle", {
					"cx": "7",
					"cy": "18",
					"r": "2"
				}],
				["path", { "d": "M9 18h5" }],
				["circle", {
					"cx": "16",
					"cy": "18",
					"r": "2"
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
function Calendar($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "calendar" },
		sanitize_props($$props),
		{
			iconNode: [
				["path", { "d": "M8 2v4" }],
				["path", { "d": "M16 2v4" }],
				["rect", {
					"width": "18",
					"height": "18",
					"x": "3",
					"y": "4",
					"rx": "2"
				}],
				["path", { "d": "M3 10h18" }]
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
function Chevron_down($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "chevron-down" },
		sanitize_props($$props),
		{
			iconNode: [["path", { "d": "m6 9 6 6 6-6" }]],
			children: ($$renderer$1) => {
				$$renderer$1.push(`<!--[-->`);
				slot($$renderer$1, $$props, "default", {}, null);
				$$renderer$1.push(`<!--]-->`);
			},
			$$slots: { default: true }
		}
	]));
}
function Eye_off($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "eye-off" },
		sanitize_props($$props),
		{
			iconNode: [
				["path", { "d": "M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" }],
				["path", { "d": "M14.084 14.158a3 3 0 0 1-4.242-4.242" }],
				["path", { "d": "M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" }],
				["path", { "d": "m2 2 20 20" }]
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
function Heart($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "heart" },
		sanitize_props($$props),
		{
			iconNode: [["path", { "d": "M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" }]],
			children: ($$renderer$1) => {
				$$renderer$1.push(`<!--[-->`);
				slot($$renderer$1, $$props, "default", {}, null);
				$$renderer$1.push(`<!--]-->`);
			},
			$$slots: { default: true }
		}
	]));
}
function Map_pin($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "map-pin" },
		sanitize_props($$props),
		{
			iconNode: [["path", { "d": "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" }], ["circle", {
				"cx": "12",
				"cy": "10",
				"r": "3"
			}]],
			children: ($$renderer$1) => {
				$$renderer$1.push(`<!--[-->`);
				slot($$renderer$1, $$props, "default", {}, null);
				$$renderer$1.push(`<!--]-->`);
			},
			$$slots: { default: true }
		}
	]));
}
function Radio($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "radio" },
		sanitize_props($$props),
		{
			iconNode: [
				["path", { "d": "M16.247 7.761a6 6 0 0 1 0 8.478" }],
				["path", { "d": "M19.075 4.933a10 10 0 0 1 0 14.134" }],
				["path", { "d": "M4.925 19.067a10 10 0 0 1 0-14.134" }],
				["path", { "d": "M7.753 16.239a6 6 0 0 1 0-8.478" }],
				["circle", {
					"cx": "12",
					"cy": "12",
					"r": "2"
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
function Refresh_cw($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "refresh-cw" },
		sanitize_props($$props),
		{
			iconNode: [
				["path", { "d": "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" }],
				["path", { "d": "M21 3v5h-5" }],
				["path", { "d": "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" }],
				["path", { "d": "M8 16H3v5" }]
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
function X($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "x" },
		sanitize_props($$props),
		{
			iconNode: [["path", { "d": "M18 6 6 18" }], ["path", { "d": "m6 6 12 12" }]],
			children: ($$renderer$1) => {
				$$renderer$1.push(`<!--[-->`);
				slot($$renderer$1, $$props, "default", {}, null);
				$$renderer$1.push(`<!--]-->`);
			},
			$$slots: { default: true }
		}
	]));
}
function cn(...inputs) {
	return clsx(inputs);
}
function Box($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { as = "div", class: className, children, $$slots, $$events, ...rest } = $$props;
		element($$renderer$1, as, () => {
			$$renderer$1.push(`${attributes({
				class: clsx$1(cn(className)),
				...rest
			})}`);
		}, () => {
			children?.($$renderer$1);
			$$renderer$1.push(`<!---->`);
		});
	});
}
function Stack($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { direction = "column", spacing = 0, align, justify, wrap = false, class: className, children } = $$props;
		$$renderer$1.push(`<div${attr_class(clsx$1(cn("flex", direction === "row" ? "flex-row" : "flex-col", {
			0: "gap-0",
			.5: "gap-1",
			1: "gap-2",
			1.5: "gap-3",
			2: "gap-4",
			3: "gap-6",
			4: "gap-8",
			6: "gap-12"
		}[spacing], align && `items-${align}`, justify && `justify-${justify}`, wrap && "flex-wrap", className)))}>`);
		children?.($$renderer$1);
		$$renderer$1.push(`<!----></div>`);
	});
}
function Typography($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { variant = "body", as, class: className, children } = $$props;
		const CLASSES = {
			h1: "text-4xl font-bold tracking-tight",
			h2: "text-3xl font-semibold tracking-tight",
			h3: "text-2xl font-semibold",
			h4: "text-xl font-semibold",
			h5: "text-lg font-medium",
			h6: "text-base font-semibold",
			body: "text-base",
			body2: "text-sm",
			caption: "text-xs text-[color:var(--color-fg-muted)]",
			overline: "text-xs uppercase tracking-wider text-[color:var(--color-fg-muted)]"
		};
		const TAGS = {
			h1: "h1",
			h2: "h2",
			h3: "h3",
			h4: "h4",
			h5: "h5",
			h6: "h6",
			body: "p",
			body2: "p",
			caption: "span",
			overline: "span"
		};
		element($$renderer$1, derived(() => as ?? TAGS[variant])(), () => {
			$$renderer$1.push(`${attr_class(clsx$1(cn(CLASSES[variant], className)))}`);
		}, () => {
			children?.($$renderer$1);
			$$renderer$1.push(`<!---->`);
		});
	});
}
function Card($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { variant = "plain", class: className, children } = $$props;
		$$renderer$1.push(`<div${attr_class(clsx$1(cn("bg-[color:var(--color-surface)] text-[color:var(--color-fg)]", "rounded-[var(--radius-card)] border border-[color:var(--color-border)] shadow-sm", {
			plain: "",
			station: "border-l-4 border-l-[color:var(--color-primary)]",
			route: "border-l-4 border-l-[color:var(--color-success)]",
			vehicle: "border-l-4 border-l-[color:var(--color-warning)]"
		}[variant], className)))}>`);
		children?.($$renderer$1);
		$$renderer$1.push(`<!----></div>`);
	});
}
function CardContent($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { class: className, children } = $$props;
		$$renderer$1.push(`<div${attr_class(clsx$1(cn("p-3 sm:p-4", className)))}>`);
		children?.($$renderer$1);
		$$renderer$1.push(`<!----></div>`);
	});
}
function Chip($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { size: size$1 = "medium", variant = "filled", color = "default", onclick, class: className, icon, children } = $$props;
		$$renderer$1.push(`<span${attr("role", onclick ? "button" : void 0)}${attr("tabindex", onclick ? 0 : void 0)}${attr_class(clsx$1(cn("inline-flex items-center rounded-[var(--radius-chip)] font-medium select-none whitespace-nowrap", {
			small: "text-xs h-6 px-2 gap-1",
			medium: "text-sm h-7 px-3 gap-1.5"
		}[size$1], variant === "filled" ? {
			default: "bg-[color:var(--color-border)] text-[color:var(--color-fg)]",
			primary: "bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]",
			success: "bg-[color:var(--color-success)] text-white",
			warning: "bg-[color:var(--color-warning)] text-black",
			danger: "bg-[color:var(--color-danger)] text-white"
		}[color] : {
			default: "border border-[color:var(--color-border)] text-[color:var(--color-fg)]",
			primary: "border border-[color:var(--color-primary)] text-[color:var(--color-primary)]",
			success: "border border-[color:var(--color-success)] text-[color:var(--color-success)]",
			warning: "border border-[color:var(--color-warning)] text-[color:var(--color-warning)]",
			danger: "border border-[color:var(--color-danger)] text-[color:var(--color-danger)]"
		}[color], onclick && "cursor-pointer", className)))}>`);
		if (icon) {
			$$renderer$1.push("<!--[0-->");
			icon($$renderer$1);
			$$renderer$1.push(`<!---->`);
		} else $$renderer$1.push("<!--[-1-->");
		$$renderer$1.push(`<!--]--> `);
		children?.($$renderer$1);
		$$renderer$1.push(`<!----></span>`);
	});
}
function Avatar($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { variant = "circular", size: size$1, class: className, children } = $$props;
		$$renderer$1.push(`<div${attr_style(typeof size$1 === "number" ? `width:${size$1}px;height:${size$1}px;` : void 0)}${attr_class(clsx$1(cn("inline-flex items-center justify-center shrink-0 font-medium", "bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)]", variant === "circular" ? "rounded-full" : "rounded-md", className)))}>`);
		children?.($$renderer$1);
		$$renderer$1.push(`<!----></div>`);
	});
}
function Button($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { variant = "contained", color = "primary", size: size$1 = "medium", startIcon, endIcon, type = "button", class: className, children, $$slots, $$events, ...rest } = $$props;
		const BASE = "inline-flex items-center justify-center gap-2 font-medium rounded-md transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed";
		const SIZE = {
			small: "text-xs px-2.5 h-7",
			medium: "text-sm px-3.5 h-9",
			large: "text-base px-4 h-11"
		};
		function variantClasses(v, c) {
			if (v === "contained") {
				if (c === "danger") return "bg-[color:var(--color-danger)] text-white hover:opacity-90";
				if (c === "inherit") return "bg-[color:var(--color-surface)] text-[color:var(--color-fg)] hover:bg-[color:var(--color-border)]";
				return "bg-[color:var(--color-primary)] text-[color:var(--color-primary-fg)] hover:opacity-90";
			}
			if (v === "outlined") {
				const ring = c === "danger" ? "var(--color-danger)" : c === "inherit" ? "currentColor" : "var(--color-primary)";
				return `border border-[color:${ring}] text-[color:${ring}] hover:bg-[color:${ring}]/10`;
			}
			const fg = c === "danger" ? "var(--color-danger)" : c === "inherit" ? "currentColor" : "var(--color-primary)";
			return `text-[color:${fg}] hover:bg-[color:${fg}]/10`;
		}
		$$renderer$1.push(`<button${attributes({
			type,
			class: clsx$1(cn(BASE, SIZE[size$1], variantClasses(variant, color), className)),
			...rest
		})}>`);
		if (startIcon) {
			$$renderer$1.push("<!--[0-->");
			startIcon($$renderer$1);
			$$renderer$1.push(`<!---->`);
		} else $$renderer$1.push("<!--[-1-->");
		$$renderer$1.push(`<!--]--> `);
		children?.($$renderer$1);
		$$renderer$1.push(`<!----> `);
		if (endIcon) {
			$$renderer$1.push("<!--[0-->");
			endIcon($$renderer$1);
			$$renderer$1.push(`<!---->`);
		} else $$renderer$1.push("<!--[-1-->");
		$$renderer$1.push(`<!--]--></button>`);
	});
}
function IconButton($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { size: size$1 = "medium", color = "inherit", type = "button", class: className, children, $$slots, $$events, ...rest } = $$props;
		$$renderer$1.push(`<button${attributes({
			type,
			class: clsx$1(cn("inline-flex items-center justify-center rounded-full transition-colors", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)]", "disabled:opacity-50 disabled:cursor-not-allowed", {
				small: "w-8 h-8",
				medium: "w-10 h-10",
				large: "w-12 h-12"
			}[size$1], {
				inherit: "text-current hover:bg-current/10",
				primary: "text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/10",
				danger: "text-[color:var(--color-danger)] hover:bg-[color:var(--color-danger)]/10"
			}[color], className)),
			...rest
		})}>`);
		children?.($$renderer$1);
		$$renderer$1.push(`<!----></button>`);
	});
}
function Spinner($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { size: size$1 = 20, class: className } = $$props;
		const border = derived(() => Math.max(2, Math.floor(size$1 / 10)));
		$$renderer$1.push(`<span role="progressbar" aria-label="Loading"${attr_style(`width:${size$1}px;height:${size$1}px;border-width:${border()}px;`)}${attr_class(clsx$1(cn("inline-block rounded-full border-[color:var(--color-border)] border-t-[color:var(--color-primary)] animate-spin", className)))}></span>`);
	});
}
var DEFAULT_TTL = {
	success: 2500,
	info: 4e3,
	warning: 6e3
};
function createStatusBus() {
	let entries = [];
	const timers = /* @__PURE__ */ new Map();
	function clearTimer(id) {
		const t = timers.get(id);
		if (t) {
			clearTimeout(t);
			timers.delete(id);
		}
	}
	function scheduleDismiss(entry) {
		const ttl = entry.ttlMs ?? DEFAULT_TTL[entry.kind];
		if (typeof ttl === "number" && ttl > 0) {
			clearTimer(entry.id);
			timers.set(entry.id, setTimeout(() => dismiss(entry.id), ttl));
		}
	}
	function push(entry) {
		const existing = entries.findIndex((e) => e.id === entry.id);
		if (existing >= 0) entries[existing] = entry;
		else entries.push(entry);
		scheduleDismiss(entry);
	}
	function progress(id, value) {
		const idx = entries.findIndex((e) => e.id === id);
		if (idx >= 0 && entries[idx].kind === "progress") entries[idx] = {
			...entries[idx],
			progress: value
		};
	}
	function dismiss(id) {
		clearTimer(id);
		entries = entries.filter((e) => e.id !== id);
	}
	function clear() {
		timers.forEach(clearTimeout);
		timers.clear();
		entries = [];
	}
	return {
		get entries() {
			return entries;
		},
		push,
		progress,
		dismiss,
		clear
	};
}
const statusBus = createStatusBus();
function StatusBar($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		const active = derived(() => {
			const entries = statusBus.entries;
			if (entries.length === 0) return null;
			const priorityOf = (k) => k === "error" ? 5 : k === "loading" || k === "progress" ? 4 : k === "warning" ? 3 : k === "info" ? 2 : 1;
			return [...entries].sort((a, b) => priorityOf(b.kind) - priorityOf(a.kind))[0];
		});
		const loadingMessages = derived(() => statusBus.entries.filter((e) => e.kind === "loading").map((e) => e.message));
		const KIND_CLASS = {
			error: "bg-[color:var(--color-danger)] text-white",
			loading: "bg-[color:var(--color-primary)]/15 text-[color:var(--color-primary)]",
			progress: "bg-[color:var(--color-primary)]/15 text-[color:var(--color-primary)]",
			warning: "bg-[color:var(--color-warning)] text-black",
			info: "bg-[color:var(--color-border)] text-[color:var(--color-fg)]",
			success: "bg-[color:var(--color-success)] text-white"
		};
		if (active()) {
			$$renderer$1.push("<!--[0-->");
			$$renderer$1.push(`<div${attr_class(clsx$1(cn("relative w-full overflow-hidden text-xs flex items-center px-3 h-7 transition-colors", KIND_CLASS[active().kind])), "svelte-ft7vkd")} role="status">`);
			if (active().kind === "loading") {
				$$renderer$1.push("<!--[0-->");
				$$renderer$1.push(`<span aria-hidden="true" class="absolute inset-y-0 left-0 w-1/3 bg-[color:var(--color-primary)]/40 animate-[statusbar-stripe_1.4s_ease-in-out_infinite] svelte-ft7vkd"></span>`);
			} else $$renderer$1.push("<!--[-1-->");
			$$renderer$1.push(`<!--]--> `);
			if (active().kind === "progress" && typeof active().progress === "number") {
				$$renderer$1.push("<!--[0-->");
				$$renderer$1.push(`<span aria-hidden="true" class="absolute inset-y-0 left-0 bg-[color:var(--color-primary)]/40 transition-[width] svelte-ft7vkd"${attr_style(`width:${Math.max(0, Math.min(100, active().progress))}%`)}></span>`);
			} else $$renderer$1.push("<!--[-1-->");
			$$renderer$1.push(`<!--]--> <span class="relative z-10 truncate svelte-ft7vkd">${escape_html(active().kind === "loading" && loadingMessages().length > 1 ? `Loading: ${loadingMessages().join(", ")}` : active().message)}</span></div>`);
		} else $$renderer$1.push("<!--[-1-->");
		$$renderer$1.push(`<!--]-->`);
	});
}
function BottomNavigation($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { value, items, onchange, class: className } = $$props;
		$$renderer$1.push(`<nav${attr_class(clsx$1(cn("fixed inset-x-0 bottom-0 z-30 flex bg-[color:var(--color-surface)]", "border-t border-[color:var(--color-border)]", "pb-[var(--space-safe-bottom)]", className)))}><!--[-->`);
		const each_array = ensure_array_like(items);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];
			const active = item.value === value;
			$$renderer$1.push(`<button type="button"${attr_class(clsx$1(cn("flex-1 h-14 flex flex-col items-center justify-center gap-0.5 text-xs", "transition-colors", active ? "text-[color:var(--color-primary)]" : "text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)]")))}${attr("aria-current", active ? "page" : void 0)}>`);
			item.icon($$renderer$1);
			$$renderer$1.push(`<!----> <span>${escape_html(item.label)}</span></button>`);
		}
		$$renderer$1.push(`<!--]--></nav>`);
	});
}
function isFunction$1(value) {
	return typeof value === "function";
}
function isObject(value) {
	return value !== null && typeof value === "object";
}
var CLASS_VALUE_PRIMITIVE_TYPES = [
	"string",
	"number",
	"bigint",
	"boolean"
];
function isClassValue(value) {
	if (value === null || value === void 0) return true;
	if (CLASS_VALUE_PRIMITIVE_TYPES.includes(typeof value)) return true;
	if (Array.isArray(value)) return value.every((item) => isClassValue(item));
	if (typeof value === "object") {
		if (Object.getPrototypeOf(value) !== Object.prototype) return false;
		return true;
	}
	return false;
}
const BoxSymbol = Symbol("box");
const isWritableSymbol = Symbol("is-writable");
function boxWith(getter, setter) {
	const derived$1 = derived(getter);
	if (setter) return {
		[BoxSymbol]: true,
		[isWritableSymbol]: true,
		get current() {
			return derived$1();
		},
		set current(v) {
			setter(v);
		}
	};
	return {
		[BoxSymbol]: true,
		get current() {
			return getter();
		}
	};
}
function isBox(value) {
	return isObject(value) && BoxSymbol in value;
}
function isWritableBox(value) {
	return isBox(value) && isWritableSymbol in value;
}
function boxFrom(value) {
	if (isBox(value)) return value;
	if (isFunction$1(value)) return boxWith(value);
	return simpleBox(value);
}
function boxFlatten(boxes) {
	return Object.entries(boxes).reduce((acc, [key, b]) => {
		if (!isBox(b)) return Object.assign(acc, { [key]: b });
		if (isWritableBox(b)) Object.defineProperty(acc, key, {
			get() {
				return b.current;
			},
			set(v) {
				b.current = v;
			}
		});
		else Object.defineProperty(acc, key, { get() {
			return b.current;
		} });
		return acc;
	}, {});
}
function toReadonlyBox(b) {
	if (!isWritableBox(b)) return b;
	return {
		[BoxSymbol]: true,
		get current() {
			return b.current;
		}
	};
}
function simpleBox(initialValue) {
	let current = initialValue;
	return {
		[BoxSymbol]: true,
		[isWritableSymbol]: true,
		get current() {
			return current;
		},
		set current(v) {
			current = v;
		}
	};
}
function box(initialValue) {
	let current = initialValue;
	return {
		[BoxSymbol]: true,
		[isWritableSymbol]: true,
		get current() {
			return current;
		},
		set current(v) {
			current = v;
		}
	};
}
box.from = boxFrom;
box.with = boxWith;
box.flatten = boxFlatten;
box.readonly = toReadonlyBox;
box.isBox = isBox;
box.isWritableBox = isWritableBox;
function composeHandlers(...handlers) {
	return function(e) {
		for (const handler of handlers) {
			if (!handler) continue;
			if (e.defaultPrevented) return;
			if (typeof handler === "function") handler.call(this, e);
			else handler.current?.call(this, e);
		}
	};
}
var NUMBER_CHAR_RE = /\d/;
var STR_SPLITTERS = [
	"-",
	"_",
	"/",
	"."
];
function isUppercase(char = "") {
	if (NUMBER_CHAR_RE.test(char)) return void 0;
	return char !== char.toLowerCase();
}
function splitByCase(str) {
	const parts = [];
	let buff = "";
	let previousUpper;
	let previousSplitter;
	for (const char of str) {
		const isSplitter = STR_SPLITTERS.includes(char);
		if (isSplitter === true) {
			parts.push(buff);
			buff = "";
			previousUpper = void 0;
			continue;
		}
		const isUpper = isUppercase(char);
		if (previousSplitter === false) {
			if (previousUpper === false && isUpper === true) {
				parts.push(buff);
				buff = char;
				previousUpper = isUpper;
				continue;
			}
			if (previousUpper === true && isUpper === false && buff.length > 1) {
				const lastChar = buff.at(-1);
				parts.push(buff.slice(0, Math.max(0, buff.length - 1)));
				buff = lastChar + char;
				previousUpper = isUpper;
				continue;
			}
		}
		buff += char;
		previousUpper = isUpper;
		previousSplitter = isSplitter;
	}
	parts.push(buff);
	return parts;
}
function pascalCase(str) {
	if (!str) return "";
	return splitByCase(str).map((p) => upperFirst(p)).join("");
}
function camelCase(str) {
	return lowerFirst(pascalCase(str || ""));
}
function upperFirst(str) {
	return str ? str[0].toUpperCase() + str.slice(1) : "";
}
function lowerFirst(str) {
	return str ? str[0].toLowerCase() + str.slice(1) : "";
}
function cssToStyleObj(css) {
	if (!css) return {};
	const styleObj = {};
	function iterator(name, value) {
		if (name.startsWith("-moz-") || name.startsWith("-webkit-") || name.startsWith("-ms-") || name.startsWith("-o-")) {
			styleObj[pascalCase(name)] = value;
			return;
		}
		if (name.startsWith("--")) {
			styleObj[name] = value;
			return;
		}
		styleObj[camelCase(name)] = value;
	}
	parse(css, iterator);
	return styleObj;
}
function executeCallbacks(...callbacks) {
	return (...args) => {
		for (const callback of callbacks) if (typeof callback === "function") callback(...args);
	};
}
function createParser(matcher, replacer) {
	const regex = RegExp(matcher, "g");
	return (str) => {
		if (typeof str !== "string") throw new TypeError(`expected an argument of type string, but got ${typeof str}`);
		if (!str.match(regex)) return str;
		return str.replace(regex, replacer);
	};
}
var camelToKebab = createParser(/[A-Z]/, (match) => `-${match.toLowerCase()}`);
function styleToCSS(styleObj) {
	if (!styleObj || typeof styleObj !== "object" || Array.isArray(styleObj)) throw new TypeError(`expected an argument of type object, but got ${typeof styleObj}`);
	return Object.keys(styleObj).map((property) => `${camelToKebab(property)}: ${styleObj[property]};`).join("\n");
}
function styleToString(style = {}) {
	return styleToCSS(style).replace("\n", " ");
}
const EVENT_LIST_SET = new Set([
	"onabort",
	"onanimationcancel",
	"onanimationend",
	"onanimationiteration",
	"onanimationstart",
	"onauxclick",
	"onbeforeinput",
	"onbeforetoggle",
	"onblur",
	"oncancel",
	"oncanplay",
	"oncanplaythrough",
	"onchange",
	"onclick",
	"onclose",
	"oncompositionend",
	"oncompositionstart",
	"oncompositionupdate",
	"oncontextlost",
	"oncontextmenu",
	"oncontextrestored",
	"oncopy",
	"oncuechange",
	"oncut",
	"ondblclick",
	"ondrag",
	"ondragend",
	"ondragenter",
	"ondragleave",
	"ondragover",
	"ondragstart",
	"ondrop",
	"ondurationchange",
	"onemptied",
	"onended",
	"onerror",
	"onfocus",
	"onfocusin",
	"onfocusout",
	"onformdata",
	"ongotpointercapture",
	"oninput",
	"oninvalid",
	"onkeydown",
	"onkeypress",
	"onkeyup",
	"onload",
	"onloadeddata",
	"onloadedmetadata",
	"onloadstart",
	"onlostpointercapture",
	"onmousedown",
	"onmouseenter",
	"onmouseleave",
	"onmousemove",
	"onmouseout",
	"onmouseover",
	"onmouseup",
	"onpaste",
	"onpause",
	"onplay",
	"onplaying",
	"onpointercancel",
	"onpointerdown",
	"onpointerenter",
	"onpointerleave",
	"onpointermove",
	"onpointerout",
	"onpointerover",
	"onpointerup",
	"onprogress",
	"onratechange",
	"onreset",
	"onresize",
	"onscroll",
	"onscrollend",
	"onsecuritypolicyviolation",
	"onseeked",
	"onseeking",
	"onselect",
	"onselectionchange",
	"onselectstart",
	"onslotchange",
	"onstalled",
	"onsubmit",
	"onsuspend",
	"ontimeupdate",
	"ontoggle",
	"ontouchcancel",
	"ontouchend",
	"ontouchmove",
	"ontouchstart",
	"ontransitioncancel",
	"ontransitionend",
	"ontransitionrun",
	"ontransitionstart",
	"onvolumechange",
	"onwaiting",
	"onwebkitanimationend",
	"onwebkitanimationiteration",
	"onwebkitanimationstart",
	"onwebkittransitionend",
	"onwheel"
]);
function isEventHandler(key) {
	return EVENT_LIST_SET.has(key);
}
function mergeProps(...args) {
	const result = { ...args[0] };
	for (let i = 1; i < args.length; i++) {
		const props = args[i];
		if (!props) continue;
		for (const key of Object.keys(props)) {
			const a = result[key];
			const b = props[key];
			const aIsFunction = typeof a === "function";
			const bIsFunction = typeof b === "function";
			if (aIsFunction && typeof bIsFunction && isEventHandler(key)) result[key] = composeHandlers(a, b);
			else if (aIsFunction && bIsFunction) result[key] = executeCallbacks(a, b);
			else if (key === "class") {
				const aIsClassValue = isClassValue(a);
				const bIsClassValue = isClassValue(b);
				if (aIsClassValue && bIsClassValue) result[key] = clsx(a, b);
				else if (aIsClassValue) result[key] = clsx(a);
				else if (bIsClassValue) result[key] = clsx(b);
			} else if (key === "style") {
				const aIsObject = typeof a === "object";
				const bIsObject = typeof b === "object";
				const aIsString = typeof a === "string";
				const bIsString = typeof b === "string";
				if (aIsObject && bIsObject) result[key] = {
					...a,
					...b
				};
				else if (aIsObject && bIsString) {
					const parsedStyle = cssToStyleObj(b);
					result[key] = {
						...a,
						...parsedStyle
					};
				} else if (aIsString && bIsObject) result[key] = {
					...cssToStyleObj(a),
					...b
				};
				else if (aIsString && bIsString) {
					const parsedStyleA = cssToStyleObj(a);
					const parsedStyleB = cssToStyleObj(b);
					result[key] = {
						...parsedStyleA,
						...parsedStyleB
					};
				} else if (aIsObject) result[key] = a;
				else if (bIsObject) result[key] = b;
				else if (aIsString) result[key] = a;
				else if (bIsString) result[key] = b;
			} else result[key] = b !== void 0 ? b : a;
		}
		for (const key of Object.getOwnPropertySymbols(props)) {
			const a = result[key];
			const b = props[key];
			result[key] = b !== void 0 ? b : a;
		}
	}
	if (typeof result.style === "object") result.style = styleToString(result.style).replaceAll("\n", " ");
	if (result.hidden === false) {
		result.hidden = void 0;
		delete result.hidden;
	}
	if (result.disabled === false) {
		result.disabled = void 0;
		delete result.disabled;
	}
	return result;
}
const srOnlyStyles = {
	position: "absolute",
	width: "1px",
	height: "1px",
	padding: "0",
	margin: "-1px",
	overflow: "hidden",
	clip: "rect(0, 0, 0, 0)",
	whiteSpace: "nowrap",
	borderWidth: "0",
	transform: "translateX(-100%)"
};
styleToString(srOnlyStyles);
const defaultWindow = void 0;
function getActiveElement$1(document$1) {
	let activeElement$1 = document$1.activeElement;
	while (activeElement$1?.shadowRoot) {
		const node = activeElement$1.shadowRoot.activeElement;
		if (node === activeElement$1) break;
		else activeElement$1 = node;
	}
	return activeElement$1;
}
globalThis.Date;
globalThis.Set;
const SvelteMap = globalThis.Map;
globalThis.URL;
globalThis.URLSearchParams;
function createSubscriber(_) {
	return () => {};
}
var ActiveElement = class {
	#document;
	#subscribe;
	constructor(options = {}) {
		const { window: window$1 = defaultWindow, document: document$1 = window$1?.document } = options;
		if (window$1 === void 0) return;
		this.#document = document$1;
		this.#subscribe = createSubscriber((update) => {
			const cleanupFocusIn = on(window$1, "focusin", update);
			const cleanupFocusOut = on(window$1, "focusout", update);
			return () => {
				cleanupFocusIn();
				cleanupFocusOut();
			};
		});
	}
	get current() {
		this.#subscribe?.();
		if (!this.#document) return null;
		return getActiveElement$1(this.#document);
	}
};
new ActiveElement();
function isFunction(value) {
	return typeof value === "function";
}
var Context = class {
	#name;
	#key;
	constructor(name) {
		this.#name = name;
		this.#key = Symbol(name);
	}
	get key() {
		return this.#key;
	}
	exists() {
		return hasContext(this.#key);
	}
	get() {
		const context = getContext(this.#key);
		if (context === void 0) throw new Error(`Context "${this.#name}" not found`);
		return context;
	}
	getOr(fallback$1) {
		const context = getContext(this.#key);
		if (context === void 0) return fallback$1;
		return context;
	}
	set(context) {
		return setContext(this.#key, context);
	}
};
function runEffect(flush, effect) {
	switch (flush) {
		case "post": break;
		case "pre": break;
	}
}
function runWatcher(sources, flush, effect, options = {}) {
	const { lazy = false } = options;
	let active = !lazy;
	let previousValues = Array.isArray(sources) ? [] : void 0;
	runEffect(flush, () => {
		const values = Array.isArray(sources) ? sources.map((source) => source()) : sources();
		if (!active) {
			active = true;
			previousValues = values;
			return;
		}
		const cleanup = run(() => effect(values, previousValues));
		previousValues = values;
		return cleanup;
	});
}
function runWatcherOnce(sources, flush, effect) {}
function watch(sources, effect, options) {
	runWatcher(sources, "post", effect, options);
}
function watchPre(sources, effect, options) {
	runWatcher(sources, "pre", effect, options);
}
watch.pre = watchPre;
function watchOnce(source, effect) {
	runWatcherOnce(source, "post", effect);
}
function watchOncePre(source, effect) {
	runWatcherOnce(source, "pre", effect);
}
watchOnce.pre = watchOncePre;
function get$1(value) {
	if (isFunction(value)) return value();
	return value;
}
var ElementSize = class {
	#size = {
		width: 0,
		height: 0
	};
	#observed = false;
	#options;
	#node;
	#window;
	#width = derived(() => {
		this.#subscribe()?.();
		return this.getSize().width;
	});
	#height = derived(() => {
		this.#subscribe()?.();
		return this.getSize().height;
	});
	#subscribe = derived(() => {
		const node$ = get$1(this.#node);
		if (!node$) return;
		return createSubscriber((update) => {
			if (!this.#window) return;
			const observer = new this.#window.ResizeObserver((entries) => {
				this.#observed = true;
				for (const entry of entries) {
					const boxSize = this.#options.box === "content-box" ? entry.contentBoxSize : entry.borderBoxSize;
					const boxSizeArr = Array.isArray(boxSize) ? boxSize : [boxSize];
					this.#size.width = boxSizeArr.reduce((acc, size$1) => Math.max(acc, size$1.inlineSize), 0);
					this.#size.height = boxSizeArr.reduce((acc, size$1) => Math.max(acc, size$1.blockSize), 0);
				}
				update();
			});
			observer.observe(node$);
			return () => {
				this.#observed = false;
				observer.disconnect();
			};
		});
	});
	constructor(node, options = { box: "border-box" }) {
		this.#window = options.window ?? defaultWindow;
		this.#options = options;
		this.#node = node;
		this.#size = {
			width: 0,
			height: 0
		};
	}
	calculateSize() {
		const element$1 = get$1(this.#node);
		if (!element$1 || !this.#window) return;
		const offsetWidth = element$1.offsetWidth;
		const offsetHeight = element$1.offsetHeight;
		if (this.#options.box === "border-box") return {
			width: offsetWidth,
			height: offsetHeight
		};
		const style = this.#window.getComputedStyle(element$1);
		const paddingWidth = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
		const paddingHeight = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
		const borderWidth = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
		const borderHeight = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
		return {
			width: offsetWidth - paddingWidth - borderWidth,
			height: offsetHeight - paddingHeight - borderHeight
		};
	}
	getSize() {
		return this.#observed ? this.#size : this.calculateSize() ?? this.#size;
	}
	get current() {
		this.#subscribe()?.();
		return this.getSize();
	}
	get width() {
		return this.#width();
	}
	get height() {
		return this.#height();
	}
};
function debounce$1(fn, delay) {
	let timeoutId;
	let lastResolve = null;
	return (...args) => {
		return new Promise((resolve) => {
			if (lastResolve) lastResolve(void 0);
			lastResolve = resolve;
			clearTimeout(timeoutId);
			timeoutId = setTimeout(async () => {
				const result = await fn(...args);
				if (lastResolve) {
					lastResolve(result);
					lastResolve = null;
				}
			}, delay);
		});
	};
}
function throttle(fn, delay) {
	let lastRun = 0;
	let lastPromise = null;
	return (...args) => {
		const now = Date.now();
		if (lastRun && now - lastRun < delay) return lastPromise ?? Promise.resolve(void 0);
		lastRun = now;
		lastPromise = fn(...args);
		return lastPromise;
	};
}
function runResource(source, fetcher, options = {}, effectFn) {
	const { lazy = false, once = false, initialValue, debounce: debounceTime, throttle: throttleTime } = options;
	let current = initialValue;
	let loading = false;
	let error = void 0;
	let cleanupFns = [];
	const runCleanup = () => {
		cleanupFns.forEach((fn) => fn());
		cleanupFns = [];
	};
	const onCleanup = (fn) => {
		cleanupFns = [...cleanupFns, fn];
	};
	const baseFetcher = async (value, previousValue, refetching = false) => {
		try {
			loading = true;
			error = void 0;
			runCleanup();
			const controller = new AbortController();
			onCleanup(() => controller.abort());
			const result = await fetcher(value, previousValue, {
				data: current,
				refetching,
				onCleanup,
				signal: controller.signal
			});
			current = result;
			return result;
		} catch (e) {
			if (!(e instanceof DOMException && e.name === "AbortError")) error = e;
			return;
		} finally {
			loading = false;
		}
	};
	const runFetcher = debounceTime ? debounce$1(baseFetcher, debounceTime) : throttleTime ? throttle(baseFetcher, throttleTime) : baseFetcher;
	const sources = Array.isArray(source) ? source : [source];
	let prevValues;
	effectFn((values, previousValues) => {
		if (once && prevValues) return;
		prevValues = values;
		runFetcher(Array.isArray(source) ? values : values[0], Array.isArray(source) ? previousValues : previousValues?.[0]);
	}, { lazy });
	return {
		get current() {
			return current;
		},
		get loading() {
			return loading;
		},
		get error() {
			return error;
		},
		mutate: (value) => {
			current = value;
		},
		refetch: (info) => {
			const values = sources.map((s) => s());
			return runFetcher(Array.isArray(source) ? values : values[0], Array.isArray(source) ? values : values[0], info ?? true);
		}
	};
}
function resource(source, fetcher, options) {
	return runResource(source, fetcher, options, (fn, options$1) => {
		const sources = Array.isArray(source) ? source : [source];
		const getters = () => sources.map((s) => s());
		watch(getters, (values, previousValues) => {
			fn(values, previousValues ?? []);
		}, options$1);
	});
}
function resourcePre(source, fetcher, options) {
	return runResource(source, fetcher, options, (fn, options$1) => {
		const sources = Array.isArray(source) ? source : [source];
		const getter = () => sources.map((s) => s());
		watch.pre(getter, (values, previousValues) => {
			fn(values, previousValues ?? []);
		}, options$1);
	});
}
resource.pre = resourcePre;
function afterSleep(ms, cb) {
	return setTimeout(cb, ms);
}
function afterTick(fn) {
	(/* @__PURE__ */ tick()).then(fn);
}
var ELEMENT_NODE = 1;
var DOCUMENT_NODE = 9;
var DOCUMENT_FRAGMENT_NODE = 11;
function isHTMLElement$1(node) {
	return isObject(node) && node.nodeType === ELEMENT_NODE && typeof node.nodeName === "string";
}
function isDocument(node) {
	return isObject(node) && node.nodeType === DOCUMENT_NODE;
}
function isWindow(node) {
	return isObject(node) && node.constructor?.name === "VisualViewport";
}
function isNode(node) {
	return isObject(node) && node.nodeType !== void 0;
}
function isShadowRoot(node) {
	return isNode(node) && node.nodeType === DOCUMENT_FRAGMENT_NODE && "host" in node;
}
function contains(parent, child) {
	if (!parent || !child) return false;
	if (!isHTMLElement$1(parent) || !isHTMLElement$1(child)) return false;
	const rootNode = child.getRootNode?.();
	if (parent === child) return true;
	if (parent.contains(child)) return true;
	if (rootNode && isShadowRoot(rootNode)) {
		let next = child;
		while (next) {
			if (parent === next) return true;
			next = next.parentNode || next.host;
		}
	}
	return false;
}
function getDocument(node) {
	if (isDocument(node)) return node;
	if (isWindow(node)) return node.document;
	return node?.ownerDocument ?? document;
}
function getWindow(node) {
	if (isShadowRoot(node)) return getWindow(node.host);
	if (isDocument(node)) return node.defaultView ?? window;
	if (isHTMLElement$1(node)) return node.ownerDocument?.defaultView ?? window;
	return window;
}
function getActiveElement(rootNode) {
	let activeElement$1 = rootNode.activeElement;
	while (activeElement$1?.shadowRoot) {
		const el = activeElement$1.shadowRoot.activeElement;
		if (el === activeElement$1) break;
		else activeElement$1 = el;
	}
	return activeElement$1;
}
var DOMContext = class {
	element;
	#root = derived(() => {
		if (!this.element.current) return document;
		return this.element.current.getRootNode() ?? document;
	});
	get root() {
		return this.#root();
	}
	set root($$value) {
		return this.#root($$value);
	}
	constructor(element$1) {
		if (typeof element$1 === "function") this.element = boxWith(element$1);
		else this.element = element$1;
	}
	getDocument = () => {
		return getDocument(this.root);
	};
	getWindow = () => {
		return this.getDocument().defaultView ?? window;
	};
	getActiveElement = () => {
		return getActiveElement(this.root);
	};
	isActiveElement = (node) => {
		return node === this.getActiveElement();
	};
	getElementById(id) {
		return this.root.getElementById(id);
	}
	querySelector = (selector) => {
		if (!this.root) return null;
		return this.root.querySelector(selector);
	};
	querySelectorAll = (selector) => {
		if (!this.root) return [];
		return this.root.querySelectorAll(selector);
	};
	setTimeout = (callback, delay) => {
		return this.getWindow().setTimeout(callback, delay);
	};
	clearTimeout = (timeoutId) => {
		return this.getWindow().clearTimeout(timeoutId);
	};
};
if (typeof HTMLElement === "function") HTMLElement;
function createAttachmentKey() {
	return Symbol(ATTACHMENT_KEY);
}
function attachRef(ref, onChange) {
	return { [createAttachmentKey()]: (node) => {
		if (isBox(ref)) {
			ref.current = node;
			run(() => onChange?.(node));
			return () => {
				if ("isConnected" in node && node.isConnected) return;
				ref.current = null;
				onChange?.(null);
			};
		}
		ref(node);
		run(() => onChange?.(node));
		return () => {
			if ("isConnected" in node && node.isConnected) return;
			ref(null);
			onChange?.(null);
		};
	} };
}
function boolToStr(condition) {
	return condition ? "true" : "false";
}
function boolToEmptyStrOrUndef(condition) {
	return condition ? "" : void 0;
}
function boolToTrueOrUndef(condition) {
	return condition ? true : void 0;
}
function getDataOpenClosed(condition) {
	return condition ? "open" : "closed";
}
function getDataChecked(condition) {
	return condition ? "checked" : "unchecked";
}
function getDataTransitionAttrs(state) {
	if (state === "starting") return { "data-starting-style": "" };
	if (state === "ending") return { "data-ending-style": "" };
	return {};
}
function getAriaChecked(checked, indeterminate) {
	if (indeterminate) return "mixed";
	return checked ? "true" : "false";
}
var BitsAttrs = class {
	#variant;
	#prefix;
	attrs;
	constructor(config) {
		this.#variant = config.getVariant ? config.getVariant() : null;
		this.#prefix = this.#variant ? `data-${this.#variant}-` : `data-${config.component}-`;
		this.getAttr = this.getAttr.bind(this);
		this.selector = this.selector.bind(this);
		this.attrs = Object.fromEntries(config.parts.map((part) => [part, this.getAttr(part)]));
	}
	getAttr(part, variantOverride) {
		if (variantOverride) return `data-${variantOverride}-${part}`;
		return `${this.#prefix}${part}`;
	}
	selector(part, variantOverride) {
		return `[${this.getAttr(part, variantOverride)}]`;
	}
};
function createBitsAttrs(config) {
	const bitsAttrs = new BitsAttrs(config);
	return {
		...bitsAttrs.attrs,
		selector: bitsAttrs.selector,
		getAttr: bitsAttrs.getAttr
	};
}
const ARROW_DOWN = "ArrowDown";
const ARROW_LEFT = "ArrowLeft";
const ARROW_RIGHT = "ArrowRight";
const ARROW_UP = "ArrowUp";
const HOME = "Home";
const PAGE_DOWN = "PageDown";
const PAGE_UP = "PageUp";
function getElemDirection(elem) {
	return window.getComputedStyle(elem).getPropertyValue("direction");
}
const FIRST_KEYS = [
	ARROW_DOWN,
	PAGE_UP,
	HOME
];
const LAST_KEYS = [
	ARROW_UP,
	PAGE_DOWN,
	"End"
];
[...FIRST_KEYS, ...LAST_KEYS];
function getNextKey(dir = "ltr", orientation = "horizontal") {
	return {
		horizontal: dir === "rtl" ? ARROW_LEFT : ARROW_RIGHT,
		vertical: ARROW_DOWN
	}[orientation];
}
function getPrevKey(dir = "ltr", orientation = "horizontal") {
	return {
		horizontal: dir === "rtl" ? ARROW_RIGHT : ARROW_LEFT,
		vertical: ARROW_UP
	}[orientation];
}
function getDirectionalKeys(dir = "ltr", orientation = "horizontal") {
	if (!["ltr", "rtl"].includes(dir)) dir = "ltr";
	if (!["horizontal", "vertical"].includes(orientation)) orientation = "horizontal";
	return {
		nextKey: getNextKey(dir, orientation),
		prevKey: getPrevKey(dir, orientation)
	};
}
const isBrowser = typeof document !== "undefined";
const isIOS = getIsIOS();
function getIsIOS() {
	return isBrowser && window?.navigator?.userAgent && (/iP(ad|hone|od)/.test(window.navigator.userAgent) || window?.navigator?.maxTouchPoints > 2 && /iPad|Macintosh/.test(window?.navigator.userAgent));
}
function isHTMLElement(element$1) {
	return element$1 instanceof HTMLElement;
}
function isElement(element$1) {
	return element$1 instanceof Element;
}
function isElementOrSVGElement(element$1) {
	return element$1 instanceof Element || element$1 instanceof SVGElement;
}
function isFocusVisible(element$1) {
	return element$1.matches(":focus-visible");
}
function isNotNull(value) {
	return value !== null;
}
var RovingFocusGroup = class {
	#opts;
	#currentTabStopId = box(null);
	constructor(opts) {
		this.#opts = opts;
	}
	getCandidateNodes() {
		return [];
	}
	focusFirstCandidate() {
		const items = this.getCandidateNodes();
		if (!items.length) return;
		items[0]?.focus();
	}
	handleKeydown(node, e, both = false) {
		const rootNode = this.#opts.rootNode.current;
		if (!rootNode || !node) return;
		const items = this.getCandidateNodes();
		if (!items.length) return;
		const currentIndex = items.indexOf(node);
		const { nextKey, prevKey } = getDirectionalKeys(getElemDirection(rootNode), this.#opts.orientation.current);
		const loop = this.#opts.loop.current;
		const keyToIndex = {
			[nextKey]: currentIndex + 1,
			[prevKey]: currentIndex - 1,
			[HOME]: 0,
			["End"]: items.length - 1
		};
		if (both) {
			const altNextKey = nextKey === "ArrowDown" ? ARROW_RIGHT : ARROW_DOWN;
			const altPrevKey = prevKey === "ArrowUp" ? ARROW_LEFT : ARROW_UP;
			keyToIndex[altNextKey] = currentIndex + 1;
			keyToIndex[altPrevKey] = currentIndex - 1;
		}
		let itemIndex = keyToIndex[e.key];
		if (itemIndex === void 0) return;
		e.preventDefault();
		if (itemIndex < 0 && loop) itemIndex = items.length - 1;
		else if (itemIndex === items.length && loop) itemIndex = 0;
		const itemToFocus = items[itemIndex];
		if (!itemToFocus) return;
		itemToFocus.focus();
		this.#currentTabStopId.current = itemToFocus.id;
		this.#opts.onCandidateFocus?.(itemToFocus);
		return itemToFocus;
	}
	getTabIndex(node) {
		const items = this.getCandidateNodes();
		const anyActive = this.#currentTabStopId.current !== null;
		if (node && !anyActive && items[0] === node) {
			this.#currentTabStopId.current = node.id;
			return 0;
		} else if (node?.id === this.#currentTabStopId.current) return 0;
		return -1;
	}
	setCurrentTabStopId(id) {
		this.#currentTabStopId.current = id;
	}
	focusCurrentTabStop() {
		const currentTabStopId = this.#currentTabStopId.current;
		if (!currentTabStopId) return;
		const currentTabStop = this.#opts.rootNode.current?.querySelector(`#${currentTabStopId}`);
		if (!currentTabStop || !isHTMLElement(currentTabStop)) return;
		currentTabStop.focus();
	}
};
var AnimationsComplete = class {
	#opts;
	#currentFrame = null;
	#observer = null;
	#runId = 0;
	constructor(opts) {
		this.#opts = opts;
	}
	#cleanup() {
		if (this.#currentFrame !== null) {
			window.cancelAnimationFrame(this.#currentFrame);
			this.#currentFrame = null;
		}
		this.#observer?.disconnect();
		this.#observer = null;
		this.#runId++;
	}
	run(fn) {
		this.#cleanup();
		const node = this.#opts.ref.current;
		if (!node) return;
		if (typeof node.getAnimations !== "function") {
			this.#executeCallback(fn);
			return;
		}
		const runId = this.#runId;
		const executeIfCurrent = () => {
			if (runId !== this.#runId) return;
			this.#executeCallback(fn);
		};
		const waitForAnimations = () => {
			if (runId !== this.#runId) return;
			const animations = node.getAnimations();
			if (animations.length === 0) {
				executeIfCurrent();
				return;
			}
			Promise.all(animations.map((animation) => animation.finished)).then(() => {
				executeIfCurrent();
			}).catch(() => {
				if (runId !== this.#runId) return;
				if (node.getAnimations().some((animation) => animation.pending || animation.playState !== "finished")) {
					waitForAnimations();
					return;
				}
				executeIfCurrent();
			});
		};
		const requestWaitForAnimations = () => {
			this.#currentFrame = window.requestAnimationFrame(() => {
				this.#currentFrame = null;
				waitForAnimations();
			});
		};
		if (!this.#opts.afterTick.current) {
			requestWaitForAnimations();
			return;
		}
		this.#currentFrame = window.requestAnimationFrame(() => {
			this.#currentFrame = null;
			const startingStyleAttr = "data-starting-style";
			if (!node.hasAttribute(startingStyleAttr)) {
				requestWaitForAnimations();
				return;
			}
			this.#observer = new MutationObserver(() => {
				if (runId !== this.#runId) return;
				if (node.hasAttribute(startingStyleAttr)) return;
				this.#observer?.disconnect();
				this.#observer = null;
				requestWaitForAnimations();
			});
			this.#observer.observe(node, {
				attributes: true,
				attributeFilter: [startingStyleAttr]
			});
		});
	}
	#executeCallback(fn) {
		const execute = () => {
			fn();
		};
		if (this.#opts.afterTick) afterTick(execute);
		else execute();
	}
};
var PresenceManager = class {
	#opts;
	#enabled;
	#afterAnimations;
	#shouldRender = false;
	#transitionStatus = void 0;
	#hasMounted = false;
	#transitionFrame = null;
	constructor(opts) {
		this.#opts = opts;
		this.#shouldRender = opts.open.current;
		this.#enabled = opts.enabled ?? true;
		this.#afterAnimations = new AnimationsComplete({
			ref: this.#opts.ref,
			afterTick: this.#opts.open
		});
		watch(() => this.#opts.open.current, (isOpen) => {
			if (!this.#hasMounted) {
				this.#hasMounted = true;
				return;
			}
			this.#clearTransitionFrame();
			if (!isOpen && this.#opts.shouldSkipExitAnimation?.()) {
				this.#shouldRender = false;
				this.#transitionStatus = void 0;
				this.#opts.onComplete?.();
				return;
			}
			if (isOpen) this.#shouldRender = true;
			this.#transitionStatus = isOpen ? "starting" : "ending";
			if (isOpen) this.#transitionFrame = window.requestAnimationFrame(() => {
				this.#transitionFrame = null;
				if (this.#opts.open.current) this.#transitionStatus = void 0;
			});
			if (!this.#enabled) {
				if (!isOpen) this.#shouldRender = false;
				this.#transitionStatus = void 0;
				this.#opts.onComplete?.();
				return;
			}
			this.#afterAnimations.run(() => {
				if (isOpen === this.#opts.open.current) {
					if (!this.#opts.open.current) this.#shouldRender = false;
					this.#transitionStatus = void 0;
					this.#opts.onComplete?.();
				}
			});
		});
	}
	get shouldRender() {
		return this.#shouldRender;
	}
	get transitionStatus() {
		return this.#transitionStatus;
	}
	#clearTransitionFrame() {
		if (this.#transitionFrame === null) return;
		window.cancelAnimationFrame(this.#transitionFrame);
		this.#transitionFrame = null;
	}
};
function noop() {}
function createId(prefixOrUid, uid) {
	if (uid === void 0) return `bits-${prefixOrUid}`;
	return `bits-${prefixOrUid}-${uid}`;
}
var dialogAttrs = createBitsAttrs({
	component: "dialog",
	parts: [
		"content",
		"trigger",
		"overlay",
		"title",
		"description",
		"close",
		"cancel",
		"action"
	]
});
var DialogRootContext = new Context("Dialog.Root | AlertDialog.Root");
var DialogRootState = class DialogRootState {
	static create(opts) {
		const parent = DialogRootContext.getOr(null);
		return DialogRootContext.set(new DialogRootState(opts, parent));
	}
	opts;
	triggerNode = null;
	contentNode = null;
	overlayNode = null;
	descriptionNode = null;
	contentId = void 0;
	titleId = void 0;
	triggerId = void 0;
	descriptionId = void 0;
	cancelNode = null;
	nestedOpenCount = 0;
	depth;
	parent;
	contentPresence;
	overlayPresence;
	constructor(opts, parent) {
		this.opts = opts;
		this.parent = parent;
		this.depth = parent ? parent.depth + 1 : 0;
		this.handleOpen = this.handleOpen.bind(this);
		this.handleClose = this.handleClose.bind(this);
		this.contentPresence = new PresenceManager({
			ref: boxWith(() => this.contentNode),
			open: this.opts.open,
			enabled: true,
			onComplete: () => {
				this.opts.onOpenChangeComplete.current(this.opts.open.current);
			}
		});
		this.overlayPresence = new PresenceManager({
			ref: boxWith(() => this.overlayNode),
			open: this.opts.open,
			enabled: true
		});
		watch(() => this.opts.open.current, (isOpen) => {
			if (!this.parent) return;
			if (isOpen) this.parent.incrementNested();
			else this.parent.decrementNested();
		}, { lazy: true });
	}
	handleOpen() {
		if (this.opts.open.current) return;
		this.opts.open.current = true;
	}
	handleClose() {
		if (!this.opts.open.current) return;
		this.opts.open.current = false;
	}
	getBitsAttr = (part) => {
		return dialogAttrs.getAttr(part, this.opts.variant.current);
	};
	incrementNested() {
		this.nestedOpenCount++;
		this.parent?.incrementNested();
	}
	decrementNested() {
		if (this.nestedOpenCount === 0) return;
		this.nestedOpenCount--;
		this.parent?.decrementNested();
	}
	#sharedProps = derived(() => ({ "data-state": getDataOpenClosed(this.opts.open.current) }));
	get sharedProps() {
		return this.#sharedProps();
	}
	set sharedProps($$value) {
		return this.#sharedProps($$value);
	}
};
var DialogTitleState = class DialogTitleState {
	static create(opts) {
		return new DialogTitleState(opts, DialogRootContext.get());
	}
	opts;
	root;
	attachment;
	constructor(opts, root) {
		this.opts = opts;
		this.root = root;
		this.root.titleId = this.opts.id.current;
		this.attachment = attachRef(this.opts.ref);
		watch.pre(() => this.opts.id.current, (id) => {
			this.root.titleId = id;
		});
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		role: "heading",
		"aria-level": this.opts.level.current,
		[this.root.getBitsAttr("title")]: "",
		...this.root.sharedProps,
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
var DialogContentState = class DialogContentState {
	static create(opts) {
		return new DialogContentState(opts, DialogRootContext.get());
	}
	opts;
	root;
	attachment;
	constructor(opts, root) {
		this.opts = opts;
		this.root = root;
		this.attachment = attachRef(this.opts.ref, (v) => {
			this.root.contentNode = v;
			this.root.contentId = v?.id;
		});
	}
	#snippetProps = derived(() => ({ open: this.root.opts.open.current }));
	get snippetProps() {
		return this.#snippetProps();
	}
	set snippetProps($$value) {
		return this.#snippetProps($$value);
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		role: this.root.opts.variant.current === "alert-dialog" ? "alertdialog" : "dialog",
		"aria-modal": "true",
		"aria-describedby": this.root.descriptionId,
		"aria-labelledby": this.root.titleId,
		[this.root.getBitsAttr("content")]: "",
		style: {
			pointerEvents: "auto",
			outline: this.root.opts.variant.current === "alert-dialog" ? "none" : void 0,
			"--bits-dialog-depth": this.root.depth,
			"--bits-dialog-nested-count": this.root.nestedOpenCount,
			contain: "layout style"
		},
		tabindex: this.root.opts.variant.current === "alert-dialog" ? -1 : void 0,
		"data-nested-open": boolToEmptyStrOrUndef(this.root.nestedOpenCount > 0),
		"data-nested": boolToEmptyStrOrUndef(this.root.parent !== null),
		...getDataTransitionAttrs(this.root.contentPresence.transitionStatus),
		...this.root.sharedProps,
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
	get shouldRender() {
		return this.root.contentPresence.shouldRender;
	}
};
var DialogOverlayState = class DialogOverlayState {
	static create(opts) {
		return new DialogOverlayState(opts, DialogRootContext.get());
	}
	opts;
	root;
	attachment;
	constructor(opts, root) {
		this.opts = opts;
		this.root = root;
		this.attachment = attachRef(this.opts.ref, (v) => this.root.overlayNode = v);
	}
	#snippetProps = derived(() => ({ open: this.root.opts.open.current }));
	get snippetProps() {
		return this.#snippetProps();
	}
	set snippetProps($$value) {
		return this.#snippetProps($$value);
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		[this.root.getBitsAttr("overlay")]: "",
		style: {
			pointerEvents: "auto",
			"--bits-dialog-depth": this.root.depth,
			"--bits-dialog-nested-count": this.root.nestedOpenCount
		},
		"data-nested-open": boolToEmptyStrOrUndef(this.root.nestedOpenCount > 0),
		"data-nested": boolToEmptyStrOrUndef(this.root.parent !== null),
		...getDataTransitionAttrs(this.root.overlayPresence.transitionStatus),
		...this.root.sharedProps,
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
	get shouldRender() {
		return this.root.overlayPresence.shouldRender;
	}
};
function Dialog_title($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		const uid = props_id($$renderer$1);
		let { id = createId(uid), ref = null, child, children, level = 2, $$slots, $$events, ...restProps } = $$props;
		const titleState = DialogTitleState.create({
			id: boxWith(() => id),
			level: boxWith(() => level),
			ref: boxWith(() => ref, (v) => ref = v)
		});
		const mergedProps = derived(() => mergeProps(restProps, titleState.props));
		if (child) {
			$$renderer$1.push("<!--[0-->");
			child($$renderer$1, { props: mergedProps() });
			$$renderer$1.push(`<!---->`);
		} else {
			$$renderer$1.push("<!--[-1-->");
			$$renderer$1.push(`<div${attributes({ ...mergedProps() })}>`);
			children?.($$renderer$1);
			$$renderer$1.push(`<!----></div>`);
		}
		$$renderer$1.push(`<!--]-->`);
		bind_props($$props, { ref });
	});
}
function Portal_consumer($$renderer, $$props) {
	const { children } = $$props;
	$$renderer.push(`<!---->`);
	children?.($$renderer);
	$$renderer.push(`<!---->`);
	$$renderer.push(`<!---->`);
}
const BitsConfigContext = new Context("BitsConfig");
function getBitsConfig() {
	const fallback$1 = new BitsConfigState(null, {});
	return BitsConfigContext.getOr(fallback$1).opts;
}
var BitsConfigState = class {
	opts;
	constructor(parent, opts) {
		const resolveConfigOption = createConfigResolver(parent, opts);
		this.opts = {
			defaultPortalTo: resolveConfigOption((config) => config.defaultPortalTo),
			defaultLocale: resolveConfigOption((config) => config.defaultLocale)
		};
	}
};
function createConfigResolver(parent, currentOpts) {
	return (getter) => {
		return boxWith(() => {
			const value = getter(currentOpts)?.current;
			if (value !== void 0) return value;
			if (parent === null) return void 0;
			return getter(parent.opts)?.current;
		});
	};
}
function createPropResolver(configOption, fallback$1) {
	return (getProp) => {
		const config = getBitsConfig();
		return boxWith(() => {
			const propValue = getProp();
			if (propValue !== void 0) return propValue;
			const option = configOption(config).current;
			if (option !== void 0) return option;
			return fallback$1;
		});
	};
}
createPropResolver((config) => config.defaultLocale, "en");
const resolvePortalToProp = createPropResolver((config) => config.defaultPortalTo, "body");
function Portal($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { to: toProp, children, disabled } = $$props;
		const to = resolvePortalToProp(() => toProp);
		const context = getAllContexts();
		let target = derived(getTarget);
		function getTarget() {
			if (!isBrowser || disabled) return null;
			let localTarget = null;
			if (typeof to.current === "string") localTarget = document.querySelector(to.current);
			else localTarget = to.current;
			return localTarget;
		}
		let instance;
		function unmountInstance() {
			if (instance) {
				unmount(instance);
				instance = null;
			}
		}
		watch([() => target(), () => disabled], ([target$1, disabled$1]) => {
			if (!target$1 || disabled$1) {
				unmountInstance();
				return;
			}
			instance = mount(Portal_consumer, {
				target: target$1,
				props: { children },
				context
			});
			return () => {
				unmountInstance();
			};
		});
		if (disabled) {
			$$renderer$1.push("<!--[0-->");
			children?.($$renderer$1);
			$$renderer$1.push(`<!---->`);
		} else $$renderer$1.push("<!--[-1-->");
		$$renderer$1.push(`<!--]-->`);
	});
}
var CustomEventDispatcher = class {
	eventName;
	options;
	constructor(eventName, options = {
		bubbles: true,
		cancelable: true
	}) {
		this.eventName = eventName;
		this.options = options;
	}
	createEvent(detail) {
		return new CustomEvent(this.eventName, {
			...this.options,
			detail
		});
	}
	dispatch(element$1, detail) {
		const event = this.createEvent(detail);
		element$1.dispatchEvent(event);
		return event;
	}
	listen(element$1, callback, options) {
		const handler = (event) => {
			callback(event);
		};
		return on(element$1, this.eventName, handler, options);
	}
};
function debounce(fn, wait = 500) {
	let timeout = null;
	const debounced = (...args) => {
		if (timeout !== null) clearTimeout(timeout);
		timeout = setTimeout(() => {
			fn(...args);
		}, wait);
	};
	debounced.destroy = () => {
		if (timeout !== null) {
			clearTimeout(timeout);
			timeout = null;
		}
	};
	return debounced;
}
function isOrContainsTarget(node, target) {
	return node === target || node.contains(target);
}
function getOwnerDocument(el) {
	return el?.ownerDocument ?? document;
}
function isClickTrulyOutside(event, contentNode) {
	const { clientX, clientY } = event;
	const rect = contentNode.getBoundingClientRect();
	return clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom;
}
const CONTEXT_MENU_TRIGGER_ATTR = "data-context-menu-trigger";
const CONTEXT_MENU_CONTENT_ATTR = "data-context-menu-content";
new Context("Menu.Root");
new Context("Menu.Root | Menu.Sub");
new Context("Menu.Content");
new Context("Menu.Group | Menu.RadioGroup");
new Context("Menu.RadioGroup");
new Context("Menu.CheckboxGroup");
new CustomEventDispatcher("bitsmenuopen", {
	bubbles: false,
	cancelable: true
});
createBitsAttrs({
	component: "menu",
	parts: [
		"trigger",
		"content",
		"sub-trigger",
		"item",
		"group",
		"group-heading",
		"checkbox-group",
		"checkbox-item",
		"radio-group",
		"radio-item",
		"separator",
		"sub-content",
		"arrow"
	]
});
globalThis.bitsDismissableLayers ??= /* @__PURE__ */ new Map();
var DismissibleLayerState = class DismissibleLayerState {
	static create(opts) {
		return new DismissibleLayerState(opts);
	}
	opts;
	#interactOutsideProp;
	#behaviorType;
	#interceptedEvents = { pointerdown: false };
	#isResponsibleLayer = false;
	#isFocusInsideDOMTree = false;
	#documentObj = void 0;
	#onFocusOutside;
	#unsubClickListener = noop;
	constructor(opts) {
		this.opts = opts;
		this.#behaviorType = opts.interactOutsideBehavior;
		this.#interactOutsideProp = opts.onInteractOutside;
		this.#onFocusOutside = opts.onFocusOutside;
		let unsubEvents = noop;
		const cleanup = () => {
			this.#resetState();
			globalThis.bitsDismissableLayers.delete(this);
			this.#handleInteractOutside.destroy();
			unsubEvents();
		};
		watch([() => this.opts.enabled.current, () => this.opts.ref.current], () => {
			if (!this.opts.enabled.current || !this.opts.ref.current) return;
			afterSleep(1, () => {
				if (!this.opts.ref.current) return;
				globalThis.bitsDismissableLayers.set(this, this.#behaviorType);
				unsubEvents();
				unsubEvents = this.#addEventListeners();
			});
			return cleanup;
		});
	}
	#handleFocus = (event) => {
		if (event.defaultPrevented) return;
		if (!this.opts.ref.current) return;
		afterTick(() => {
			if (!this.opts.ref.current || this.#isTargetWithinLayer(event.target)) return;
			if (event.target && !this.#isFocusInsideDOMTree) this.#onFocusOutside.current?.(event);
		});
	};
	#addEventListeners() {
		return executeCallbacks(on(this.#documentObj, "pointerdown", executeCallbacks(this.#markInterceptedEvent, this.#markResponsibleLayer), { capture: true }), on(this.#documentObj, "pointerdown", executeCallbacks(this.#markNonInterceptedEvent, this.#handleInteractOutside)), on(this.#documentObj, "focusin", this.#handleFocus));
	}
	#handleDismiss = (e) => {
		let event = e;
		if (event.defaultPrevented) event = createWrappedEvent(e);
		this.#interactOutsideProp.current(e);
	};
	#handleInteractOutside = debounce((e) => {
		if (!this.opts.ref.current) {
			this.#unsubClickListener();
			return;
		}
		const isEventValid = this.opts.isValidEvent.current(e, this.opts.ref.current) || isValidEvent(e, this.opts.ref.current);
		if (!this.#isResponsibleLayer || this.#isAnyEventIntercepted() || !isEventValid) {
			this.#unsubClickListener();
			return;
		}
		let event = e;
		if (event.defaultPrevented) event = createWrappedEvent(event);
		if (this.#behaviorType.current !== "close" && this.#behaviorType.current !== "defer-otherwise-close") {
			this.#unsubClickListener();
			return;
		}
		if (e.pointerType === "touch") {
			this.#unsubClickListener();
			this.#unsubClickListener = on(this.#documentObj, "click", this.#handleDismiss, { once: true });
		} else this.#interactOutsideProp.current(event);
	}, 10);
	#markInterceptedEvent = (e) => {
		this.#interceptedEvents[e.type] = true;
	};
	#markNonInterceptedEvent = (e) => {
		this.#interceptedEvents[e.type] = false;
	};
	#markResponsibleLayer = () => {
		if (!this.opts.ref.current) return;
		this.#isResponsibleLayer = isResponsibleLayer(this.opts.ref.current);
	};
	#isTargetWithinLayer = (target) => {
		if (!this.opts.ref.current) return false;
		return isOrContainsTarget(this.opts.ref.current, target);
	};
	#resetState = debounce(() => {
		for (const eventType in this.#interceptedEvents) this.#interceptedEvents[eventType] = false;
		this.#isResponsibleLayer = false;
	}, 20);
	#isAnyEventIntercepted() {
		return Object.values(this.#interceptedEvents).some(Boolean);
	}
	#onfocuscapture = () => {
		this.#isFocusInsideDOMTree = true;
	};
	#onblurcapture = () => {
		this.#isFocusInsideDOMTree = false;
	};
	props = {
		onfocuscapture: this.#onfocuscapture,
		onblurcapture: this.#onblurcapture
	};
};
function getTopMostDismissableLayer(layersArr = [...globalThis.bitsDismissableLayers]) {
	return layersArr.findLast(([_, { current: behaviorType }]) => behaviorType === "close" || behaviorType === "ignore");
}
function isResponsibleLayer(node) {
	const layersArr = [...globalThis.bitsDismissableLayers];
	const topMostLayer = getTopMostDismissableLayer(layersArr);
	if (topMostLayer) return topMostLayer[0].opts.ref.current === node;
	const [firstLayerNode] = layersArr[0];
	return firstLayerNode.opts.ref.current === node;
}
function isValidEvent(e, node) {
	const target = e.target;
	if (!isElementOrSVGElement(target)) return false;
	const targetIsContextMenuTrigger = Boolean(target.closest(`[${CONTEXT_MENU_TRIGGER_ATTR}]`));
	const nodeIsContextMenu = Boolean(node.closest(`[${CONTEXT_MENU_CONTENT_ATTR}]`));
	if ("button" in e && e.button > 0 && !targetIsContextMenuTrigger) return false;
	if ("button" in e && e.button === 0 && targetIsContextMenuTrigger && nodeIsContextMenu) return true;
	if (targetIsContextMenuTrigger && nodeIsContextMenu) return false;
	return getOwnerDocument(target).documentElement.contains(target) && !isOrContainsTarget(node, target) && isClickTrulyOutside(e, node);
}
function createWrappedEvent(e) {
	const capturedCurrentTarget = e.currentTarget;
	const capturedTarget = e.target;
	let newEvent;
	if (e instanceof PointerEvent) newEvent = new PointerEvent(e.type, e);
	else newEvent = new PointerEvent("pointerdown", e);
	let isPrevented = false;
	return new Proxy(newEvent, { get: (target, prop) => {
		if (prop === "currentTarget") return capturedCurrentTarget;
		if (prop === "target") return capturedTarget;
		if (prop === "preventDefault") return () => {
			isPrevented = true;
			if (typeof target.preventDefault === "function") target.preventDefault();
		};
		if (prop === "defaultPrevented") return isPrevented;
		if (prop in target) return target[prop];
		return e[prop];
	} });
}
function Dismissible_layer($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { interactOutsideBehavior = "close", onInteractOutside = noop, onFocusOutside = noop, id, children, enabled, isValidEvent: isValidEvent$1 = () => false, ref } = $$props;
		const dismissibleLayerState = DismissibleLayerState.create({
			id: boxWith(() => id),
			interactOutsideBehavior: boxWith(() => interactOutsideBehavior),
			onInteractOutside: boxWith(() => onInteractOutside),
			enabled: boxWith(() => enabled),
			onFocusOutside: boxWith(() => onFocusOutside),
			isValidEvent: boxWith(() => isValidEvent$1),
			ref
		});
		children?.($$renderer$1, { props: dismissibleLayerState.props });
		$$renderer$1.push(`<!---->`);
	});
}
globalThis.bitsEscapeLayers ??= /* @__PURE__ */ new Map();
var EscapeLayerState = class EscapeLayerState {
	static create(opts) {
		return new EscapeLayerState(opts);
	}
	opts;
	domContext;
	constructor(opts) {
		this.opts = opts;
		this.domContext = new DOMContext(this.opts.ref);
		let unsubEvents = noop;
		watch(() => opts.enabled.current, (enabled) => {
			if (enabled) {
				globalThis.bitsEscapeLayers.set(this, opts.escapeKeydownBehavior);
				unsubEvents = this.#addEventListener();
			}
			return () => {
				unsubEvents();
				globalThis.bitsEscapeLayers.delete(this);
			};
		});
	}
	#addEventListener = () => {
		return on(this.domContext.getDocument(), "keydown", this.#onkeydown, { passive: false });
	};
	#onkeydown = (e) => {
		if (e.key !== "Escape" || !isResponsibleEscapeLayer(this)) return;
		const clonedEvent = new KeyboardEvent(e.type, e);
		e.preventDefault();
		const behaviorType = this.opts.escapeKeydownBehavior.current;
		if (behaviorType !== "close" && behaviorType !== "defer-otherwise-close") return;
		this.opts.onEscapeKeydown.current(clonedEvent);
	};
};
function isResponsibleEscapeLayer(instance) {
	const layersArr = [...globalThis.bitsEscapeLayers];
	const topMostLayer = layersArr.findLast(([_, { current: behaviorType }]) => behaviorType === "close" || behaviorType === "ignore");
	if (topMostLayer) return topMostLayer[0] === instance;
	const [firstLayerNode] = layersArr[0];
	return firstLayerNode === instance;
}
function Escape_layer($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { escapeKeydownBehavior = "close", onEscapeKeydown = noop, children, enabled, ref } = $$props;
		EscapeLayerState.create({
			escapeKeydownBehavior: boxWith(() => escapeKeydownBehavior),
			onEscapeKeydown: boxWith(() => onEscapeKeydown),
			enabled: boxWith(() => enabled),
			ref
		});
		children?.($$renderer$1);
		$$renderer$1.push(`<!---->`);
	});
}
var FocusScopeManager = class FocusScopeManager {
	static instance;
	#scopeStack = simpleBox([]);
	#focusHistory = /* @__PURE__ */ new WeakMap();
	#preFocusHistory = /* @__PURE__ */ new WeakMap();
	static getInstance() {
		if (!this.instance) this.instance = new FocusScopeManager();
		return this.instance;
	}
	register(scope) {
		const current = this.getActive();
		if (current && current !== scope) current.pause();
		const activeElement$1 = document.activeElement;
		if (activeElement$1 && activeElement$1 !== document.body) this.#preFocusHistory.set(scope, activeElement$1);
		this.#scopeStack.current = this.#scopeStack.current.filter((s) => s !== scope);
		this.#scopeStack.current.unshift(scope);
	}
	unregister(scope) {
		this.#scopeStack.current = this.#scopeStack.current.filter((s) => s !== scope);
		const next = this.getActive();
		if (next) next.resume();
	}
	getActive() {
		return this.#scopeStack.current[0];
	}
	setFocusMemory(scope, element$1) {
		this.#focusHistory.set(scope, element$1);
	}
	getFocusMemory(scope) {
		return this.#focusHistory.get(scope);
	}
	isActiveScope(scope) {
		return this.getActive() === scope;
	}
	setPreFocusMemory(scope, element$1) {
		this.#preFocusHistory.set(scope, element$1);
	}
	getPreFocusMemory(scope) {
		return this.#preFocusHistory.get(scope);
	}
	clearPreFocusMemory(scope) {
		this.#preFocusHistory.delete(scope);
	}
};
var FocusScope = class FocusScope {
	#paused = false;
	#container = null;
	#manager = FocusScopeManager.getInstance();
	#cleanupFns = [];
	#opts;
	constructor(opts) {
		this.#opts = opts;
	}
	get paused() {
		return this.#paused;
	}
	pause() {
		this.#paused = true;
	}
	resume() {
		this.#paused = false;
	}
	#cleanup() {
		for (const fn of this.#cleanupFns) fn();
		this.#cleanupFns = [];
	}
	mount(container) {
		if (this.#container) this.unmount();
		this.#container = container;
		this.#manager.register(this);
		this.#setupEventListeners();
		this.#handleOpenAutoFocus();
	}
	unmount() {
		if (!this.#container) return;
		this.#cleanup();
		this.#handleCloseAutoFocus();
		this.#manager.unregister(this);
		this.#manager.clearPreFocusMemory(this);
		this.#container = null;
	}
	#handleOpenAutoFocus() {
		if (!this.#container) return;
		const event = new CustomEvent("focusScope.onOpenAutoFocus", {
			bubbles: false,
			cancelable: true
		});
		this.#opts.onOpenAutoFocus.current(event);
		if (!event.defaultPrevented) requestAnimationFrame(() => {
			if (!this.#container) return;
			const firstTabbable = this.#getFirstTabbable();
			if (firstTabbable) {
				firstTabbable.focus();
				this.#manager.setFocusMemory(this, firstTabbable);
			} else this.#container.focus();
		});
	}
	#handleCloseAutoFocus() {
		const event = new CustomEvent("focusScope.onCloseAutoFocus", {
			bubbles: false,
			cancelable: true
		});
		this.#opts.onCloseAutoFocus.current?.(event);
		if (!event.defaultPrevented) {
			const preFocusedElement = this.#manager.getPreFocusMemory(this);
			if (preFocusedElement && document.contains(preFocusedElement)) try {
				preFocusedElement.focus();
			} catch {
				document.body.focus();
			}
		}
	}
	#setupEventListeners() {
		if (!this.#container || !this.#opts.trap.current) return;
		const container = this.#container;
		const doc = container.ownerDocument;
		const handleFocus = (e) => {
			if (this.#paused || !this.#manager.isActiveScope(this)) return;
			const target = e.target;
			if (!target) return;
			if (container.contains(target)) this.#manager.setFocusMemory(this, target);
			else {
				const lastFocused = this.#manager.getFocusMemory(this);
				if (lastFocused && container.contains(lastFocused) && isFocusable(lastFocused)) {
					e.preventDefault();
					lastFocused.focus();
				} else {
					const firstTabbable = this.#getFirstTabbable();
					const firstFocusable = this.#getAllFocusables()[0];
					(firstTabbable || firstFocusable || container).focus();
				}
			}
		};
		const handleKeydown = (e) => {
			if (!this.#opts.loop || this.#paused || e.key !== "Tab") return;
			if (!this.#manager.isActiveScope(this)) return;
			const tabbables = this.#getTabbables();
			if (tabbables.length === 0) return;
			const first = tabbables[0];
			const last = tabbables[tabbables.length - 1];
			if (!e.shiftKey && doc.activeElement === last) {
				e.preventDefault();
				first.focus();
			} else if (e.shiftKey && doc.activeElement === first) {
				e.preventDefault();
				last.focus();
			}
		};
		this.#cleanupFns.push(on(doc, "focusin", handleFocus, { capture: true }), on(container, "keydown", handleKeydown));
		const observer = new MutationObserver(() => {
			const lastFocused = this.#manager.getFocusMemory(this);
			if (lastFocused && !container.contains(lastFocused)) {
				const firstTabbable = this.#getFirstTabbable();
				const firstFocusable = this.#getAllFocusables()[0];
				const elementToFocus = firstTabbable || firstFocusable;
				if (elementToFocus) {
					elementToFocus.focus();
					this.#manager.setFocusMemory(this, elementToFocus);
				} else container.focus();
			}
		});
		observer.observe(container, {
			childList: true,
			subtree: true
		});
		this.#cleanupFns.push(() => observer.disconnect());
	}
	#getTabbables() {
		if (!this.#container) return [];
		return tabbable(this.#container, {
			includeContainer: false,
			getShadowRoot: true
		});
	}
	#getFirstTabbable() {
		return this.#getTabbables()[0] || null;
	}
	#getAllFocusables() {
		if (!this.#container) return [];
		return focusable(this.#container, {
			includeContainer: false,
			getShadowRoot: true
		});
	}
	static use(opts) {
		let scope = null;
		watch([() => opts.ref.current, () => opts.enabled.current], ([ref, enabled]) => {
			if (ref && enabled) {
				if (!scope) scope = new FocusScope(opts);
				scope.mount(ref);
			} else if (scope) {
				scope.unmount();
				scope = null;
			}
		});
		return { get props() {
			return { tabindex: -1 };
		} };
	}
};
function Focus_scope($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { enabled = false, trapFocus = false, loop = false, onCloseAutoFocus = noop, onOpenAutoFocus = noop, focusScope, ref } = $$props;
		const focusScopeState = FocusScope.use({
			enabled: boxWith(() => enabled),
			trap: boxWith(() => trapFocus),
			loop,
			onCloseAutoFocus: boxWith(() => onCloseAutoFocus),
			onOpenAutoFocus: boxWith(() => onOpenAutoFocus),
			ref
		});
		focusScope?.($$renderer$1, { props: focusScopeState.props });
		$$renderer$1.push(`<!---->`);
	});
}
var noopPointer = () => {};
globalThis.bitsTextSelectionLayers ??= /* @__PURE__ */ new Map();
var TextSelectionLayerState = class TextSelectionLayerState {
	static create(opts) {
		return new TextSelectionLayerState(opts);
	}
	opts;
	domContext;
	#unsubSelectionLock = noop;
	#enabledSnapshot = false;
	#onPointerDownSnapshot = noopPointer;
	#onPointerUpSnapshot = noopPointer;
	constructor(opts) {
		this.opts = opts;
		this.domContext = new DOMContext(opts.ref);
		let unsubEvents = noop;
		watch(() => [
			this.opts.enabled.current,
			this.opts.onPointerDown.current,
			this.opts.onPointerUp.current
		], ([enabled, onPointerDown, onPointerUp]) => {
			this.#enabledSnapshot = enabled;
			this.#onPointerDownSnapshot = onPointerDown;
			this.#onPointerUpSnapshot = onPointerUp;
			if (enabled) {
				globalThis.bitsTextSelectionLayers.set(this, this.opts.enabled);
				unsubEvents();
				unsubEvents = this.#addEventListeners();
			}
			return () => {
				this.#enabledSnapshot = false;
				unsubEvents();
				this.#resetSelectionLock();
				globalThis.bitsTextSelectionLayers.delete(this);
			};
		});
	}
	#addEventListeners() {
		return executeCallbacks(on(this.domContext.getDocument(), "pointerdown", this.#pointerdown), on(this.domContext.getDocument(), "pointerup", composeHandlers(this.#resetSelectionLock, this.#pointerupUserHandler)));
	}
	#pointerupUserHandler = (e) => {
		this.#onPointerUpSnapshot(e);
	};
	#pointerdown = (e) => {
		const node = this.opts.ref.current;
		const target = e.target;
		if (!isHTMLElement(node) || !isHTMLElement(target) || !this.#enabledSnapshot) return;
		if (!isHighestLayer(this) || !contains(node, target)) return;
		this.#onPointerDownSnapshot(e);
		if (e.defaultPrevented) return;
		this.#unsubSelectionLock = preventTextSelectionOverflow(node, this.domContext.getDocument().body);
	};
	#resetSelectionLock = () => {
		this.#unsubSelectionLock();
		this.#unsubSelectionLock = noop;
	};
};
var getUserSelect = (node) => node.style.userSelect || node.style.webkitUserSelect;
function preventTextSelectionOverflow(node, body) {
	const originalBodyUserSelect = getUserSelect(body);
	const originalNodeUserSelect = getUserSelect(node);
	setUserSelect(body, "none");
	setUserSelect(node, "text");
	return () => {
		setUserSelect(body, originalBodyUserSelect);
		setUserSelect(node, originalNodeUserSelect);
	};
}
function setUserSelect(node, value) {
	node.style.userSelect = value;
	node.style.webkitUserSelect = value;
}
function isHighestLayer(instance) {
	const layersArr = [...globalThis.bitsTextSelectionLayers];
	if (!layersArr.length) return false;
	const highestLayer = layersArr.at(-1);
	if (!highestLayer) return false;
	return highestLayer[0] === instance;
}
function Text_selection_layer($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { preventOverflowTextSelection = true, onPointerDown = noop, onPointerUp = noop, id, children, enabled, ref } = $$props;
		TextSelectionLayerState.create({
			id: boxWith(() => id),
			onPointerDown: boxWith(() => onPointerDown),
			onPointerUp: boxWith(() => onPointerUp),
			enabled: boxWith(() => enabled && preventOverflowTextSelection),
			ref
		});
		children?.($$renderer$1);
		$$renderer$1.push(`<!---->`);
	});
}
globalThis.bitsIdCounter ??= { current: 0 };
function useId(prefix = "bits") {
	globalThis.bitsIdCounter.current++;
	return `${prefix}-${globalThis.bitsIdCounter.current}`;
}
var SharedState = class {
	#factory;
	#subscribers = 0;
	#state;
	#scope;
	constructor(factory) {
		this.#factory = factory;
	}
	#dispose() {
		this.#subscribers -= 1;
		if (this.#scope && this.#subscribers <= 0) {
			this.#scope();
			this.#state = void 0;
			this.#scope = void 0;
		}
	}
	get(...args) {
		this.#subscribers += 1;
		if (this.#state === void 0) this.#scope = () => {};
		return this.#state;
	}
};
var lockMap = new SvelteMap();
var initialBodyStyle = null;
var cleanupTimeoutId = null;
var isInCleanupTransition = false;
var anyLocked = boxWith(() => {
	for (const value of lockMap.values()) if (value) return true;
	return false;
});
var cleanupScheduledAt = null;
var bodyLockStackCount = new SharedState(() => {
	function resetBodyStyle() {}
	function cancelPendingCleanup() {
		if (cleanupTimeoutId === null) return;
		window.clearTimeout(cleanupTimeoutId);
		cleanupTimeoutId = null;
	}
	function scheduleCleanupIfNoNewLocks(delay, callback) {
		cancelPendingCleanup();
		isInCleanupTransition = true;
		cleanupScheduledAt = Date.now();
		const currentCleanupId = cleanupScheduledAt;
		const cleanupFn = () => {
			cleanupTimeoutId = null;
			if (cleanupScheduledAt !== currentCleanupId) return;
			if (!isAnyLocked(lockMap)) {
				isInCleanupTransition = false;
				callback();
			} else isInCleanupTransition = false;
		};
		const actualDelay = delay === null ? 24 : delay;
		cleanupTimeoutId = window.setTimeout(cleanupFn, actualDelay);
	}
	function ensureInitialStyleCaptured() {
		if (initialBodyStyle === null && lockMap.size === 0 && !isInCleanupTransition) initialBodyStyle = document.body.getAttribute("style");
	}
	watch(() => anyLocked.current, () => {
		if (!anyLocked.current) return;
		ensureInitialStyleCaptured();
		isInCleanupTransition = false;
		const htmlStyle = getComputedStyle(document.documentElement);
		const bodyStyle = getComputedStyle(document.body);
		const hasStableGutter = htmlStyle.scrollbarGutter?.includes("stable") || bodyStyle.scrollbarGutter?.includes("stable");
		const verticalScrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
		const config = {
			padding: Number.parseInt(bodyStyle.paddingRight ?? "0", 10) + verticalScrollbarWidth,
			margin: Number.parseInt(bodyStyle.marginRight ?? "0", 10)
		};
		if (verticalScrollbarWidth > 0 && !hasStableGutter) {
			document.body.style.paddingRight = `${config.padding}px`;
			document.body.style.marginRight = `${config.margin}px`;
			document.body.style.setProperty("--scrollbar-width", `${verticalScrollbarWidth}px`);
		}
		document.body.style.overflow = "hidden";
		if (isIOS) on(document, "touchmove", (e) => {
			if (e.target !== document.documentElement) return;
			if (e.touches.length > 1) return;
			e.preventDefault();
		}, { passive: false });
		afterTick(() => {
			document.body.style.pointerEvents = "none";
			document.body.style.overflow = "hidden";
		});
	});
	return {
		get lockMap() {
			return lockMap;
		},
		resetBodyStyle,
		scheduleCleanupIfNoNewLocks,
		cancelPendingCleanup,
		ensureInitialStyleCaptured
	};
});
var BodyScrollLock = class {
	#id = useId();
	#initialState;
	#restoreScrollDelay = () => null;
	#countState;
	locked;
	constructor(initialState, restoreScrollDelay = () => null) {
		this.#initialState = initialState;
		this.#restoreScrollDelay = restoreScrollDelay;
		this.#countState = bodyLockStackCount.get();
		if (!this.#countState) return;
		this.#countState.cancelPendingCleanup();
		this.#countState.ensureInitialStyleCaptured();
		this.#countState.lockMap.set(this.#id, this.#initialState ?? false);
		this.locked = boxWith(() => this.#countState.lockMap.get(this.#id) ?? false, (v) => this.#countState.lockMap.set(this.#id, v));
	}
};
function isAnyLocked(map) {
	for (const [_, value] of map) if (value) return true;
	return false;
}
function Scroll_lock($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { preventScroll = true, restoreScrollDelay = null } = $$props;
		if (preventScroll) new BodyScrollLock(preventScroll, () => restoreScrollDelay);
	});
}
function Dialog_overlay($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		const uid = props_id($$renderer$1);
		let { id = createId(uid), forceMount = false, child, children, ref = null, $$slots, $$events, ...restProps } = $$props;
		const overlayState = DialogOverlayState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
		});
		const mergedProps = derived(() => mergeProps(restProps, overlayState.props));
		if (overlayState.shouldRender || forceMount) {
			$$renderer$1.push("<!--[0-->");
			if (child) {
				$$renderer$1.push("<!--[0-->");
				child($$renderer$1, {
					props: mergeProps(mergedProps()),
					...overlayState.snippetProps
				});
				$$renderer$1.push(`<!---->`);
			} else {
				$$renderer$1.push("<!--[-1-->");
				$$renderer$1.push(`<div${attributes({ ...mergeProps(mergedProps()) })}>`);
				children?.($$renderer$1, overlayState.snippetProps);
				$$renderer$1.push(`<!----></div>`);
			}
			$$renderer$1.push(`<!--]-->`);
		} else $$renderer$1.push("<!--[-1-->");
		$$renderer$1.push(`<!--]-->`);
		bind_props($$props, { ref });
	});
}
function Hidden_input($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { value = void 0, $$slots, $$events, ...restProps } = $$props;
		const mergedProps = derived(() => mergeProps(restProps, {
			"aria-hidden": "true",
			tabindex: -1,
			style: {
				...srOnlyStyles,
				position: "absolute",
				top: "0",
				left: "0"
			}
		}));
		if (mergedProps().type === "checkbox") {
			$$renderer$1.push("<!--[0-->");
			$$renderer$1.push(`<input${attributes({
				...mergedProps(),
				value
			}, void 0, void 0, void 0, 4)}/>`);
		} else {
			$$renderer$1.push("<!--[-1-->");
			$$renderer$1.push(`<input${attributes({
				value,
				...mergedProps()
			}, void 0, void 0, void 0, 4)}/>`);
		}
		$$renderer$1.push(`<!--]-->`);
		bind_props($$props, { value });
	});
}
function get(valueOrGetValue) {
	return typeof valueOrGetValue === "function" ? valueOrGetValue() : valueOrGetValue;
}
function getDPR(element$1) {
	if (typeof window === "undefined") return 1;
	return (element$1.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function roundByDPR(element$1, value) {
	const dpr = getDPR(element$1);
	return Math.round(value * dpr) / dpr;
}
function getFloatingContentCSSVars(name) {
	return {
		[`--bits-${name}-content-transform-origin`]: `var(--bits-floating-transform-origin)`,
		[`--bits-${name}-content-available-width`]: `var(--bits-floating-available-width)`,
		[`--bits-${name}-content-available-height`]: `var(--bits-floating-available-height)`,
		[`--bits-${name}-anchor-width`]: `var(--bits-floating-anchor-width)`,
		[`--bits-${name}-anchor-height`]: `var(--bits-floating-anchor-height)`
	};
}
function useFloating(options) {
	options.whileElementsMounted;
	const openOption = derived(() => get(options.open) ?? true);
	const middlewareOption = derived(() => get(options.middleware));
	const transformOption = derived(() => get(options.transform) ?? true);
	const placementOption = derived(() => get(options.placement) ?? "bottom");
	const strategyOption = derived(() => get(options.strategy) ?? "absolute");
	const sideOffsetOption = derived(() => get(options.sideOffset) ?? 0);
	const alignOffsetOption = derived(() => get(options.alignOffset) ?? 0);
	const reference = options.reference;
	let x = 0;
	let y = 0;
	const floating = simpleBox(null);
	let strategy = strategyOption();
	let placement = placementOption();
	let middlewareData = {};
	let isPositioned = false;
	let updateRequestId = 0;
	const floatingStyles = derived(() => {
		const xVal = floating.current ? roundByDPR(floating.current, x) : x;
		const yVal = floating.current ? roundByDPR(floating.current, y) : y;
		if (transformOption()) return {
			position: strategy,
			left: "0",
			top: "0",
			transform: `translate(${xVal}px, ${yVal}px)`,
			...floating.current && getDPR(floating.current) >= 1.5 && { willChange: "transform" }
		};
		return {
			position: strategy,
			left: `${xVal}px`,
			top: `${yVal}px`
		};
	});
	function update() {
		if (reference.current === null || floating.current === null) return;
		const referenceNode = reference.current;
		const floatingNode = floating.current;
		const requestId = ++updateRequestId;
		computePosition(referenceNode, floatingNode, {
			middleware: middlewareOption(),
			placement: placementOption(),
			strategy: strategyOption()
		}).then((position) => {
			if (requestId !== updateRequestId) return;
			if (reference.current !== referenceNode || floating.current !== floatingNode) return;
			if (isReferenceHidden(referenceNode)) {
				middlewareData = {
					...middlewareData,
					hide: {
						...middlewareData.hide,
						referenceHidden: true
					}
				};
				return;
			}
			if (!openOption() && x !== 0 && y !== 0) {
				const maxExpectedOffset = Math.max(Math.abs(sideOffsetOption()), Math.abs(alignOffsetOption()), 15);
				if (position.x <= maxExpectedOffset && position.y <= maxExpectedOffset) return;
			}
			x = position.x;
			y = position.y;
			strategy = position.strategy;
			placement = position.placement;
			middlewareData = position.middlewareData;
			isPositioned = true;
		});
	}
	return {
		floating,
		reference,
		get strategy() {
			return strategy;
		},
		get placement() {
			return placement;
		},
		get middlewareData() {
			return middlewareData;
		},
		get isPositioned() {
			return isPositioned;
		},
		get floatingStyles() {
			return floatingStyles();
		},
		get update() {
			return update;
		}
	};
}
function isReferenceHidden(node) {
	if (!(node instanceof Element)) return false;
	if (!node.isConnected) return true;
	if (node instanceof HTMLElement && node.hidden) return true;
	return node.getClientRects().length === 0;
}
var OPPOSITE_SIDE = {
	top: "bottom",
	right: "left",
	bottom: "top",
	left: "right"
};
var FloatingRootContext = new Context("Floating.Root");
var FloatingContentContext = new Context("Floating.Content");
var FloatingTooltipRootContext = new Context("Floating.Root");
var FloatingRootState = class FloatingRootState {
	static create(tooltip = false) {
		return tooltip ? FloatingTooltipRootContext.set(new FloatingRootState()) : FloatingRootContext.set(new FloatingRootState());
	}
	anchorNode = simpleBox(null);
	customAnchorNode = simpleBox(null);
	triggerNode = simpleBox(null);
	constructor() {}
};
var FloatingContentState = class FloatingContentState {
	static create(opts, tooltip = false) {
		return tooltip ? FloatingContentContext.set(new FloatingContentState(opts, FloatingTooltipRootContext.get())) : FloatingContentContext.set(new FloatingContentState(opts, FloatingRootContext.get()));
	}
	opts;
	root;
	contentRef = simpleBox(null);
	wrapperRef = simpleBox(null);
	arrowRef = simpleBox(null);
	contentAttachment = attachRef(this.contentRef);
	wrapperAttachment = attachRef(this.wrapperRef);
	arrowAttachment = attachRef(this.arrowRef);
	arrowId = simpleBox(useId());
	#transformedStyle = derived(() => {
		if (typeof this.opts.style === "string") return cssToStyleObj(this.opts.style);
		if (!this.opts.style) return {};
	});
	#updatePositionStrategy = void 0;
	#arrowSize = new ElementSize(() => this.arrowRef.current ?? void 0);
	#arrowWidth = derived(() => this.#arrowSize?.width ?? 0);
	#arrowHeight = derived(() => this.#arrowSize?.height ?? 0);
	#desiredPlacement = derived(() => this.opts.side?.current + (this.opts.align.current !== "center" ? `-${this.opts.align.current}` : ""));
	#boundary = derived(() => Array.isArray(this.opts.collisionBoundary.current) ? this.opts.collisionBoundary.current : [this.opts.collisionBoundary.current]);
	#hasExplicitBoundaries = derived(() => this.#boundary().length > 0);
	get hasExplicitBoundaries() {
		return this.#hasExplicitBoundaries();
	}
	set hasExplicitBoundaries($$value) {
		return this.#hasExplicitBoundaries($$value);
	}
	#detectOverflowOptions = derived(() => ({
		padding: this.opts.collisionPadding.current,
		boundary: this.#boundary().filter(isNotNull),
		altBoundary: this.hasExplicitBoundaries
	}));
	get detectOverflowOptions() {
		return this.#detectOverflowOptions();
	}
	set detectOverflowOptions($$value) {
		return this.#detectOverflowOptions($$value);
	}
	#availableWidth = void 0;
	#availableHeight = void 0;
	#anchorWidth = void 0;
	#anchorHeight = void 0;
	#middleware = derived(() => [
		offset({
			mainAxis: this.opts.sideOffset.current + this.#arrowHeight(),
			alignmentAxis: this.opts.alignOffset.current
		}),
		this.opts.avoidCollisions.current && shift({
			mainAxis: true,
			crossAxis: false,
			limiter: this.opts.sticky.current === "partial" ? limitShift() : void 0,
			...this.detectOverflowOptions
		}),
		this.opts.avoidCollisions.current && flip({ ...this.detectOverflowOptions }),
		size({
			...this.detectOverflowOptions,
			apply: ({ rects, availableWidth, availableHeight }) => {
				const { width: anchorWidth, height: anchorHeight } = rects.reference;
				this.#availableWidth = availableWidth;
				this.#availableHeight = availableHeight;
				this.#anchorWidth = anchorWidth;
				this.#anchorHeight = anchorHeight;
			}
		}),
		this.arrowRef.current && arrow({
			element: this.arrowRef.current,
			padding: this.opts.arrowPadding.current
		}),
		transformOrigin({
			arrowWidth: this.#arrowWidth(),
			arrowHeight: this.#arrowHeight()
		}),
		this.opts.hideWhenDetached.current && hide({
			strategy: "referenceHidden",
			...this.detectOverflowOptions
		})
	].filter(Boolean));
	get middleware() {
		return this.#middleware();
	}
	set middleware($$value) {
		return this.#middleware($$value);
	}
	floating;
	#placedSide = derived(() => getSideFromPlacement(this.floating.placement));
	get placedSide() {
		return this.#placedSide();
	}
	set placedSide($$value) {
		return this.#placedSide($$value);
	}
	#placedAlign = derived(() => getAlignFromPlacement(this.floating.placement));
	get placedAlign() {
		return this.#placedAlign();
	}
	set placedAlign($$value) {
		return this.#placedAlign($$value);
	}
	#arrowX = derived(() => this.floating.middlewareData.arrow?.x ?? 0);
	get arrowX() {
		return this.#arrowX();
	}
	set arrowX($$value) {
		return this.#arrowX($$value);
	}
	#arrowY = derived(() => this.floating.middlewareData.arrow?.y ?? 0);
	get arrowY() {
		return this.#arrowY();
	}
	set arrowY($$value) {
		return this.#arrowY($$value);
	}
	#cannotCenterArrow = derived(() => this.floating.middlewareData.arrow?.centerOffset !== 0);
	get cannotCenterArrow() {
		return this.#cannotCenterArrow();
	}
	set cannotCenterArrow($$value) {
		return this.#cannotCenterArrow($$value);
	}
	contentZIndex;
	#arrowBaseSide = derived(() => OPPOSITE_SIDE[this.placedSide]);
	get arrowBaseSide() {
		return this.#arrowBaseSide();
	}
	set arrowBaseSide($$value) {
		return this.#arrowBaseSide($$value);
	}
	#wrapperProps = derived(() => ({
		id: this.opts.wrapperId.current,
		"data-bits-floating-content-wrapper": "",
		style: {
			...this.floating.floatingStyles,
			transform: this.floating.isPositioned ? this.floating.floatingStyles.transform : "translate(0, -200%)",
			minWidth: "max-content",
			zIndex: this.contentZIndex,
			"--bits-floating-transform-origin": `${this.floating.middlewareData.transformOrigin?.x} ${this.floating.middlewareData.transformOrigin?.y}`,
			"--bits-floating-available-width": `${this.#availableWidth}px`,
			"--bits-floating-available-height": `${this.#availableHeight}px`,
			"--bits-floating-anchor-width": `${this.#anchorWidth}px`,
			"--bits-floating-anchor-height": `${this.#anchorHeight}px`,
			...this.floating.middlewareData.hide?.referenceHidden && {
				visibility: "hidden",
				"pointer-events": "none"
			},
			...this.#transformedStyle()
		},
		dir: this.opts.dir.current,
		...this.wrapperAttachment
	}));
	get wrapperProps() {
		return this.#wrapperProps();
	}
	set wrapperProps($$value) {
		return this.#wrapperProps($$value);
	}
	#props = derived(() => ({
		"data-side": this.placedSide,
		"data-align": this.placedAlign,
		style: styleToString({ ...this.#transformedStyle() }),
		...this.contentAttachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
	#arrowStyle = derived(() => ({
		position: "absolute",
		left: this.arrowX ? `${this.arrowX}px` : void 0,
		top: this.arrowY ? `${this.arrowY}px` : void 0,
		[this.arrowBaseSide]: 0,
		"transform-origin": {
			top: "",
			right: "0 0",
			bottom: "center 0",
			left: "100% 0"
		}[this.placedSide],
		transform: {
			top: "translateY(100%)",
			right: "translateY(50%) rotate(90deg) translateX(-50%)",
			bottom: "rotate(180deg)",
			left: "translateY(50%) rotate(-90deg) translateX(50%)"
		}[this.placedSide],
		visibility: this.cannotCenterArrow ? "hidden" : void 0
	}));
	get arrowStyle() {
		return this.#arrowStyle();
	}
	set arrowStyle($$value) {
		return this.#arrowStyle($$value);
	}
	constructor(opts, root) {
		this.opts = opts;
		this.root = root;
		this.#updatePositionStrategy = opts.updatePositionStrategy;
		if (opts.customAnchor) this.root.customAnchorNode.current = opts.customAnchor.current;
		watch(() => opts.customAnchor.current, (customAnchor) => {
			this.root.customAnchorNode.current = customAnchor;
		});
		this.floating = useFloating({
			strategy: () => this.opts.strategy.current,
			placement: () => this.#desiredPlacement(),
			middleware: () => this.middleware,
			reference: this.root.anchorNode,
			whileElementsMounted: (...args) => {
				return autoUpdate(...args, { animationFrame: this.#updatePositionStrategy?.current === "always" });
			},
			open: () => this.opts.enabled.current,
			sideOffset: () => this.opts.sideOffset.current,
			alignOffset: () => this.opts.alignOffset.current
		});
		watch(() => this.contentRef.current, (contentNode) => {
			if (!contentNode || !this.opts.enabled.current) return;
			const win = getWindow(contentNode);
			const rafId = win.requestAnimationFrame(() => {
				if (this.contentRef.current !== contentNode || !this.opts.enabled.current) return;
				const zIndex = win.getComputedStyle(contentNode).zIndex;
				if (zIndex !== this.contentZIndex) this.contentZIndex = zIndex;
			});
			return () => {
				win.cancelAnimationFrame(rafId);
			};
		});
	}
};
function transformOrigin(options) {
	return {
		name: "transformOrigin",
		options,
		fn(data) {
			const { placement, rects, middlewareData } = data;
			const isArrowHidden = middlewareData.arrow?.centerOffset !== 0;
			const arrowWidth = isArrowHidden ? 0 : options.arrowWidth;
			const arrowHeight = isArrowHidden ? 0 : options.arrowHeight;
			const [placedSide, placedAlign] = getSideAndAlignFromPlacement(placement);
			const noArrowAlign = {
				start: "0%",
				center: "50%",
				end: "100%"
			}[placedAlign];
			const arrowXCenter = (middlewareData.arrow?.x ?? 0) + arrowWidth / 2;
			const arrowYCenter = (middlewareData.arrow?.y ?? 0) + arrowHeight / 2;
			let x = "";
			let y = "";
			if (placedSide === "bottom") {
				x = isArrowHidden ? noArrowAlign : `${arrowXCenter}px`;
				y = `${-arrowHeight}px`;
			} else if (placedSide === "top") {
				x = isArrowHidden ? noArrowAlign : `${arrowXCenter}px`;
				y = `${rects.floating.height + arrowHeight}px`;
			} else if (placedSide === "right") {
				x = `${-arrowHeight}px`;
				y = isArrowHidden ? noArrowAlign : `${arrowYCenter}px`;
			} else if (placedSide === "left") {
				x = `${rects.floating.width + arrowHeight}px`;
				y = isArrowHidden ? noArrowAlign : `${arrowYCenter}px`;
			}
			return { data: {
				x,
				y
			} };
		}
	};
}
function getSideAndAlignFromPlacement(placement) {
	const [side, align = "center"] = placement.split("-");
	return [side, align];
}
function getSideFromPlacement(placement) {
	return getSideAndAlignFromPlacement(placement)[0];
}
function getAlignFromPlacement(placement) {
	return getSideAndAlignFromPlacement(placement)[1];
}
function Floating_layer($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { children, tooltip = false } = $$props;
		FloatingRootState.create(tooltip);
		children?.($$renderer$1);
		$$renderer$1.push(`<!---->`);
	});
}
function Floating_layer_content($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { content, side = "bottom", sideOffset = 0, align = "center", alignOffset = 0, id, arrowPadding = 0, avoidCollisions = true, collisionBoundary = [], collisionPadding = 0, hideWhenDetached = false, onPlaced = () => {}, sticky = "partial", updatePositionStrategy = "optimized", strategy = "fixed", dir = "ltr", style = {}, wrapperId = useId(), customAnchor = null, enabled, tooltip = false } = $$props;
		const contentState = FloatingContentState.create({
			side: boxWith(() => side),
			sideOffset: boxWith(() => sideOffset),
			align: boxWith(() => align),
			alignOffset: boxWith(() => alignOffset),
			id: boxWith(() => id),
			arrowPadding: boxWith(() => arrowPadding),
			avoidCollisions: boxWith(() => avoidCollisions),
			collisionBoundary: boxWith(() => collisionBoundary),
			collisionPadding: boxWith(() => collisionPadding),
			hideWhenDetached: boxWith(() => hideWhenDetached),
			onPlaced: boxWith(() => onPlaced),
			sticky: boxWith(() => sticky),
			updatePositionStrategy: boxWith(() => updatePositionStrategy),
			strategy: boxWith(() => strategy),
			dir: boxWith(() => dir),
			style: boxWith(() => style),
			enabled: boxWith(() => enabled),
			wrapperId: boxWith(() => wrapperId),
			customAnchor: boxWith(() => customAnchor)
		}, tooltip);
		const mergedProps = derived(() => mergeProps(contentState.wrapperProps, { style: { pointerEvents: "auto" } }));
		content?.($$renderer$1, {
			props: contentState.props,
			wrapperProps: mergedProps()
		});
		$$renderer$1.push(`<!---->`);
	});
}
function Floating_layer_content_static($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { content, onPlaced } = $$props;
		content?.($$renderer$1, {
			props: {},
			wrapperProps: {}
		});
		$$renderer$1.push(`<!---->`);
	});
}
function Popper_content($$renderer, $$props) {
	let { content, isStatic = false, onPlaced, $$slots, $$events, ...restProps } = $$props;
	if (isStatic) {
		$$renderer.push("<!--[0-->");
		Floating_layer_content_static($$renderer, {
			content,
			onPlaced
		});
	} else {
		$$renderer.push("<!--[-1-->");
		Floating_layer_content($$renderer, spread_props([{
			content,
			onPlaced
		}, restProps]));
	}
	$$renderer.push(`<!--]-->`);
}
function Popper_layer_inner($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { popper, onEscapeKeydown, escapeKeydownBehavior, preventOverflowTextSelection, id, onPointerDown, onPointerUp, side, sideOffset, align, alignOffset, arrowPadding, avoidCollisions, collisionBoundary, collisionPadding, sticky, hideWhenDetached, updatePositionStrategy, strategy, dir, preventScroll, wrapperId, style, onPlaced, onInteractOutside, onCloseAutoFocus, onOpenAutoFocus, onFocusOutside, interactOutsideBehavior = "close", loop, trapFocus = true, isValidEvent: isValidEvent$1 = () => false, customAnchor = null, isStatic = false, enabled, ref, tooltip = false, contentPointerEvents = "auto", $$slots, $$events, ...restProps } = $$props;
		const resolvedPreventScroll = derived(() => preventScroll ?? true);
		const effectiveStrategy = derived(() => strategy ?? (resolvedPreventScroll() ? "fixed" : "absolute"));
		{
			function content($$renderer$2, { props: floatingProps, wrapperProps }) {
				if (restProps.forceMount && enabled) {
					$$renderer$2.push("<!--[0-->");
					Scroll_lock($$renderer$2, { preventScroll: resolvedPreventScroll() });
				} else if (!restProps.forceMount) {
					$$renderer$2.push("<!--[1-->");
					Scroll_lock($$renderer$2, { preventScroll: resolvedPreventScroll() });
				} else $$renderer$2.push("<!--[-1-->");
				$$renderer$2.push(`<!--]--> `);
				{
					function focusScope($$renderer$3, { props: focusScopeProps }) {
						Escape_layer($$renderer$3, {
							onEscapeKeydown,
							escapeKeydownBehavior,
							enabled,
							ref,
							children: ($$renderer$4) => {
								{
									function children($$renderer$5, { props: dismissibleProps }) {
										Text_selection_layer($$renderer$5, {
											id,
											preventOverflowTextSelection,
											onPointerDown,
											onPointerUp,
											enabled,
											ref,
											children: ($$renderer$6) => {
												popper?.($$renderer$6, {
													props: mergeProps(restProps, floatingProps, dismissibleProps, focusScopeProps, { style: { pointerEvents: contentPointerEvents } }),
													wrapperProps
												});
												$$renderer$6.push(`<!---->`);
											},
											$$slots: { default: true }
										});
									}
									Dismissible_layer($$renderer$4, {
										id,
										onInteractOutside,
										onFocusOutside,
										interactOutsideBehavior,
										isValidEvent: isValidEvent$1,
										enabled,
										ref,
										children,
										$$slots: { default: true }
									});
								}
							},
							$$slots: { default: true }
						});
					}
					Focus_scope($$renderer$2, {
						onOpenAutoFocus,
						onCloseAutoFocus,
						loop,
						enabled,
						trapFocus,
						forceMount: restProps.forceMount,
						ref,
						focusScope,
						$$slots: { focusScope: true }
					});
				}
				$$renderer$2.push(`<!---->`);
			}
			Popper_content($$renderer$1, {
				isStatic,
				id,
				side,
				sideOffset,
				align,
				alignOffset,
				arrowPadding,
				avoidCollisions,
				collisionBoundary,
				collisionPadding,
				sticky,
				hideWhenDetached,
				updatePositionStrategy,
				strategy: effectiveStrategy(),
				dir,
				wrapperId,
				style,
				onPlaced,
				customAnchor,
				enabled,
				tooltip,
				content,
				$$slots: { content: true }
			});
		}
	});
}
function Popper_layer($$renderer, $$props) {
	let { popper, open, onEscapeKeydown, escapeKeydownBehavior, preventOverflowTextSelection, id, onPointerDown, onPointerUp, side, sideOffset, align, alignOffset, arrowPadding, avoidCollisions, collisionBoundary, collisionPadding, sticky, hideWhenDetached, updatePositionStrategy, strategy, dir, preventScroll, wrapperId, style, onPlaced, onInteractOutside, onCloseAutoFocus, onOpenAutoFocus, onFocusOutside, interactOutsideBehavior = "close", loop, trapFocus = true, isValidEvent: isValidEvent$1 = () => false, customAnchor = null, isStatic = false, ref, shouldRender, $$slots, $$events, ...restProps } = $$props;
	if (shouldRender) {
		$$renderer.push("<!--[0-->");
		Popper_layer_inner($$renderer, spread_props([{
			popper,
			onEscapeKeydown,
			escapeKeydownBehavior,
			preventOverflowTextSelection,
			id,
			onPointerDown,
			onPointerUp,
			side,
			sideOffset,
			align,
			alignOffset,
			arrowPadding,
			avoidCollisions,
			collisionBoundary,
			collisionPadding,
			sticky,
			hideWhenDetached,
			updatePositionStrategy,
			strategy,
			dir,
			preventScroll,
			wrapperId,
			style,
			onPlaced,
			customAnchor,
			isStatic,
			enabled: open,
			onInteractOutside,
			onCloseAutoFocus,
			onOpenAutoFocus,
			interactOutsideBehavior,
			loop,
			trapFocus,
			isValidEvent: isValidEvent$1,
			onFocusOutside,
			forceMount: false,
			ref
		}, restProps]));
	} else $$renderer.push("<!--[-1-->");
	$$renderer.push(`<!--]-->`);
}
function Popper_layer_force_mount($$renderer, $$props) {
	let { popper, onEscapeKeydown, escapeKeydownBehavior, preventOverflowTextSelection, id, onPointerDown, onPointerUp, side, sideOffset, align, alignOffset, arrowPadding, avoidCollisions, collisionBoundary, collisionPadding, sticky, hideWhenDetached, updatePositionStrategy, strategy, dir, preventScroll, wrapperId, style, onPlaced, onInteractOutside, onCloseAutoFocus, onOpenAutoFocus, onFocusOutside, interactOutsideBehavior = "close", loop, trapFocus = true, isValidEvent: isValidEvent$1 = () => false, customAnchor = null, isStatic = false, enabled, $$slots, $$events, ...restProps } = $$props;
	Popper_layer_inner($$renderer, spread_props([
		{
			popper,
			onEscapeKeydown,
			escapeKeydownBehavior,
			preventOverflowTextSelection,
			id,
			onPointerDown,
			onPointerUp,
			side,
			sideOffset,
			align,
			alignOffset,
			arrowPadding,
			avoidCollisions,
			collisionBoundary,
			collisionPadding,
			sticky,
			hideWhenDetached,
			updatePositionStrategy,
			strategy,
			dir,
			preventScroll,
			wrapperId,
			style,
			onPlaced,
			customAnchor,
			isStatic,
			enabled,
			onInteractOutside,
			onCloseAutoFocus,
			onOpenAutoFocus,
			interactOutsideBehavior,
			loop,
			trapFocus,
			isValidEvent: isValidEvent$1,
			onFocusOutside
		},
		restProps,
		{ forceMount: true }
	]));
}
function isPointInPolygon(point, polygon) {
	const [x, y] = point;
	let isInside = false;
	const length = polygon.length;
	for (let i = 0, j = length - 1; i < length; j = i++) {
		const [xi, yi] = polygon[i] ?? [0, 0];
		const [xj, yj] = polygon[j] ?? [0, 0];
		if (yi >= y !== yj >= y && x <= (xj - xi) * (y - yi) / (yj - yi) + xi) isInside = !isInside;
	}
	return isInside;
}
function isInsideRect(point, rect) {
	return point[0] >= rect.left && point[0] <= rect.right && point[1] >= rect.top && point[1] <= rect.bottom;
}
function getSide(triggerRect, contentRect) {
	const triggerCenterX = triggerRect.left + triggerRect.width / 2;
	const triggerCenterY = triggerRect.top + triggerRect.height / 2;
	const contentCenterX = contentRect.left + contentRect.width / 2;
	const contentCenterY = contentRect.top + contentRect.height / 2;
	const deltaX = contentCenterX - triggerCenterX;
	const deltaY = contentCenterY - triggerCenterY;
	if (Math.abs(deltaX) > Math.abs(deltaY)) return deltaX > 0 ? "right" : "left";
	return deltaY > 0 ? "bottom" : "top";
}
var SafePolygon = class {
	#opts;
	#buffer;
	#transitIntentTimeout;
	#exitPoint = null;
	#exitTarget = null;
	#transitTargets = [];
	#trackedTriggerNode = null;
	#leaveFallbackRafId = null;
	#transitIntentTimeoutId = null;
	#cancelLeaveFallback() {
		if (this.#leaveFallbackRafId !== null) {
			cancelAnimationFrame(this.#leaveFallbackRafId);
			this.#leaveFallbackRafId = null;
		}
	}
	#scheduleLeaveFallback() {
		this.#cancelLeaveFallback();
		this.#leaveFallbackRafId = requestAnimationFrame(() => {
			this.#leaveFallbackRafId = null;
			if (!this.#exitPoint || !this.#exitTarget) return;
			this.#clearTracking();
			this.#opts.onPointerExit();
		});
	}
	#cancelTransitIntentTimeout() {
		if (this.#transitIntentTimeoutId !== null) {
			clearTimeout(this.#transitIntentTimeoutId);
			this.#transitIntentTimeoutId = null;
		}
	}
	#scheduleTransitIntentTimeout() {
		if (this.#transitIntentTimeout === null) return;
		this.#cancelTransitIntentTimeout();
		this.#transitIntentTimeoutId = window.setTimeout(() => {
			this.#transitIntentTimeoutId = null;
			if (!this.#exitPoint || !this.#exitTarget) return;
			this.#clearTracking();
			this.#opts.onPointerExit();
		}, this.#transitIntentTimeout);
	}
	constructor(opts) {
		this.#opts = opts;
		this.#buffer = opts.buffer ?? 1;
		const transitIntentTimeout = opts.transitIntentTimeout;
		this.#transitIntentTimeout = typeof transitIntentTimeout === "number" && transitIntentTimeout > 0 ? transitIntentTimeout : null;
		watch([
			opts.triggerNode,
			opts.contentNode,
			opts.enabled
		], ([triggerNode, contentNode, enabled]) => {
			if (!triggerNode || !contentNode || !enabled) {
				this.#trackedTriggerNode = null;
				this.#clearTracking();
				return;
			}
			if (this.#trackedTriggerNode && this.#trackedTriggerNode !== triggerNode) this.#clearTracking();
			this.#trackedTriggerNode = triggerNode;
			const doc = getDocument(triggerNode);
			const handlePointerMove = (e) => {
				this.#onPointerMove([e.clientX, e.clientY], triggerNode, contentNode);
			};
			const handleTriggerLeave = (e) => {
				const target = e.relatedTarget;
				if (isElement(target) && contentNode.contains(target)) return;
				const ignoredTargets = this.#opts.ignoredTargets?.() ?? [];
				if (isElement(target) && ignoredTargets.some((n) => n === target || n.contains(target))) return;
				this.#transitTargets = isElement(target) && ignoredTargets.length > 0 ? ignoredTargets.filter((n) => target.contains(n)) : [];
				this.#exitPoint = [e.clientX, e.clientY];
				this.#exitTarget = "content";
				this.#scheduleLeaveFallback();
			};
			const handleTriggerEnter = () => {
				this.#clearTracking();
			};
			const handleContentEnter = () => {
				this.#clearTracking();
			};
			const handleContentLeave = (e) => {
				const target = e.relatedTarget;
				if (isElement(target) && triggerNode.contains(target)) return;
				this.#exitPoint = [e.clientX, e.clientY];
				this.#exitTarget = "trigger";
				this.#scheduleLeaveFallback();
			};
			return [
				on(doc, "pointermove", handlePointerMove),
				on(triggerNode, "pointerleave", handleTriggerLeave),
				on(triggerNode, "pointerenter", handleTriggerEnter),
				on(contentNode, "pointerenter", handleContentEnter),
				on(contentNode, "pointerleave", handleContentLeave)
			].reduce((acc, cleanup) => () => {
				acc();
				cleanup();
			}, () => {});
		});
	}
	#onPointerMove(clientPoint, triggerNode, contentNode) {
		if (!this.#exitPoint || !this.#exitTarget) return;
		this.#cancelLeaveFallback();
		this.#scheduleTransitIntentTimeout();
		const triggerRect = triggerNode.getBoundingClientRect();
		const contentRect = contentNode.getBoundingClientRect();
		if (this.#exitTarget === "content" && isInsideRect(clientPoint, contentRect)) {
			this.#clearTracking();
			return;
		}
		if (this.#exitTarget === "trigger" && isInsideRect(clientPoint, triggerRect)) {
			this.#clearTracking();
			return;
		}
		if (this.#exitTarget === "content" && this.#transitTargets.length > 0) for (const transitTarget of this.#transitTargets) {
			const transitRect = transitTarget.getBoundingClientRect();
			if (isInsideRect(clientPoint, transitRect)) return;
			const transitSide = getSide(triggerRect, transitRect);
			const transitCorridor = this.#getCorridorPolygon(triggerRect, transitRect, transitSide);
			if (transitCorridor && isPointInPolygon(clientPoint, transitCorridor)) return;
		}
		const side = getSide(triggerRect, contentRect);
		const corridorPoly = this.#getCorridorPolygon(triggerRect, contentRect, side);
		if (corridorPoly && isPointInPolygon(clientPoint, corridorPoly)) return;
		const targetRect = this.#exitTarget === "content" ? contentRect : triggerRect;
		if (isPointInPolygon(clientPoint, this.#getSafePolygon(this.#exitPoint, targetRect, side, this.#exitTarget))) return;
		this.#clearTracking();
		this.#opts.onPointerExit();
	}
	#clearTracking() {
		this.#exitPoint = null;
		this.#exitTarget = null;
		this.#transitTargets = [];
		this.#cancelLeaveFallback();
		this.#cancelTransitIntentTimeout();
	}
	#getCorridorPolygon(triggerRect, contentRect, side) {
		const buffer = this.#buffer;
		switch (side) {
			case "top": return [
				[Math.min(triggerRect.left, contentRect.left) - buffer, triggerRect.top],
				[Math.min(triggerRect.left, contentRect.left) - buffer, contentRect.bottom],
				[Math.max(triggerRect.right, contentRect.right) + buffer, contentRect.bottom],
				[Math.max(triggerRect.right, contentRect.right) + buffer, triggerRect.top]
			];
			case "bottom": return [
				[Math.min(triggerRect.left, contentRect.left) - buffer, triggerRect.bottom],
				[Math.min(triggerRect.left, contentRect.left) - buffer, contentRect.top],
				[Math.max(triggerRect.right, contentRect.right) + buffer, contentRect.top],
				[Math.max(triggerRect.right, contentRect.right) + buffer, triggerRect.bottom]
			];
			case "left": return [
				[triggerRect.left, Math.min(triggerRect.top, contentRect.top) - buffer],
				[contentRect.right, Math.min(triggerRect.top, contentRect.top) - buffer],
				[contentRect.right, Math.max(triggerRect.bottom, contentRect.bottom) + buffer],
				[triggerRect.left, Math.max(triggerRect.bottom, contentRect.bottom) + buffer]
			];
			case "right": return [
				[triggerRect.right, Math.min(triggerRect.top, contentRect.top) - buffer],
				[contentRect.left, Math.min(triggerRect.top, contentRect.top) - buffer],
				[contentRect.left, Math.max(triggerRect.bottom, contentRect.bottom) + buffer],
				[triggerRect.right, Math.max(triggerRect.bottom, contentRect.bottom) + buffer]
			];
		}
	}
	#getSafePolygon(exitPoint, targetRect, side, exitTarget) {
		const buffer = this.#buffer * 4;
		const [x, y] = exitPoint;
		switch (exitTarget === "trigger" ? this.#flipSide(side) : side) {
			case "top": return [
				[x - buffer, y + buffer],
				[x + buffer, y + buffer],
				[targetRect.right + buffer, targetRect.bottom],
				[targetRect.right + buffer, targetRect.top],
				[targetRect.left - buffer, targetRect.top],
				[targetRect.left - buffer, targetRect.bottom]
			];
			case "bottom": return [
				[x - buffer, y - buffer],
				[x + buffer, y - buffer],
				[targetRect.right + buffer, targetRect.top],
				[targetRect.right + buffer, targetRect.bottom],
				[targetRect.left - buffer, targetRect.bottom],
				[targetRect.left - buffer, targetRect.top]
			];
			case "left": return [
				[x + buffer, y - buffer],
				[x + buffer, y + buffer],
				[targetRect.right, targetRect.bottom + buffer],
				[targetRect.left, targetRect.bottom + buffer],
				[targetRect.left, targetRect.top - buffer],
				[targetRect.right, targetRect.top - buffer]
			];
			case "right": return [
				[x - buffer, y - buffer],
				[x - buffer, y + buffer],
				[targetRect.left, targetRect.bottom + buffer],
				[targetRect.right, targetRect.bottom + buffer],
				[targetRect.right, targetRect.top - buffer],
				[targetRect.left, targetRect.top - buffer]
			];
		}
	}
	#flipSide(side) {
		switch (side) {
			case "top": return "bottom";
			case "bottom": return "top";
			case "left": return "right";
			case "right": return "left";
		}
	}
};
function Dialog$1($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { open = false, onOpenChange = noop, onOpenChangeComplete = noop, children } = $$props;
		DialogRootState.create({
			variant: boxWith(() => "dialog"),
			open: boxWith(() => open, (v) => {
				open = v;
				onOpenChange(v);
			}),
			onOpenChangeComplete: boxWith(() => onOpenChangeComplete)
		});
		children?.($$renderer$1);
		$$renderer$1.push(`<!---->`);
		bind_props($$props, { open });
	});
}
function Dialog_content($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		const uid = props_id($$renderer$1);
		let { id = createId(uid), children, child, ref = null, forceMount = false, onCloseAutoFocus = noop, onOpenAutoFocus = noop, onEscapeKeydown = noop, onInteractOutside = noop, trapFocus = true, preventScroll = true, restoreScrollDelay = null, $$slots, $$events, ...restProps } = $$props;
		const contentState = DialogContentState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
		});
		const mergedProps = derived(() => mergeProps(restProps, contentState.props));
		if (contentState.shouldRender || forceMount) {
			$$renderer$1.push("<!--[0-->");
			{
				function focusScope($$renderer$2, { props: focusScopeProps }) {
					Escape_layer($$renderer$2, spread_props([mergedProps(), {
						enabled: contentState.root.opts.open.current,
						ref: contentState.opts.ref,
						onEscapeKeydown: (e) => {
							onEscapeKeydown(e);
							if (e.defaultPrevented) return;
							contentState.root.handleClose();
						},
						children: ($$renderer$3) => {
							Dismissible_layer($$renderer$3, spread_props([mergedProps(), {
								ref: contentState.opts.ref,
								enabled: contentState.root.opts.open.current,
								onInteractOutside: (e) => {
									onInteractOutside(e);
									if (e.defaultPrevented) return;
									contentState.root.handleClose();
								},
								children: ($$renderer$4) => {
									Text_selection_layer($$renderer$4, spread_props([mergedProps(), {
										ref: contentState.opts.ref,
										enabled: contentState.root.opts.open.current,
										children: ($$renderer$5) => {
											if (child) {
												$$renderer$5.push("<!--[0-->");
												if (contentState.root.opts.open.current) {
													$$renderer$5.push("<!--[0-->");
													Scroll_lock($$renderer$5, {
														preventScroll,
														restoreScrollDelay
													});
												} else $$renderer$5.push("<!--[-1-->");
												$$renderer$5.push(`<!--]--> `);
												child($$renderer$5, {
													props: mergeProps(mergedProps(), focusScopeProps),
													...contentState.snippetProps
												});
												$$renderer$5.push(`<!---->`);
											} else {
												$$renderer$5.push("<!--[-1-->");
												Scroll_lock($$renderer$5, { preventScroll });
												$$renderer$5.push(`<!----> <div${attributes({ ...mergeProps(mergedProps(), focusScopeProps) })}>`);
												children?.($$renderer$5);
												$$renderer$5.push(`<!----></div>`);
											}
											$$renderer$5.push(`<!--]-->`);
										},
										$$slots: { default: true }
									}]));
								},
								$$slots: { default: true }
							}]));
						},
						$$slots: { default: true }
					}]));
				}
				Focus_scope($$renderer$1, {
					ref: contentState.opts.ref,
					loop: true,
					trapFocus,
					enabled: contentState.root.opts.open.current,
					onOpenAutoFocus,
					onCloseAutoFocus,
					focusScope,
					$$slots: { focusScope: true }
				});
			}
		} else $$renderer$1.push("<!--[-1-->");
		$$renderer$1.push(`<!--]-->`);
		bind_props($$props, { ref });
	});
}
var switchAttrs = createBitsAttrs({
	component: "switch",
	parts: ["root", "thumb"]
});
var SwitchRootContext = new Context("Switch.Root");
var SwitchRootState = class SwitchRootState {
	static create(opts) {
		return SwitchRootContext.set(new SwitchRootState(opts));
	}
	opts;
	attachment;
	constructor(opts) {
		this.opts = opts;
		this.attachment = attachRef(opts.ref);
		this.onkeydown = this.onkeydown.bind(this);
		this.onclick = this.onclick.bind(this);
	}
	#toggle() {
		this.opts.checked.current = !this.opts.checked.current;
	}
	onkeydown(e) {
		if (!(e.key === "Enter" || e.key === " ") || this.opts.disabled.current) return;
		e.preventDefault();
		this.#toggle();
	}
	onclick(_) {
		if (this.opts.disabled.current) return;
		this.#toggle();
	}
	#sharedProps = derived(() => ({
		"data-disabled": boolToEmptyStrOrUndef(this.opts.disabled.current),
		"data-state": getDataChecked(this.opts.checked.current),
		"data-required": boolToEmptyStrOrUndef(this.opts.required.current)
	}));
	get sharedProps() {
		return this.#sharedProps();
	}
	set sharedProps($$value) {
		return this.#sharedProps($$value);
	}
	#snippetProps = derived(() => ({ checked: this.opts.checked.current }));
	get snippetProps() {
		return this.#snippetProps();
	}
	set snippetProps($$value) {
		return this.#snippetProps($$value);
	}
	#props = derived(() => ({
		...this.sharedProps,
		id: this.opts.id.current,
		role: "switch",
		disabled: boolToTrueOrUndef(this.opts.disabled.current),
		"aria-checked": getAriaChecked(this.opts.checked.current, false),
		"aria-required": boolToStr(this.opts.required.current),
		[switchAttrs.root]: "",
		onclick: this.onclick,
		onkeydown: this.onkeydown,
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
var SwitchInputState = class SwitchInputState {
	static create() {
		return new SwitchInputState(SwitchRootContext.get());
	}
	root;
	#shouldRender = derived(() => this.root.opts.name.current !== void 0);
	get shouldRender() {
		return this.#shouldRender();
	}
	set shouldRender($$value) {
		return this.#shouldRender($$value);
	}
	constructor(root) {
		this.root = root;
	}
	#props = derived(() => ({
		type: "checkbox",
		name: this.root.opts.name.current,
		value: this.root.opts.value.current,
		checked: this.root.opts.checked.current,
		disabled: this.root.opts.disabled.current,
		required: this.root.opts.required.current
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
var SwitchThumbState = class SwitchThumbState {
	static create(opts) {
		return new SwitchThumbState(opts, SwitchRootContext.get());
	}
	opts;
	root;
	attachment;
	constructor(opts, root) {
		this.opts = opts;
		this.root = root;
		this.attachment = attachRef(opts.ref);
	}
	#snippetProps = derived(() => ({ checked: this.root.opts.checked.current }));
	get snippetProps() {
		return this.#snippetProps();
	}
	set snippetProps($$value) {
		return this.#snippetProps($$value);
	}
	#props = derived(() => ({
		...this.root.sharedProps,
		id: this.opts.id.current,
		[switchAttrs.thumb]: "",
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
function Switch_input($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		const inputState = SwitchInputState.create();
		if (inputState.shouldRender) {
			$$renderer$1.push("<!--[0-->");
			Hidden_input($$renderer$1, spread_props([inputState.props]));
		} else $$renderer$1.push("<!--[-1-->");
		$$renderer$1.push(`<!--]-->`);
	});
}
function Switch$1($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		const uid = props_id($$renderer$1);
		let { child, children, ref = null, id = createId(uid), disabled = false, required = false, checked = false, value = "on", name = void 0, type = "button", onCheckedChange = noop, $$slots, $$events, ...restProps } = $$props;
		const rootState = SwitchRootState.create({
			checked: boxWith(() => checked, (v) => {
				checked = v;
				onCheckedChange?.(v);
			}),
			disabled: boxWith(() => disabled ?? false),
			required: boxWith(() => required),
			value: boxWith(() => value),
			name: boxWith(() => name),
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
		});
		const mergedProps = derived(() => mergeProps(restProps, rootState.props, { type }));
		if (child) {
			$$renderer$1.push("<!--[0-->");
			child($$renderer$1, {
				props: mergedProps(),
				...rootState.snippetProps
			});
			$$renderer$1.push(`<!---->`);
		} else {
			$$renderer$1.push("<!--[-1-->");
			$$renderer$1.push(`<button${attributes({ ...mergedProps() })}>`);
			children?.($$renderer$1, rootState.snippetProps);
			$$renderer$1.push(`<!----></button>`);
		}
		$$renderer$1.push(`<!--]--> `);
		Switch_input($$renderer$1, {});
		$$renderer$1.push(`<!---->`);
		bind_props($$props, {
			ref,
			checked
		});
	});
}
function Switch_thumb($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		const uid = props_id($$renderer$1);
		let { child, children, ref = null, id = createId(uid), $$slots, $$events, ...restProps } = $$props;
		const thumbState = SwitchThumbState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
		});
		const mergedProps = derived(() => mergeProps(restProps, thumbState.props));
		if (child) {
			$$renderer$1.push("<!--[0-->");
			child($$renderer$1, {
				props: mergedProps(),
				...thumbState.snippetProps
			});
			$$renderer$1.push(`<!---->`);
		} else {
			$$renderer$1.push("<!--[-1-->");
			$$renderer$1.push(`<span${attributes({ ...mergedProps() })}>`);
			children?.($$renderer$1, thumbState.snippetProps);
			$$renderer$1.push(`<!----></span>`);
		}
		$$renderer$1.push(`<!--]-->`);
		bind_props($$props, { ref });
	});
}
var tabsAttrs = createBitsAttrs({
	component: "tabs",
	parts: [
		"root",
		"list",
		"trigger",
		"content"
	]
});
var TabsRootContext = new Context("Tabs.Root");
var TabsRootState = class TabsRootState {
	static create(opts) {
		return TabsRootContext.set(new TabsRootState(opts));
	}
	opts;
	attachment;
	rovingFocusGroup;
	triggerIds = [];
	valueToTriggerId = new SvelteMap();
	valueToContentId = new SvelteMap();
	constructor(opts) {
		this.opts = opts;
		this.attachment = attachRef(opts.ref);
		this.rovingFocusGroup = new RovingFocusGroup({
			candidateAttr: tabsAttrs.trigger,
			rootNode: this.opts.ref,
			loop: this.opts.loop,
			orientation: this.opts.orientation
		});
	}
	registerTrigger(id, value) {
		this.triggerIds.push(id);
		this.valueToTriggerId.set(value, id);
		return () => {
			this.triggerIds = this.triggerIds.filter((triggerId) => triggerId !== id);
			this.valueToTriggerId.delete(value);
		};
	}
	registerContent(id, value) {
		this.valueToContentId.set(value, id);
		return () => {
			this.valueToContentId.delete(value);
		};
	}
	setValue(v) {
		this.opts.value.current = v;
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		"data-orientation": this.opts.orientation.current,
		[tabsAttrs.root]: "",
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
var TabsListState = class TabsListState {
	static create(opts) {
		return new TabsListState(opts, TabsRootContext.get());
	}
	opts;
	root;
	attachment;
	#isDisabled = derived(() => this.root.opts.disabled.current);
	constructor(opts, root) {
		this.opts = opts;
		this.root = root;
		this.attachment = attachRef(opts.ref);
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		role: "tablist",
		"aria-orientation": this.root.opts.orientation.current,
		"data-orientation": this.root.opts.orientation.current,
		[tabsAttrs.list]: "",
		"data-disabled": boolToEmptyStrOrUndef(this.#isDisabled()),
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
var TabsTriggerState = class TabsTriggerState {
	static create(opts) {
		return new TabsTriggerState(opts, TabsRootContext.get());
	}
	opts;
	root;
	attachment;
	#tabIndex = 0;
	#isActive = derived(() => this.root.opts.value.current === this.opts.value.current);
	#isDisabled = derived(() => this.opts.disabled.current || this.root.opts.disabled.current);
	#ariaControls = derived(() => this.root.valueToContentId.get(this.opts.value.current));
	constructor(opts, root) {
		this.opts = opts;
		this.root = root;
		this.attachment = attachRef(opts.ref);
		watch([() => this.opts.id.current, () => this.opts.value.current], ([id, value]) => {
			return this.root.registerTrigger(id, value);
		});
		this.onfocus = this.onfocus.bind(this);
		this.onclick = this.onclick.bind(this);
		this.onkeydown = this.onkeydown.bind(this);
	}
	#activate() {
		if (this.root.opts.value.current === this.opts.value.current) return;
		this.root.setValue(this.opts.value.current);
	}
	onfocus(_) {
		if (this.root.opts.activationMode.current !== "automatic" || this.#isDisabled()) return;
		this.#activate();
	}
	onclick(_) {
		if (this.#isDisabled()) return;
		this.#activate();
	}
	onkeydown(e) {
		if (this.#isDisabled()) return;
		if (e.key === " " || e.key === "Enter") {
			e.preventDefault();
			this.#activate();
			return;
		}
		this.root.rovingFocusGroup.handleKeydown(this.opts.ref.current, e);
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		role: "tab",
		"data-state": getTabDataState(this.#isActive()),
		"data-value": this.opts.value.current,
		"data-orientation": this.root.opts.orientation.current,
		"data-disabled": boolToEmptyStrOrUndef(this.#isDisabled()),
		"aria-selected": boolToStr(this.#isActive()),
		"aria-controls": this.#ariaControls(),
		[tabsAttrs.trigger]: "",
		disabled: boolToTrueOrUndef(this.#isDisabled()),
		tabindex: this.#tabIndex,
		onclick: this.onclick,
		onfocus: this.onfocus,
		onkeydown: this.onkeydown,
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
function getTabDataState(condition) {
	return condition ? "active" : "inactive";
}
function Tabs$1($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		const uid = props_id($$renderer$1);
		let { id = createId(uid), ref = null, value = "", onValueChange = noop, orientation = "horizontal", loop = true, activationMode = "automatic", disabled = false, children, child, $$slots, $$events, ...restProps } = $$props;
		const rootState = TabsRootState.create({
			id: boxWith(() => id),
			value: boxWith(() => value, (v) => {
				value = v;
				onValueChange(v);
			}),
			orientation: boxWith(() => orientation),
			loop: boxWith(() => loop),
			activationMode: boxWith(() => activationMode),
			disabled: boxWith(() => disabled),
			ref: boxWith(() => ref, (v) => ref = v)
		});
		const mergedProps = derived(() => mergeProps(restProps, rootState.props));
		if (child) {
			$$renderer$1.push("<!--[0-->");
			child($$renderer$1, { props: mergedProps() });
			$$renderer$1.push(`<!---->`);
		} else {
			$$renderer$1.push("<!--[-1-->");
			$$renderer$1.push(`<div${attributes({ ...mergedProps() })}>`);
			children?.($$renderer$1);
			$$renderer$1.push(`<!----></div>`);
		}
		$$renderer$1.push(`<!--]-->`);
		bind_props($$props, {
			ref,
			value
		});
	});
}
function Tabs_list($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		const uid = props_id($$renderer$1);
		let { child, children, id = createId(uid), ref = null, $$slots, $$events, ...restProps } = $$props;
		const listState = TabsListState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
		});
		const mergedProps = derived(() => mergeProps(restProps, listState.props));
		if (child) {
			$$renderer$1.push("<!--[0-->");
			child($$renderer$1, { props: mergedProps() });
			$$renderer$1.push(`<!---->`);
		} else {
			$$renderer$1.push("<!--[-1-->");
			$$renderer$1.push(`<div${attributes({ ...mergedProps() })}>`);
			children?.($$renderer$1);
			$$renderer$1.push(`<!----></div>`);
		}
		$$renderer$1.push(`<!--]-->`);
		bind_props($$props, { ref });
	});
}
function Tabs_trigger($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		const uid = props_id($$renderer$1);
		let { child, children, disabled = false, id = createId(uid), type = "button", value, ref = null, $$slots, $$events, ...restProps } = $$props;
		const triggerState = TabsTriggerState.create({
			id: boxWith(() => id),
			disabled: boxWith(() => disabled ?? false),
			value: boxWith(() => value),
			ref: boxWith(() => ref, (v) => ref = v)
		});
		const mergedProps = derived(() => mergeProps(restProps, triggerState.props, { type }));
		if (child) {
			$$renderer$1.push("<!--[0-->");
			child($$renderer$1, { props: mergedProps() });
			$$renderer$1.push(`<!---->`);
		} else {
			$$renderer$1.push("<!--[-1-->");
			$$renderer$1.push(`<button${attributes({ ...mergedProps() })}>`);
			children?.($$renderer$1);
			$$renderer$1.push(`<!----></button>`);
		}
		$$renderer$1.push(`<!--]-->`);
		bind_props($$props, { ref });
	});
}
const toggleGroupAttrs = createBitsAttrs({
	component: "toggle-group",
	parts: ["root", "item"]
});
var ToggleGroupRootContext = new Context("ToggleGroup.Root");
var ToggleGroupBaseState = class {
	opts;
	rovingFocusGroup;
	attachment;
	constructor(opts) {
		this.opts = opts;
		this.attachment = attachRef(this.opts.ref);
		this.rovingFocusGroup = new RovingFocusGroup({
			candidateAttr: toggleGroupAttrs.item,
			rootNode: opts.ref,
			loop: opts.loop,
			orientation: opts.orientation
		});
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		[toggleGroupAttrs.root]: "",
		role: "group",
		"data-orientation": this.opts.orientation.current,
		"data-disabled": boolToEmptyStrOrUndef(this.opts.disabled.current),
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
var ToggleGroupSingleState = class extends ToggleGroupBaseState {
	opts;
	isMulti = false;
	#anyPressed = derived(() => this.opts.value.current !== "");
	get anyPressed() {
		return this.#anyPressed();
	}
	set anyPressed($$value) {
		return this.#anyPressed($$value);
	}
	constructor(opts) {
		super(opts);
		this.opts = opts;
	}
	includesItem(item) {
		return this.opts.value.current === item;
	}
	toggleItem(item, id) {
		if (this.includesItem(item)) this.opts.value.current = "";
		else {
			this.opts.value.current = item;
			this.rovingFocusGroup.setCurrentTabStopId(id);
		}
	}
};
var ToggleGroupMultipleState = class extends ToggleGroupBaseState {
	opts;
	isMulti = true;
	#anyPressed = derived(() => this.opts.value.current.length > 0);
	get anyPressed() {
		return this.#anyPressed();
	}
	set anyPressed($$value) {
		return this.#anyPressed($$value);
	}
	constructor(opts) {
		super(opts);
		this.opts = opts;
	}
	includesItem(item) {
		return this.opts.value.current.includes(item);
	}
	toggleItem(item, id) {
		if (this.includesItem(item)) this.opts.value.current = this.opts.value.current.filter((v) => v !== item);
		else {
			this.opts.value.current = [...this.opts.value.current, item];
			this.rovingFocusGroup.setCurrentTabStopId(id);
		}
	}
};
var ToggleGroupRootState = class {
	static create(opts) {
		const { type, ...rest } = opts;
		const rootState = type === "single" ? new ToggleGroupSingleState(rest) : new ToggleGroupMultipleState(rest);
		return ToggleGroupRootContext.set(rootState);
	}
};
var ToggleGroupItemState = class ToggleGroupItemState {
	static create(opts) {
		return new ToggleGroupItemState(opts, ToggleGroupRootContext.get());
	}
	opts;
	root;
	attachment;
	#isDisabled = derived(() => this.opts.disabled.current || this.root.opts.disabled.current);
	#isPressed = derived(() => this.root.includesItem(this.opts.value.current));
	get isPressed() {
		return this.#isPressed();
	}
	set isPressed($$value) {
		return this.#isPressed($$value);
	}
	#ariaChecked = derived(() => {
		return this.root.isMulti ? void 0 : getAriaChecked(this.isPressed, false);
	});
	#ariaPressed = derived(() => {
		return this.root.isMulti ? boolToStr(this.isPressed) : void 0;
	});
	constructor(opts, root) {
		this.opts = opts;
		this.root = root;
		this.attachment = attachRef(this.opts.ref);
		this.onclick = this.onclick.bind(this);
		this.onkeydown = this.onkeydown.bind(this);
	}
	#toggleItem() {
		if (this.#isDisabled()) return;
		this.root.toggleItem(this.opts.value.current, this.opts.id.current);
	}
	onclick(_) {
		if (this.#isDisabled()) return;
		this.root.toggleItem(this.opts.value.current, this.opts.id.current);
	}
	onkeydown(e) {
		if (this.#isDisabled()) return;
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			this.#toggleItem();
			return;
		}
		if (!this.root.opts.rovingFocus.current) return;
		this.root.rovingFocusGroup.handleKeydown(this.opts.ref.current, e);
	}
	#tabIndex = 0;
	#snippetProps = derived(() => ({ pressed: this.isPressed }));
	get snippetProps() {
		return this.#snippetProps();
	}
	set snippetProps($$value) {
		return this.#snippetProps($$value);
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		role: this.root.isMulti ? void 0 : "radio",
		tabindex: this.#tabIndex,
		"data-orientation": this.root.opts.orientation.current,
		"data-disabled": boolToEmptyStrOrUndef(this.#isDisabled()),
		"data-state": getToggleItemDataState(this.isPressed),
		"data-value": this.opts.value.current,
		"aria-pressed": this.#ariaPressed(),
		"aria-checked": this.#ariaChecked(),
		disabled: boolToTrueOrUndef(this.#isDisabled()),
		[toggleGroupAttrs.item]: "",
		onclick: this.onclick,
		onkeydown: this.onkeydown,
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
function getToggleItemDataState(condition) {
	return condition ? "on" : "off";
}
function Toggle_group($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		const uid = props_id($$renderer$1);
		let { id = createId(uid), ref = null, value = void 0, onValueChange = noop, type, disabled = false, loop = true, orientation = "horizontal", rovingFocus = true, child, children, $$slots, $$events, ...restProps } = $$props;
		function handleDefaultValue() {
			if (value !== void 0) return;
			value = type === "single" ? "" : [];
		}
		handleDefaultValue();
		watch.pre(() => value, () => {
			handleDefaultValue();
		});
		const rootState = ToggleGroupRootState.create({
			id: boxWith(() => id),
			value: boxWith(() => value, (v) => {
				value = v;
				onValueChange(v);
			}),
			disabled: boxWith(() => disabled),
			loop: boxWith(() => loop),
			orientation: boxWith(() => orientation),
			rovingFocus: boxWith(() => rovingFocus),
			type,
			ref: boxWith(() => ref, (v) => ref = v)
		});
		const mergedProps = derived(() => mergeProps(restProps, rootState.props));
		if (child) {
			$$renderer$1.push("<!--[0-->");
			child($$renderer$1, { props: mergedProps() });
			$$renderer$1.push(`<!---->`);
		} else {
			$$renderer$1.push("<!--[-1-->");
			$$renderer$1.push(`<div${attributes({ ...mergedProps() })}>`);
			children?.($$renderer$1);
			$$renderer$1.push(`<!----></div>`);
		}
		$$renderer$1.push(`<!--]-->`);
		bind_props($$props, {
			ref,
			value
		});
	});
}
function Toggle_group_item($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		const uid = props_id($$renderer$1);
		let { children, child, ref = null, value, disabled = false, id = createId(uid), type = "button", $$slots, $$events, ...restProps } = $$props;
		const itemState = ToggleGroupItemState.create({
			id: boxWith(() => id),
			value: boxWith(() => value),
			disabled: boxWith(() => disabled ?? false),
			ref: boxWith(() => ref, (v) => ref = v)
		});
		const mergedProps = derived(() => mergeProps(restProps, itemState.props, { type }));
		if (child) {
			$$renderer$1.push("<!--[0-->");
			child($$renderer$1, {
				props: mergedProps(),
				...itemState.snippetProps
			});
			$$renderer$1.push(`<!---->`);
		} else {
			$$renderer$1.push("<!--[-1-->");
			$$renderer$1.push(`<button${attributes({ ...mergedProps() })}>`);
			children?.($$renderer$1, itemState.snippetProps);
			$$renderer$1.push(`<!----></button>`);
		}
		$$renderer$1.push(`<!--]-->`);
		bind_props($$props, { ref });
	});
}
var TimeoutFn = class {
	#interval;
	#cb;
	#timer = null;
	constructor(cb, interval) {
		this.#cb = cb;
		this.#interval = interval;
		this.stop = this.stop.bind(this);
		this.start = this.start.bind(this);
		this.stop;
	}
	#clear() {
		if (this.#timer !== null) {
			window.clearTimeout(this.#timer);
			this.#timer = null;
		}
	}
	stop() {
		this.#clear();
	}
	start(...args) {
		this.#clear();
		this.#timer = window.setTimeout(() => {
			this.#timer = null;
			this.#cb(...args);
		}, this.#interval);
	}
};
const tooltipAttrs = createBitsAttrs({
	component: "tooltip",
	parts: ["content", "trigger"]
});
var TooltipProviderContext = new Context("Tooltip.Provider");
var TooltipRootContext = new Context("Tooltip.Root");
var TooltipTriggerRegistryState = class {
	triggers = /* @__PURE__ */ new Map();
	activeTriggerId = null;
	#activeTriggerNode = derived(() => {
		const activeTriggerId = this.activeTriggerId;
		if (activeTriggerId === null) return null;
		return this.triggers.get(activeTriggerId)?.node ?? null;
	});
	get activeTriggerNode() {
		return this.#activeTriggerNode();
	}
	set activeTriggerNode($$value) {
		return this.#activeTriggerNode($$value);
	}
	#activePayload = derived(() => {
		const activeTriggerId = this.activeTriggerId;
		if (activeTriggerId === null) return null;
		return this.triggers.get(activeTriggerId)?.payload ?? null;
	});
	get activePayload() {
		return this.#activePayload();
	}
	set activePayload($$value) {
		return this.#activePayload($$value);
	}
	register = (record) => {
		const next = new Map(this.triggers);
		next.set(record.id, record);
		this.triggers = next;
		this.#coerceActiveTrigger();
	};
	update = (record) => {
		const next = new Map(this.triggers);
		next.set(record.id, record);
		this.triggers = next;
		this.#coerceActiveTrigger();
	};
	unregister = (id) => {
		if (!this.triggers.has(id)) return;
		const next = new Map(this.triggers);
		next.delete(id);
		this.triggers = next;
		if (this.activeTriggerId === id) this.activeTriggerId = null;
	};
	setActiveTrigger = (id) => {
		if (id === null) {
			this.activeTriggerId = null;
			return;
		}
		if (!this.triggers.has(id)) {
			this.activeTriggerId = null;
			return;
		}
		this.activeTriggerId = id;
	};
	get = (id) => {
		return this.triggers.get(id);
	};
	has = (id) => {
		return this.triggers.has(id);
	};
	getFirstTriggerId = () => {
		const firstEntry = this.triggers.entries().next();
		if (firstEntry.done) return null;
		return firstEntry.value[0];
	};
	#coerceActiveTrigger = () => {
		const activeTriggerId = this.activeTriggerId;
		if (activeTriggerId === null) return;
		if (!this.triggers.has(activeTriggerId)) this.activeTriggerId = null;
	};
};
var TooltipProviderState = class TooltipProviderState {
	static create(opts) {
		return TooltipProviderContext.set(new TooltipProviderState(opts));
	}
	opts;
	isOpenDelayed = true;
	isPointerInTransit = simpleBox(false);
	#timerFn;
	#openTooltip = null;
	constructor(opts) {
		this.opts = opts;
		this.#timerFn = new TimeoutFn(() => {
			this.isOpenDelayed = true;
		}, this.opts.skipDelayDuration.current);
	}
	#startTimer = () => {
		if (this.opts.skipDelayDuration.current === 0) {
			this.isOpenDelayed = true;
			return;
		} else this.#timerFn.start();
	};
	#clearTimer = () => {
		this.#timerFn.stop();
	};
	onOpen = (tooltip) => {
		if (this.#openTooltip && this.#openTooltip !== tooltip) this.#openTooltip.handleClose();
		this.#clearTimer();
		this.isOpenDelayed = false;
		this.#openTooltip = tooltip;
	};
	onClose = (tooltip) => {
		if (this.#openTooltip === tooltip) {
			this.#openTooltip = null;
			this.#startTimer();
		}
	};
	isTooltipOpen = (tooltip) => {
		return this.#openTooltip === tooltip;
	};
};
var TooltipRootState = class TooltipRootState {
	static create(opts) {
		return TooltipRootContext.set(new TooltipRootState(opts, TooltipProviderContext.get()));
	}
	opts;
	provider;
	#delayDuration = derived(() => this.opts.delayDuration.current ?? this.provider.opts.delayDuration.current);
	get delayDuration() {
		return this.#delayDuration();
	}
	set delayDuration($$value) {
		return this.#delayDuration($$value);
	}
	#disableHoverableContent = derived(() => this.opts.disableHoverableContent.current ?? this.provider.opts.disableHoverableContent.current);
	get disableHoverableContent() {
		return this.#disableHoverableContent();
	}
	set disableHoverableContent($$value) {
		return this.#disableHoverableContent($$value);
	}
	#disableCloseOnTriggerClick = derived(() => this.opts.disableCloseOnTriggerClick.current ?? this.provider.opts.disableCloseOnTriggerClick.current);
	get disableCloseOnTriggerClick() {
		return this.#disableCloseOnTriggerClick();
	}
	set disableCloseOnTriggerClick($$value) {
		return this.#disableCloseOnTriggerClick($$value);
	}
	#disabled = derived(() => this.opts.disabled.current ?? this.provider.opts.disabled.current);
	get disabled() {
		return this.#disabled();
	}
	set disabled($$value) {
		return this.#disabled($$value);
	}
	#ignoreNonKeyboardFocus = derived(() => this.opts.ignoreNonKeyboardFocus.current ?? this.provider.opts.ignoreNonKeyboardFocus.current);
	get ignoreNonKeyboardFocus() {
		return this.#ignoreNonKeyboardFocus();
	}
	set ignoreNonKeyboardFocus($$value) {
		return this.#ignoreNonKeyboardFocus($$value);
	}
	registry;
	tether;
	contentNode = null;
	contentPresence;
	#wasOpenDelayed = false;
	#timerFn;
	#stateAttr = derived(() => {
		if (!this.opts.open.current) return "closed";
		return this.#wasOpenDelayed ? "delayed-open" : "instant-open";
	});
	get stateAttr() {
		return this.#stateAttr();
	}
	set stateAttr($$value) {
		return this.#stateAttr($$value);
	}
	constructor(opts, provider) {
		this.opts = opts;
		this.provider = provider;
		this.tether = opts.tether.current?.state ?? null;
		this.registry = this.tether?.registry ?? new TooltipTriggerRegistryState();
		this.#timerFn = new TimeoutFn(() => {
			this.#wasOpenDelayed = true;
			this.opts.open.current = true;
		}, this.delayDuration ?? 0);
		if (this.tether) this.tether.root = this;
		this.contentPresence = new PresenceManager({
			open: this.opts.open,
			ref: boxWith(() => this.contentNode),
			onComplete: () => {
				this.opts.onOpenChangeComplete.current(this.opts.open.current);
			}
		});
		watch(() => this.delayDuration, () => {
			if (this.delayDuration === void 0) return;
			this.#timerFn = new TimeoutFn(() => {
				this.#wasOpenDelayed = true;
				this.opts.open.current = true;
			}, this.delayDuration);
		});
		watch(() => this.opts.open.current, (isOpen) => {
			if (isOpen) {
				this.ensureActiveTrigger();
				this.provider.onOpen(this);
			} else this.provider.onClose(this);
		}, { lazy: true });
		watch(() => this.opts.triggerId.current, (triggerId) => {
			if (triggerId === this.registry.activeTriggerId) return;
			this.registry.setActiveTrigger(triggerId);
		});
		watch(() => this.registry.activeTriggerId, (activeTriggerId) => {
			if (this.opts.triggerId.current === activeTriggerId) return;
			this.opts.triggerId.current = activeTriggerId;
		});
	}
	handleOpen = () => {
		this.#timerFn.stop();
		this.#wasOpenDelayed = false;
		this.ensureActiveTrigger();
		this.opts.open.current = true;
	};
	handleClose = () => {
		this.#timerFn.stop();
		this.opts.open.current = false;
	};
	#handleDelayedOpen = () => {
		this.#timerFn.stop();
		const shouldSkipDelay = !this.provider.isOpenDelayed;
		const delayDuration = this.delayDuration ?? 0;
		if (shouldSkipDelay || delayDuration === 0) {
			this.#wasOpenDelayed = false;
			this.opts.open.current = true;
		} else this.#timerFn.start();
	};
	onTriggerEnter = (triggerId) => {
		this.setActiveTrigger(triggerId);
		this.#handleDelayedOpen();
	};
	onTriggerLeave = () => {
		if (this.disableHoverableContent) this.handleClose();
		else this.#timerFn.stop();
	};
	ensureActiveTrigger = () => {
		if (this.registry.activeTriggerId !== null && this.registry.has(this.registry.activeTriggerId)) return;
		if (this.opts.triggerId.current !== null && this.registry.has(this.opts.triggerId.current)) {
			this.registry.setActiveTrigger(this.opts.triggerId.current);
			return;
		}
		const firstTriggerId = this.registry.getFirstTriggerId();
		this.registry.setActiveTrigger(firstTriggerId);
	};
	setActiveTrigger = (triggerId) => {
		this.registry.setActiveTrigger(triggerId);
	};
	registerTrigger = (trigger) => {
		this.registry.register(trigger);
		if (trigger.disabled && this.registry.activeTriggerId === trigger.id && this.opts.open.current) this.handleClose();
	};
	updateTrigger = (trigger) => {
		this.registry.update(trigger);
		if (trigger.disabled && this.registry.activeTriggerId === trigger.id && this.opts.open.current) this.handleClose();
	};
	unregisterTrigger = (id) => {
		const isActive = this.registry.activeTriggerId === id;
		this.registry.unregister(id);
		if (isActive && this.opts.open.current) this.handleClose();
	};
	isActiveTrigger = (triggerId) => {
		return this.registry.activeTriggerId === triggerId;
	};
	get triggerNode() {
		return this.registry.activeTriggerNode;
	}
	get activePayload() {
		return this.registry.activePayload;
	}
	get activeTriggerId() {
		return this.registry.activeTriggerId;
	}
};
var TooltipTriggerState = class TooltipTriggerState {
	static create(opts) {
		if (opts.tether.current) return new TooltipTriggerState(opts, null, opts.tether.current.state);
		return new TooltipTriggerState(opts, TooltipRootContext.get(), null);
	}
	opts;
	root;
	tether;
	attachment;
	#isPointerDown = simpleBox(false);
	#hasPointerMoveOpened = false;
	domContext;
	#transitCheckTimeout = null;
	#mounted = false;
	#lastRegisteredId = null;
	constructor(opts, root, tether) {
		this.opts = opts;
		this.root = root;
		this.tether = tether;
		this.domContext = new DOMContext(opts.ref);
		this.attachment = attachRef(this.opts.ref, (v) => this.#register(v));
		watch(() => this.opts.id.current, () => {
			this.#register(this.opts.ref.current);
		});
		watch(() => this.opts.payload.current, () => {
			this.#register(this.opts.ref.current);
		});
		watch(() => this.opts.disabled.current, () => {
			this.#register(this.opts.ref.current);
		});
	}
	#getRoot = () => {
		return this.tether?.root ?? this.root;
	};
	#isDisabled = () => {
		const root = this.#getRoot();
		return this.opts.disabled.current || Boolean(root?.disabled);
	};
	#register = (node) => {
		if (!this.#mounted) return;
		const id = this.opts.id.current;
		const payload = this.opts.payload.current;
		const disabled = this.opts.disabled.current;
		if (this.#lastRegisteredId && this.#lastRegisteredId !== id) {
			const root$1 = this.#getRoot();
			if (this.tether) this.tether.registry.unregister(this.#lastRegisteredId);
			else root$1?.unregisterTrigger(this.#lastRegisteredId);
		}
		const triggerRecord = {
			id,
			node,
			payload,
			disabled
		};
		const root = this.#getRoot();
		if (this.tether) {
			if (this.tether.registry.has(id)) this.tether.registry.update(triggerRecord);
			else this.tether.registry.register(triggerRecord);
			if (disabled && this.tether.registry.activeTriggerId === id && root?.opts.open.current) root.handleClose();
		} else if (root?.registry.has(id)) root.updateTrigger(triggerRecord);
		else root?.registerTrigger(triggerRecord);
		this.#lastRegisteredId = id;
	};
	#clearTransitCheck = () => {
		if (this.#transitCheckTimeout !== null) {
			clearTimeout(this.#transitCheckTimeout);
			this.#transitCheckTimeout = null;
		}
	};
	handlePointerUp = () => {
		this.#isPointerDown.current = false;
	};
	#onpointerup = () => {
		if (this.#isDisabled()) return;
		this.#isPointerDown.current = false;
	};
	#onpointerdown = () => {
		if (this.#isDisabled()) return;
		this.#isPointerDown.current = true;
		this.domContext.getDocument().addEventListener("pointerup", () => {
			this.handlePointerUp();
		}, { once: true });
	};
	#onpointerenter = (e) => {
		const root = this.#getRoot();
		if (!root) return;
		if (this.#isDisabled()) {
			if (root.opts.open.current) root.handleClose();
			return;
		}
		if (e.pointerType === "touch") return;
		if (root.provider.isPointerInTransit.current) {
			this.#clearTransitCheck();
			this.#transitCheckTimeout = window.setTimeout(() => {
				if (root.provider.isPointerInTransit.current) {
					root.provider.isPointerInTransit.current = false;
					root.onTriggerEnter(this.opts.id.current);
					this.#hasPointerMoveOpened = true;
				}
			}, 250);
			return;
		}
		root.onTriggerEnter(this.opts.id.current);
		this.#hasPointerMoveOpened = true;
	};
	#onpointermove = (e) => {
		const root = this.#getRoot();
		if (!root) return;
		if (this.#isDisabled()) {
			if (root.opts.open.current) root.handleClose();
			return;
		}
		if (e.pointerType === "touch") return;
		if (this.#hasPointerMoveOpened) return;
		this.#clearTransitCheck();
		root.provider.isPointerInTransit.current = false;
		root.onTriggerEnter(this.opts.id.current);
		this.#hasPointerMoveOpened = true;
	};
	#onpointerleave = (e) => {
		const root = this.#getRoot();
		if (!root) return;
		if (this.#isDisabled()) return;
		this.#clearTransitCheck();
		if (!root.isActiveTrigger(this.opts.id.current)) {
			this.#hasPointerMoveOpened = false;
			return;
		}
		const relatedTarget = e.relatedTarget;
		if (isElement(relatedTarget)) for (const record of root.registry.triggers.values()) {
			if (record.node !== relatedTarget) continue;
			if (root.provider.opts.skipDelayDuration.current > 0) {
				this.#hasPointerMoveOpened = false;
				return;
			}
			root.handleClose();
			this.#hasPointerMoveOpened = false;
			return;
		}
		root.onTriggerLeave();
		this.#hasPointerMoveOpened = false;
	};
	#onfocus = (e) => {
		const root = this.#getRoot();
		if (!root) return;
		if (this.#isPointerDown.current) return;
		if (this.#isDisabled()) {
			if (root.opts.open.current) root.handleClose();
			return;
		}
		if (root.ignoreNonKeyboardFocus && !isFocusVisible(e.currentTarget)) return;
		root.setActiveTrigger(this.opts.id.current);
		root.handleOpen();
	};
	#onblur = () => {
		const root = this.#getRoot();
		if (!root || this.#isDisabled()) return;
		root.handleClose();
	};
	#onclick = () => {
		const root = this.#getRoot();
		if (!root || root.disableCloseOnTriggerClick || this.#isDisabled()) return;
		root.handleClose();
	};
	#props = derived(() => {
		const root = this.#getRoot();
		const isOpenForTrigger = Boolean(root?.opts.open.current && root.isActiveTrigger(this.opts.id.current));
		const isDisabled = this.#isDisabled();
		return {
			id: this.opts.id.current,
			"aria-describedby": isOpenForTrigger ? root?.contentNode?.id : void 0,
			"data-state": isOpenForTrigger ? root?.stateAttr : "closed",
			"data-disabled": boolToEmptyStrOrUndef(isDisabled),
			"data-delay-duration": `${root?.delayDuration ?? 0}`,
			[tooltipAttrs.trigger]: "",
			tabindex: isDisabled ? void 0 : this.opts.tabindex.current,
			disabled: this.opts.disabled.current,
			onpointerup: this.#onpointerup,
			onpointerdown: this.#onpointerdown,
			onpointerenter: this.#onpointerenter,
			onpointermove: this.#onpointermove,
			onpointerleave: this.#onpointerleave,
			onfocus: this.#onfocus,
			onblur: this.#onblur,
			onclick: this.#onclick,
			...this.attachment
		};
	});
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
};
var TooltipContentState = class TooltipContentState {
	static create(opts) {
		return new TooltipContentState(opts, TooltipRootContext.get());
	}
	opts;
	root;
	attachment;
	constructor(opts, root) {
		this.opts = opts;
		this.root = root;
		this.attachment = attachRef(this.opts.ref, (v) => this.root.contentNode = v);
		new SafePolygon({
			triggerNode: () => this.root.triggerNode,
			contentNode: () => this.root.contentNode,
			enabled: () => this.root.opts.open.current && !this.root.disableHoverableContent,
			transitIntentTimeout: 180,
			ignoredTargets: () => {
				if (this.root.provider.opts.skipDelayDuration.current === 0) return [];
				const nodes = [];
				const activeTriggerNode = this.root.triggerNode;
				for (const record of this.root.registry.triggers.values()) if (record.node && record.node !== activeTriggerNode) nodes.push(record.node);
				return nodes;
			},
			onPointerExit: () => {
				if (this.root.provider.isTooltipOpen(this.root)) this.root.handleClose();
			}
		});
	}
	onInteractOutside = (e) => {
		if (isElement(e.target) && this.root.triggerNode?.contains(e.target) && this.root.disableCloseOnTriggerClick) {
			e.preventDefault();
			return;
		}
		this.opts.onInteractOutside.current(e);
		if (e.defaultPrevented) return;
		this.root.handleClose();
	};
	onEscapeKeydown = (e) => {
		this.opts.onEscapeKeydown.current?.(e);
		if (e.defaultPrevented) return;
		this.root.handleClose();
	};
	onOpenAutoFocus = (e) => {
		e.preventDefault();
	};
	onCloseAutoFocus = (e) => {
		e.preventDefault();
	};
	get shouldRender() {
		return this.root.contentPresence.shouldRender;
	}
	#snippetProps = derived(() => ({ open: this.root.opts.open.current }));
	get snippetProps() {
		return this.#snippetProps();
	}
	set snippetProps($$value) {
		return this.#snippetProps($$value);
	}
	#props = derived(() => ({
		id: this.opts.id.current,
		"data-state": this.root.stateAttr,
		"data-disabled": boolToEmptyStrOrUndef(this.root.disabled),
		...getDataTransitionAttrs(this.root.contentPresence.transitionStatus),
		style: { outline: "none" },
		[tooltipAttrs.content]: "",
		...this.attachment
	}));
	get props() {
		return this.#props();
	}
	set props($$value) {
		return this.#props($$value);
	}
	popperProps = {
		onInteractOutside: this.onInteractOutside,
		onEscapeKeydown: this.onEscapeKeydown,
		onOpenAutoFocus: this.onOpenAutoFocus,
		onCloseAutoFocus: this.onCloseAutoFocus
	};
};
function Tooltip$1($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { open = false, triggerId = null, onOpenChange = noop, onOpenChangeComplete = noop, disabled, delayDuration, disableCloseOnTriggerClick, disableHoverableContent, ignoreNonKeyboardFocus, tether, children } = $$props;
		const rootState = TooltipRootState.create({
			open: boxWith(() => open, (v) => {
				open = v;
				onOpenChange(v);
			}),
			triggerId: boxWith(() => triggerId, (v) => {
				triggerId = v;
			}),
			delayDuration: boxWith(() => delayDuration),
			disableCloseOnTriggerClick: boxWith(() => disableCloseOnTriggerClick),
			disableHoverableContent: boxWith(() => disableHoverableContent),
			ignoreNonKeyboardFocus: boxWith(() => ignoreNonKeyboardFocus),
			disabled: boxWith(() => disabled),
			onOpenChangeComplete: boxWith(() => onOpenChangeComplete),
			tether: boxWith(() => tether)
		});
		Floating_layer($$renderer$1, {
			tooltip: true,
			children: ($$renderer$2) => {
				children?.($$renderer$2, {
					open: rootState.opts.open.current,
					triggerId: rootState.activeTriggerId,
					payload: rootState.activePayload
				});
				$$renderer$2.push(`<!---->`);
			},
			$$slots: { default: true }
		});
		bind_props($$props, {
			open,
			triggerId
		});
	});
}
function Tooltip_content($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		const uid = props_id($$renderer$1);
		let { children, child, id = createId(uid), ref = null, side = "top", sideOffset = 0, align = "center", avoidCollisions = true, arrowPadding = 0, sticky = "partial", strategy, hideWhenDetached = false, customAnchor, collisionPadding = 0, onInteractOutside = noop, onEscapeKeydown = noop, forceMount = false, style, $$slots, $$events, ...restProps } = $$props;
		const contentState = TooltipContentState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			onInteractOutside: boxWith(() => onInteractOutside),
			onEscapeKeydown: boxWith(() => onEscapeKeydown)
		});
		const floatingProps = derived(() => ({
			side,
			sideOffset,
			align,
			avoidCollisions,
			arrowPadding,
			sticky,
			hideWhenDetached,
			collisionPadding,
			strategy,
			customAnchor: customAnchor ?? contentState.root.triggerNode
		}));
		const mergedProps = derived(() => mergeProps(restProps, floatingProps(), contentState.props));
		if (forceMount) {
			$$renderer$1.push("<!--[0-->");
			{
				function popper($$renderer$2, { props, wrapperProps }) {
					const finalWrapperProps = mergeProps(wrapperProps, { style: { pointerEvents: contentState.root.disableHoverableContent ? "none" : void 0 } });
					const finalProps = mergeProps(props, { style: getFloatingContentCSSVars("tooltip") }, { style });
					if (child) {
						$$renderer$2.push("<!--[0-->");
						child($$renderer$2, {
							props: finalProps,
							wrapperProps: finalWrapperProps,
							...contentState.snippetProps
						});
						$$renderer$2.push(`<!---->`);
					} else {
						$$renderer$2.push("<!--[-1-->");
						$$renderer$2.push(`<div${attributes({ ...finalWrapperProps })}><div${attributes({ ...finalProps })}>`);
						children?.($$renderer$2);
						$$renderer$2.push(`<!----></div></div>`);
					}
					$$renderer$2.push(`<!--]-->`);
				}
				Popper_layer_force_mount($$renderer$1, spread_props([
					mergedProps(),
					contentState.popperProps,
					{
						enabled: contentState.root.opts.open.current,
						id,
						trapFocus: false,
						loop: false,
						preventScroll: false,
						forceMount: true,
						ref: contentState.opts.ref,
						tooltip: true,
						shouldRender: contentState.shouldRender,
						contentPointerEvents: contentState.root.disableHoverableContent ? "none" : "auto",
						popper,
						$$slots: { popper: true }
					}
				]));
			}
		} else if (!forceMount) {
			$$renderer$1.push("<!--[1-->");
			{
				function popper($$renderer$2, { props, wrapperProps }) {
					const finalWrapperProps = mergeProps(wrapperProps, { style: { pointerEvents: contentState.root.disableHoverableContent ? "none" : void 0 } });
					const finalProps = mergeProps(props, { style: getFloatingContentCSSVars("tooltip") }, { style });
					if (child) {
						$$renderer$2.push("<!--[0-->");
						child($$renderer$2, {
							props: finalProps,
							wrapperProps: finalWrapperProps,
							...contentState.snippetProps
						});
						$$renderer$2.push(`<!---->`);
					} else {
						$$renderer$2.push("<!--[-1-->");
						$$renderer$2.push(`<div${attributes({ ...finalWrapperProps })}><div${attributes({ ...finalProps })}>`);
						children?.($$renderer$2);
						$$renderer$2.push(`<!----></div></div>`);
					}
					$$renderer$2.push(`<!--]-->`);
				}
				Popper_layer($$renderer$1, spread_props([
					mergedProps(),
					contentState.popperProps,
					{
						open: contentState.root.opts.open.current,
						id,
						trapFocus: false,
						loop: false,
						preventScroll: false,
						forceMount: false,
						ref: contentState.opts.ref,
						tooltip: true,
						shouldRender: contentState.shouldRender,
						contentPointerEvents: contentState.root.disableHoverableContent ? "none" : "auto",
						popper,
						$$slots: { popper: true }
					}
				]));
			}
		} else $$renderer$1.push("<!--[-1-->");
		$$renderer$1.push(`<!--]-->`);
		bind_props($$props, { ref });
	});
}
function Tooltip_trigger($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		const uid = props_id($$renderer$1);
		let { children, child, id = createId(uid), disabled = false, payload, tether, type = "button", tabindex = 0, ref = null, $$slots, $$events, ...restProps } = $$props;
		const triggerState = TooltipTriggerState.create({
			id: boxWith(() => id),
			disabled: boxWith(() => disabled ?? false),
			tabindex: boxWith(() => tabindex ?? 0),
			payload: boxWith(() => payload),
			tether: boxWith(() => tether),
			ref: boxWith(() => ref, (v) => ref = v)
		});
		const mergedProps = derived(() => mergeProps(restProps, triggerState.props, { type }));
		if (child) {
			$$renderer$1.push("<!--[0-->");
			child($$renderer$1, { props: mergedProps() });
			$$renderer$1.push(`<!---->`);
		} else {
			$$renderer$1.push("<!--[-1-->");
			$$renderer$1.push(`<button${attributes({ ...mergedProps() })}>`);
			children?.($$renderer$1);
			$$renderer$1.push(`<!----></button>`);
		}
		$$renderer$1.push(`<!--]-->`);
		bind_props($$props, { ref });
	});
}
function Tooltip_provider($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { children, delayDuration = 700, disableCloseOnTriggerClick = false, disableHoverableContent = false, disabled = false, ignoreNonKeyboardFocus = false, skipDelayDuration = 300 } = $$props;
		TooltipProviderState.create({
			delayDuration: boxWith(() => delayDuration),
			disableCloseOnTriggerClick: boxWith(() => disableCloseOnTriggerClick),
			disableHoverableContent: boxWith(() => disableHoverableContent),
			disabled: boxWith(() => disabled),
			ignoreNonKeyboardFocus: boxWith(() => ignoreNonKeyboardFocus),
			skipDelayDuration: boxWith(() => skipDelayDuration)
		});
		children?.($$renderer$1);
		$$renderer$1.push(`<!---->`);
	});
}
function Dialog($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { open, onclose, fullScreen = false, maxWidth = "sm", class: className, children } = $$props;
		const MAX_W = {
			xs: "max-w-xs",
			sm: "max-w-sm",
			md: "max-w-md",
			lg: "max-w-2xl"
		};
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer$2) {
			var bind_get = () => open;
			var bind_set = (v) => {
				if (!v) onclose();
			};
			if (Dialog$1) {
				$$renderer$2.push("<!--[-->");
				Dialog$1($$renderer$2, {
					get open() {
						return bind_get();
					},
					set open($$value) {
						bind_set($$value);
					},
					children: ($$renderer$3) => {
						if (Portal) {
							$$renderer$3.push("<!--[-->");
							Portal($$renderer$3, {
								children: ($$renderer$4) => {
									if (Dialog_overlay) {
										$$renderer$4.push("<!--[-->");
										Dialog_overlay($$renderer$4, { class: "fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=open]:fade-in" });
										$$renderer$4.push("<!--]-->");
									} else {
										$$renderer$4.push("<!--[!-->");
										$$renderer$4.push("<!--]-->");
									}
									$$renderer$4.push(` `);
									if (Dialog_content) {
										$$renderer$4.push("<!--[-->");
										Dialog_content($$renderer$4, {
											class: cn("fixed z-50 bg-[color:var(--color-surface)] text-[color:var(--color-fg)] shadow-xl outline-none", "data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95", fullScreen ? "inset-0 w-screen h-screen" : `top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-2rem)] ${MAX_W[maxWidth]} rounded-lg`, className),
											children: ($$renderer$5) => {
												children?.($$renderer$5);
												$$renderer$5.push(`<!---->`);
											},
											$$slots: { default: true }
										});
										$$renderer$4.push("<!--]-->");
									} else {
										$$renderer$4.push("<!--[!-->");
										$$renderer$4.push("<!--]-->");
									}
								},
								$$slots: { default: true }
							});
							$$renderer$3.push("<!--]-->");
						} else {
							$$renderer$3.push("<!--[!-->");
							$$renderer$3.push("<!--]-->");
						}
					},
					$$slots: { default: true }
				});
				$$renderer$2.push("<!--]-->");
			} else {
				$$renderer$2.push("<!--[!-->");
				$$renderer$2.push("<!--]-->");
			}
		}
		do {
			$$settled = true;
			$$inner_renderer = $$renderer$1.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);
		$$renderer$1.subsume($$inner_renderer);
	});
}
function DialogTitle($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { onclose, class: className, children } = $$props;
		$$renderer$1.push(`<div${attr_class(clsx$1(cn("flex items-center justify-between gap-3 px-4 py-3 border-b border-[color:var(--color-border)]", className)))}>`);
		if (Dialog_title) {
			$$renderer$1.push("<!--[-->");
			Dialog_title($$renderer$1, {
				class: "text-lg font-semibold",
				children: ($$renderer$2) => {
					children?.($$renderer$2);
					$$renderer$2.push(`<!---->`);
				},
				$$slots: { default: true }
			});
			$$renderer$1.push("<!--]-->");
		} else {
			$$renderer$1.push("<!--[!-->");
			$$renderer$1.push("<!--]-->");
		}
		$$renderer$1.push(` `);
		if (onclose) {
			$$renderer$1.push("<!--[0-->");
			$$renderer$1.push(`<button type="button" aria-label="Close" class="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-[color:var(--color-border)]">`);
			X($$renderer$1, { size: 18 });
			$$renderer$1.push(`<!----></button>`);
		} else $$renderer$1.push("<!--[-1-->");
		$$renderer$1.push(`<!--]--></div>`);
	});
}
function DialogContent($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { class: className, children } = $$props;
		$$renderer$1.push(`<div${attr_class(clsx$1(cn("p-4 overflow-auto", className)))}>`);
		children?.($$renderer$1);
		$$renderer$1.push(`<!----></div>`);
	});
}
function Tooltip($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { title, placement = "top", class: className, children } = $$props;
		if (!title) {
			$$renderer$1.push("<!--[0-->");
			children?.($$renderer$1);
			$$renderer$1.push(`<!---->`);
		} else {
			$$renderer$1.push("<!--[-1-->");
			if (Tooltip_provider) {
				$$renderer$1.push("<!--[-->");
				Tooltip_provider($$renderer$1, {
					delayDuration: 300,
					children: ($$renderer$2) => {
						if (Tooltip$1) {
							$$renderer$2.push("<!--[-->");
							Tooltip$1($$renderer$2, {
								children: ($$renderer$3) => {
									{
										function child($$renderer$4, { props }) {
											$$renderer$4.push(`<span${attributes({
												...props,
												class: "inline-flex"
											})}>`);
											children?.($$renderer$4);
											$$renderer$4.push(`<!----></span>`);
										}
										if (Tooltip_trigger) {
											$$renderer$3.push("<!--[-->");
											Tooltip_trigger($$renderer$3, {
												child,
												$$slots: { child: true }
											});
											$$renderer$3.push("<!--]-->");
										} else {
											$$renderer$3.push("<!--[!-->");
											$$renderer$3.push("<!--]-->");
										}
									}
									$$renderer$3.push(` `);
									if (Portal) {
										$$renderer$3.push("<!--[-->");
										Portal($$renderer$3, {
											children: ($$renderer$4) => {
												if (Tooltip_content) {
													$$renderer$4.push("<!--[-->");
													Tooltip_content($$renderer$4, {
														side: placement,
														sideOffset: 6,
														class: cn("z-50 px-2 py-1 rounded text-xs bg-[color:var(--color-fg)] text-[color:var(--color-bg)] shadow", "data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in", className),
														children: ($$renderer$5) => {
															$$renderer$5.push(`<!---->${escape_html(title)}`);
														},
														$$slots: { default: true }
													});
													$$renderer$4.push("<!--]-->");
												} else {
													$$renderer$4.push("<!--[!-->");
													$$renderer$4.push("<!--]-->");
												}
											},
											$$slots: { default: true }
										});
										$$renderer$3.push("<!--]-->");
									} else {
										$$renderer$3.push("<!--[!-->");
										$$renderer$3.push("<!--]-->");
									}
								},
								$$slots: { default: true }
							});
							$$renderer$2.push("<!--]-->");
						} else {
							$$renderer$2.push("<!--[!-->");
							$$renderer$2.push("<!--]-->");
						}
					},
					$$slots: { default: true }
				});
				$$renderer$1.push("<!--]-->");
			} else {
				$$renderer$1.push("<!--[!-->");
				$$renderer$1.push("<!--]-->");
			}
		}
		$$renderer$1.push(`<!--]-->`);
	});
}
function Collapsible($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { in: inProp, open, reduced = false, class: className, children } = $$props;
		const isOpen = derived(() => inProp ?? open ?? false);
		$$renderer$1.push(`<div${attr("data-state", isOpen() ? "open" : "closed")}${attr_class(clsx$1(cn("grid", reduced ? "" : "transition-[grid-template-rows] duration-200 ease-out", isOpen() ? "grid-rows-[1fr]" : "grid-rows-[0fr]", className)))}${attr("aria-hidden", !isOpen())}><div class="overflow-hidden min-h-0">`);
		children?.($$renderer$1);
		$$renderer$1.push(`<!----></div></div>`);
	});
}
function Switch($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { checked, onchange, disabled = false, class: className, "aria-label": ariaLabel } = $$props;
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer$2) {
			var bind_get = () => checked;
			var bind_set = (v) => onchange(v);
			if (Switch$1) {
				$$renderer$2.push("<!--[-->");
				Switch$1($$renderer$2, {
					get checked() {
						return bind_get();
					},
					set checked($$value) {
						bind_set($$value);
					},
					disabled,
					"aria-label": ariaLabel,
					class: cn("relative w-10 h-6 rounded-full transition-colors", "bg-[color:var(--color-border)] data-[state=checked]:bg-[color:var(--color-primary)]", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)]", "disabled:opacity-50 disabled:cursor-not-allowed", className),
					children: ($$renderer$3) => {
						if (Switch_thumb) {
							$$renderer$3.push("<!--[-->");
							Switch_thumb($$renderer$3, { class: "block w-5 h-5 bg-white rounded-full shadow translate-x-0.5 transition-transform data-[state=checked]:translate-x-[18px]" });
							$$renderer$3.push("<!--]-->");
						} else {
							$$renderer$3.push("<!--[!-->");
							$$renderer$3.push("<!--]-->");
						}
					},
					$$slots: { default: true }
				});
				$$renderer$2.push("<!--]-->");
			} else {
				$$renderer$2.push("<!--[!-->");
				$$renderer$2.push("<!--]-->");
			}
		}
		do {
			$$settled = true;
			$$inner_renderer = $$renderer$1.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);
		$$renderer$1.subsume($$inner_renderer);
	});
}
function TextField($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		const autoId = props_id($$renderer$1);
		let { label, helperText, error = false, fullWidth = false, class: className, id, $$slots, $$events, ...rest } = $$props;
		const inputId = derived(() => id ?? `tf-${autoId}`);
		$$renderer$1.push(`<div${attr_class(clsx$1(cn(fullWidth && "w-full", className)))}>`);
		if (label) {
			$$renderer$1.push("<!--[0-->");
			$$renderer$1.push(`<label${attr("for", inputId())} class="block text-sm font-medium mb-1 text-[color:var(--color-fg)]">${escape_html(label)}</label>`);
		} else $$renderer$1.push("<!--[-1-->");
		$$renderer$1.push(`<!--]--> <input${attributes({
			id: inputId(),
			class: clsx$1(cn("block w-full h-10 px-3 rounded-md border bg-[color:var(--color-surface)] text-[color:var(--color-fg)]", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)]", error ? "border-[color:var(--color-danger)] focus-visible:ring-[color:var(--color-danger)]" : "border-[color:var(--color-border)]")),
			"aria-invalid": error || void 0,
			...rest
		}, void 0, void 0, void 0, 4)}/> `);
		if (helperText) {
			$$renderer$1.push("<!--[0-->");
			$$renderer$1.push(`<p${attr_class(clsx$1(cn("mt-1 text-xs", error ? "text-[color:var(--color-danger)]" : "text-[color:var(--color-fg-muted)]")))}>${escape_html(helperText)}</p>`);
		} else $$renderer$1.push("<!--[-1-->");
		$$renderer$1.push(`<!--]--></div>`);
	});
}
function ProgressBar($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { value, class: className, "aria-label": ariaLabel = "Progress" } = $$props;
		const pct = derived(() => Math.max(0, Math.min(100, value)));
		$$renderer$1.push(`<div role="progressbar"${attr("aria-label", ariaLabel)}${attr("aria-valuemin", 0)}${attr("aria-valuemax", 100)}${attr("aria-valuenow", pct())}${attr_class(clsx$1(cn("h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--color-border)]", className)))}><div class="h-full bg-[color:var(--color-primary)] transition-[width] duration-150"${attr_style(`width:${pct()}%`)}></div></div>`);
	});
}
function Tabs($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { value, items, onchange, class: className } = $$props;
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer$2) {
			var bind_get = () => value;
			var bind_set = (v) => onchange(v);
			if (Tabs$1) {
				$$renderer$2.push("<!--[-->");
				Tabs$1($$renderer$2, {
					get value() {
						return bind_get();
					},
					set value($$value) {
						bind_set($$value);
					},
					class: cn("w-full", className),
					children: ($$renderer$3) => {
						if (Tabs_list) {
							$$renderer$3.push("<!--[-->");
							Tabs_list($$renderer$3, {
								class: cn("inline-flex items-center gap-1 p-1 rounded-md", "bg-[color:var(--color-border)]/50"),
								children: ($$renderer$4) => {
									$$renderer$4.push(`<!--[-->`);
									const each_array = ensure_array_like(items);
									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let item = each_array[$$index];
										if (Tabs_trigger) {
											$$renderer$4.push("<!--[-->");
											Tabs_trigger($$renderer$4, {
												value: item.value,
												class: cn("px-3 h-8 text-sm rounded-md transition-colors", "data-[state=active]:bg-[color:var(--color-surface)]", "data-[state=active]:text-[color:var(--color-fg)]", "data-[state=active]:shadow-sm", "text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)]", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)]"),
												children: ($$renderer$5) => {
													$$renderer$5.push(`<!---->${escape_html(item.label)}`);
												},
												$$slots: { default: true }
											});
											$$renderer$4.push("<!--]-->");
										} else {
											$$renderer$4.push("<!--[!-->");
											$$renderer$4.push("<!--]-->");
										}
									}
									$$renderer$4.push(`<!--]-->`);
								},
								$$slots: { default: true }
							});
							$$renderer$3.push("<!--]-->");
						} else {
							$$renderer$3.push("<!--[!-->");
							$$renderer$3.push("<!--]-->");
						}
					},
					$$slots: { default: true }
				});
				$$renderer$2.push("<!--]-->");
			} else {
				$$renderer$2.push("<!--[!-->");
				$$renderer$2.push("<!--]-->");
			}
		}
		do {
			$$settled = true;
			$$inner_renderer = $$renderer$1.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);
		$$renderer$1.subsume($$inner_renderer);
	});
}
function ToggleGroup($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { value, items, onchange, size: size$1 = "medium", class: className } = $$props;
		const SIZE = {
			small: "text-xs h-7 px-2.5",
			medium: "text-sm h-9 px-3.5"
		};
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer$2) {
			var bind_get = () => value;
			var bind_set = (v) => {
				if (v) onchange(v);
			};
			if (Toggle_group) {
				$$renderer$2.push("<!--[-->");
				Toggle_group($$renderer$2, {
					type: "single",
					get value() {
						return bind_get();
					},
					set value($$value) {
						bind_set($$value);
					},
					class: cn("inline-flex rounded-md border border-[color:var(--color-border)] overflow-hidden", className),
					children: ($$renderer$3) => {
						$$renderer$3.push(`<!--[-->`);
						const each_array = ensure_array_like(items);
						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let item = each_array[$$index];
							if (Toggle_group_item) {
								$$renderer$3.push("<!--[-->");
								Toggle_group_item($$renderer$3, {
									value: item.value,
									"aria-label": item["aria-label"],
									class: cn("inline-flex items-center justify-center gap-1.5 transition-colors", SIZE[size$1], "data-[state=on]:bg-[color:var(--color-primary)] data-[state=on]:text-[color:var(--color-primary-fg)]", "hover:bg-[color:var(--color-border)]/50", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)]"),
									children: ($$renderer$4) => {
										if (item.icon) {
											$$renderer$4.push("<!--[0-->");
											item.icon($$renderer$4);
											$$renderer$4.push(`<!---->`);
										} else $$renderer$4.push("<!--[-1-->");
										$$renderer$4.push(`<!--]--> `);
										if (item.label) {
											$$renderer$4.push("<!--[0-->");
											$$renderer$4.push(`<span>${escape_html(item.label)}</span>`);
										} else $$renderer$4.push("<!--[-1-->");
										$$renderer$4.push(`<!--]-->`);
									},
									$$slots: { default: true }
								});
								$$renderer$3.push("<!--]-->");
							} else {
								$$renderer$3.push("<!--[!-->");
								$$renderer$3.push("<!--]-->");
							}
						}
						$$renderer$3.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});
				$$renderer$2.push("<!--]-->");
			} else {
				$$renderer$2.push("<!--[!-->");
				$$renderer$2.push("<!--]-->");
			}
		}
		do {
			$$settled = true;
			$$inner_renderer = $$renderer$1.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);
		$$renderer$1.subsume($$inner_renderer);
	});
}
function List($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { class: className, children, $$slots, $$events, ...rest } = $$props;
		$$renderer$1.push(`<ul${attributes({
			class: clsx$1(cn("list-none m-0 p-0 flex flex-col", className)),
			...rest
		})}>`);
		children?.($$renderer$1);
		$$renderer$1.push(`<!----></ul>`);
	});
}
function ListItem($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { button = false, onclick, class: className, children, $$slots, $$events, ...rest } = $$props;
		$$renderer$1.push(`<li${attributes({
			class: clsx$1(cn("flex items-stretch", className)),
			...rest
		})}>`);
		if (button) {
			$$renderer$1.push("<!--[0-->");
			$$renderer$1.push(`<button type="button"${attr_class(clsx$1(cn("flex-1 inline-flex items-center gap-3 px-3 py-2 text-left rounded", "hover:bg-[color:var(--color-border)]/40", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)]")))}>`);
			children?.($$renderer$1);
			$$renderer$1.push(`<!----></button>`);
		} else {
			$$renderer$1.push("<!--[-1-->");
			$$renderer$1.push(`<div class="flex-1 inline-flex items-center gap-3 px-3 py-2">`);
			children?.($$renderer$1);
			$$renderer$1.push(`<!----></div>`);
		}
		$$renderer$1.push(`<!--]--></li>`);
	});
}
function ListItemText($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { primary, secondary, class: className } = $$props;
		$$renderer$1.push(`<div${attr_class(clsx$1(cn("flex flex-col min-w-0", className)))}>`);
		if (typeof primary === "string") {
			$$renderer$1.push("<!--[0-->");
			$$renderer$1.push(`<span class="text-sm font-medium truncate">${escape_html(primary)}</span>`);
		} else if (primary) {
			$$renderer$1.push("<!--[1-->");
			primary($$renderer$1);
			$$renderer$1.push(`<!---->`);
		} else $$renderer$1.push("<!--[-1-->");
		$$renderer$1.push(`<!--]--> `);
		if (typeof secondary === "string") {
			$$renderer$1.push("<!--[0-->");
			$$renderer$1.push(`<span class="text-xs text-[color:var(--color-fg-muted)] truncate">${escape_html(secondary)}</span>`);
		} else if (secondary) {
			$$renderer$1.push("<!--[1-->");
			secondary($$renderer$1);
			$$renderer$1.push(`<!---->`);
		} else $$renderer$1.push("<!--[-1-->");
		$$renderer$1.push(`<!--]--></div>`);
	});
}
function pickContrastingText(hex) {
	const c = hex.replace("#", "");
	if (c.length !== 6) return "#000";
	const r = parseInt(c.substring(0, 2), 16);
	const g = parseInt(c.substring(2, 4), 16);
	const b = parseInt(c.substring(4, 6), 16);
	return (.299 * r + .587 * g + .114 * b) / 255 > .6 ? "#000" : "#fff";
}
function formatHHMM(minutesSinceMidnight) {
	const safe = Math.max(0, Math.min(1439, Math.round(minutesSinceMidnight)));
	const h = Math.floor(safe / 60);
	const m = safe % 60;
	return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function RouteBadge($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { route, size: size$1 = "medium", isStart = false, isEnd = false, isFavorite = false, selected = false, onclick, class: className, "aria-label": ariaLabel } = $$props;
		const fg = derived(() => route.textColor ?? pickContrastingText(route.color));
		$$renderer$1.push(`<span${attr("role", onclick ? "button" : "img")}${attr("tabindex", onclick ? 0 : void 0)}${attr("aria-label", ariaLabel ?? `Route ${route.shortName}`)}${attr("aria-pressed", onclick ? selected : void 0)}${attr_style(`background:${route.color};color:${fg()};`)}${attr_class(clsx$1(cn("relative inline-flex items-center justify-center font-bold rounded-md select-none whitespace-nowrap", {
			small: "h-6 min-w-6 px-1.5 text-xs",
			medium: "h-7 min-w-7 px-2 text-sm",
			large: "h-8 min-w-8 px-2.5 text-base"
		}[size$1], onclick && "cursor-pointer", selected && "ring-2 ring-offset-1 ring-offset-[color:var(--color-surface)] ring-[color:var(--color-fg)]", className)))}>`);
		if (isStart) {
			$$renderer$1.push("<!--[0-->");
			$$renderer$1.push(`<span aria-hidden="true" class="absolute left-0.5 top-1/2 -translate-y-1/2 w-0 h-0 opacity-90"${attr_style(`border-top:4px solid transparent;border-bottom:4px solid transparent;border-left:5px solid ${fg()};`)}></span>`);
		} else $$renderer$1.push("<!--[-1-->");
		$$renderer$1.push(`<!--]--> `);
		if (isEnd) {
			$$renderer$1.push("<!--[0-->");
			$$renderer$1.push(`<span aria-hidden="true" class="absolute right-0.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 opacity-90"${attr_style(`background:${fg()};`)}></span>`);
		} else $$renderer$1.push("<!--[-1-->");
		$$renderer$1.push(`<!--]--> `);
		if (isFavorite) {
			$$renderer$1.push("<!--[0-->");
			$$renderer$1.push(`<span aria-hidden="true" class="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-[color:var(--color-danger)] text-white" style="width:14px;height:14px;">`);
			Heart($$renderer$1, {
				size: 9,
				strokeWidth: 3
			});
			$$renderer$1.push(`<!----></span>`);
		} else $$renderer$1.push("<!--[-1-->");
		$$renderer$1.push(`<!--]--> ${escape_html(route.shortName)}</span>`);
	});
}
function VehicleCard($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { vehicle, onclick, class: className } = $$props;
		const KIND = derived(() => ({
			"live": {
				border: "border-solid",
				opacity: "",
				icon: Radio,
				label: "Live",
				iconBg: "bg-[color:var(--color-success)]"
			},
			"live-matched": {
				border: "border-solid",
				opacity: "",
				icon: Calendar,
				label: "Matched",
				iconBg: "bg-[color:var(--color-success)]"
			},
			"ghost": {
				border: "border-dashed",
				opacity: "",
				icon: Eye_off,
				label: "Ghost",
				iconBg: "bg-[color:var(--color-warning)]"
			},
			"scheduled": {
				border: "border-dotted",
				opacity: "opacity-60",
				icon: Calendar,
				label: "Scheduled",
				iconBg: "bg-[color:var(--color-fg-muted)]"
			}
		})[vehicle.kind]);
		const KindIcon = derived(() => KIND().icon);
		const secondaryLine = derived(() => {
			if (vehicle.kind === "live" || vehicle.kind === "live-matched") return typeof vehicle.eta === "number" ? `${vehicle.eta} min` : "En route";
			return `Scheduled ${formatHHMM(vehicle.schedule.scheduledDeparture)}`;
		});
		const headsign = derived(() => vehicle.headsign ?? (vehicle.kind !== "live" && vehicle.kind !== "live-matched" ? vehicle.schedule.headsign : void 0) ?? "—");
		const interactive = derived(() => typeof onclick === "function");
		$$renderer$1.push(`<div${attr("role", interactive() ? "button" : void 0)}${attr("tabindex", interactive() ? 0 : void 0)}${attr_class(clsx$1(cn("flex items-center gap-3 px-3 py-2 border-2 rounded-md transition-colors", "border-[color:var(--color-border)]", KIND().border, KIND().opacity, interactive() && "cursor-pointer hover:bg-[color:var(--color-border)]/30", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)]", className)))}>`);
		RouteBadge($$renderer$1, {
			route: vehicle.route,
			size: "medium"
		});
		$$renderer$1.push(`<!----> <div class="flex-1 min-w-0"><div class="text-sm font-medium truncate">${escape_html(headsign())}</div> <div class="text-xs text-[color:var(--color-fg-muted)] truncate">${escape_html(secondaryLine())}</div></div> <span${attr("title", KIND().label)}${attr("aria-label", KIND().label)}${attr_class(clsx$1(cn("inline-flex items-center justify-center w-6 h-6 rounded-full text-white shrink-0", KIND().iconBg)))}>`);
		if (KindIcon()) {
			$$renderer$1.push("<!--[-->");
			KindIcon()($$renderer$1, {
				size: 12,
				strokeWidth: 2.5
			});
			$$renderer$1.push("<!--]-->");
		} else {
			$$renderer$1.push("<!--[!-->");
			$$renderer$1.push("<!--]-->");
		}
		$$renderer$1.push(`</span></div>`);
	});
}
function StationCard($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { station, routes, vehicles, expanded, ontoggle, dropOffOnly = false, selectedRouteId, onRouteClick, favoriteRouteIds, class: className } = $$props;
		function formatDistance(m) {
			if (typeof m !== "number") return "";
			return m < 1e3 ? `${Math.round(m)} m` : `${(m / 1e3).toFixed(1)} km`;
		}
		const filteredVehicles = derived(() => typeof selectedRouteId === "number" ? vehicles.filter((v) => v.route.id === selectedRouteId) : vehicles);
		Card($$renderer$1, {
			variant: "station",
			class: className,
			children: ($$renderer$2) => {
				CardContent($$renderer$2, {
					children: ($$renderer$3) => {
						Stack($$renderer$3, {
							direction: "row",
							spacing: 1.5,
							align: "center",
							children: ($$renderer$4) => {
								Avatar($$renderer$4, {
									variant: "square",
									class: "w-10 h-10 sm:w-12 sm:h-12",
									children: ($$renderer$5) => {
										Bus($$renderer$5, { size: 20 });
									},
									$$slots: { default: true }
								});
								$$renderer$4.push(`<!----> `);
								Box($$renderer$4, {
									class: "flex-1 min-w-0",
									children: ($$renderer$5) => {
										Stack($$renderer$5, {
											spacing: .5,
											children: ($$renderer$6) => {
												Typography($$renderer$6, {
													variant: "h6",
													class: "truncate",
													children: ($$renderer$7) => {
														$$renderer$7.push(`<!---->${escape_html(station.name)}`);
													},
													$$slots: { default: true }
												});
												$$renderer$6.push(`<!----> `);
												Stack($$renderer$6, {
													direction: "row",
													spacing: 1,
													align: "center",
													wrap: true,
													children: ($$renderer$7) => {
														if (typeof station.distance === "number") {
															$$renderer$7.push("<!--[0-->");
															Tooltip($$renderer$7, {
																title: `Station ID: ${station.id}${station.lat && station.lon ? ` | GPS: ${station.lat}, ${station.lon}` : ""}`,
																children: ($$renderer$8) => {
																	{
																		function icon($$renderer$9) {
																			Map_pin($$renderer$9, { size: 12 });
																		}
																		Chip($$renderer$8, {
																			size: "small",
																			icon,
																			children: ($$renderer$9) => {
																				$$renderer$9.push(`<!---->${escape_html(formatDistance(station.distance))}`);
																			},
																			$$slots: {
																				icon: true,
																				default: true
																			}
																		});
																	}
																},
																$$slots: { default: true }
															});
														} else $$renderer$7.push("<!--[-1-->");
														$$renderer$7.push(`<!--]--> `);
														if (dropOffOnly) {
															$$renderer$7.push("<!--[0-->");
															Chip($$renderer$7, {
																size: "small",
																variant: "outlined",
																color: "danger",
																children: ($$renderer$8) => {
																	$$renderer$8.push(`<!---->Drop off only`);
																},
																$$slots: { default: true }
															});
														} else $$renderer$7.push("<!--[-1-->");
														$$renderer$7.push(`<!--]-->`);
													},
													$$slots: { default: true }
												});
												$$renderer$6.push(`<!----> `);
												if (routes.length > 0) {
													$$renderer$6.push("<!--[0-->");
													Stack($$renderer$6, {
														direction: "row",
														spacing: .5,
														align: "center",
														wrap: true,
														class: "mt-1",
														children: ($$renderer$7) => {
															$$renderer$7.push(`<!--[-->`);
															const each_array = ensure_array_like(routes);
															for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																let route = each_array[$$index];
																RouteBadge($$renderer$7, {
																	route,
																	size: "medium",
																	selected: selectedRouteId === route.id,
																	isFavorite: favoriteRouteIds?.has(route.id),
																	onclick: onRouteClick ? () => onRouteClick(route.id) : void 0
																});
															}
															$$renderer$7.push(`<!--]-->`);
														},
														$$slots: { default: true }
													});
												} else $$renderer$6.push("<!--[-1-->");
												$$renderer$6.push(`<!--]-->`);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
								$$renderer$4.push(`<!----> `);
								IconButton($$renderer$4, {
									onclick: ontoggle,
									"aria-label": expanded ? "Collapse" : "Expand",
									class: cn("transition-transform duration-200", expanded ? "rotate-180" : "rotate-0"),
									children: ($$renderer$5) => {
										Chevron_down($$renderer$5, { size: 20 });
									},
									$$slots: { default: true }
								});
								$$renderer$4.push(`<!---->`);
							},
							$$slots: { default: true }
						});
						$$renderer$3.push(`<!----> `);
						Collapsible($$renderer$3, {
							in: expanded,
							class: "mt-2",
							children: ($$renderer$4) => {
								if (filteredVehicles().length === 0) {
									$$renderer$4.push("<!--[0-->");
									Box($$renderer$4, {
										class: "px-3 py-3 text-sm text-[color:var(--color-fg-muted)]",
										children: ($$renderer$5) => {
											$$renderer$5.push(`<!---->${escape_html(selectedRouteId != null ? "No vehicles for the selected route right now." : "No vehicles right now.")}`);
										},
										$$slots: { default: true }
									});
								} else {
									$$renderer$4.push("<!--[-1-->");
									Stack($$renderer$4, {
										spacing: .5,
										class: "pt-1",
										children: ($$renderer$5) => {
											$$renderer$5.push(`<!--[-->`);
											const each_array_1 = ensure_array_like(filteredVehicles());
											for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
												let vehicle = each_array_1[$$index_1];
												VehicleCard($$renderer$5, { vehicle });
											}
											$$renderer$5.push(`<!--]-->`);
										},
										$$slots: { default: true }
									});
								}
								$$renderer$4.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});
						$$renderer$3.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}
function StatusDot($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { state, label, tooltip, pulse = false, class: className } = $$props;
		const COLOR = {
			ok: "bg-[color:var(--color-success)]",
			stale: "bg-[color:var(--color-warning)]",
			error: "bg-[color:var(--color-danger)]",
			idle: "bg-[color:var(--color-fg-muted)]/40"
		};
		Tooltip($$renderer$1, {
			title: tooltip ?? label,
			placement: "bottom",
			children: ($$renderer$2) => {
				$$renderer$2.push(`<span role="status"${attr("aria-label", `${label}: ${state}`)}${attr_class(clsx$1(cn("inline-block w-2.5 h-2.5 rounded-full transition-colors", COLOR[state], pulse && state === "ok" && "animate-pulse", className)))}></span>`);
			},
			$$slots: { default: true }
		});
	});
}
function Header($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { title, health, onrefresh, refreshing = false } = $$props;
		$$renderer$1.push(`<header class="sticky top-0 z-40 flex items-center gap-3 px-4 h-12 bg-[color:var(--color-surface)] border-b border-[color:var(--color-border)] pt-[var(--space-safe-top)]"><h1 class="flex-1 text-base font-semibold truncate">${escape_html(title)}</h1> <div class="flex items-center gap-2">`);
		StatusDot($$renderer$1, {
			state: health.gps.state,
			label: "GPS",
			tooltip: health.gps.tooltip
		});
		$$renderer$1.push(`<!----> `);
		StatusDot($$renderer$1, {
			state: health.connection.state,
			label: "Connection",
			tooltip: health.connection.tooltip
		});
		$$renderer$1.push(`<!----> `);
		StatusDot($$renderer$1, {
			state: health.schedule.state,
			label: "Schedule",
			tooltip: health.schedule.tooltip
		});
		$$renderer$1.push(`<!----> `);
		StatusDot($$renderer$1, {
			state: health.live.state,
			label: "Live",
			tooltip: health.live.tooltip,
			pulse: true
		});
		$$renderer$1.push(`<!----></div> `);
		if (onrefresh) {
			$$renderer$1.push("<!--[0-->");
			IconButton($$renderer$1, {
				size: "small",
				onclick: onrefresh,
				"aria-label": "Refresh",
				disabled: refreshing,
				children: ($$renderer$2) => {
					Refresh_cw($$renderer$2, {
						size: 18,
						class: refreshing ? "animate-spin" : ""
					});
				},
				$$slots: { default: true }
			});
		} else $$renderer$1.push("<!--[-1-->");
		$$renderer$1.push(`<!--]--></header>`);
	});
}
function AppLayout($$renderer, $$props) {
	let { title, health, onrefresh, refreshing = false, navItems, activeNav, onnav, children } = $$props;
	$$renderer.push(`<div class="min-h-svh flex flex-col bg-[color:var(--color-bg)] text-[color:var(--color-fg)]">`);
	Header($$renderer, {
		title,
		health,
		onrefresh,
		refreshing
	});
	$$renderer.push(`<!----> `);
	StatusBar($$renderer, {});
	$$renderer.push(`<!----> <main class="flex-1 overflow-x-hidden pb-20">`);
	children?.($$renderer);
	$$renderer.push(`<!----></main> `);
	BottomNavigation($$renderer, {
		value: activeNav,
		onchange: onnav,
		items: navItems
	});
	$$renderer.push(`<!----></div>`);
}
export { Map_pin as A, Chip as C, Stack as D, Typography as E, Bus as M, Icon as N, Box as O, Avatar as S, Card as T, Dialog as _, ListItemText as a, IconButton as b, ToggleGroup as c, TextField as d, Switch as f, DialogTitle as g, DialogContent as h, RouteBadge as i, Heart as j, Refresh_cw as k, Tabs as l, Tooltip as m, StationCard as n, ListItem as o, Collapsible as p, VehicleCard as r, List as s, AppLayout as t, ProgressBar as u, statusBus as v, CardContent as w, Button as x, Spinner as y };
