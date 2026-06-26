import { t as false_default } from "./false.js";
import { HttpError, SvelteKitError } from "@sveltejs/kit/internal";
import * as devalue from "devalue";
function noop() {}
function once(fn) {
	let done = false;
	let result;
	return () => {
		if (done) return result;
		done = true;
		return result = fn();
	};
}
const text_encoder = new TextEncoder();
function get_relative_path(from, to) {
	const from_parts = from.split(/[/\\]/);
	const to_parts = to.split(/[/\\]/);
	from_parts.pop();
	while (from_parts[0] === to_parts[0]) {
		from_parts.shift();
		to_parts.shift();
	}
	let i = from_parts.length;
	while (i--) from_parts[i] = "..";
	return from_parts.concat(to_parts).join("/");
}
function base64_encode(bytes) {
	if (globalThis.Buffer) return globalThis.Buffer.from(bytes).toString("base64");
	let binary = "";
	for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
	return btoa(binary);
}
function base64_decode(encoded) {
	if (globalThis.Buffer) {
		const buffer = globalThis.Buffer.from(encoded, "base64");
		return new Uint8Array(buffer);
	}
	const binary = atob(encoded);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return bytes;
}
function coalesce_to_error(err) {
	return err instanceof Error || err && err.name && err.message ? err : new Error(JSON.stringify(err));
}
function normalize_error(error) {
	return error;
}
function get_status(error) {
	return error instanceof HttpError || error instanceof SvelteKitError ? error.status : 500;
}
function get_message(error) {
	return error instanceof SvelteKitError ? error.text : "Internal Error";
}
function validate_depends(route_id, dep) {
	const match = /^(moz-icon|view-source|jar):/.exec(dep);
	if (match) console.warn(`${route_id}: Calling \`depends('${dep}')\` will throw an error in Firefox because \`${match[1]}\` is a special URI scheme`);
}
const INVALIDATED_PARAM = "x-sveltekit-invalidated";
const TRAILING_SLASH_PARAM = "x-sveltekit-trailing-slash";
function validate_load_response(data, location_description) {
	if (data != null && Object.getPrototypeOf(data) !== Object.prototype) throw new Error(`a load function ${location_description} returned ${typeof data !== "object" ? `a ${typeof data}` : data instanceof Response ? "a Response object" : Array.isArray(data) ? "an array" : "a non-plain object"}, but must return a plain object at the top level (i.e. \`return {...}\`)`);
}
function stringify(data, transport) {
	const encoders = Object.fromEntries(Object.entries(transport).map(([k, v]) => [k, v.encode]));
	return devalue.stringify(data, encoders);
}
var object_proto_names = /* @__PURE__ */ Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function is_plain_object(thing) {
	if (typeof thing !== "object" || thing === null) return false;
	const proto = Object.getPrototypeOf(thing);
	return proto === Object.prototype || proto === null || Object.getPrototypeOf(proto) === null || Object.getOwnPropertyNames(proto).sort().join("\0") === object_proto_names;
}
function to_sorted(value, clones) {
	const clone = Object.getPrototypeOf(value) === null ? Object.create(null) : {};
	clones.set(value, clone);
	Object.defineProperty(clone, remote_arg_marker, { value: true });
	for (const key of Object.keys(value).sort()) {
		const property = value[key];
		Object.defineProperty(clone, key, {
			value: clones.get(property) ?? property,
			enumerable: true,
			configurable: true,
			writable: true
		});
	}
	return clone;
}
var remote_object = "__skrao";
var remote_map = "__skram";
var remote_set = "__skras";
var remote_file = "__skraf";
var remote_regex_guard = "__skrag";
var remote_arg_marker = Symbol(remote_object);
function create_remote_arg_reducers(transport, sort, remote_arg_clones) {
	const remote_fns_reducers = { [remote_regex_guard]: (value) => {
		if (value instanceof RegExp) throw new Error("Regular expressions are not valid remote function arguments");
	} };
	if (sort) {
		remote_fns_reducers[remote_map] = (value) => {
			if (!(value instanceof Map)) return;
			const entries = [];
			for (const [key, val] of value) entries.push([stringify$1(key), stringify$1(val)]);
			return entries.sort(([a1, a2], [b1, b2]) => {
				if (a1 < b1) return -1;
				if (a1 > b1) return 1;
				if (a2 < b2) return -1;
				if (a2 > b2) return 1;
				return 0;
			});
		};
		remote_fns_reducers[remote_set] = (value) => {
			if (!(value instanceof Set)) return;
			const items = [];
			for (const item of value) items.push(stringify$1(item));
			items.sort();
			return items;
		};
		remote_fns_reducers[remote_object] = (value) => {
			if (!is_plain_object(value)) return;
			if (Object.hasOwn(value, remote_arg_marker)) return;
			if (remote_arg_clones.has(value)) return remote_arg_clones.get(value);
			return to_sorted(value, remote_arg_clones);
		};
	}
	const all_reducers = {
		...Object.fromEntries(Object.entries(transport).map(([k, v]) => [k, v.encode])),
		...remote_fns_reducers
	};
	const stringify$1 = (value) => devalue.stringify(value, all_reducers);
	return all_reducers;
}
function create_remote_arg_revivers(transport) {
	const remote_fns_revivers = {
		[remote_object]: (value) => value,
		[remote_map]: (value) => {
			if (!Array.isArray(value)) throw new Error("Invalid data for Map reviver");
			const map = /* @__PURE__ */ new Map();
			for (const item of value) {
				if (!Array.isArray(item) || item.length !== 2 || typeof item[0] !== "string" || typeof item[1] !== "string") throw new Error("Invalid data for Map reviver");
				const [key, val] = item;
				map.set(parse$1(key), parse$1(val));
			}
			return map;
		},
		[remote_set]: (value) => {
			if (!Array.isArray(value)) throw new Error("Invalid data for Set reviver");
			const set = /* @__PURE__ */ new Set();
			for (const item of value) {
				if (typeof item !== "string") throw new Error("Invalid data for Set reviver");
				set.add(parse$1(item));
			}
			return set;
		},
		[remote_file]: (value) => {
			if (!value || typeof value !== "object" || typeof value.name !== "string" || typeof value.type !== "string" || typeof value.size !== "number" || typeof value.lastModified !== "number" || !(value.data instanceof ArrayBuffer)) throw new Error("Invalid data for File reviver");
			const { data, name, ...meta } = value;
			return new File([data], name, meta);
		}
	};
	const all_revivers = {
		...Object.fromEntries(Object.entries(transport).map(([k, v]) => [k, v.decode])),
		...remote_fns_revivers
	};
	const parse$1 = (data) => devalue.parse(data, all_revivers);
	return all_revivers;
}
function stringify_remote_arg(value, transport) {
	if (value === void 0) return "";
	return url_friendly_base64_encode(devalue.stringify(value, create_remote_arg_reducers(transport, true, /* @__PURE__ */ new Map())));
}
function url_friendly_base64_encode(string) {
	return base64_encode(text_encoder.encode(string)).replaceAll("=", "").replaceAll("+", "-").replaceAll("/", "_");
}
function parse_remote_arg(string, transport) {
	if (!string) return void 0;
	const json_string = new TextDecoder().decode(base64_decode(string.replaceAll("-", "+").replaceAll("_", "/")));
	return devalue.parse(json_string, create_remote_arg_revivers(transport));
}
function create_remote_key(id, payload) {
	return id + "/" + payload;
}
function split_remote_key(key) {
	const i = key.lastIndexOf("/");
	if (i === -1) throw new Error(`Invalid remote key: ${key}`);
	return {
		id: key.slice(0, i),
		payload: key.slice(i + 1)
	};
}
export { text_encoder as _, split_remote_key as a, validate_depends as c, get_message as d, get_status as f, get_relative_path as g, base64_encode as h, parse_remote_arg as i, validate_load_response as l, base64_decode as m, TRAILING_SLASH_PARAM as n, stringify as o, normalize_error as p, create_remote_key as r, stringify_remote_arg as s, INVALIDATED_PARAM as t, coalesce_to_error as u, noop as v, once as y };
