import { d as get_message, f as get_status, u as coalesce_to_error } from "./shared.js";
import { t as false_default } from "./false.js";
import { json, text } from "@sveltejs/kit";
import { HttpError, SvelteKitError } from "@sveltejs/kit/internal";
import { with_request_store } from "@sveltejs/kit/internal/server";
import * as set_cookie_parser from "set-cookie-parser";
import * as devalue from "devalue";
const SVELTE_KIT_ASSETS = "/_svelte_kit_assets";
const ENDPOINT_METHODS = [
	"GET",
	"POST",
	"PUT",
	"PATCH",
	"DELETE",
	"OPTIONS",
	"HEAD"
];
const MUTATIVE_METHODS = [
	"POST",
	"PUT",
	"PATCH",
	"DELETE"
];
const PAGE_METHODS = [
	"GET",
	"POST",
	"HEAD"
];
var decoder = new TextDecoder();
function set_nested_value(object, path_string, value) {
	if (path_string.startsWith("n:")) {
		path_string = path_string.slice(2);
		value = value === "" ? void 0 : parseFloat(value);
	} else if (path_string.startsWith("b:")) {
		path_string = path_string.slice(2);
		value = value === "on";
	}
	deep_set(object, split_path(path_string), value);
}
function convert_formdata(data) {
	const result = {};
	for (let key of data.keys()) {
		const is_array = key.endsWith("[]");
		let values = data.getAll(key);
		if (is_array) key = key.slice(0, -2);
		values = values.filter((entry) => typeof entry === "string" || entry.name !== "" || entry.size > 0);
		if (values.length === 0 && !is_array) continue;
		if (key.startsWith("n:")) {
			key = key.slice(2);
			values = values.map((v) => v === "" ? void 0 : parseFloat(v));
		} else if (key.startsWith("b:")) {
			key = key.slice(2);
			values = values.map((v) => v === "on");
		}
		if (values.length > 1 && !is_array) throw new Error(`Form cannot contain duplicated keys — "${key}" has ${values.length} values`);
		set_nested_value(result, key, is_array ? values : values[0]);
	}
	return result;
}
const BINARY_FORM_CONTENT_TYPE = "application/x-sveltekit-formdata";
var BINARY_FORM_VERSION = 0;
var HEADER_BYTES = 7;
async function deserialize_binary_form(request) {
	if (request.headers.get("content-type") !== "application/x-sveltekit-formdata") {
		const form_data = await request.formData();
		return {
			data: convert_formdata(form_data),
			meta: {},
			form_data
		};
	}
	if (!request.body) throw deserialize_error("no body");
	const reader = request.body.getReader();
	const chunks = [];
	function get_chunk(index) {
		if (index in chunks) return chunks[index];
		let i = chunks.length;
		while (i <= index) {
			chunks[i] = reader.read().then((chunk) => chunk.value);
			i++;
		}
		return chunks[index];
	}
	async function get_buffer(offset, length) {
		let start_chunk;
		let chunk_start = 0;
		let chunk_index;
		for (chunk_index = 0;; chunk_index++) {
			const chunk = await get_chunk(chunk_index);
			if (!chunk) return null;
			const chunk_end = chunk_start + chunk.byteLength;
			if (offset >= chunk_start && offset < chunk_end) {
				start_chunk = chunk;
				break;
			}
			chunk_start = chunk_end;
		}
		if (offset + length <= chunk_start + start_chunk.byteLength) return start_chunk.subarray(offset - chunk_start, offset + length - chunk_start);
		const chunks$1 = [start_chunk.subarray(offset - chunk_start)];
		let cursor = start_chunk.byteLength - offset + chunk_start;
		while (cursor < length) {
			chunk_index++;
			let chunk = await get_chunk(chunk_index);
			if (!chunk) return null;
			if (chunk.byteLength > length - cursor) chunk = chunk.subarray(0, length - cursor);
			chunks$1.push(chunk);
			cursor += chunk.byteLength;
		}
		const buffer = new Uint8Array(length);
		cursor = 0;
		for (const chunk of chunks$1) {
			buffer.set(chunk, cursor);
			cursor += chunk.byteLength;
		}
		return buffer;
	}
	const header = await get_buffer(0, HEADER_BYTES);
	if (!header) throw deserialize_error("too short");
	if (header[0] !== BINARY_FORM_VERSION) throw deserialize_error(`got version ${header[0]}, expected version ${BINARY_FORM_VERSION}`);
	const header_view = new DataView(header.buffer, header.byteOffset, header.byteLength);
	const data_length = header_view.getUint32(1, true);
	const file_offsets_length = header_view.getUint16(5, true);
	const data_buffer = await get_buffer(HEADER_BYTES, data_length);
	if (!data_buffer) throw deserialize_error("data too short");
	let file_offsets;
	let files_start_offset;
	if (file_offsets_length > 0) {
		const file_offsets_buffer = await get_buffer(HEADER_BYTES + data_length, file_offsets_length);
		if (!file_offsets_buffer) throw deserialize_error("file offset table too short");
		const parsed_offsets = JSON.parse(decoder.decode(file_offsets_buffer));
		if (!Array.isArray(parsed_offsets) || parsed_offsets.some((n) => typeof n !== "number" || !Number.isInteger(n) || n < 0)) throw deserialize_error("invalid file offset table");
		file_offsets = parsed_offsets;
		files_start_offset = HEADER_BYTES + data_length + file_offsets_length;
	}
	const file_spans = [];
	const [data, meta] = devalue.parse(decoder.decode(data_buffer), { File: ([name, type, size, last_modified, index]) => {
		if (typeof name !== "string" || typeof type !== "string" || typeof size !== "number" || typeof last_modified !== "number" || typeof index !== "number") throw deserialize_error("invalid file metadata");
		let offset = file_offsets[index];
		if (offset === void 0) throw deserialize_error("duplicate file offset table index");
		file_offsets[index] = void 0;
		offset += files_start_offset;
		file_spans.push({
			offset,
			size
		});
		return new Proxy(new LazyFile(name, type, size, last_modified, get_chunk, offset), { getPrototypeOf() {
			return File.prototype;
		} });
	} });
	file_spans.sort((a, b) => a.offset - b.offset || a.size - b.size);
	for (let i = 1; i < file_spans.length; i++) {
		const previous = file_spans[i - 1];
		const current = file_spans[i];
		const previous_end = previous.offset + previous.size;
		if (previous_end < current.offset) throw deserialize_error("gaps in file data");
		if (previous_end > current.offset) throw deserialize_error("overlapping file data");
	}
	(async () => {
		let has_more = true;
		while (has_more) has_more = !!await get_chunk(chunks.length);
	})();
	return {
		data,
		meta,
		form_data: null
	};
}
function deserialize_error(message) {
	return new SvelteKitError(400, "Bad Request", `Could not deserialize binary form: ${message}`);
}
var LazyFile = class LazyFile {
	#get_chunk;
	#offset;
	constructor(name, type, size, last_modified, get_chunk, offset) {
		this.name = name;
		this.type = type;
		this.size = size;
		this.lastModified = last_modified;
		this.webkitRelativePath = "";
		this.#get_chunk = get_chunk;
		this.#offset = offset;
		this.arrayBuffer = this.arrayBuffer.bind(this);
		this.bytes = this.bytes.bind(this);
		this.slice = this.slice.bind(this);
		this.stream = this.stream.bind(this);
		this.text = this.text.bind(this);
	}
	#buffer;
	async arrayBuffer() {
		this.#buffer ??= await new Response(this.stream()).arrayBuffer();
		return this.#buffer;
	}
	async bytes() {
		return new Uint8Array(await this.arrayBuffer());
	}
	slice(start = 0, end = this.size, contentType = this.type) {
		if (start < 0) start = Math.max(this.size + start, 0);
		else start = Math.min(start, this.size);
		if (end < 0) end = Math.max(this.size + end, 0);
		else end = Math.min(end, this.size);
		const size = Math.max(end - start, 0);
		return new LazyFile(this.name, contentType, size, this.lastModified, this.#get_chunk, this.#offset + start);
	}
	stream() {
		let cursor = 0;
		let chunk_index = 0;
		return new ReadableStream({
			start: async (controller) => {
				let chunk_start = 0;
				let start_chunk;
				for (chunk_index = 0;; chunk_index++) {
					const chunk = await this.#get_chunk(chunk_index);
					if (!chunk) return null;
					const chunk_end = chunk_start + chunk.byteLength;
					if (this.#offset >= chunk_start && this.#offset < chunk_end) {
						start_chunk = chunk;
						break;
					}
					chunk_start = chunk_end;
				}
				if (this.#offset + this.size <= chunk_start + start_chunk.byteLength) {
					controller.enqueue(start_chunk.subarray(this.#offset - chunk_start, this.#offset + this.size - chunk_start));
					controller.close();
				} else {
					controller.enqueue(start_chunk.subarray(this.#offset - chunk_start));
					cursor = start_chunk.byteLength - this.#offset + chunk_start;
				}
			},
			pull: async (controller) => {
				chunk_index++;
				let chunk = await this.#get_chunk(chunk_index);
				if (!chunk) {
					controller.error("incomplete file data");
					controller.close();
					return;
				}
				if (chunk.byteLength > this.size - cursor) chunk = chunk.subarray(0, this.size - cursor);
				controller.enqueue(chunk);
				cursor += chunk.byteLength;
				if (cursor >= this.size) controller.close();
			}
		});
	}
	async text() {
		return decoder.decode(await this.arrayBuffer());
	}
};
var path_regex = /^[a-zA-Z_$]\w*(\.[a-zA-Z_$]\w*|\[\d+\])*$/;
function split_path(path) {
	if (!path_regex.test(path)) throw new Error(`Invalid path ${path}`);
	return path.split(/\.|\[|\]/).filter(Boolean);
}
function check_prototype_pollution(key) {
	if (key === "__proto__" || key === "constructor" || key === "prototype") throw new Error(`Invalid key "${key}"`);
}
function deep_set(object, keys, value) {
	let current = object;
	for (let i = 0; i < keys.length - 1; i += 1) {
		const key = keys[i];
		check_prototype_pollution(key);
		const is_array = /^\d+$/.test(keys[i + 1]);
		const inner = Object.hasOwn(current, key) ? current[key] : void 0;
		const exists = inner != null;
		if (exists && is_array !== Array.isArray(inner)) throw new Error(`Invalid array key ${keys[i + 1]}`);
		if (!exists) current[key] = is_array ? [] : {};
		current = current[key];
	}
	const final_key = keys[keys.length - 1];
	check_prototype_pollution(final_key);
	current[final_key] = value;
}
function normalize_issue(issue, server = false) {
	const normalized = {
		name: "",
		path: [],
		message: issue.message,
		server
	};
	if (issue.path !== void 0) {
		let name = "";
		for (const segment of issue.path) {
			const key = typeof segment === "object" ? segment.key : segment;
			normalized.path.push(key);
			if (typeof key === "number") name += `[${key}]`;
			else if (typeof key === "string") name += name === "" ? key : "." + key;
		}
		normalized.name = name;
	}
	return normalized;
}
function flatten_issues(issues) {
	const result = {};
	for (const issue of issues) {
		(result.$ ??= []).push(issue);
		let name = "";
		if (issue.path !== void 0) for (const key of issue.path) {
			if (typeof key === "number") name += `[${key}]`;
			else if (typeof key === "string") name += name === "" ? key : "." + key;
			(result[name] ??= []).push(issue);
		}
	}
	return result;
}
function deep_get(object, path) {
	let current = object;
	for (const key of path) {
		if (current == null || typeof current !== "object") return current;
		current = current[key];
	}
	return current;
}
function get_type_prefix(field_type, is_array, input_value) {
	if (field_type === "number" || field_type === "range") return "n:";
	if (field_type === "checkbox" && !is_array) return "b:";
	if (field_type === "hidden" || field_type === "submit") {
		const input_type = typeof input_value;
		if (input_type === "number") return "n:";
		if (input_type === "boolean") return "b:";
	}
	return "";
}
function deep_clone(value) {
	if (value !== null && typeof value === "object") {
		if (value instanceof File) return value;
		if (Array.isArray(value)) return value.map(deep_clone);
		const clone = {};
		for (const key of Object.keys(value)) clone[key] = deep_clone(value[key]);
		return clone;
	}
	return value;
}
function create_field_proxy(target, get_input, set_input, get_issues, path = []) {
	const get_value = () => {
		return deep_clone(deep_get(get_input(), path));
	};
	return new Proxy(target, { get(target$1, prop) {
		if (typeof prop === "symbol") return target$1[prop];
		if (/^\d+$/.test(prop)) return create_field_proxy({}, get_input, set_input, get_issues, [...path, parseInt(prop, 10)]);
		const key = build_path_string(path);
		if (prop === "set") {
			const set_func = function(newValue) {
				set_input(path, newValue);
				return newValue;
			};
			return create_field_proxy(set_func, get_input, set_input, get_issues, [...path, prop]);
		}
		if (prop === "value") return create_field_proxy(get_value, get_input, set_input, get_issues, [...path, prop]);
		if (prop === "issues" || prop === "allIssues") {
			const issues_func = () => {
				const all_issues = get_issues(path, prop === "allIssues")[key === "" ? "$" : key];
				if (prop === "allIssues") return all_issues?.map((issue) => ({
					path: issue.path,
					message: issue.message
				}));
				return all_issues?.filter((issue) => issue.name === key)?.map((issue) => ({
					path: issue.path,
					message: issue.message
				}));
			};
			return create_field_proxy(issues_func, get_input, set_input, get_issues, [...path, prop]);
		}
		if (prop === "as") {
			const as_func = (type, input_value) => {
				const is_array = type === "file multiple" || type === "select multiple" || type === "checkbox" && typeof input_value === "string";
				const base_props = {
					name: get_type_prefix(type, is_array, input_value) + key + (is_array ? "[]" : ""),
					get "aria-invalid"() {
						return key in get_issues() ? "true" : void 0;
					}
				};
				if (type !== "text" && type !== "select" && type !== "select multiple") base_props.type = type === "file multiple" ? "file" : type;
				if (type === "submit" || type === "hidden") {
					const value = typeof input_value === "boolean" ? input_value ? "on" : "off" : input_value;
					return Object.defineProperties(base_props, { value: {
						value,
						enumerable: true
					} });
				}
				if (type === "select" || type === "select multiple") return Object.defineProperties(base_props, {
					multiple: {
						value: is_array,
						enumerable: true
					},
					value: {
						enumerable: true,
						get() {
							return get_value() ?? input_value;
						}
					}
				});
				if (type === "checkbox" || type === "radio") {
					if (type === "checkbox" && !is_array) return Object.defineProperties(base_props, {
						defaultChecked: {
							enumerable: true,
							get() {
								return input_value;
							}
						},
						checked: {
							enumerable: true,
							get() {
								return get_value() ?? input_value;
							}
						}
					});
					return Object.defineProperties(base_props, {
						value: {
							value: input_value ?? "on",
							enumerable: true
						},
						checked: {
							enumerable: true,
							get() {
								const value = get_value();
								if (type === "radio") return value === input_value;
								return (value ?? []).includes(input_value);
							}
						}
					});
				}
				if (type === "file" || type === "file multiple") return Object.defineProperties(base_props, {
					multiple: {
						value: is_array,
						enumerable: true
					},
					files: {
						enumerable: true,
						get() {
							const value = get_value();
							if (value instanceof File) {
								if (typeof DataTransfer !== "undefined") {
									const fileList = new DataTransfer();
									fileList.items.add(value);
									return fileList.files;
								}
								return {
									0: value,
									length: 1
								};
							}
							if (Array.isArray(value) && value.every((f) => f instanceof File)) {
								if (typeof DataTransfer !== "undefined") {
									const fileList = new DataTransfer();
									value.forEach((file) => fileList.items.add(file));
									return fileList.files;
								}
								const fileListLike = { length: value.length };
								value.forEach((file, index) => {
									fileListLike[index] = file;
								});
								return fileListLike;
							}
							return null;
						}
					}
				});
				return Object.defineProperties(base_props, {
					defaultValue: {
						enumerable: true,
						get() {
							return input_value;
						}
					},
					value: {
						enumerable: true,
						get() {
							const value = get_value() ?? input_value;
							return value != null ? String(value) : "";
						}
					}
				});
			};
			return create_field_proxy(as_func, get_input, set_input, get_issues, [...path, "as"]);
		}
		return create_field_proxy({}, get_input, set_input, get_issues, [...path, prop]);
	} });
}
function build_path_string(path) {
	let result = "";
	for (const segment of path) if (typeof segment === "number") result += `[${segment}]`;
	else result += result === "" ? segment : "." + segment;
	return result;
}
function throw_on_old_property_access(instance) {
	Object.defineProperty(instance, "field", { value: (name) => {
		const new_name = name.endsWith("[]") ? name.slice(0, -2) : name;
		throw new Error(`\`form.field\` has been removed: Instead of \`<input name={form.field('${name}')} />\` do \`<input {...form.fields.${new_name}.as(type)} />\``);
	} });
	for (const property of ["input", "issues"]) Object.defineProperty(instance, property, { get() {
		const new_name = property === "issues" ? "issues" : "value";
		return new Proxy({}, { get(_, prop) {
			const prop_string = typeof prop === "string" ? prop : String(prop);
			const old = prop_string.includes("[") || prop_string.includes(".") ? `['${prop_string}']` : `.${prop_string}`;
			const replacement = `.${prop_string}.${new_name}()`;
			throw new Error(`\`form.${property}\` has been removed: Instead of \`form.${property}${old}\` write \`form.fields${replacement}\``);
		} });
	} });
}
function negotiate(accept, types) {
	const parts = [];
	accept.split(",").forEach((str, i) => {
		const match = /([^/ \t]+)\/([^; \t]+)[ \t]*(?:;[ \t]*q=([0-9.]+))?/.exec(str);
		if (match) {
			const [, type, subtype, q = "1"] = match;
			parts.push({
				type,
				subtype,
				q: +q,
				i
			});
		}
	});
	parts.sort((a, b) => {
		if (a.q !== b.q) return b.q - a.q;
		if (a.subtype === "*" !== (b.subtype === "*")) return a.subtype === "*" ? 1 : -1;
		if (a.type === "*" !== (b.type === "*")) return a.type === "*" ? 1 : -1;
		return a.i - b.i;
	});
	let accepted;
	let min_priority = Infinity;
	for (const mimetype of types) {
		const [type, subtype] = mimetype.split("/");
		const priority = parts.findIndex((part) => (part.type === type || part.type === "*") && (part.subtype === subtype || part.subtype === "*"));
		if (priority !== -1 && priority < min_priority) {
			accepted = mimetype;
			min_priority = priority;
		}
	}
	return accepted;
}
function get_set_cookies(headers) {
	if (typeof headers.getSetCookie === "function") return headers.getSetCookie();
	const set_cookie = headers.get("set-cookie");
	return set_cookie ? set_cookie_parser.splitCookiesString(set_cookie) : [];
}
function is_content_type(request, ...types) {
	const type = request.headers.get("content-type")?.split(";", 1)[0].trim() ?? "";
	return types.includes(type.toLowerCase());
}
function is_form_content_type(request) {
	return is_content_type(request, "application/x-www-form-urlencoded", "multipart/form-data", "text/plain", BINARY_FORM_CONTENT_TYPE);
}
const s = JSON.stringify;
var escape_html_attr_dict = {
	"&": "&amp;",
	"\"": "&quot;"
};
var escape_html_dict = {
	"&": "&amp;",
	"<": "&lt;"
};
var escape_html_attr_regex = new RegExp(`[${Object.keys(escape_html_attr_dict).join("")}]|[\\ud800-\\udbff](?![\\udc00-\\udfff])|[\\ud800-\\udbff][\\udc00-\\udfff]|[\\udc00-\\udfff]`, "g");
var escape_html_regex = new RegExp(`[${Object.keys(escape_html_dict).join("")}]|[\\ud800-\\udbff](?![\\udc00-\\udfff])|[\\ud800-\\udbff][\\udc00-\\udfff]|[\\udc00-\\udfff]`, "g");
function escape_html(str, is_attr) {
	const dict = is_attr ? escape_html_attr_dict : escape_html_dict;
	return str.replace(is_attr ? escape_html_attr_regex : escape_html_regex, (match) => {
		if (match.length === 2) return match;
		return dict[match] ?? `&#${match.charCodeAt(0)};`;
	});
}
function method_not_allowed(mod, method) {
	return text(`${method} method not allowed`, {
		status: 405,
		headers: { allow: allowed_methods(mod).join(", ") }
	});
}
function allowed_methods(mod) {
	const allowed = ENDPOINT_METHODS.filter((method) => method in mod);
	if ("GET" in mod && !("HEAD" in mod)) allowed.push("HEAD");
	return allowed;
}
function get_global_name(options) {
	return `__sveltekit_${options.version_hash}`;
}
function static_error_page(options, status, message) {
	return text(options.templates.error({
		status,
		message: escape_html(message)
	}), {
		headers: { "content-type": "text/html; charset=utf-8" },
		status
	});
}
async function handle_fatal_error(event, state, options, error$1) {
	error$1 = error$1 instanceof HttpError ? error$1 : coalesce_to_error(error$1);
	const status = get_status(error$1);
	const body = await handle_error_and_jsonify(event, state, options, error$1);
	const type = negotiate(event.request.headers.get("accept") || "text/html", ["application/json", "text/html"]);
	if (event.isDataRequest || type === "application/json") return json(body, { status });
	return static_error_page(options, status, body.message);
}
async function handle_error_and_jsonify(event, state, options, error$1) {
	if (error$1 instanceof HttpError) return {
		message: "Unknown Error",
		...error$1.body
	};
	const status = get_status(error$1);
	const message = get_message(error$1);
	return await with_request_store({
		event,
		state
	}, () => options.hooks.handleError({
		error: error$1,
		event,
		status,
		message
	})) ?? { message };
}
function redirect_response(status, location) {
	return new Response(void 0, {
		status,
		headers: { location }
	});
}
function clarify_devalue_error(event, error$1) {
	if (error$1.path) return `Data returned from \`load\` while rendering ${event.route.id} is not serializable: ${error$1.message} (${error$1.path}). If you need to serialize/deserialize custom types, use transport hooks: https://svelte.dev/docs/kit/hooks#Universal-hooks-transport.`;
	if (error$1.path === "") return `Data returned from \`load\` while rendering ${event.route.id} is not a plain object`;
	return error$1.message;
}
function serialize_uses(node) {
	const uses = {};
	if (node.uses && node.uses.dependencies.size > 0) uses.dependencies = Array.from(node.uses.dependencies);
	if (node.uses && node.uses.search_params.size > 0) uses.search_params = Array.from(node.uses.search_params);
	if (node.uses && node.uses.params.size > 0) uses.params = Array.from(node.uses.params);
	if (node.uses?.parent) uses.parent = 1;
	if (node.uses?.route) uses.route = 1;
	if (node.uses?.url) uses.url = 1;
	return uses;
}
function has_prerendered_path(manifest, pathname) {
	return manifest._.prerendered_routes.has(pathname) || pathname.at(-1) === "/" && manifest._.prerendered_routes.has(pathname.slice(0, -1));
}
function format_server_error(status, error$1, event) {
	const formatted_text = `\n\x1b[1;31m[${status}] ${event.request.method} ${event.url.pathname}\x1b[0m`;
	if (status === 404) return formatted_text;
	return `${formatted_text}\n${error$1.stack}`;
}
function get_node_type(node_id) {
	const filename = (node_id?.split("/"))?.at(-1);
	if (!filename) return "unknown";
	return filename.split(".").slice(0, -1).join(".");
}
function count_non_ssi_comments(str) {
	return (str.match(/<!--(?!#)/g) ?? []).length;
}
function create_replacer(transport) {
	const replacer = (thing) => {
		for (const key in transport) {
			const encoded = transport[key].encode(thing);
			if (encoded) return `app.decode('${key}', ${devalue.uneval(encoded, replacer)})`;
		}
	};
	return replacer;
}
export { normalize_issue as C, MUTATIVE_METHODS as D, ENDPOINT_METHODS as E, PAGE_METHODS as O, flatten_issues as S, throw_on_old_property_access as T, is_form_content_type as _, get_global_name as a, deep_set as b, handle_fatal_error as c, redirect_response as d, serialize_uses as f, get_set_cookies as g, s as h, format_server_error as i, SVELTE_KIT_ASSETS as k, has_prerendered_path as l, escape_html as m, count_non_ssi_comments as n, get_node_type as o, static_error_page as p, create_replacer as r, handle_error_and_jsonify as s, clarify_devalue_error as t, method_not_allowed as u, negotiate as v, set_nested_value as w, deserialize_binary_form as x, create_field_proxy as y };
