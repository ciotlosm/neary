let base = "";
let assets = base;
const app_dir = "_app";
const relative = true;
var initial = {
	base,
	assets
};
initial.base;
function override(paths) {
	base = paths.base;
	assets = paths.assets;
}
function reset() {
	base = initial.base;
	assets = initial.assets;
}
function set_assets(path) {
	assets = initial.assets = path;
}
let public_env = {};
function set_private_env(environment) {}
function set_public_env(environment) {
	public_env = environment;
}
const version = "1782432031014";
let prerendering = false;
function set_building() {}
function set_prerendering() {
	prerendering = true;
}
export { public_env as a, app_dir as c, override as d, relative as f, version as i, assets as l, set_assets as m, set_building as n, set_private_env as o, reset as p, set_prerendering as r, set_public_env as s, prerendering as t, base as u };
