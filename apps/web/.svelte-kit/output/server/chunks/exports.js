import { t as false_default } from "./false.js";
function compact(arr) {
	return arr.filter((val) => val != null);
}
var DATA_SUFFIX = "/__data.json";
var HTML_DATA_SUFFIX = ".html__data.json";
function has_data_suffix(pathname) {
	return pathname.endsWith(DATA_SUFFIX) || pathname.endsWith(HTML_DATA_SUFFIX);
}
function add_data_suffix(pathname) {
	if (pathname.endsWith(".html")) return pathname.replace(/\.html$/, HTML_DATA_SUFFIX);
	return pathname.replace(/\/$/, "") + DATA_SUFFIX;
}
function strip_data_suffix(pathname) {
	if (pathname.endsWith(HTML_DATA_SUFFIX)) return pathname.slice(0, -16) + ".html";
	return pathname.slice(0, -12);
}
var ROUTE_SUFFIX = "/__route.js";
function has_resolution_suffix(pathname) {
	return pathname.endsWith(ROUTE_SUFFIX);
}
function add_resolution_suffix(pathname) {
	return pathname.replace(/\/$/, "") + ROUTE_SUFFIX;
}
function strip_resolution_suffix(pathname) {
	return pathname.slice(0, -11);
}
const noop_span = {
	spanContext() {
		return noop_span_context;
	},
	setAttribute() {
		return this;
	},
	setAttributes() {
		return this;
	},
	addEvent() {
		return this;
	},
	setStatus() {
		return this;
	},
	updateName() {
		return this;
	},
	end() {
		return this;
	},
	isRecording() {
		return false;
	},
	recordException() {
		return this;
	},
	addLink() {
		return this;
	},
	addLinks() {
		return this;
	}
};
var noop_span_context = {
	traceId: "",
	spanId: "",
	traceFlags: 0
};
const SCHEME = /^[a-z][a-z\d+\-.]+:/i;
var internal = new URL("sveltekit-internal://");
function resolve(base, path) {
	if (path[0] === "/" && path[1] === "/") return path;
	let url = new URL(base, internal);
	url = new URL(path, url);
	return url.protocol === internal.protocol ? url.pathname + url.search + url.hash : url.href;
}
function normalize_path(path, trailing_slash) {
	if (path === "/" || trailing_slash === "ignore") return path;
	if (trailing_slash === "never") return path.endsWith("/") ? path.slice(0, -1) : path;
	else if (trailing_slash === "always" && !path.endsWith("/")) return path + "/";
	return path;
}
function decode_pathname(pathname) {
	return pathname.split("%25").map(decodeURI).join("%25");
}
function decode_params(params) {
	for (const key in params) params[key] = decodeURIComponent(params[key]);
	return params;
}
function make_trackable(url, callback, search_params_callback, allow_hash = false) {
	const tracked = new URL(url);
	Object.defineProperty(tracked, "searchParams", {
		value: new Proxy(tracked.searchParams, { get(obj, key) {
			if (key === "get" || key === "getAll" || key === "has") return (param, ...rest) => {
				search_params_callback(param);
				return obj[key](param, ...rest);
			};
			callback();
			const value = Reflect.get(obj, key);
			return typeof value === "function" ? value.bind(obj) : value;
		} }),
		enumerable: true,
		configurable: true
	});
	const tracked_url_properties = [
		"href",
		"pathname",
		"search",
		"toString",
		"toJSON"
	];
	if (allow_hash) tracked_url_properties.push("hash");
	for (const property of tracked_url_properties) Object.defineProperty(tracked, property, {
		get() {
			callback();
			return url[property];
		},
		enumerable: true,
		configurable: true
	});
	tracked[Symbol.for("nodejs.util.inspect.custom")] = (_depth, opts, inspect) => {
		return inspect(url, opts);
	};
	tracked.searchParams[Symbol.for("nodejs.util.inspect.custom")] = (_depth, opts, inspect) => {
		return inspect(url.searchParams, opts);
	};
	if (!allow_hash) disable_hash(tracked);
	return tracked;
}
function disable_hash(url) {
	allow_nodejs_console_log(url);
	Object.defineProperty(url, "hash", { get() {
		throw new Error("Cannot access event.url.hash. Consider using `page.url.hash` inside a component instead");
	} });
}
function disable_search(url) {
	allow_nodejs_console_log(url);
	for (const property of ["search", "searchParams"]) Object.defineProperty(url, property, { get() {
		throw new Error(`Cannot access url.${property} on a page with prerendering enabled`);
	} });
}
function allow_nodejs_console_log(url) {
	url[Symbol.for("nodejs.util.inspect.custom")] = (_depth, opts, inspect) => {
		return inspect(new URL(url), opts);
	};
}
function hash(...values) {
	let hash$1 = 5381;
	for (const value of values) if (typeof value === "string") {
		let i = value.length;
		while (i) hash$1 = hash$1 * 33 ^ value.charCodeAt(--i);
	} else if (ArrayBuffer.isView(value)) {
		const buffer = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
		let i = buffer.length;
		while (i) hash$1 = hash$1 * 33 ^ buffer[--i];
	} else throw new TypeError("value must be a string or TypedArray");
	return (hash$1 >>> 0).toString(36);
}
function exec(match, params, matchers) {
	const result = {};
	const values = match.slice(1);
	const values_needing_match = values.filter((value) => value !== void 0);
	let buffered = 0;
	for (let i = 0; i < params.length; i += 1) {
		const param = params[i];
		let value = values[i - buffered];
		if (param.chained && param.rest && buffered) {
			value = values.slice(i - buffered, i + 1).filter((s) => s).join("/");
			buffered = 0;
		}
		if (value === void 0) if (param.rest) value = "";
		else continue;
		if (!param.matcher || matchers[param.matcher](value)) {
			result[param.name] = value;
			const next_param = params[i + 1];
			const next_value = values[i + 1];
			if (next_param && !next_param.rest && next_param.optional && next_value && param.chained) buffered = 0;
			if (!next_param && !next_value && Object.keys(result).length === values_needing_match.length) buffered = 0;
			continue;
		}
		if (param.optional && param.chained) {
			buffered++;
			continue;
		}
		return;
	}
	if (buffered) return;
	return result;
}
function find_route(path, routes, matchers) {
	for (const route of routes) {
		const match = route.pattern.exec(path);
		if (!match) continue;
		const matched = exec(match, route.params, matchers);
		if (matched) return {
			route,
			params: decode_params(matched)
		};
	}
	return null;
}
function validator(expected) {
	function validate(module, file) {
		if (!module) return;
		for (const key in module) {
			if (key[0] === "_" || expected.has(key)) continue;
			const values = [...expected.values()];
			const hint = hint_for_supported_files(key, file?.slice(file.lastIndexOf("."))) ?? `valid exports are ${values.join(", ")}, or anything with a '_' prefix`;
			throw new Error(`Invalid export '${key}'${file ? ` in ${file}` : ""} (${hint})`);
		}
	}
	return validate;
}
function hint_for_supported_files(key, ext = ".js") {
	const supported_files = [];
	if (valid_layout_exports.has(key)) supported_files.push(`+layout${ext}`);
	if (valid_page_exports.has(key)) supported_files.push(`+page${ext}`);
	if (valid_layout_server_exports.has(key)) supported_files.push(`+layout.server${ext}`);
	if (valid_page_server_exports.has(key)) supported_files.push(`+page.server${ext}`);
	if (valid_server_exports.has(key)) supported_files.push(`+server${ext}`);
	if (supported_files.length > 0) return `'${key}' is a valid export in ${supported_files.slice(0, -1).join(", ")}${supported_files.length > 1 ? " or " : ""}${supported_files.at(-1)}`;
}
var valid_layout_exports = new Set([
	"load",
	"prerender",
	"csr",
	"ssr",
	"trailingSlash",
	"config"
]);
var valid_page_exports = new Set([...valid_layout_exports, "entries"]);
var valid_layout_server_exports = new Set([...valid_layout_exports]);
var valid_page_server_exports = new Set([
	...valid_layout_server_exports,
	"actions",
	"entries"
]);
var valid_server_exports = new Set([
	"GET",
	"POST",
	"PATCH",
	"PUT",
	"DELETE",
	"OPTIONS",
	"HEAD",
	"fallback",
	"prerender",
	"trailingSlash",
	"config",
	"entries"
]);
const validate_layout_exports = validator(valid_layout_exports);
const validate_page_exports = validator(valid_page_exports);
const validate_layout_server_exports = validator(valid_layout_server_exports);
const validate_page_server_exports = validator(valid_page_server_exports);
const validate_server_exports = validator(valid_server_exports);
export { compact as S, add_resolution_suffix as _, validate_server_exports as a, strip_data_suffix as b, SCHEME as c, disable_search as d, make_trackable as f, add_data_suffix as g, noop_span as h, validate_page_server_exports as i, decode_params as l, resolve as m, validate_layout_server_exports as n, find_route as o, normalize_path as p, validate_page_exports as r, hash as s, validate_layout_exports as t, decode_pathname as u, has_data_suffix as v, strip_resolution_suffix as x, has_resolution_suffix as y };
