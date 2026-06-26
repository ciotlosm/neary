import { u as derived } from "../../chunks/index-server.js";
import "../../chunks/shared.js";
import "../../chunks/false.js";
import "../../chunks/internal.js";
import "../../chunks/exports.js";
import "../../chunks/internal2.js";
import { t as goto } from "../../chunks/client.js";
import { n as Settings, t as locationStore } from "../../chunks/locationStore.svelte.js";
import { t as page } from "../../chunks/state.js";
import { A as Map_pin, j as Heart, t as AppLayout } from "../../chunks/ui.js";
import { t as House } from "../../chunks/house.js";
import { t as userPrefs } from "../../chunks/userPrefs.svelte.js";
import "../../chunks/repo.js";
var ConnectionStore = class {
	online = typeof navigator !== "undefined" ? navigator.onLine : true;
	constructor() {
		if (typeof window === "undefined") return;
		window.addEventListener("online", () => this.online = true);
		window.addEventListener("offline", () => this.online = false);
	}
};
const connectionStore = new ConnectionStore();
function stationsIcon($$renderer) {
	Map_pin($$renderer, { size: 20 });
}
function favoritesIcon($$renderer) {
	Heart($$renderer, { size: 20 });
}
function plannerIcon($$renderer) {
	House($$renderer, { size: 20 });
}
function settingsIcon($$renderer) {
	Settings($$renderer, { size: 20 });
}
function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { children } = $$props;
		const NAV_ITEMS = [
			{
				value: "/",
				label: "Stations",
				icon: stationsIcon
			},
			{
				value: "/favorites",
				label: "Favorites",
				icon: favoritesIcon
			},
			{
				value: "/planner",
				label: "Planner",
				icon: plannerIcon
			},
			{
				value: "/settings",
				label: "Settings",
				icon: settingsIcon
			}
		];
		const TITLES = {
			"/": "Stations",
			"/favorites": "Favorites",
			"/planner": "Planner",
			"/settings": "Settings"
		};
		const activeNav = derived(() => NAV_ITEMS.find((n) => page.url.pathname === n.value)?.value ?? "/");
		const title = derived(() => TITLES[activeNav()]);
		const health = derived(() => ({
			gps: {
				state: locationStore.freshness,
				tooltip: locationStore.tooltip
			},
			connection: {
				state: connectionStore.online ? "ok" : "error",
				tooltip: connectionStore.online ? "Online" : "Offline"
			},
			schedule: {
				state: userPrefs.agencyId == null ? "idle" : "ok",
				tooltip: userPrefs.agencyId == null ? "No agency selected" : "Schedule loaded"
			},
			live: {
				state: "idle",
				tooltip: userPrefs.apiKey ? "API key present — live worker activates in Phase 5" : "Live tracking disabled (add API key in Settings)"
			}
		}));
		AppLayout($$renderer$1, {
			title: title(),
			health: health(),
			navItems: NAV_ITEMS,
			activeNav: activeNav(),
			onnav: (to) => goto(to),
			children: ($$renderer$2) => {
				children($$renderer$2);
				$$renderer$2.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	});
}
export { _layout as default };
