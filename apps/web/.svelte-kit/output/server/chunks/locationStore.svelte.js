import { _ as sanitize_props, v as slot, y as spread_props } from "./index-server.js";
import { N as Icon } from "./ui.js";
function Settings($$renderer, $$props) {
	Icon($$renderer, spread_props([
		{ name: "settings" },
		sanitize_props($$props),
		{
			iconNode: [["path", { "d": "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" }], ["circle", {
				"cx": "12",
				"cy": "12",
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
var LocationStore = class {
	position = null;
	error = null;
	permission = "unknown";
	lastUpdated = null;
	now = typeof Date === "undefined" ? 0 : Date.now();
	watchId = null;
	tickerId = null;
	constructor() {
		if (typeof navigator === "undefined" || !("permissions" in navigator)) return;
		navigator.permissions.query({ name: "geolocation" }).then((status) => {
			this.permission = status.state;
			status.addEventListener("change", () => {
				this.permission = status.state;
			});
		}).catch(() => {});
	}
	start() {
		if (typeof navigator === "undefined" || !("geolocation" in navigator)) return false;
		if (this.watchId !== null) return true;
		this.watchId = navigator.geolocation.watchPosition((pos) => {
			this.position = pos;
			this.lastUpdated = Date.now();
			this.error = null;
		}, (err) => {
			this.error = err;
			if (err.code === err.PERMISSION_DENIED) this.permission = "denied";
		}, {
			enableHighAccuracy: false,
			timeout: 1e4,
			maximumAge: 3e4
		});
		if (this.tickerId === null && typeof setInterval !== "undefined") this.tickerId = setInterval(() => this.now = Date.now(), 15e3);
		return true;
	}
	stop() {
		if (this.watchId !== null && typeof navigator !== "undefined") {
			navigator.geolocation.clearWatch(this.watchId);
			this.watchId = null;
		}
		if (this.tickerId !== null) {
			clearInterval(this.tickerId);
			this.tickerId = null;
		}
	}
	get freshness() {
		if (this.permission === "denied") return "error";
		if (this.error && !this.position) return "error";
		if (!this.lastUpdated) return "idle";
		const age = this.now - this.lastUpdated;
		if (age < 6e4) return "ok";
		if (age < 5 * 6e4) return "stale";
		return "error";
	}
	get tooltip() {
		if (this.permission === "denied") return "Location permission denied";
		if (this.error && !this.position) return `GPS error: ${this.error.message}`;
		if (!this.lastUpdated) return "Waiting for first GPS fix…";
		const ageSec = Math.round((this.now - this.lastUpdated) / 1e3);
		if (ageSec < 60) return `GPS fresh (${ageSec}s ago)`;
		return `GPS last fix ${Math.round(ageSec / 60)} min ago`;
	}
};
const locationStore = new LocationStore();
export { Settings as n, locationStore as t };
