import { B as noop, E as escape_html, _ as sanitize_props, f as ensure_array_like, p as head, v as slot, y as spread_props } from "../../../chunks/index-server.js";
import "../../../chunks/false.js";
import { A as Map_pin, C as Chip, D as Stack, E as Typography, M as Bus, N as Icon, S as Avatar, T as Card, _ as Dialog, a as ListItemText, b as IconButton, c as ToggleGroup, d as TextField, f as Switch, g as DialogTitle, h as DialogContent, i as RouteBadge, k as Refresh_cw, l as Tabs, m as Tooltip, n as StationCard, o as ListItem, p as Collapsible, r as VehicleCard, s as List, u as ProgressBar, v as statusBus, w as CardContent, x as Button, y as Spinner } from "../../../chunks/ui.js";
import { n as Moon, r as Locate, t as Sun } from "../../../chunks/sun.js";
import { t as userPrefs } from "../../../chunks/userPrefs.svelte.js";
function Search($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "search" },
		sanitize_props($$props),
		{
			iconNode: [["path", { "d": "m21 21-4.34-4.34" }], ["circle", {
				"cx": "11",
				"cy": "11",
				"r": "8"
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
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let switchOn = true;
		let collapsibleOpen = false;
		let dialogOpen = false;
		let textValue = "";
		let progressValue = 35;
		let tabsValue = "today";
		const route24 = {
			id: 24,
			shortName: "24",
			color: "#1e88e5"
		};
		const route35 = {
			id: 35,
			shortName: "35",
			color: "#43a047"
		};
		const route9 = {
			id: 9,
			shortName: "9",
			color: "#fdd835"
		};
		const routeM = {
			id: 100,
			shortName: "M5",
			color: "#e53935"
		};
		const demoStation = {
			id: 4012,
			name: "Piața Mihai Viteazul",
			distance: 120,
			lat: 46.7712,
			lon: 23.6236
		};
		const demoVehicles = [
			{
				kind: "live",
				id: "v-live-1",
				route: route24,
				gps: {
					lat: 46.77,
					lon: 23.624,
					observedAt: Date.now() - 8e3
				},
				eta: 3,
				headsign: "Mănăștur"
			},
			{
				kind: "live-matched",
				id: "v-matched-1",
				route: route35,
				gps: {
					lat: 46.7693,
					lon: 23.6219,
					observedAt: Date.now() - 12e3
				},
				schedule: {
					tripId: "t-35-103",
					scheduledDeparture: 867,
					headsign: "Aeroport"
				},
				eta: 8
			},
			{
				kind: "ghost",
				id: "v-ghost-1",
				route: route9,
				schedule: {
					tripId: "t-9-44",
					scheduledDeparture: 872,
					headsign: "Gara Cluj"
				}
			},
			{
				kind: "scheduled",
				id: "v-sched-1",
				route: routeM,
				schedule: {
					tripId: "t-M5-72",
					scheduledDeparture: 885,
					headsign: "Centru"
				}
			}
		];
		let stationExpanded = true;
		let selectedRouteId = null;
		const favorites = new Set([35]);
		function demo(kind) {
			if (kind === "loading") {
				statusBus.push({
					id: `demo-${kind}`,
					kind,
					message: "Loading schedule…"
				});
				setTimeout(() => statusBus.dismiss(`demo-${kind}`), 2500);
				return;
			}
			if (kind === "progress") {
				const id = `demo-${kind}`;
				statusBus.push({
					id,
					kind,
					message: "Downloading agency database",
					progress: 0
				});
				let pct = 0;
				const t = setInterval(() => {
					pct += 13;
					if (pct >= 100) {
						clearInterval(t);
						statusBus.dismiss(id);
					} else statusBus.progress(id, pct);
				}, 200);
				return;
			}
			statusBus.push({
				id: `demo-${kind}-${Date.now()}`,
				kind,
				message: {
					error: "Something went wrong loading vehicles.",
					warning: "Schedule is more than 24h old.",
					success: "Schedule refreshed.",
					info: "Tap a route to see its schedule."
				}[kind]
			});
		}
		let $$settled = true;
		let $$inner_renderer;
		function $$render_inner($$renderer$2) {
			head("1fte3s2", $$renderer$2, ($$renderer$3) => {
				$$renderer$3.title(($$renderer$4) => {
					$$renderer$4.push(`<title>Showcase — neary v2</title>`);
				});
			});
			$$renderer$2.push(`<main class="mx-auto max-w-3xl px-4 py-6 space-y-10"><header>`);
			Typography($$renderer$2, {
				variant: "h2",
				children: ($$renderer$3) => {
					$$renderer$3.push(`<!---->UI primitives`);
				},
				$$slots: { default: true }
			});
			$$renderer$2.push(`<!----> `);
			Typography($$renderer$2, {
				variant: "body2",
				class: "text-[color:var(--color-fg-muted)]",
				children: ($$renderer$3) => {
					$$renderer$3.push(`<!---->Every primitive in <code>$lib/ui</code>, exercised. Header / status bar / bottom nav now
      live in the global layout; theme switching is in <a href="/settings" class="underline">Settings</a>.`);
				},
				$$slots: { default: true }
			});
			$$renderer$2.push(`<!----></header> <section class="space-y-3">`);
			Typography($$renderer$2, {
				variant: "h4",
				children: ($$renderer$3) => {
					$$renderer$3.push(`<!---->StatusBar`);
				},
				$$slots: { default: true }
			});
			$$renderer$2.push(`<!----> `);
			Stack($$renderer$2, {
				direction: "row",
				spacing: 1,
				wrap: true,
				children: ($$renderer$3) => {
					Button($$renderer$3, {
						size: "small",
						color: "primary",
						onclick: () => demo("loading"),
						children: ($$renderer$4) => {
							$$renderer$4.push(`<!---->loading`);
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!----> `);
					Button($$renderer$3, {
						size: "small",
						color: "primary",
						onclick: () => demo("progress"),
						children: ($$renderer$4) => {
							$$renderer$4.push(`<!---->progress`);
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!----> `);
					Button($$renderer$3, {
						size: "small",
						variant: "outlined",
						onclick: () => demo("info"),
						children: ($$renderer$4) => {
							$$renderer$4.push(`<!---->info`);
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!----> `);
					Button($$renderer$3, {
						size: "small",
						variant: "outlined",
						onclick: () => demo("success"),
						children: ($$renderer$4) => {
							$$renderer$4.push(`<!---->success`);
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!----> `);
					Button($$renderer$3, {
						size: "small",
						variant: "outlined",
						color: "danger",
						onclick: () => demo("warning"),
						children: ($$renderer$4) => {
							$$renderer$4.push(`<!---->warning`);
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!----> `);
					Button($$renderer$3, {
						size: "small",
						color: "danger",
						onclick: () => demo("error"),
						children: ($$renderer$4) => {
							$$renderer$4.push(`<!---->error`);
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!----> `);
					Button($$renderer$3, {
						size: "small",
						variant: "text",
						onclick: () => statusBus.clear(),
						children: ($$renderer$4) => {
							$$renderer$4.push(`<!---->clear`);
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!---->`);
				},
				$$slots: { default: true }
			});
			$$renderer$2.push(`<!----></section> <section class="space-y-3">`);
			Typography($$renderer$2, {
				variant: "h4",
				children: ($$renderer$3) => {
					$$renderer$3.push(`<!---->Buttons`);
				},
				$$slots: { default: true }
			});
			$$renderer$2.push(`<!----> `);
			Stack($$renderer$2, {
				direction: "row",
				spacing: 1,
				wrap: true,
				align: "center",
				children: ($$renderer$3) => {
					Button($$renderer$3, {
						children: ($$renderer$4) => {
							$$renderer$4.push(`<!---->Contained`);
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!----> `);
					Button($$renderer$3, {
						variant: "outlined",
						children: ($$renderer$4) => {
							$$renderer$4.push(`<!---->Outlined`);
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!----> `);
					Button($$renderer$3, {
						variant: "text",
						children: ($$renderer$4) => {
							$$renderer$4.push(`<!---->Text`);
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!----> `);
					Button($$renderer$3, {
						color: "danger",
						children: ($$renderer$4) => {
							$$renderer$4.push(`<!---->Danger`);
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!----> `);
					Button($$renderer$3, {
						variant: "outlined",
						color: "danger",
						children: ($$renderer$4) => {
							$$renderer$4.push(`<!---->Outlined danger`);
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!----> `);
					Button($$renderer$3, {
						disabled: true,
						children: ($$renderer$4) => {
							$$renderer$4.push(`<!---->Disabled`);
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!---->`);
				},
				$$slots: { default: true }
			});
			$$renderer$2.push(`<!----> `);
			Stack($$renderer$2, {
				direction: "row",
				spacing: 1,
				wrap: true,
				align: "center",
				children: ($$renderer$3) => {
					Button($$renderer$3, {
						size: "small",
						children: ($$renderer$4) => {
							$$renderer$4.push(`<!---->Small`);
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!----> `);
					Button($$renderer$3, {
						size: "medium",
						children: ($$renderer$4) => {
							$$renderer$4.push(`<!---->Medium`);
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!----> `);
					Button($$renderer$3, {
						size: "large",
						children: ($$renderer$4) => {
							$$renderer$4.push(`<!---->Large`);
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!---->`);
				},
				$$slots: { default: true }
			});
			$$renderer$2.push(`<!----> `);
			{
				function refreshIcon($$renderer$3) {
					Refresh_cw($$renderer$3, { size: 16 });
				}
				Stack($$renderer$2, {
					direction: "row",
					spacing: 1,
					wrap: true,
					align: "center",
					refreshIcon,
					children: ($$renderer$3) => {
						Button($$renderer$3, {
							startIcon: refreshIcon,
							children: ($$renderer$4) => {
								$$renderer$4.push(`<!---->Refresh`);
							},
							$$slots: { default: true }
						});
						$$renderer$3.push(`<!----> `);
						IconButton($$renderer$3, {
							"aria-label": "Search",
							children: ($$renderer$4) => {
								Search($$renderer$4, { size: 20 });
							},
							$$slots: { default: true }
						});
						$$renderer$3.push(`<!----> `);
						IconButton($$renderer$3, {
							color: "primary",
							"aria-label": "Locate",
							children: ($$renderer$4) => {
								Locate($$renderer$4, { size: 20 });
							},
							$$slots: { default: true }
						});
						$$renderer$3.push(`<!---->`);
					},
					$$slots: {
						refreshIcon: true,
						default: true
					}
				});
			}
			$$renderer$2.push(`<!----></section> <section class="space-y-3">`);
			Typography($$renderer$2, {
				variant: "h4",
				children: ($$renderer$3) => {
					$$renderer$3.push(`<!---->Chips`);
				},
				$$slots: { default: true }
			});
			$$renderer$2.push(`<!----> `);
			Stack($$renderer$2, {
				direction: "row",
				spacing: 1,
				wrap: true,
				align: "center",
				children: ($$renderer$3) => {
					Chip($$renderer$3, {
						children: ($$renderer$4) => {
							$$renderer$4.push(`<!---->Default`);
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!----> `);
					Chip($$renderer$3, {
						color: "primary",
						children: ($$renderer$4) => {
							$$renderer$4.push(`<!---->Primary`);
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!----> `);
					Chip($$renderer$3, {
						color: "success",
						children: ($$renderer$4) => {
							$$renderer$4.push(`<!---->Success`);
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!----> `);
					Chip($$renderer$3, {
						color: "warning",
						children: ($$renderer$4) => {
							$$renderer$4.push(`<!---->Warning`);
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!----> `);
					Chip($$renderer$3, {
						color: "danger",
						children: ($$renderer$4) => {
							$$renderer$4.push(`<!---->Danger`);
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!---->`);
				},
				$$slots: { default: true }
			});
			$$renderer$2.push(`<!----> `);
			Stack($$renderer$2, {
				direction: "row",
				spacing: 1,
				wrap: true,
				align: "center",
				children: ($$renderer$3) => {
					Chip($$renderer$3, {
						variant: "outlined",
						children: ($$renderer$4) => {
							$$renderer$4.push(`<!---->Outlined`);
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!----> `);
					Chip($$renderer$3, {
						variant: "outlined",
						color: "primary",
						children: ($$renderer$4) => {
							$$renderer$4.push(`<!---->Primary`);
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!----> `);
					Chip($$renderer$3, {
						variant: "outlined",
						color: "danger",
						children: ($$renderer$4) => {
							$$renderer$4.push(`<!---->Drop off only`);
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!---->`);
				},
				$$slots: { default: true }
			});
			$$renderer$2.push(`<!----> `);
			Stack($$renderer$2, {
				direction: "row",
				spacing: 1,
				wrap: true,
				align: "center",
				children: ($$renderer$3) => {
					Chip($$renderer$3, {
						size: "small",
						children: ($$renderer$4) => {
							$$renderer$4.push(`<!---->small`);
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!----> `);
					Chip($$renderer$3, {
						size: "medium",
						children: ($$renderer$4) => {
							$$renderer$4.push(`<!---->medium`);
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!----> `);
					Chip($$renderer$3, {
						onclick: () => demo("info"),
						children: ($$renderer$4) => {
							$$renderer$4.push(`<!---->clickable`);
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!----> `);
					{
						function icon($$renderer$4) {
							Map_pin($$renderer$4, { size: 12 });
						}
						Chip($$renderer$3, {
							icon,
							children: ($$renderer$4) => {
								$$renderer$4.push(`<!---->120 m`);
							},
							$$slots: {
								icon: true,
								default: true
							}
						});
					}
					$$renderer$3.push(`<!---->`);
				},
				$$slots: { default: true }
			});
			$$renderer$2.push(`<!----></section> <section class="space-y-3">`);
			Typography($$renderer$2, {
				variant: "h4",
				children: ($$renderer$3) => {
					$$renderer$3.push(`<!---->Avatars &amp; Spinner`);
				},
				$$slots: { default: true }
			});
			$$renderer$2.push(`<!----> `);
			Stack($$renderer$2, {
				direction: "row",
				spacing: 1.5,
				align: "center",
				children: ($$renderer$3) => {
					Avatar($$renderer$3, {
						size: 32,
						children: ($$renderer$4) => {
							Bus($$renderer$4, { size: 16 });
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!----> `);
					Avatar($$renderer$3, {
						size: 40,
						children: ($$renderer$4) => {
							Bus($$renderer$4, { size: 20 });
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!----> `);
					Avatar($$renderer$3, {
						size: 48,
						children: ($$renderer$4) => {
							Bus($$renderer$4, { size: 24 });
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!----> `);
					Avatar($$renderer$3, {
						variant: "square",
						class: "w-10 h-10 sm:w-12 sm:h-12",
						children: ($$renderer$4) => {
							Bus($$renderer$4, { size: 20 });
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!----> `);
					Spinner($$renderer$3, { size: 20 });
					$$renderer$3.push(`<!----> `);
					Spinner($$renderer$3, { size: 28 });
					$$renderer$3.push(`<!---->`);
				},
				$$slots: { default: true }
			});
			$$renderer$2.push(`<!----></section> <section class="space-y-1">`);
			Typography($$renderer$2, {
				variant: "h4",
				children: ($$renderer$3) => {
					$$renderer$3.push(`<!---->Typography`);
				},
				$$slots: { default: true }
			});
			$$renderer$2.push(`<!----> `);
			Typography($$renderer$2, {
				variant: "h1",
				children: ($$renderer$3) => {
					$$renderer$3.push(`<!---->Heading 1`);
				},
				$$slots: { default: true }
			});
			$$renderer$2.push(`<!----> `);
			Typography($$renderer$2, {
				variant: "h2",
				children: ($$renderer$3) => {
					$$renderer$3.push(`<!---->Heading 2`);
				},
				$$slots: { default: true }
			});
			$$renderer$2.push(`<!----> `);
			Typography($$renderer$2, {
				variant: "h3",
				children: ($$renderer$3) => {
					$$renderer$3.push(`<!---->Heading 3`);
				},
				$$slots: { default: true }
			});
			$$renderer$2.push(`<!----> `);
			Typography($$renderer$2, {
				variant: "h4",
				children: ($$renderer$3) => {
					$$renderer$3.push(`<!---->Heading 4`);
				},
				$$slots: { default: true }
			});
			$$renderer$2.push(`<!----> `);
			Typography($$renderer$2, {
				variant: "h5",
				children: ($$renderer$3) => {
					$$renderer$3.push(`<!---->Heading 5`);
				},
				$$slots: { default: true }
			});
			$$renderer$2.push(`<!----> `);
			Typography($$renderer$2, {
				variant: "h6",
				children: ($$renderer$3) => {
					$$renderer$3.push(`<!---->Heading 6`);
				},
				$$slots: { default: true }
			});
			$$renderer$2.push(`<!----> `);
			Typography($$renderer$2, {
				variant: "body",
				children: ($$renderer$3) => {
					$$renderer$3.push(`<!---->Body text — used for most regular content.`);
				},
				$$slots: { default: true }
			});
			$$renderer$2.push(`<!----> `);
			Typography($$renderer$2, {
				variant: "body2",
				children: ($$renderer$3) => {
					$$renderer$3.push(`<!---->Body 2 — secondary text.`);
				},
				$$slots: { default: true }
			});
			$$renderer$2.push(`<!----> `);
			Typography($$renderer$2, {
				variant: "caption",
				children: ($$renderer$3) => {
					$$renderer$3.push(`<!---->Caption — small muted text.`);
				},
				$$slots: { default: true }
			});
			$$renderer$2.push(`<!----> `);
			Typography($$renderer$2, {
				variant: "overline",
				children: ($$renderer$3) => {
					$$renderer$3.push(`<!---->Overline label`);
				},
				$$slots: { default: true }
			});
			$$renderer$2.push(`<!----></section> <section class="space-y-4">`);
			Typography($$renderer$2, {
				variant: "h4",
				children: ($$renderer$3) => {
					$$renderer$3.push(`<!---->Form controls`);
				},
				$$slots: { default: true }
			});
			$$renderer$2.push(`<!----> `);
			Stack($$renderer$2, {
				spacing: 2,
				children: ($$renderer$3) => {
					TextField($$renderer$3, {
						label: "API key",
						placeholder: "Optional — for live tracking",
						helperText: "Add in Settings to enable real-time data.",
						get value() {
							return textValue;
						},
						set value($$value) {
							textValue = $$value;
							$$settled = false;
						}
					});
					$$renderer$3.push(`<!----> `);
					TextField($$renderer$3, {
						label: "With error",
						value: "bad-input",
						error: true,
						helperText: "This value is not valid."
					});
					$$renderer$3.push(`<!---->`);
				},
				$$slots: { default: true }
			});
			$$renderer$2.push(`<!----> `);
			Stack($$renderer$2, {
				direction: "row",
				spacing: 2,
				align: "center",
				children: ($$renderer$3) => {
					Switch($$renderer$3, {
						checked: switchOn,
						onchange: (v) => switchOn = v,
						"aria-label": "Toggle ghost vehicles"
					});
					$$renderer$3.push(`<!----> `);
					Typography($$renderer$3, {
						variant: "body2",
						children: ($$renderer$4) => {
							$$renderer$4.push(`<!---->Show ghost vehicles`);
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!---->`);
				},
				$$slots: { default: true }
			});
			$$renderer$2.push(`<!----> `);
			Stack($$renderer$2, {
				spacing: 1,
				children: ($$renderer$3) => {
					Typography($$renderer$3, {
						variant: "body2",
						children: ($$renderer$4) => {
							$$renderer$4.push(`<!---->ProgressBar`);
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!----> `);
					ProgressBar($$renderer$3, { value: progressValue });
					$$renderer$3.push(`<!----> `);
					Stack($$renderer$3, {
						direction: "row",
						spacing: 1,
						align: "center",
						children: ($$renderer$4) => {
							Button($$renderer$4, {
								size: "small",
								variant: "outlined",
								onclick: () => progressValue = Math.max(0, progressValue - 10),
								children: ($$renderer$5) => {
									$$renderer$5.push(`<!---->−10%`);
								},
								$$slots: { default: true }
							});
							$$renderer$4.push(`<!----> `);
							Button($$renderer$4, {
								size: "small",
								variant: "outlined",
								onclick: () => progressValue = Math.min(100, progressValue + 10),
								children: ($$renderer$5) => {
									$$renderer$5.push(`<!---->+10%`);
								},
								$$slots: { default: true }
							});
							$$renderer$4.push(`<!----> `);
							Typography($$renderer$4, {
								variant: "caption",
								children: ($$renderer$5) => {
									$$renderer$5.push(`<!---->${escape_html(progressValue)}%`);
								},
								$$slots: { default: true }
							});
							$$renderer$4.push(`<!---->`);
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!---->`);
				},
				$$slots: { default: true }
			});
			$$renderer$2.push(`<!----></section> <section class="space-y-4">`);
			Typography($$renderer$2, {
				variant: "h4",
				children: ($$renderer$3) => {
					$$renderer$3.push(`<!---->Overlays &amp; motion`);
				},
				$$slots: { default: true }
			});
			$$renderer$2.push(`<!----> `);
			Stack($$renderer$2, {
				direction: "row",
				spacing: 1.5,
				align: "center",
				wrap: true,
				children: ($$renderer$3) => {
					Tooltip($$renderer$3, {
						title: "Hover or focus to see me",
						placement: "top",
						children: ($$renderer$4) => {
							Button($$renderer$4, {
								variant: "outlined",
								size: "small",
								children: ($$renderer$5) => {
									$$renderer$5.push(`<!---->Hover for tooltip`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!----> `);
					Tooltip($$renderer$3, {
						title: "Tooltip on a chip works too",
						placement: "right",
						children: ($$renderer$4) => {
							Chip($$renderer$4, {
								color: "primary",
								children: ($$renderer$5) => {
									$$renderer$5.push(`<!---->Hover me`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!----> `);
					Tooltip($$renderer$3, {
						title: "Bottom tooltip",
						placement: "bottom",
						children: ($$renderer$4) => {
							IconButton($$renderer$4, {
								"aria-label": "Info",
								children: ($$renderer$5) => {
									Search($$renderer$5, { size: 18 });
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!---->`);
				},
				$$slots: { default: true }
			});
			$$renderer$2.push(`<!----> `);
			Stack($$renderer$2, {
				spacing: 1,
				children: ($$renderer$3) => {
					Button($$renderer$3, {
						variant: "outlined",
						size: "small",
						onclick: () => collapsibleOpen = !collapsibleOpen,
						children: ($$renderer$4) => {
							$$renderer$4.push(`<!---->${escape_html(collapsibleOpen ? "Hide" : "Show")} collapsible`);
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!----> `);
					Collapsible($$renderer$3, {
						in: collapsibleOpen,
						children: ($$renderer$4) => {
							Card($$renderer$4, {
								children: ($$renderer$5) => {
									CardContent($$renderer$5, {
										children: ($$renderer$6) => {
											Typography($$renderer$6, {
												variant: "body2",
												children: ($$renderer$7) => {
													$$renderer$7.push(`<!---->Pure CSS grid-template-rows 1fr↔0fr — no JS height measurement,
              interruptible, respects reduced motion.`);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!---->`);
				},
				$$slots: { default: true }
			});
			$$renderer$2.push(`<!----> <div>`);
			Button($$renderer$2, {
				onclick: () => dialogOpen = true,
				children: ($$renderer$3) => {
					$$renderer$3.push(`<!---->Open dialog`);
				},
				$$slots: { default: true }
			});
			$$renderer$2.push(`<!----></div></section> <section class="space-y-4">`);
			Typography($$renderer$2, {
				variant: "h4",
				children: ($$renderer$3) => {
					$$renderer$3.push(`<!---->Selection &amp; lists`);
				},
				$$slots: { default: true }
			});
			$$renderer$2.push(`<!----> `);
			Stack($$renderer$2, {
				spacing: 1,
				children: ($$renderer$3) => {
					Typography($$renderer$3, {
						variant: "body2",
						children: ($$renderer$4) => {
							$$renderer$4.push(`<!---->Tabs`);
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!----> `);
					Tabs($$renderer$3, {
						value: tabsValue,
						onchange: (v) => tabsValue = v,
						items: [
							{
								value: "today",
								label: "Today"
							},
							{
								value: "tomorrow",
								label: "Tomorrow"
							},
							{
								value: "week",
								label: "This week"
							}
						]
					});
					$$renderer$3.push(`<!----> `);
					Typography($$renderer$3, {
						variant: "caption",
						children: ($$renderer$4) => {
							$$renderer$4.push(`<!---->Active: ${escape_html(tabsValue)}`);
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!---->`);
				},
				$$slots: { default: true }
			});
			$$renderer$2.push(`<!----> `);
			{
				function sunIcon($$renderer$3) {
					Sun($$renderer$3, { size: 16 });
				}
				function autoIcon($$renderer$3) {
					Locate($$renderer$3, { size: 16 });
				}
				function moonIcon($$renderer$3) {
					Moon($$renderer$3, { size: 16 });
				}
				Stack($$renderer$2, {
					spacing: 1,
					sunIcon,
					autoIcon,
					moonIcon,
					children: ($$renderer$3) => {
						Typography($$renderer$3, {
							variant: "body2",
							children: ($$renderer$4) => {
								$$renderer$4.push(`<!---->ToggleGroup — bound to userPrefs.theme`);
							},
							$$slots: { default: true }
						});
						$$renderer$3.push(`<!---->  `);
						Stack($$renderer$3, {
							direction: "row",
							spacing: 1,
							align: "center",
							wrap: true,
							children: ($$renderer$4) => {
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
								ToggleGroup($$renderer$4, {
									size: "small",
									value: userPrefs.theme,
									onchange: (v) => userPrefs.theme = v,
									items: [
										{
											value: "light",
											"aria-label": "Light",
											icon: sunIcon
										},
										{
											value: "auto",
											"aria-label": "Auto",
											icon: autoIcon
										},
										{
											value: "dark",
											"aria-label": "Dark",
											icon: moonIcon
										}
									]
								});
								$$renderer$4.push(`<!---->`);
							},
							$$slots: { default: true }
						});
						$$renderer$3.push(`<!---->`);
					},
					$$slots: {
						sunIcon: true,
						autoIcon: true,
						moonIcon: true,
						default: true
					}
				});
			}
			$$renderer$2.push(`<!----> `);
			Stack($$renderer$2, {
				spacing: 1,
				children: ($$renderer$3) => {
					Typography($$renderer$3, {
						variant: "body2",
						children: ($$renderer$4) => {
							$$renderer$4.push(`<!---->List`);
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!----> `);
					Card($$renderer$3, {
						children: ($$renderer$4) => {
							List($$renderer$4, {
								children: ($$renderer$5) => {
									ListItem($$renderer$5, {
										button: true,
										onclick: () => statusBus.push({
											id: "list-1",
											kind: "info",
											message: "Station 1 tapped"
										}),
										children: ($$renderer$6) => {
											Avatar($$renderer$6, {
												variant: "square",
												size: 36,
												children: ($$renderer$7) => {
													Bus($$renderer$7, { size: 18 });
												},
												$$slots: { default: true }
											});
											$$renderer$6.push(`<!----> `);
											ListItemText($$renderer$6, {
												primary: "Piața Mihai Viteazul",
												secondary: "120 m · 6 routes"
											});
											$$renderer$6.push(`<!----> `);
											Chip($$renderer$6, {
												size: "small",
												color: "success",
												children: ($$renderer$7) => {
													$$renderer$7.push(`<!---->Live`);
												},
												$$slots: { default: true }
											});
											$$renderer$6.push(`<!---->`);
										},
										$$slots: { default: true }
									});
									$$renderer$5.push(`<!----> `);
									ListItem($$renderer$5, {
										button: true,
										onclick: () => statusBus.push({
											id: "list-2",
											kind: "info",
											message: "Station 2 tapped"
										}),
										children: ($$renderer$6) => {
											Avatar($$renderer$6, {
												variant: "square",
												size: 36,
												children: ($$renderer$7) => {
													Bus($$renderer$7, { size: 18 });
												},
												$$slots: { default: true }
											});
											$$renderer$6.push(`<!----> `);
											ListItemText($$renderer$6, {
												primary: "Cluj Arena",
												secondary: "340 m · 4 routes"
											});
											$$renderer$6.push(`<!----> `);
											Chip($$renderer$6, {
												size: "small",
												color: "warning",
												variant: "outlined",
												children: ($$renderer$7) => {
													$$renderer$7.push(`<!---->Schedule`);
												},
												$$slots: { default: true }
											});
											$$renderer$6.push(`<!---->`);
										},
										$$slots: { default: true }
									});
									$$renderer$5.push(`<!----> `);
									ListItem($$renderer$5, {
										children: ($$renderer$6) => {
											Avatar($$renderer$6, {
												variant: "square",
												size: 36,
												children: ($$renderer$7) => {
													Bus($$renderer$7, { size: 18 });
												},
												$$slots: { default: true }
											});
											$$renderer$6.push(`<!----> `);
											ListItemText($$renderer$6, {
												primary: "Gara Cluj",
												secondary: "1.2 km · 8 routes (read-only row)"
											});
											$$renderer$6.push(`<!---->`);
										},
										$$slots: { default: true }
									});
									$$renderer$5.push(`<!---->`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!---->`);
				},
				$$slots: { default: true }
			});
			$$renderer$2.push(`<!----></section> <section class="space-y-4">`);
			Typography($$renderer$2, {
				variant: "h4",
				children: ($$renderer$3) => {
					$$renderer$3.push(`<!---->Composite primitives`);
				},
				$$slots: { default: true }
			});
			$$renderer$2.push(`<!----> `);
			Stack($$renderer$2, {
				spacing: 1,
				children: ($$renderer$3) => {
					Typography($$renderer$3, {
						variant: "body2",
						children: ($$renderer$4) => {
							$$renderer$4.push(`<!---->RouteBadge`);
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!----> `);
					Stack($$renderer$3, {
						direction: "row",
						spacing: 1,
						align: "center",
						wrap: true,
						children: ($$renderer$4) => {
							RouteBadge($$renderer$4, {
								route: route24,
								size: "small"
							});
							$$renderer$4.push(`<!----> `);
							RouteBadge($$renderer$4, {
								route: route24,
								size: "medium"
							});
							$$renderer$4.push(`<!----> `);
							RouteBadge($$renderer$4, {
								route: route24,
								size: "large"
							});
							$$renderer$4.push(`<!---->`);
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!----> `);
					Stack($$renderer$3, {
						direction: "row",
						spacing: 1,
						align: "center",
						wrap: true,
						children: ($$renderer$4) => {
							RouteBadge($$renderer$4, {
								route: route24,
								isStart: true
							});
							$$renderer$4.push(`<!----> `);
							RouteBadge($$renderer$4, {
								route: route24,
								isEnd: true
							});
							$$renderer$4.push(`<!----> `);
							RouteBadge($$renderer$4, {
								route: route24,
								isStart: true,
								isEnd: true,
								"aria-label": "Turnaround route 24"
							});
							$$renderer$4.push(`<!----> `);
							RouteBadge($$renderer$4, {
								route: route9,
								isFavorite: true
							});
							$$renderer$4.push(`<!----> `);
							RouteBadge($$renderer$4, {
								route: route35,
								selected: true,
								onclick: () => statusBus.push({
									id: "rb-click",
									kind: "info",
									message: "Route 35 clicked"
								})
							});
							$$renderer$4.push(`<!----> `);
							RouteBadge($$renderer$4, { route: routeM });
							$$renderer$4.push(`<!---->`);
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!---->`);
				},
				$$slots: { default: true }
			});
			$$renderer$2.push(`<!----> `);
			Stack($$renderer$2, {
				spacing: 1,
				children: ($$renderer$3) => {
					Typography($$renderer$3, {
						variant: "body2",
						children: ($$renderer$4) => {
							$$renderer$4.push(`<!---->VehicleCard — one of each kind`);
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!----> `);
					Stack($$renderer$3, {
						spacing: .5,
						children: ($$renderer$4) => {
							$$renderer$4.push(`<!--[-->`);
							const each_array = ensure_array_like(demoVehicles);
							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let v = each_array[$$index];
								VehicleCard($$renderer$4, { vehicle: v });
							}
							$$renderer$4.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!---->`);
				},
				$$slots: { default: true }
			});
			$$renderer$2.push(`<!----> `);
			Stack($$renderer$2, {
				spacing: 1,
				children: ($$renderer$3) => {
					Typography($$renderer$3, {
						variant: "body2",
						children: ($$renderer$4) => {
							$$renderer$4.push(`<!---->StationCard`);
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!----> `);
					StationCard($$renderer$3, {
						station: demoStation,
						routes: [
							route24,
							route35,
							route9,
							routeM
						],
						vehicles: demoVehicles,
						expanded: stationExpanded,
						ontoggle: () => stationExpanded = !stationExpanded,
						dropOffOnly: false,
						selectedRouteId,
						onRouteClick: (id) => selectedRouteId = selectedRouteId === id ? null : id,
						favoriteRouteIds: favorites
					});
					$$renderer$3.push(`<!---->`);
				},
				$$slots: { default: true }
			});
			$$renderer$2.push(`<!----></section></main> `);
			Dialog($$renderer$2, {
				open: dialogOpen,
				onclose: () => dialogOpen = false,
				maxWidth: "sm",
				children: ($$renderer$3) => {
					DialogTitle($$renderer$3, {
						onclose: () => dialogOpen = false,
						children: ($$renderer$4) => {
							$$renderer$4.push(`<!---->Dialog title`);
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!----> `);
					DialogContent($$renderer$3, {
						children: ($$renderer$4) => {
							Stack($$renderer$4, {
								spacing: 2,
								children: ($$renderer$5) => {
									Typography($$renderer$5, {
										variant: "body2",
										children: ($$renderer$6) => {
											$$renderer$6.push(`<!---->bits-ui handles the focus trap, the Escape key, the overlay click, and scroll
        locking on the body. Styling and copy are ours.`);
										},
										$$slots: { default: true }
									});
									$$renderer$5.push(`<!----> `);
									Stack($$renderer$5, {
										direction: "row",
										spacing: 1,
										justify: "end",
										children: ($$renderer$6) => {
											Button($$renderer$6, {
												variant: "text",
												onclick: () => dialogOpen = false,
												children: ($$renderer$7) => {
													$$renderer$7.push(`<!---->Cancel`);
												},
												$$slots: { default: true }
											});
											$$renderer$6.push(`<!----> `);
											Button($$renderer$6, {
												onclick: () => dialogOpen = false,
												children: ($$renderer$7) => {
													$$renderer$7.push(`<!---->Confirm`);
												},
												$$slots: { default: true }
											});
											$$renderer$6.push(`<!---->`);
										},
										$$slots: { default: true }
									});
									$$renderer$5.push(`<!---->`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
					$$renderer$3.push(`<!---->`);
				},
				$$slots: { default: true }
			});
			$$renderer$2.push(`<!---->`);
		}
		do {
			$$settled = true;
			$$inner_renderer = $$renderer$1.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);
		$$renderer$1.subsume($$inner_renderer);
	});
}
export { _page as default };
