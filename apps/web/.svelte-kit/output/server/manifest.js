export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["dev-data/agency-2.manifest.json","dev-data/agency-2.sqlite3","dev-data/agency-2.sqlite3.gz","favicon.svg"]),
	mimeTypes: {".json":"application/json",".gz":"application/gzip",".svg":"image/svg+xml"},
	_: {
		client: {start:"_app/immutable/entry/start.CFkI3f08.js",app:"_app/immutable/entry/app.C_r1TqMz.js",imports:["_app/immutable/entry/start.CFkI3f08.js","_app/immutable/chunks/CGYbF6iX.js","_app/immutable/chunks/DqxyGLxc.js","_app/immutable/chunks/C2IYLphb.js","_app/immutable/entry/app.C_r1TqMz.js","_app/immutable/chunks/CGYbF6iX.js","_app/immutable/chunks/C2IYLphb.js","_app/immutable/chunks/C6CJalKn.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js'))
		],
		remotes: {
			
		},
		routes: [
			
		],
		prerendered_routes: new Set(["/","/data-test","/favorites","/planner","/settings","/showcase"]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
