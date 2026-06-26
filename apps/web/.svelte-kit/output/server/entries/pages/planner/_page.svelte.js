import "../../../chunks/index-server.js";
import "../../../chunks/false.js";
import { C as Chip, D as Stack, E as Typography, T as Card, w as CardContent } from "../../../chunks/ui.js";
import { t as House } from "../../../chunks/house.js";
function _page($$renderer) {
	$$renderer.push(`<div class="mx-auto max-w-3xl px-4 py-6">`);
	Card($$renderer, {
		children: ($$renderer$1) => {
			CardContent($$renderer$1, {
				children: ($$renderer$2) => {
					Stack($$renderer$2, {
						spacing: 1.5,
						align: "center",
						class: "text-center",
						children: ($$renderer$3) => {
							$$renderer$3.push(`<div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)]">`);
							House($$renderer$3, { size: 24 });
							$$renderer$3.push(`<!----></div> `);
							Typography($$renderer$3, {
								variant: "h4",
								children: ($$renderer$4) => {
									$$renderer$4.push(`<!---->Trip Planner`);
								},
								$$slots: { default: true }
							});
							$$renderer$3.push(`<!----> `);
							Chip($$renderer$3, {
								size: "small",
								variant: "outlined",
								children: ($$renderer$4) => {
									$$renderer$4.push(`<!---->Coming in Phase 8`);
								},
								$$slots: { default: true }
							});
							$$renderer$3.push(`<!----> `);
							Typography($$renderer$3, {
								variant: "body2",
								class: "max-w-prose text-[color:var(--color-fg-muted)]",
								children: ($$renderer$4) => {
									$$renderer$4.push(`<!---->From/to routing over real GTFS with transfers. Uses the same
          SQLite-WASM worker as the rest of the app.`);
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
		},
		$$slots: { default: true }
	});
	$$renderer.push(`<!----></div>`);
}
export { _page as default };
