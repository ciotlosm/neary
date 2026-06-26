import { B as noop, E as escape_html, _ as sanitize_props, f as ensure_array_like, v as slot, y as spread_props } from "../../../chunks/index-server.js";
import "../../../chunks/false.js";
import { C as Chip, D as Stack, E as Typography, N as Icon, O as Box, T as Card, a as ListItemText, c as ToggleGroup, d as TextField, f as Switch, o as ListItem, s as List, w as CardContent, x as Button, y as Spinner } from "../../../chunks/ui.js";
import { n as Moon, r as Locate, t as Sun } from "../../../chunks/sun.js";
import { t as userPrefs } from "../../../chunks/userPrefs.svelte.js";
function sunIcon($$renderer) {
	Sun($$renderer, { size: 16 });
}
function autoIcon($$renderer) {
	Locate($$renderer, { size: 16 });
}
function moonIcon($$renderer) {
	Moon($$renderer, { size: 16 });
}
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		$$renderer$1.push(`<div class="mx-auto max-w-3xl px-4 py-6 space-y-6">`);
		Card($$renderer$1, {
			children: ($$renderer$2) => {
				CardContent($$renderer$2, {
					children: ($$renderer$3) => {
						Stack($$renderer$3, {
							spacing: 1.5,
							children: ($$renderer$4) => {
								Typography($$renderer$4, {
									variant: "h6",
									children: ($$renderer$5) => {
										$$renderer$5.push(`<!---->Theme`);
									},
									$$slots: { default: true }
								});
								$$renderer$4.push(`<!----> `);
								ToggleGroup($$renderer$4, {
									value: userPrefs.theme,
									onchange: (v) => userPrefs.theme = v,
									items: [
										{
											value: "light",
											label: "Light",
											icon: sunIcon
										},
										{
											value: "auto",
											label: "Auto",
											icon: autoIcon
										},
										{
											value: "dark",
											label: "Dark",
											icon: moonIcon
										}
									]
								});
								$$renderer$4.push(`<!----> `);
								Typography($$renderer$4, {
									variant: "caption",
									children: ($$renderer$5) => {
										$$renderer$5.push(`<!---->Auto follows your system preference (changes when iOS toggles dark mode).`);
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
		$$renderer$1.push(`<!----> `);
		Card($$renderer$1, {
			children: ($$renderer$2) => {
				CardContent($$renderer$2, {
					children: ($$renderer$3) => {
						Stack($$renderer$3, {
							spacing: 1.5,
							children: ($$renderer$4) => {
								Typography($$renderer$4, {
									variant: "h6",
									children: ($$renderer$5) => {
										$$renderer$5.push(`<!---->Transit agency`);
									},
									$$slots: { default: true }
								});
								$$renderer$4.push(`<!----> `);
								Typography($$renderer$4, {
									variant: "caption",
									children: ($$renderer$5) => {
										$$renderer$5.push(`<!---->Pick one. The schedule database (~4 MB gzipped) downloads once and is
          cached for offline use. Agencies marked "no data yet" don't have a
          SQLite blob published yet — they will once the <a href="https://github.com/ciotlosm/neary-gtfs" target="_blank" rel="noopener" class="underline">neary-gtfs</a> pipeline grows.`);
									},
									$$slots: { default: true }
								});
								$$renderer$4.push(`<!----> `);
								$$renderer$4.push("<!--[1-->");
								Stack($$renderer$4, {
									direction: "row",
									spacing: 1,
									align: "center",
									children: ($$renderer$5) => {
										Spinner($$renderer$5, { size: 16 });
										$$renderer$5.push(`<!----> `);
										Typography($$renderer$5, {
											variant: "caption",
											children: ($$renderer$6) => {
												$$renderer$6.push(`<!---->Loading agency list…`);
											},
											$$slots: { default: true }
										});
										$$renderer$5.push(`<!---->`);
									},
									$$slots: { default: true }
								});
								$$renderer$4.push(`<!--]--> `);
								if (userPrefs.agencyId != null) {
									$$renderer$4.push("<!--[0-->");
									Stack($$renderer$4, {
										direction: "row",
										justify: "end",
										children: ($$renderer$5) => {
											Button($$renderer$5, {
												size: "small",
												variant: "outlined",
												color: "danger",
												onclick: () => userPrefs.agencyId = null,
												children: ($$renderer$6) => {
													$$renderer$6.push(`<!---->Clear selection`);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});
								} else $$renderer$4.push("<!--[-1-->");
								$$renderer$4.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
		$$renderer$1.push(`<!----> `);
		Card($$renderer$1, {
			children: ($$renderer$2) => {
				CardContent($$renderer$2, {
					children: ($$renderer$3) => {
						Stack($$renderer$3, {
							spacing: 2,
							children: ($$renderer$4) => {
								Typography($$renderer$4, {
									variant: "h6",
									children: ($$renderer$5) => {
										$$renderer$5.push(`<!---->Display`);
									},
									$$slots: { default: true }
								});
								$$renderer$4.push(`<!----> `);
								Stack($$renderer$4, {
									direction: "row",
									align: "center",
									justify: "between",
									children: ($$renderer$5) => {
										Box($$renderer$5, {
											class: "flex-1 min-w-0",
											children: ($$renderer$6) => {
												Typography($$renderer$6, {
													variant: "body2",
													children: ($$renderer$7) => {
														$$renderer$7.push(`<!---->Show "Drop off only" indicators`);
													},
													$$slots: { default: true }
												});
												$$renderer$6.push(`<!----> `);
												Typography($$renderer$6, {
													variant: "caption",
													children: ($$renderer$7) => {
														$$renderer$7.push(`<!---->Flag stations / vehicles that don't pick up passengers.`);
													},
													$$slots: { default: true }
												});
												$$renderer$6.push(`<!---->`);
											},
											$$slots: { default: true }
										});
										$$renderer$5.push(`<!----> `);
										Switch($$renderer$5, {
											checked: userPrefs.showDropOffOnly,
											onchange: (v) => userPrefs.showDropOffOnly = v,
											"aria-label": "Show drop-off-only indicators"
										});
										$$renderer$5.push(`<!---->`);
									},
									$$slots: { default: true }
								});
								$$renderer$4.push(`<!----> `);
								Stack($$renderer$4, {
									direction: "row",
									align: "center",
									justify: "between",
									children: ($$renderer$5) => {
										Box($$renderer$5, {
											class: "flex-1 min-w-0",
											children: ($$renderer$6) => {
												Typography($$renderer$6, {
													variant: "body2",
													children: ($$renderer$7) => {
														$$renderer$7.push(`<!---->Show ghost vehicles`);
													},
													$$slots: { default: true }
												});
												$$renderer$6.push(`<!----> `);
												Typography($$renderer$6, {
													variant: "caption",
													children: ($$renderer$7) => {
														$$renderer$7.push(`<!---->Scheduled runs whose GPS is currently missing.`);
													},
													$$slots: { default: true }
												});
												$$renderer$6.push(`<!---->`);
											},
											$$slots: { default: true }
										});
										$$renderer$5.push(`<!----> `);
										Switch($$renderer$5, {
											checked: userPrefs.showGhostVehicles,
											onchange: (v) => userPrefs.showGhostVehicles = v,
											"aria-label": "Show ghost vehicles"
										});
										$$renderer$5.push(`<!---->`);
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
		$$renderer$1.push(`<!----> `);
		Card($$renderer$1, {
			children: ($$renderer$2) => {
				CardContent($$renderer$2, {
					children: ($$renderer$3) => {
						Stack($$renderer$3, {
							spacing: 1.5,
							children: ($$renderer$4) => {
								Typography($$renderer$4, {
									variant: "h6",
									children: ($$renderer$5) => {
										$$renderer$5.push(`<!---->Live tracking (optional)`);
									},
									$$slots: { default: true }
								});
								$$renderer$4.push(`<!----> `);
								TextField($$renderer$4, {
									label: "Tranzy API key",
									placeholder: "Paste your API key to enable live vehicle tracking",
									value: userPrefs.apiKey ?? "",
									oninput: (e) => userPrefs.apiKey = e.currentTarget.value || null,
									helperText: "Optional — without it, the app runs in schedule-only mode."
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
		$$renderer$1.push(`<!----> `);
		Card($$renderer$1, {
			children: ($$renderer$2) => {
				CardContent($$renderer$2, {
					children: ($$renderer$3) => {
						Stack($$renderer$3, {
							spacing: 1,
							children: ($$renderer$4) => {
								Typography($$renderer$4, {
									variant: "h6",
									children: ($$renderer$5) => {
										$$renderer$5.push(`<!---->Advanced`);
									},
									$$slots: { default: true }
								});
								$$renderer$4.push(`<!----> `);
								Typography($$renderer$4, {
									variant: "caption",
									children: ($$renderer$5) => {
										$$renderer$5.push(`<!---->Storage breakdown, data freshness, force schedule reload, app version,
          and debug toggles live here in a separate view (lands with Phase 7).`);
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
