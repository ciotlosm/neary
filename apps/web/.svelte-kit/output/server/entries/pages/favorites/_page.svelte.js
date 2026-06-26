import { E as escape_html } from "../../../chunks/index-server.js";
import "../../../chunks/false.js";
import { D as Stack, E as Typography, T as Card, j as Heart, w as CardContent } from "../../../chunks/ui.js";
import { t as userPrefs } from "../../../chunks/userPrefs.svelte.js";
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		$$renderer$1.push(`<div class="mx-auto max-w-3xl px-4 py-6">`);
		Card($$renderer$1, {
			children: ($$renderer$2) => {
				CardContent($$renderer$2, {
					children: ($$renderer$3) => {
						Stack($$renderer$3, {
							spacing: 1.5,
							align: "center",
							class: "text-center",
							children: ($$renderer$4) => {
								$$renderer$4.push(`<div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[color:var(--color-danger)]/10 text-[color:var(--color-danger)]">`);
								Heart($$renderer$4, { size: 24 });
								$$renderer$4.push(`<!----></div> `);
								Typography($$renderer$4, {
									variant: "h4",
									children: ($$renderer$5) => {
										$$renderer$5.push(`<!---->Favorites`);
									},
									$$slots: { default: true }
								});
								$$renderer$4.push(`<!----> `);
								Typography($$renderer$4, {
									variant: "body2",
									class: "max-w-prose text-[color:var(--color-fg-muted)]",
									children: ($$renderer$5) => {
										$$renderer$5.push(`<!---->${escape_html(userPrefs.agencyId == null ? "Pick an agency in Settings first; then star routes from a station card to see them here." : "No favorites yet. Tap the heart on any route badge to add it.")}`);
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
		$$renderer$1.push(`<!----></div>`);
	});
}
export { _page as default };
