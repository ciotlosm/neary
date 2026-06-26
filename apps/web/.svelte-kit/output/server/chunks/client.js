import { B as noop$1, H as run, M as writable, i as tick$1, r as settled, t as index_server_exports } from "./index-server.js";
import { c as validate_depends, d as get_message, f as get_status, l as validate_load_response, m as base64_decode, n as TRAILING_SLASH_PARAM, r as create_remote_key, t as INVALIDATED_PARAM, v as noop } from "./shared.js";
import { t as false_default } from "./false.js";
import { i as version, l as assets, u as base } from "./internal.js";
import { S as compact, f as make_trackable, g as add_data_suffix, h as noop_span, l as decode_params, p as normalize_path, r as validate_page_exports, s as hash, u as decode_pathname } from "./exports.js";
import { HttpError, Redirect, SvelteKitError } from "@sveltejs/kit/internal";
import { try_get_request_store } from "@sveltejs/kit/internal/server";
import * as devalue from "devalue";
var cache = /* @__PURE__ */ new Map();
function initial_fetch(resource, opts) {
	const selector = build_selector(resource, opts);
	const script = document.querySelector(selector);
	if (script?.textContent) {
		script.remove();
		let { body, ...init } = JSON.parse(script.textContent);
		if (script.getAttribute("data-b64") !== null) body = base64_decode(body);
		const ttl = script.getAttribute("data-ttl");
		if (ttl) cache.set(selector, {
			body,
			init,
			ttl: 1e3 * Number(ttl)
		});
		return Promise.resolve(new Response(body, init));
	}
	return window.fetch(resource, opts);
}
function subsequent_fetch(resource, resolved, opts) {
	if (cache.size > 0) {
		const selector = build_selector(resource, opts);
		const cached = cache.get(selector);
		if (cached) {
			if (performance.now() < cached.ttl && [
				"default",
				"force-cache",
				"only-if-cached",
				void 0
			].includes(opts?.cache)) return new Response(cached.body, cached.init);
			cache.delete(selector);
		}
	}
	return window.fetch(resolved, opts);
}
function build_selector(resource, opts) {
	let selector = `script[data-sveltekit-fetched][data-url=${JSON.stringify(resource instanceof Request ? resource.url : resource)}]`;
	if (opts?.headers || opts?.body) {
		const values = [];
		if (opts.headers) values.push([...new Headers(opts.headers)].join(","));
		if (opts.body && (typeof opts.body === "string" || ArrayBuffer.isView(opts.body))) values.push(opts.body);
		selector += `[data-hash="${hash(...values)}"]`;
	}
	return selector;
}
/* @__NO_SIDE_EFFECTS__ */
function get(key, parse$1 = JSON.parse) {
	try {
		return parse$1(sessionStorage[key]);
	} catch {}
}
const STATES_KEY = "sveltekit:states";
const HISTORY_INDEX = "sveltekit:history";
const NAVIGATION_INDEX = "sveltekit:navigation";
const PRELOAD_PRIORITIES = {
	tap: 1,
	hover: 2,
	viewport: 3,
	eager: 4,
	off: -1,
	false: -1
};
const origin = "";
function resolve_url(url) {
	if (url instanceof URL) return url;
	let baseURI = document.baseURI;
	if (!baseURI) {
		const baseTags = document.getElementsByTagName("base");
		baseURI = baseTags.length ? baseTags[0].href : document.URL;
	}
	return new URL(url, baseURI);
}
function scroll_state() {
	return {
		x: pageXOffset,
		y: pageYOffset
	};
}
({ ...PRELOAD_PRIORITIES }), PRELOAD_PRIORITIES.hover;
function notifiable_store(value) {
	const store = writable(value);
	let ready = true;
	function notify() {
		ready = true;
		store.update((val) => val);
	}
	function set(new_value) {
		ready = false;
		store.set(new_value);
	}
	function subscribe(run$1) {
		let old_value;
		return store.subscribe((new_value) => {
			if (old_value === void 0 || ready && new_value !== old_value) run$1(old_value = new_value);
		});
	}
	return {
		notify,
		set,
		subscribe
	};
}
const updated_listener = { v: noop };
function create_updated_store() {
	const { set, subscribe } = writable(false);
	return {
		subscribe,
		check: async () => false
	};
}
function is_external_url(url, base$1, hash_routing) {
	if (url.origin !== origin || !url.pathname.startsWith(base$1)) return true;
	if (hash_routing) return url.pathname !== location.pathname;
	return false;
}
let page;
let navigating;
let updated;
var is_legacy = noop$1.toString().includes("$$") || /function \w+\(\) \{\}/.test(noop$1.toString());
var placeholder_url = "a:";
if (is_legacy) {
	page = {
		data: {},
		form: null,
		error: null,
		params: {},
		route: { id: null },
		state: {},
		status: -1,
		url: new URL(placeholder_url)
	};
	navigating = { current: null };
	updated = { current: false };
} else {
	page = new class Page {
		data = {};
		form = null;
		error = null;
		params = {};
		route = { id: null };
		state = {};
		status = -1;
		url = new URL(placeholder_url);
	}();
	navigating = new class Navigating {
		current = null;
	}();
	updated = new class Updated {
		current = false;
	}();
	updated_listener.v = () => updated.current = true;
}
function update(new_page) {
	Object.assign(page, new_page);
}
async function* read_stream(reader, delimiter) {
	let done = false;
	let buffer = "";
	const decoder = new TextDecoder();
	while (true) {
		let split = buffer.indexOf(delimiter);
		while (split !== -1) {
			yield buffer.slice(0, split);
			buffer = buffer.slice(split + delimiter.length);
			split = buffer.indexOf(delimiter);
		}
		if (done) {
			if (buffer) yield buffer;
			return;
		}
		const chunk = await reader.read();
		done = chunk.done;
		if (chunk.value) buffer += decoder.decode(chunk.value, { stream: true });
		if (done) buffer += decoder.decode();
	}
}
async function* read_ndjson(reader) {
	for await (const block of read_stream(reader, "\n")) {
		const line = block.trim();
		if (line) yield JSON.parse(line);
	}
}
var { onMount, tick } = index_server_exports;
var rendering_error = null;
var scroll_positions = /* @__PURE__ */ get("sveltekit:scroll") ?? {};
var snapshots = /* @__PURE__ */ get("sveltekit:snapshot") ?? {};
const stores = {
	url: /* @__PURE__ */ notifiable_store({}),
	page: /* @__PURE__ */ notifiable_store({}),
	navigating: /* @__PURE__ */ writable(null),
	updated: /* @__PURE__ */ create_updated_store()
};
function update_scroll_positions(index) {
	scroll_positions[index] = scroll_state();
}
function clear_onward_history(current_history_index$1, current_navigation_index$1) {
	let i = current_history_index$1 + 1;
	while (scroll_positions[i]) {
		delete scroll_positions[i];
		i += 1;
	}
	i = current_navigation_index$1 + 1;
	while (snapshots[i]) {
		delete snapshots[i];
		i += 1;
	}
}
function native_navigation(url, replace = false) {
	if (replace) location.replace(url.href);
	else location.href = url.href;
	return new Promise(noop);
}
async function update_service_worker() {
	if ("serviceWorker" in navigator) {
		const registration = await navigator.serviceWorker.getRegistration(base || "/");
		if (registration) await registration.update();
	}
}
var routes;
var default_layout_loader;
var default_error_loader;
var target;
let app;
var invalidated = [];
var components = [];
var load_cache = null;
function discard_load_cache() {
	load_cache?.fork?.then((f) => f?.discard());
	load_cache = null;
	current_a = {
		element: void 0,
		href: void 0
	};
}
var reroute_cache = /* @__PURE__ */ new Map();
var before_navigate_callbacks = /* @__PURE__ */ new Set();
var on_navigate_callbacks = /* @__PURE__ */ new Set();
var after_navigate_callbacks = /* @__PURE__ */ new Set();
var current = {
	branch: [],
	error: null,
	url: null,
	nav: null
};
var hydrated = false;
var started = false;
var autoscroll = true;
var is_navigating = false;
var force_invalidation = false;
var root;
var current_history_index;
var current_navigation_index;
var token;
var preload_tokens = /* @__PURE__ */ new Set();
const query_map = /* @__PURE__ */ new Map();
const live_query_map = /* @__PURE__ */ new Map();
function reset_invalidation() {
	invalidated.length = 0;
	force_invalidation = false;
}
function capture_snapshot(index) {
	if (components.some((c) => c?.snapshot)) snapshots[index] = components.map((c) => c?.snapshot?.capture());
}
function restore_snapshot(index) {
	snapshots[index]?.forEach((value, i) => {
		components[i]?.snapshot?.restore(value);
	});
}
async function _goto(url, options, redirect_count, nav_token) {
	let query_keys;
	let live_query_keys;
	if (options.invalidateAll) discard_load_cache();
	await navigate({
		type: "goto",
		url: resolve_url(url),
		keepfocus: options.keepFocus,
		noscroll: options.noScroll,
		replace_state: options.replaceState,
		state: options.state,
		redirect_count,
		nav_token,
		accept: () => {
			if (options.invalidateAll) {
				force_invalidation = true;
				query_keys = /* @__PURE__ */ new Set();
				for (const [id, entries] of query_map) for (const [payload, entry] of entries) {
					entry.resource?.reset();
					query_keys.add(create_remote_key(id, payload));
				}
				live_query_keys = /* @__PURE__ */ new Set();
				for (const [id, entries] of live_query_map) for (const payload of entries.keys()) live_query_keys.add(create_remote_key(id, payload));
			}
			if (options.invalidate) options.invalidate.forEach(push_invalidated);
		}
	});
	if (options.invalidateAll) tick$1().then(tick$1).then(() => {
		for (const [id, entries] of query_map) for (const [payload, { resource }] of entries) if (query_keys?.has(create_remote_key(id, payload))) resource.start();
		for (const [id, entries] of live_query_map) for (const [payload, { resource }] of entries) if (live_query_keys?.has(create_remote_key(id, payload))) resource.reconnect();
	});
}
async function initialize(result, target$1, hydrate) {
	const nav = {
		params: current.params,
		route: { id: current.route?.id ?? null },
		url: new URL(location.href)
	};
	current = {
		...result.state,
		nav
	};
	update(result.props.page);
	root = new app.root({
		target: target$1,
		props: {
			...result.props,
			stores,
			components
		},
		hydrate,
		sync: false,
		transformError: void 0
	});
	await Promise.resolve();
	if (hydrate) {
		const navigation = {
			from: null,
			to: {
				...nav,
				scroll: scroll_positions[current_history_index] ?? scroll_state()
			},
			willUnload: false,
			type: "enter",
			complete: Promise.resolve()
		};
		after_navigate_callbacks.forEach((fn) => fn(navigation));
	}
	restore_snapshot(current_navigation_index);
	started = true;
}
async function get_navigation_result_from_branch({ url, params, branch, errors, status, error, route, form }) {
	let slash = "never";
	if (base && (url.pathname === base || url.pathname === base + "/")) slash = "always";
	else for (const node of branch) if (node?.slash !== void 0) slash = node.slash;
	url.pathname = normalize_path(url.pathname, slash);
	url.search = url.search;
	const result = {
		type: "loaded",
		state: {
			url,
			params,
			branch,
			error,
			route
		},
		props: {
			constructors: compact(branch).map((branch_node) => branch_node.node.component),
			page: clone_page(page)
		}
	};
	if (form !== void 0) result.props.form = form;
	let data = {};
	let data_changed = !page;
	let p = 0;
	for (let i = 0; i < Math.max(branch.length, current.branch.length); i += 1) {
		const node = branch[i];
		const prev = current.branch[i];
		if (node?.data !== prev?.data) data_changed = true;
		if (!node) continue;
		data = {
			...data,
			...node.data
		};
		if (data_changed) result.props[`data_${p}`] = data;
		p += 1;
	}
	if (!current.url || url.href !== current.url.href || current.error !== error || form !== void 0 && form !== page.form || data_changed) result.props.page = {
		error,
		params,
		route: { id: route?.id ?? null },
		state: {},
		status,
		url: new URL(url),
		form: form ?? null,
		data: data_changed ? data : page.data
	};
	return result;
}
async function load_node({ loader, parent, url, params, route, server_data_node }) {
	let data = null;
	let is_tracking = true;
	const uses = {
		dependencies: /* @__PURE__ */ new Set(),
		params: /* @__PURE__ */ new Set(),
		parent: false,
		route: false,
		url: false,
		search_params: /* @__PURE__ */ new Set()
	};
	const node = await loader();
	if (node.universal?.load) {
		function depends(...deps) {
			for (const dep of deps) {
				const { href } = new URL(dep, url);
				uses.dependencies.add(href);
			}
		}
		const load_input = {
			tracing: {
				enabled: false,
				root: noop_span,
				current: noop_span
			},
			route: new Proxy(route, { get: (target$1, key) => {
				if (is_tracking) uses.route = true;
				return target$1[key];
			} }),
			params: new Proxy(params, { get: (target$1, key) => {
				if (is_tracking) uses.params.add(key);
				return target$1[key];
			} }),
			data: server_data_node?.data ?? null,
			url: make_trackable(url, () => {
				if (is_tracking) uses.url = true;
			}, (param) => {
				if (is_tracking) uses.search_params.add(param);
			}, app.hash),
			async fetch(resource, init) {
				if (resource instanceof Request) init = {
					body: resource.method === "GET" || resource.method === "HEAD" ? void 0 : await resource.blob(),
					cache: resource.cache,
					credentials: resource.credentials,
					headers: [...resource.headers].length > 0 ? resource?.headers : void 0,
					integrity: resource.integrity,
					keepalive: resource.keepalive,
					method: resource.method,
					mode: resource.mode,
					redirect: resource.redirect,
					referrer: resource.referrer,
					referrerPolicy: resource.referrerPolicy,
					signal: resource.signal,
					...init
				};
				const { resolved, promise } = resolve_fetch_url(resource, init, url);
				if (is_tracking) depends(resolved.href);
				return promise;
			},
			setHeaders: noop,
			depends,
			parent() {
				if (is_tracking) uses.parent = true;
				return parent();
			},
			untrack(fn) {
				is_tracking = false;
				try {
					return fn();
				} finally {
					is_tracking = true;
				}
			}
		};
		data = await node.universal.load.call(null, load_input) ?? null;
	}
	return {
		node,
		loader,
		server: server_data_node,
		universal: node.universal?.load ? {
			type: "data",
			data,
			uses
		} : null,
		data: data ?? server_data_node?.data ?? null,
		slash: node.universal?.trailingSlash ?? server_data_node?.slash
	};
}
function resolve_fetch_url(input, init, url) {
	let requested = input instanceof Request ? input.url : input;
	const resolved = new URL(requested, url);
	if (resolved.origin === url.origin) requested = resolved.href.slice(url.origin.length);
	return {
		resolved,
		promise: started ? subsequent_fetch(requested, resolved.href, init) : initial_fetch(requested, init)
	};
}
function has_changed(parent_changed, route_changed, url_changed, search_params_changed, uses, params) {
	if (force_invalidation) return true;
	if (!uses) return false;
	if (uses.parent && parent_changed) return true;
	if (uses.route && route_changed) return true;
	if (uses.url && url_changed) return true;
	for (const tracked_params of uses.search_params) if (search_params_changed.has(tracked_params)) return true;
	for (const param of uses.params) if (params[param] !== current.params[param]) return true;
	for (const href of uses.dependencies) if (invalidated.some((fn) => fn(new URL(href)))) return true;
	return false;
}
function create_data_node(node, previous) {
	if (node?.type === "data") return node;
	if (node?.type === "skip") return previous ?? null;
	return null;
}
function diff_search_params(old_url, new_url) {
	if (!old_url) return new Set(new_url.searchParams.keys());
	const changed = new Set([...old_url.searchParams.keys(), ...new_url.searchParams.keys()]);
	for (const key of changed) {
		const old_values = old_url.searchParams.getAll(key);
		const new_values = new_url.searchParams.getAll(key);
		if (old_values.every((value) => new_values.includes(value)) && new_values.every((value) => old_values.includes(value))) changed.delete(key);
	}
	return changed;
}
function preload_error({ error, url, route, params }) {
	return {
		type: "loaded",
		state: {
			error,
			url,
			route,
			params,
			branch: []
		},
		props: {
			page: clone_page(page),
			constructors: []
		}
	};
}
async function load_route({ id, invalidating, url, params, route, preload }) {
	if (load_cache?.id === id) {
		preload_tokens.delete(load_cache.token);
		return load_cache.promise;
	}
	const { errors, layouts, leaf } = route;
	const loaders = [...layouts, leaf];
	errors.forEach((loader) => loader?.().catch(noop));
	loaders.forEach((loader) => loader?.[1]().catch(noop));
	let server_data = null;
	const url_changed = current.url ? id !== get_page_key(current.url) : false;
	const route_changed = current.route ? route.id !== current.route.id : false;
	const search_params_changed = diff_search_params(current.url, url);
	let parent_invalid = false;
	{
		const invalid_server_nodes = loaders.map((loader, i) => {
			const previous = current.branch[i];
			const invalid = !!loader?.[0] && (previous?.loader !== loader[1] || has_changed(parent_invalid, route_changed, url_changed, search_params_changed, previous.server?.uses, params));
			if (invalid) parent_invalid = true;
			return invalid;
		});
		if (invalid_server_nodes.some(Boolean)) {
			try {
				server_data = await load_data(url, invalid_server_nodes);
			} catch (error) {
				const handled_error = await handle_error(error, {
					url,
					params,
					route: { id }
				});
				if (preload && preload_tokens.has(preload)) return preload_error({
					error: handled_error,
					url,
					params,
					route
				});
				return load_root_error_page({
					status: get_status(error),
					error: handled_error,
					url,
					route
				});
			}
			if (server_data.type === "redirect") return server_data;
		}
	}
	const server_data_nodes = server_data?.nodes;
	let parent_changed = false;
	const branch_promises = loaders.map(async (loader, i) => {
		if (!loader) return;
		const previous = current.branch[i];
		const server_data_node = server_data_nodes?.[i];
		if ((!server_data_node || server_data_node.type === "skip") && loader[1] === previous?.loader && !has_changed(parent_changed, route_changed, url_changed, search_params_changed, previous.universal?.uses, params)) return previous;
		parent_changed = true;
		if (server_data_node?.type === "error") throw server_data_node;
		return load_node({
			loader: loader[1],
			url,
			params,
			route,
			parent: async () => {
				const data = {};
				for (let j = 0; j < i; j += 1) Object.assign(data, (await branch_promises[j])?.data);
				return data;
			},
			server_data_node: create_data_node(server_data_node === void 0 && loader[0] ? { type: "skip" } : server_data_node ?? null, loader[0] ? previous?.server : void 0)
		});
	});
	for (const p of branch_promises) p.catch(noop);
	const branch = [];
	for (let i = 0; i < loaders.length; i += 1) if (loaders[i]) try {
		branch.push(await branch_promises[i]);
	} catch (err) {
		if (err instanceof Redirect) return {
			type: "redirect",
			location: err.location
		};
		if (preload && preload_tokens.has(preload)) return preload_error({
			error: await handle_error(err, {
				params,
				url,
				route: { id: route.id }
			}),
			url,
			params,
			route
		});
		let status = get_status(err);
		let error;
		if (server_data_nodes?.includes(err)) {
			status = err.status ?? status;
			error = err.error;
		} else if (err instanceof HttpError) error = err.body;
		else {
			if (await stores.updated.check()) {
				await update_service_worker();
				return await native_navigation(url);
			}
			error = await handle_error(err, {
				params,
				url,
				route: { id: route.id }
			});
		}
		const error_load = await load_nearest_error_page(i, branch, errors);
		if (error_load) return get_navigation_result_from_branch({
			url,
			params,
			branch: branch.slice(0, error_load.idx).concat(error_load.node),
			errors,
			status,
			error,
			route
		});
		else return await server_fallback(url, { id: route.id }, error, status);
	}
	else branch.push(void 0);
	return get_navigation_result_from_branch({
		url,
		params,
		branch,
		errors,
		status: 200,
		error: null,
		route,
		form: invalidating ? void 0 : null
	});
}
async function load_nearest_error_page(i, branch, errors) {
	while (i--) if (errors[i]) {
		let j = i;
		while (!branch[j]) j -= 1;
		try {
			return {
				idx: j + 1,
				node: {
					node: await errors[i](),
					loader: errors[i],
					data: {},
					server: null,
					universal: null
				}
			};
		} catch {
			continue;
		}
	}
}
async function load_root_error_page({ status, error, url, route }) {
	const params = {};
	let server_data_node = null;
	if (app.server_loads[0] === 0) try {
		const server_data = await load_data(url, [true]);
		if (server_data.type !== "data" || server_data.nodes[0] && server_data.nodes[0].type !== "data") throw 0;
		server_data_node = server_data.nodes[0] ?? null;
	} catch (e) {
		if (!(e instanceof HttpError && e.status === 404) && (url.origin !== origin || url.pathname !== location.pathname || hydrated)) return await native_navigation(url);
	}
	try {
		return get_navigation_result_from_branch({
			url,
			params,
			branch: [await load_node({
				loader: default_layout_loader,
				url,
				params,
				route,
				parent: () => Promise.resolve({}),
				server_data_node: create_data_node(server_data_node)
			}), {
				node: await default_error_loader(),
				loader: default_error_loader,
				universal: null,
				server: null,
				data: null
			}],
			status,
			error,
			errors: [],
			route: null
		});
	} catch (error$1) {
		if (error$1 instanceof Redirect) {
			await _goto(new URL(error$1.location, location.href), {}, 0);
			return;
		}
		const error_template = await app.get_error_template();
		const handled = await handle_error(error$1, {
			url,
			params,
			route
		});
		const html = error_template({
			status,
			message: String(handled?.message ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
		});
		const parsed = new DOMParser().parseFromString(html, "text/html");
		document.documentElement.replaceChild(document.adoptNode(parsed.head), document.head);
		document.documentElement.replaceChild(document.adoptNode(parsed.body), document.body);
		throw error$1;
	}
}
async function get_rerouted_url(url) {
	const href = url.href;
	if (reroute_cache.has(href)) return reroute_cache.get(href);
	let rerouted;
	try {
		const promise = (async () => {
			let rerouted$1 = await app.hooks.reroute({
				url: new URL(url),
				fetch: async (input, init) => {
					return resolve_fetch_url(input, init, url).promise;
				}
			}) ?? url;
			if (typeof rerouted$1 === "string") {
				const tmp = new URL(url);
				if (app.hash) tmp.hash = rerouted$1;
				else tmp.pathname = rerouted$1;
				rerouted$1 = tmp;
			}
			return rerouted$1;
		})();
		reroute_cache.set(href, promise);
		rerouted = await promise;
	} catch (e) {
		reroute_cache.delete(href);
		return;
	}
	return rerouted;
}
async function get_navigation_intent(url, invalidating) {
	if (!url) return;
	if (is_external_url(url, base, app.hash)) return;
	{
		const rerouted = await get_rerouted_url(url);
		if (!rerouted) return;
		const path = get_url_path(rerouted);
		for (const route of routes) {
			const params = route.exec(path);
			if (params) return {
				id: get_page_key(url),
				invalidating,
				route,
				params: decode_params(params),
				url
			};
		}
	}
}
function get_url_path(url) {
	return decode_pathname(app.hash ? url.hash.replace(/^#/, "").replace(/[?#].+/, "") : url.pathname.slice(base.length)) || "/";
}
function get_page_key(url) {
	return (app.hash ? url.hash.replace(/^#/, "") : url.pathname) + url.search;
}
function _before_navigate({ url, type, intent, delta, event, scroll }) {
	let should_block = false;
	const nav = create_navigation(current, intent, url, type, scroll ?? null);
	if (delta !== void 0) nav.navigation.delta = delta;
	if (event !== void 0) nav.navigation.event = event;
	const cancellable = {
		...nav.navigation,
		cancel: () => {
			should_block = true;
			nav.reject(/* @__PURE__ */ new Error("navigation cancelled"));
		}
	};
	if (!is_navigating) before_navigate_callbacks.forEach((fn) => fn(cancellable));
	return should_block ? null : nav;
}
async function navigate({ type, url, popped, keepfocus, noscroll, replace_state, state = {}, redirect_count = 0, nav_token = {}, accept = noop, block = noop, event }) {
	const prev_token = token;
	token = nav_token;
	const intent = await get_navigation_intent(url, false);
	const nav = type === "enter" ? create_navigation(current, intent, url, type) : _before_navigate({
		url,
		type,
		delta: popped?.delta,
		intent,
		scroll: popped?.scroll,
		event
	});
	if (!nav) {
		block();
		if (token === nav_token) token = prev_token;
		return;
	}
	const previous_history_index = current_history_index;
	const previous_navigation_index = current_navigation_index;
	accept();
	is_navigating = true;
	if (started && nav.navigation.type !== "enter") stores.navigating.set(navigating.current = nav.navigation);
	let navigation_result = intent && await load_route(intent);
	if (!navigation_result) if (is_external_url(url, base, app.hash)) return await native_navigation(url, replace_state);
	else navigation_result = await server_fallback(url, { id: null }, await handle_error(new SvelteKitError(404, "Not Found", `Not found: ${url.pathname}`), {
		url,
		params: {},
		route: { id: null }
	}), 404, replace_state);
	url = intent?.url || url;
	if (token !== nav_token) {
		nav.reject(/* @__PURE__ */ new Error("navigation aborted"));
		return;
	}
	if (!navigation_result) return;
	if (navigation_result.type === "redirect") {
		if (redirect_count < 20) {
			await navigate({
				type,
				url: new URL(navigation_result.location, url),
				popped,
				keepfocus,
				noscroll,
				replace_state,
				state,
				redirect_count: redirect_count + 1,
				nav_token
			});
			nav.fulfil(void 0);
			return;
		}
		navigation_result = await load_root_error_page({
			status: 500,
			error: await handle_error(/* @__PURE__ */ new Error("Redirect loop"), {
				url,
				params: {},
				route: { id: null }
			}),
			url,
			route: { id: null }
		});
		if (!navigation_result) return;
	} else if (navigation_result.props.page.status >= 400) {
		if (await stores.updated.check()) {
			await update_service_worker();
			return await native_navigation(url, replace_state);
		}
	}
	reset_invalidation();
	update_scroll_positions(previous_history_index);
	capture_snapshot(previous_navigation_index);
	if (navigation_result.props.page.url.pathname !== url.pathname) url.pathname = navigation_result.props.page.url.pathname;
	state = popped ? popped.state : state;
	if (!popped) {
		const change = replace_state ? 0 : 1;
		const entry = {
			[HISTORY_INDEX]: current_history_index += change,
			[NAVIGATION_INDEX]: current_navigation_index += change,
			[STATES_KEY]: state
		};
		(replace_state ? history.replaceState : history.pushState).call(history, entry, "", url);
		if (!replace_state) clear_onward_history(current_history_index, current_navigation_index);
	}
	const load_cache_fork = intent && load_cache?.id === intent.id ? load_cache.fork : null;
	if (load_cache?.fork && !load_cache_fork) discard_load_cache();
	else {
		load_cache = null;
		current_a = {
			element: void 0,
			href: void 0
		};
	}
	navigation_result.props.page.state = state;
	let commit_promise;
	if (started) {
		const after_navigate = (await Promise.all(Array.from(on_navigate_callbacks, (fn) => fn(nav.navigation)))).filter((value) => typeof value === "function");
		if (after_navigate.length > 0) {
			function cleanup() {
				after_navigate.forEach((fn) => {
					after_navigate_callbacks.delete(fn);
				});
			}
			after_navigate.push(cleanup);
			after_navigate.forEach((fn) => {
				after_navigate_callbacks.add(fn);
			});
		}
		const target$1 = nav.navigation.to;
		current = {
			...navigation_result.state,
			nav: {
				params: target$1.params,
				route: target$1.route,
				url: target$1.url
			}
		};
		if (navigation_result.props.page) navigation_result.props.page.url = url;
		if (!keepfocus && document.activeElement instanceof HTMLElement && document.activeElement !== document.body) document.activeElement.blur();
		const fork = load_cache_fork && await load_cache_fork;
		if (fork) commit_promise = fork.commit();
		else {
			rendering_error = null;
			root.$set(navigation_result.props);
			if (rendering_error) Object.assign(navigation_result.props.page, rendering_error);
			update(navigation_result.props.page);
			commit_promise = settled?.();
		}
	} else await initialize(navigation_result, target, false);
	const { activeElement } = document;
	await commit_promise;
	await tick$1();
	await tick$1();
	if (token !== nav_token) {
		nav.reject(/* @__PURE__ */ new Error("navigation aborted"));
		return;
	}
	if (navigation_result.props.page && rendering_error) Object.assign(navigation_result.props.page, rendering_error);
	let deep_linked = null;
	if (autoscroll) {
		const scroll = popped ? popped.scroll : noscroll ? scroll_state() : null;
		if (scroll) scrollTo(scroll.x, scroll.y);
		else if (deep_linked = url.hash && document.getElementById(get_id(url))) deep_linked.scrollIntoView();
		else scrollTo(0, 0);
	}
	const changed_focus = document.activeElement !== activeElement && document.activeElement !== document.body;
	if (!keepfocus && !changed_focus) reset_focus(url, !deep_linked);
	autoscroll = true;
	is_navigating = false;
	nav.fulfil(void 0);
	if (nav.navigation.to) nav.navigation.to.scroll = scroll_state();
	after_navigate_callbacks.forEach((fn) => fn(nav.navigation));
	if (type === "popstate") restore_snapshot(current_navigation_index);
	stores.navigating.set(navigating.current = null);
}
async function server_fallback(url, route, error, status, replace_state) {
	if (url.origin === origin && url.pathname === location.pathname && !hydrated) return await load_root_error_page({
		status,
		error,
		url,
		route
	});
	return await native_navigation(url, replace_state);
}
var current_a = {
	element: void 0,
	href: void 0
};
function handle_error(error, event) {
	if (error instanceof HttpError) return error.body;
	const status = get_status(error);
	const message = get_message(error);
	return app.hooks.handleError({
		error,
		event,
		status,
		message
	}) ?? { message };
}
function goto(url, opts = {}) {
	throw new Error("Cannot call goto(...) on the server");
}
function push_invalidated(resource) {
	if (typeof resource === "function") invalidated.push(resource);
	else {
		const { href } = new URL(resource, location.href);
		invalidated.push((url) => url.href === href);
	}
}
async function load_data(url, invalid) {
	const data_url = new URL(url);
	data_url.pathname = add_data_suffix(url.pathname);
	if (url.pathname.endsWith("/")) data_url.searchParams.append(TRAILING_SLASH_PARAM, "1");
	data_url.searchParams.append(INVALIDATED_PARAM, invalid.map((i) => i ? "1" : "0").join(""));
	const res = await (0, window.fetch)(data_url.href, {});
	if (!res.ok) {
		let message;
		if (res.headers.get("content-type")?.includes("application/json")) message = await res.json();
		else if (res.status === 404) message = "Not Found";
		else if (res.status === 500) message = "Internal Error";
		throw new HttpError(res.status, message);
	}
	return new Promise((resolve, reject) => {
		process_stream(resolve, res).catch(reject);
	});
}
async function process_stream(resolve, res) {
	const reader = res.body.getReader();
	const deferreds = /* @__PURE__ */ new Map();
	function deserialize(data) {
		return devalue.unflatten(data, {
			...app.decoders,
			Promise: (id) => {
				return new Promise((fulfil, reject) => {
					deferreds.set(id, {
						fulfil,
						reject
					});
				});
			}
		});
	}
	for await (const node of read_ndjson(reader)) {
		if (node.type === "redirect") return resolve(node);
		if (node.type === "data") {
			node.nodes?.forEach((node$1) => {
				if (node$1?.type === "data") {
					node$1.uses = deserialize_uses(node$1.uses);
					node$1.data = deserialize(node$1.data);
				}
			});
			resolve(node);
		} else if (node.type === "chunk") {
			const { id, data, error } = node;
			const deferred = deferreds.get(id);
			deferreds.delete(id);
			if (error) deferred.reject(deserialize(error));
			else deferred.fulfil(deserialize(data));
		}
	}
}
function deserialize_uses(uses) {
	return {
		dependencies: new Set(uses?.dependencies ?? []),
		params: new Set(uses?.params ?? []),
		parent: !!uses?.parent,
		route: !!uses?.route,
		url: !!uses?.url,
		search_params: new Set(uses?.search_params ?? [])
	};
}
function reset_focus(url, scroll = true) {
	const autofocus = document.querySelector("[autofocus]");
	if (autofocus) autofocus.focus();
	else {
		const id = get_id(url);
		if (id && document.getElementById(id)) {
			const { x, y } = scroll_state();
			setTimeout(() => {
				const history_state = history.state;
				location.replace(new URL(`#${id}`, location.href));
				history.replaceState(history_state, "", url);
				if (scroll) scrollTo(x, y);
			});
		} else {
			const root$1 = document.body;
			const tabindex = root$1.getAttribute("tabindex");
			root$1.tabIndex = -1;
			root$1.focus({
				preventScroll: true,
				focusVisible: false
			});
			if (tabindex !== null) root$1.setAttribute("tabindex", tabindex);
			else root$1.removeAttribute("tabindex");
		}
		const selection = getSelection();
		if (selection && selection.type !== "None") {
			const ranges = [];
			for (let i = 0; i < selection.rangeCount; i += 1) ranges.push(selection.getRangeAt(i));
			setTimeout(() => {
				if (selection.rangeCount !== ranges.length) return;
				for (let i = 0; i < selection.rangeCount; i += 1) {
					const a = ranges[i];
					const b = selection.getRangeAt(i);
					if (a.commonAncestorContainer !== b.commonAncestorContainer || a.startContainer !== b.startContainer || a.endContainer !== b.endContainer || a.startOffset !== b.startOffset || a.endOffset !== b.endOffset) return;
				}
				selection.removeAllRanges();
			});
		}
	}
}
function create_navigation(current$1, intent, url, type, target_scroll = null) {
	let fulfil;
	let reject;
	const complete = new Promise((f, r) => {
		fulfil = f;
		reject = r;
	});
	complete.catch(noop);
	return {
		navigation: {
			from: {
				params: current$1.params,
				route: { id: current$1.route?.id ?? null },
				url: current$1.url,
				scroll: scroll_state()
			},
			to: url && {
				params: intent?.params ?? null,
				route: { id: intent?.route?.id ?? null },
				url,
				scroll: target_scroll
			},
			willUnload: !intent,
			type,
			complete
		},
		fulfil,
		reject
	};
}
function clone_page(page$1) {
	return {
		data: page$1.data,
		error: page$1.error,
		form: page$1.form,
		params: page$1.params,
		route: page$1.route,
		state: page$1.state,
		status: page$1.status,
		url: page$1.url
	};
}
function get_id(url) {
	let id;
	if (app.hash) {
		const [, , second] = url.hash.split("#", 3);
		id = second ?? "";
	} else id = url.hash.slice(1);
	return decodeURIComponent(id);
}
export { updated as a, page as i, stores as n, navigating as r, goto as t };
