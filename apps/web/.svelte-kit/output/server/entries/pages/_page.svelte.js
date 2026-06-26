import { B as noop, E as escape_html } from "../../chunks/index-server.js";
import "../../chunks/shared.js";
import "../../chunks/false.js";
import "../../chunks/internal.js";
import "../../chunks/exports.js";
import "../../chunks/internal2.js";
import { t as goto } from "../../chunks/client.js";
import { n as Settings, t as locationStore } from "../../chunks/locationStore.svelte.js";
import { D as Stack, E as Typography, M as Bus, T as Card, w as CardContent, x as Button } from "../../chunks/ui.js";
import { t as userPrefs } from "../../chunks/userPrefs.svelte.js";
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		$$renderer$1.push(`<div class="mx-auto max-w-3xl px-4 py-6">`);
		if (userPrefs.agencyId == null) {
			$$renderer$1.push("<!--[0-->");
			Card($$renderer$1, {
				class: "text-center",
				children: ($$renderer$2) => {
					CardContent($$renderer$2, {
						children: ($$renderer$3) => {
							{
								function settingsIcon($$renderer$4) {
									Settings($$renderer$4, { size: 16 });
								}
								Stack($$renderer$3, {
									spacing: 2,
									align: "center",
									settingsIcon,
									children: ($$renderer$4) => {
										$$renderer$4.push(`<div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)]">`);
										Bus($$renderer$4, { size: 24 });
										$$renderer$4.push(`<!----></div> `);
										Typography($$renderer$4, {
											variant: "h4",
											children: ($$renderer$5) => {
												$$renderer$5.push(`<!---->Select your transit agency`);
											},
											$$slots: { default: true }
										});
										$$renderer$4.push(`<!----> `);
										Typography($$renderer$4, {
											variant: "body2",
											class: "max-w-prose text-[color:var(--color-fg-muted)]",
											children: ($$renderer$5) => {
												$$renderer$5.push(`<!---->Neary needs a transit agency to load schedules and routes. Pick
            one in Settings to get started. The data downloads once and is
            cached for offline use — no account needed.`);
											},
											$$slots: { default: true }
										});
										$$renderer$4.push(`<!----> `);
										Button($$renderer$4, {
											startIcon: settingsIcon,
											onclick: () => goto("/settings"),
											children: ($$renderer$5) => {
												$$renderer$5.push(`<!---->Open Settings`);
											},
											$$slots: { default: true }
										});
										$$renderer$4.push(`<!---->`);
									},
									$$slots: {
										settingsIcon: true,
										default: true
									}
								});
							}
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer$1.push("<!--[-1-->");
			Card($$renderer$1, {
				children: ($$renderer$2) => {
					CardContent($$renderer$2, {
						children: ($$renderer$3) => {
							Stack($$renderer$3, {
								spacing: 1.5,
								children: ($$renderer$4) => {
									Typography($$renderer$4, {
										variant: "h4",
										children: ($$renderer$5) => {
											$$renderer$5.push(`<!---->Stations`);
										},
										$$slots: { default: true }
									});
									$$renderer$4.push(`<!----> `);
									Typography($$renderer$4, {
										variant: "body2",
										class: "text-[color:var(--color-fg-muted)]",
										children: ($$renderer$5) => {
											$$renderer$5.push(`<!---->Agency ${escape_html(userPrefs.agencyId)} selected. Real proximity-based station
            list lands in Phase 4 (domain layer + GPS hook). For now, see <a href="/data-test" class="underline">/data-test</a> for the raw
            GTFS pipeline exercise.`);
										},
										$$slots: { default: true }
									});
									$$renderer$4.push(`<!---->`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		}
		$$renderer$1.push(`<!--]--></div>`);
	});
}
export { _page as default };
