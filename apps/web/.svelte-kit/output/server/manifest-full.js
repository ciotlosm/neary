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
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js')),
			__memo(() => import('./nodes/6.js')),
			__memo(() => import('./nodes/7.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/data-test",
				pattern: /^\/data-test\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/favorites",
				pattern: /^\/favorites\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/planner",
				pattern: /^\/planner\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/settings",
				pattern: /^\/settings\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/showcase",
				pattern: /^\/showcase\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 7 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
