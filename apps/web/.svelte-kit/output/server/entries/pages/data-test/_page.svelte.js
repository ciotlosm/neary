import { B as noop, E as escape_html, f as ensure_array_like, p as head } from "../../../chunks/index-server.js";
import "../../../chunks/false.js";
import { A as Map_pin, C as Chip, D as Stack, E as Typography, O as Box, T as Card, a as ListItemText, i as RouteBadge, o as ListItem, s as List, v as statusBus, w as CardContent } from "../../../chunks/ui.js";
import { t as getGtfsRepo } from "../../../chunks/repo.js";
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let routes = null;
		let nearby = null;
		function fmtMeters(m) {
			return m < 1e3 ? `${Math.round(m)} m` : `${(m / 1e3).toFixed(2)} km`;
		}
		head("y4907g", $$renderer$1, ($$renderer$2) => {
			$$renderer$2.title(($$renderer$3) => {
				$$renderer$3.push(`<title>Data test — neary v2</title>`);
			});
		});
		$$renderer$1.push(`<main class="mx-auto max-w-3xl px-4 py-6 space-y-8"><header>`);
		Typography($$renderer$1, {
			variant: "h2",
			children: ($$renderer$2) => {
				$$renderer$2.push(`<!---->GTFS pipeline test`);
			},
			$$slots: { default: true }
		});
		$$renderer$1.push(`<!----> `);
		Typography($$renderer$1, {
			variant: "body2",
			class: "text-[color:var(--color-fg-muted)]",
			children: ($$renderer$2) => {
				$$renderer$2.push(`<!---->First-launch: downloads agency-2.sqlite3.gz (~4 MB), decompresses,
      imports into OPFS via SAH pool, runs real GTFS queries in a Web Worker.
      Subsequent visits skip the download.`);
			},
			$$slots: { default: true }
		});
		$$renderer$1.push(`<!----></header> `);
		$$renderer$1.push("<!--[-1-->");
		$$renderer$1.push(`<!--]--> <section class="space-y-2">`);
		Typography($$renderer$1, {
			variant: "h4",
			children: ($$renderer$2) => {
				$$renderer$2.push(`<!---->Manifest`);
			},
			$$slots: { default: true }
		});
		$$renderer$1.push(`<!----> `);
		$$renderer$1.push("<!--[0-->");
		Typography($$renderer$1, {
			variant: "body2",
			class: "text-[color:var(--color-fg-muted)]",
			children: ($$renderer$2) => {
				$$renderer$2.push(`<!---->Loading…`);
			},
			$$slots: { default: true }
		});
		$$renderer$1.push(`<!--]--></section> <section class="space-y-2">`);
		Typography($$renderer$1, {
			variant: "h4",
			children: ($$renderer$2) => {
				$$renderer$2.push(`<!---->Routes (${escape_html(routes?.length ?? "…")})`);
			},
			$$slots: { default: true }
		});
		$$renderer$1.push(`<!----> `);
		$$renderer$1.push("<!--[-1-->");
		$$renderer$1.push(`<!--]--></section> <section class="space-y-2">`);
		Typography($$renderer$1, {
			variant: "h4",
			children: ($$renderer$2) => {
				$$renderer$2.push(`<!---->Stops within 500 m of (46.7712, 23.6236)`);
			},
			$$slots: { default: true }
		});
		$$renderer$1.push(`<!----> `);
		if (nearby === null) {
			$$renderer$1.push("<!--[0-->");
			Typography($$renderer$1, {
				variant: "body2",
				class: "text-[color:var(--color-fg-muted)]",
				children: ($$renderer$2) => {
					$$renderer$2.push(`<!---->Querying…`);
				},
				$$slots: { default: true }
			});
		} else if (nearby.length === 0) {
			$$renderer$1.push("<!--[1-->");
			Typography($$renderer$1, {
				variant: "body2",
				children: ($$renderer$2) => {
					$$renderer$2.push(`<!---->No stops in range.`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer$1.push("<!--[-1-->");
			Card($$renderer$1, {
				children: ($$renderer$2) => {
					List($$renderer$2, {
						children: ($$renderer$3) => {
							$$renderer$3.push(`<!--[-->`);
							const each_array_2 = ensure_array_like(nearby);
							for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
								let s = each_array_2[i];
								ListItem($$renderer$3, {
									children: ($$renderer$4) => {
										ListItemText($$renderer$4, {
											primary: s.name,
											secondary: `id ${s.id} · ${fmtMeters(s.distance)}${i === 0 ? " · closest" : ""}`
										});
										$$renderer$4.push(`<!----> `);
										if (i === 0) {
											$$renderer$4.push("<!--[0-->");
											{
												function icon($$renderer$5) {
													Map_pin($$renderer$5, { size: 12 });
												}
												Chip($$renderer$4, {
													size: "small",
													color: "primary",
													icon,
													children: ($$renderer$5) => {
														$$renderer$5.push(`<!---->closest`);
													},
													$$slots: {
														icon: true,
														default: true
													}
												});
											}
										} else $$renderer$4.push("<!--[-1-->");
										$$renderer$4.push(`<!--]-->`);
									},
									$$slots: { default: true }
								});
							}
							$$renderer$3.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		}
		$$renderer$1.push(`<!--]--></section> `);
		$$renderer$1.push("<!--[-1-->");
		$$renderer$1.push(`<!--]--></main>`);
	});
}
export { _page as default };
