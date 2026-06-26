var STORAGE_KEY = "neary-user-prefs";
var UserPrefs = class {
	theme = "auto";
	agencyId = null;
	showDropOffOnly = true;
	showGhostVehicles = true;
	apiKey = null;
	constructor() {
		if (typeof localStorage === "undefined") return;
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (!raw) return;
			const o = JSON.parse(raw);
			if (o.theme === "auto" || o.theme === "light" || o.theme === "dark") this.theme = o.theme;
			if (typeof o.agencyId === "number" || o.agencyId === null) this.agencyId = o.agencyId;
			if (typeof o.showDropOffOnly === "boolean") this.showDropOffOnly = o.showDropOffOnly;
			if (typeof o.showGhostVehicles === "boolean") this.showGhostVehicles = o.showGhostVehicles;
			if (typeof o.apiKey === "string" || o.apiKey === null) this.apiKey = o.apiKey;
		} catch {}
	}
	snapshot() {
		return {
			theme: this.theme,
			agencyId: this.agencyId,
			showDropOffOnly: this.showDropOffOnly,
			showGhostVehicles: this.showGhostVehicles,
			apiKey: this.apiKey
		};
	}
};
const userPrefs = new UserPrefs();
export { userPrefs as t };
