import { t as false_default } from "./false.js";
import * as devalue from "devalue";
import { clsx } from "clsx";
var __defProp = Object.defineProperty;
var __export = (all) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	return target;
};
var is_array = Array.isArray;
var index_of = Array.prototype.indexOf;
var includes = Array.prototype.includes;
var array_from = Array.from;
var object_keys = Object.keys;
var define_property = Object.defineProperty;
var get_descriptor = Object.getOwnPropertyDescriptor;
var object_prototype = Object.prototype;
var array_prototype = Array.prototype;
var get_prototype_of = Object.getPrototypeOf;
var is_extensible = Object.isExtensible;
var has_own_property = Object.prototype.hasOwnProperty;
const noop = () => {};
function run(fn) {
	return fn();
}
function run_all(arr) {
	for (var i = 0; i < arr.length; i++) arr[i]();
}
function deferred() {
	var resolve;
	var reject;
	return {
		promise: new Promise((res, rej) => {
			resolve = res;
			reject = rej;
		}),
		resolve,
		reject
	};
}
function fallback(value, fallback$1, lazy = false) {
	return value === void 0 ? lazy ? fallback$1() : fallback$1 : value;
}
function equals(value) {
	return value === this.v;
}
function safe_not_equal(a, b) {
	return a != a ? b == b : a !== b || a !== null && typeof a === "object" || typeof a === "function";
}
function safe_equals(value) {
	return !safe_not_equal(value, this.v);
}
const CLEAN = 1024;
const DIRTY = 2048;
const MAYBE_DIRTY = 4096;
const INERT = 8192;
const DESTROYED = 16384;
const REACTION_RAN = 32768;
const DESTROYING = 1 << 25;
const EFFECT_TRANSPARENT = 65536;
const EFFECT_PRESERVED = 1 << 19;
const USER_EFFECT = 1 << 20;
const WAS_MARKED = 65536;
const REACTION_IS_UPDATING = 1 << 21;
const ERROR_VALUE = 1 << 23;
const STATE_SYMBOL = Symbol("$state");
const LEGACY_PROPS = Symbol("legacy props");
const ATTRIBUTES_CACHE = Symbol("attributes");
const CLASS_CACHE = Symbol("class");
const STYLE_CACHE = Symbol("style");
const TEXT_CACHE = Symbol("text");
const STALE_REACTION = new class StaleReactionError extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
globalThis.document?.contentType;
function experimental_async_required(name) {
	throw new Error(`https://svelte.dev/e/experimental_async_required`);
}
function lifecycle_outside_component(name) {
	throw new Error(`https://svelte.dev/e/lifecycle_outside_component`);
}
function missing_context() {
	throw new Error(`https://svelte.dev/e/missing_context`);
}
function effect_update_depth_exceeded() {
	throw new Error(`https://svelte.dev/e/effect_update_depth_exceeded`);
}
function hydration_failed() {
	throw new Error(`https://svelte.dev/e/hydration_failed`);
}
function rune_outside_svelte(rune) {
	throw new Error(`https://svelte.dev/e/rune_outside_svelte`);
}
function state_descriptors_fixed() {
	throw new Error(`https://svelte.dev/e/state_descriptors_fixed`);
}
function state_prototype_fixed() {
	throw new Error(`https://svelte.dev/e/state_prototype_fixed`);
}
function state_unsafe_mutation() {
	throw new Error(`https://svelte.dev/e/state_unsafe_mutation`);
}
function svelte_boundary_reset_onerror() {
	throw new Error(`https://svelte.dev/e/svelte_boundary_reset_onerror`);
}
const HYDRATION_ERROR = {};
const UNINITIALIZED = Symbol("uninitialized");
const ATTACHMENT_KEY = "@attach";
function derived_inert() {
	console.warn(`https://svelte.dev/e/derived_inert`);
}
function hydration_mismatch(location) {
	console.warn(`https://svelte.dev/e/hydration_mismatch`);
}
function svelte_boundary_reset_noop() {
	console.warn(`https://svelte.dev/e/svelte_boundary_reset_noop`);
}
let hydrating = false;
function set_hydrating(value) {
	hydrating = value;
}
let hydrate_node;
function set_hydrate_node(node) {
	if (node === null) {
		hydration_mismatch();
		throw HYDRATION_ERROR;
	}
	return hydrate_node = node;
}
function hydrate_next() {
	return set_hydrate_node(/* @__PURE__ */ get_next_sibling(hydrate_node));
}
function next(count = 1) {
	if (hydrating) {
		var i = count;
		var node = hydrate_node;
		while (i--) node = /* @__PURE__ */ get_next_sibling(node);
		hydrate_node = node;
	}
}
function skip_nodes(remove = true) {
	var depth = 0;
	var node = hydrate_node;
	while (true) {
		if (node.nodeType === 8) {
			var data = node.data;
			if (data === "]") {
				if (depth === 0) return node;
				depth -= 1;
			} else if (data === "[" || data === "[!" || data[0] === "[" && !isNaN(Number(data.slice(1)))) depth += 1;
		}
		var next$1 = /* @__PURE__ */ get_next_sibling(node);
		if (remove) node.remove();
		node = next$1;
	}
}
let async_mode_flag = false;
let component_context = null;
function set_component_context(context$1) {
	component_context = context$1;
}
function push$1(props, runes = false, fn) {
	component_context = {
		p: component_context,
		i: false,
		c: null,
		e: null,
		s: props,
		x: null,
		r: active_effect,
		l: null
	};
}
function pop$1(component) {
	var context$1 = component_context;
	var effects = context$1.e;
	if (effects !== null) {
		context$1.e = null;
		for (var fn of effects) create_user_effect(fn);
	}
	if (component !== void 0) context$1.x = component;
	context$1.i = true;
	component_context = context$1.p;
	return component ?? {};
}
function is_runes() {
	return true;
}
var micro_tasks = [];
function run_micro_tasks() {
	var tasks = micro_tasks;
	micro_tasks = [];
	run_all(tasks);
}
function queue_micro_task(fn) {
	if (micro_tasks.length === 0 && !is_flushing_sync) {
		var tasks = micro_tasks;
		queueMicrotask(() => {
			if (tasks === micro_tasks) run_micro_tasks();
		});
	}
	micro_tasks.push(fn);
}
function flush_tasks() {
	while (micro_tasks.length > 0) run_micro_tasks();
}
function handle_error(error) {
	var effect = active_effect;
	if (effect === null) {
		active_reaction.f |= ERROR_VALUE;
		return error;
	}
	if ((effect.f & 32768) === 0 && (effect.f & 4) === 0) throw error;
	invoke_error_boundary(error, effect);
}
function invoke_error_boundary(error, effect) {
	if (effect !== null && (effect.f & 16384) !== 0) return;
	while (effect !== null) {
		if ((effect.f & 128) !== 0) {
			if ((effect.f & 32768) === 0) throw error;
			try {
				effect.b.error(error);
				return;
			} catch (e) {
				error = e;
			}
		}
		effect = effect.parent;
	}
	throw error;
}
var STATUS_MASK = ~(MAYBE_DIRTY | 3072);
function set_signal_status(signal, status) {
	signal.f = signal.f & STATUS_MASK | status;
}
function update_derived_status(derived$1) {
	if ((derived$1.f & 512) !== 0 || derived$1.deps === null) set_signal_status(derived$1, CLEAN);
	else set_signal_status(derived$1, MAYBE_DIRTY);
}
function clear_marked(deps) {
	if (deps === null) return;
	for (const dep of deps) {
		if ((dep.f & 2) === 0 || (dep.f & 65536) === 0) continue;
		dep.f ^= WAS_MARKED;
		clear_marked(dep.deps);
	}
}
function defer_effect(effect, dirty_effects, maybe_dirty_effects) {
	if ((effect.f & 2048) !== 0) dirty_effects.add(effect);
	else if ((effect.f & 4096) !== 0) maybe_dirty_effects.add(effect);
	clear_marked(effect.deps);
	set_signal_status(effect, CLEAN);
}
function createSubscriber(start) {
	let subscribers = 0;
	let version = source(0);
	let stop;
	return () => {
		if (effect_tracking()) {
			get(version);
			render_effect(() => {
				if (subscribers === 0) stop = untrack(() => start(() => increment(version)));
				subscribers += 1;
				return () => {
					queue_micro_task(() => {
						subscribers -= 1;
						if (subscribers === 0) {
							stop?.();
							stop = void 0;
							increment(version);
						}
					});
				};
			});
		}
	};
}
var flags = EFFECT_TRANSPARENT | EFFECT_PRESERVED;
function boundary(node, props, children, transform_error) {
	new Boundary(node, props, children, transform_error);
}
var Boundary = class {
	parent;
	is_pending = false;
	transform_error;
	#anchor;
	#hydrate_open = hydrating ? hydrate_node : null;
	#props;
	#children;
	#effect;
	#main_effect = null;
	#pending_effect = null;
	#failed_effect = null;
	#offscreen_fragment = null;
	#local_pending_count = 0;
	#pending_count = 0;
	#pending_count_update_queued = false;
	#dirty_effects = /* @__PURE__ */ new Set();
	#maybe_dirty_effects = /* @__PURE__ */ new Set();
	#effect_pending = null;
	#effect_pending_subscriber = createSubscriber(() => {
		this.#effect_pending = source(this.#local_pending_count);
		return () => {
			this.#effect_pending = null;
		};
	});
	constructor(node, props, children, transform_error) {
		this.#anchor = node;
		this.#props = props;
		this.#children = (anchor) => {
			var effect = active_effect;
			effect.b = this;
			effect.f |= 128;
			children(anchor);
		};
		this.parent = active_effect.b;
		this.transform_error = transform_error ?? this.parent?.transform_error ?? ((e) => e);
		this.#effect = block(() => {
			if (hydrating) {
				const comment = this.#hydrate_open;
				hydrate_next();
				const server_rendered_pending = comment.data === "[!";
				if (comment.data.startsWith("[?")) {
					const serialized_error = JSON.parse(comment.data.slice(2));
					this.#hydrate_failed_content(serialized_error);
				} else if (server_rendered_pending) this.#hydrate_pending_content();
				else this.#hydrate_resolved_content();
			} else this.#render();
		}, flags);
		if (hydrating) this.#anchor = hydrate_node;
	}
	#hydrate_resolved_content() {
		try {
			this.#main_effect = branch(() => this.#children(this.#anchor));
		} catch (error) {
			this.error(error);
		}
	}
	#hydrate_failed_content(error) {
		const failed = this.#props.failed;
		if (!failed) return;
		this.#failed_effect = branch(() => {
			failed(this.#anchor, () => error, () => () => {});
		});
	}
	#hydrate_pending_content() {
		const pending = this.#props.pending;
		if (!pending) return;
		this.is_pending = true;
		this.#pending_effect = branch(() => pending(this.#anchor));
		queue_micro_task(() => {
			var fragment = this.#offscreen_fragment = document.createDocumentFragment();
			var anchor = create_text();
			fragment.append(anchor);
			this.#main_effect = this.#run(() => {
				return branch(() => this.#children(anchor));
			});
			if (this.#pending_count === 0) {
				this.#anchor.before(fragment);
				this.#offscreen_fragment = null;
				pause_effect(this.#pending_effect, () => {
					this.#pending_effect = null;
				});
				this.#resolve(current_batch);
			}
		});
	}
	#render() {
		try {
			this.is_pending = this.has_pending_snippet();
			this.#pending_count = 0;
			this.#local_pending_count = 0;
			this.#main_effect = branch(() => {
				this.#children(this.#anchor);
			});
			if (this.#pending_count > 0) {
				var fragment = this.#offscreen_fragment = document.createDocumentFragment();
				move_effect(this.#main_effect, fragment);
				const pending = this.#props.pending;
				this.#pending_effect = branch(() => pending(this.#anchor));
			} else this.#resolve(current_batch);
		} catch (error) {
			this.error(error);
		}
	}
	#resolve(batch) {
		this.is_pending = false;
		batch.transfer_effects(this.#dirty_effects, this.#maybe_dirty_effects);
	}
	defer_effect(effect) {
		defer_effect(effect, this.#dirty_effects, this.#maybe_dirty_effects);
	}
	is_rendered() {
		return !this.is_pending && (!this.parent || this.parent.is_rendered());
	}
	has_pending_snippet() {
		return !!this.#props.pending;
	}
	#run(fn) {
		var previous_effect = active_effect;
		var previous_reaction = active_reaction;
		var previous_ctx = component_context;
		set_active_effect(this.#effect);
		set_active_reaction(this.#effect);
		set_component_context(this.#effect.ctx);
		try {
			Batch.ensure();
			return fn();
		} catch (e) {
			handle_error(e);
			return null;
		} finally {
			set_active_effect(previous_effect);
			set_active_reaction(previous_reaction);
			set_component_context(previous_ctx);
		}
	}
	#update_pending_count(d, batch) {
		if (!this.has_pending_snippet()) {
			if (this.parent) this.parent.#update_pending_count(d, batch);
			return;
		}
		this.#pending_count += d;
		if (this.#pending_count === 0) {
			this.#resolve(batch);
			if (this.#pending_effect) pause_effect(this.#pending_effect, () => {
				this.#pending_effect = null;
			});
			if (this.#offscreen_fragment) {
				this.#anchor.before(this.#offscreen_fragment);
				this.#offscreen_fragment = null;
			}
		}
	}
	update_pending_count(d, batch) {
		this.#update_pending_count(d, batch);
		this.#local_pending_count += d;
		if (!this.#effect_pending || this.#pending_count_update_queued) return;
		this.#pending_count_update_queued = true;
		queue_micro_task(() => {
			this.#pending_count_update_queued = false;
			if (this.#effect_pending) internal_set(this.#effect_pending, this.#local_pending_count);
		});
	}
	get_effect_pending() {
		this.#effect_pending_subscriber();
		return get(this.#effect_pending);
	}
	error(error) {
		if (!this.#props.onerror && !this.#props.failed) throw error;
		if (current_batch?.is_fork) {
			if (this.#main_effect) current_batch.skip_effect(this.#main_effect);
			if (this.#pending_effect) current_batch.skip_effect(this.#pending_effect);
			if (this.#failed_effect) current_batch.skip_effect(this.#failed_effect);
			current_batch.oncommit(() => {
				this.#handle_error(error);
			});
		} else this.#handle_error(error);
	}
	#handle_error(error) {
		if (this.#main_effect) {
			destroy_effect(this.#main_effect);
			this.#main_effect = null;
		}
		if (this.#pending_effect) {
			destroy_effect(this.#pending_effect);
			this.#pending_effect = null;
		}
		if (this.#failed_effect) {
			destroy_effect(this.#failed_effect);
			this.#failed_effect = null;
		}
		if (hydrating) {
			set_hydrate_node(this.#hydrate_open);
			next();
			set_hydrate_node(skip_nodes());
		}
		var onerror = this.#props.onerror;
		let failed = this.#props.failed;
		var did_reset = false;
		var calling_on_error = false;
		const reset = () => {
			if (did_reset) {
				svelte_boundary_reset_noop();
				return;
			}
			did_reset = true;
			if (calling_on_error) svelte_boundary_reset_onerror();
			if (this.#failed_effect !== null) pause_effect(this.#failed_effect, () => {
				this.#failed_effect = null;
			});
			this.#run(() => {
				this.#render();
			});
		};
		const handle_error_result = (transformed_error) => {
			try {
				calling_on_error = true;
				onerror?.(transformed_error, reset);
				calling_on_error = false;
			} catch (error$1) {
				invoke_error_boundary(error$1, this.#effect && this.#effect.parent);
			}
			if (failed) this.#failed_effect = this.#run(() => {
				try {
					return branch(() => {
						var effect = active_effect;
						effect.b = this;
						effect.f |= 128;
						failed(this.#anchor, () => transformed_error, () => reset);
					});
				} catch (error$1) {
					invoke_error_boundary(error$1, this.#effect.parent);
					return null;
				}
			});
		};
		queue_micro_task(() => {
			var result;
			try {
				result = this.transform_error(error);
			} catch (e) {
				invoke_error_boundary(e, this.#effect && this.#effect.parent);
				return;
			}
			if (result !== null && typeof result === "object" && typeof result.then === "function") result.then(handle_error_result, (e) => invoke_error_boundary(e, this.#effect && this.#effect.parent));
			else handle_error_result(result);
		});
	}
};
const OBSOLETE = Symbol("obsolete");
function destroy_derived_effects(derived$1) {
	var effects = derived$1.effects;
	if (effects !== null) {
		derived$1.effects = null;
		for (var i = 0; i < effects.length; i += 1) destroy_effect(effects[i]);
	}
}
function execute_derived(derived$1) {
	var value;
	var prev_active_effect = active_effect;
	var parent = derived$1.parent;
	if (!is_destroying_effect && parent !== null && derived$1.v !== UNINITIALIZED && (parent.f & 24576) !== 0) {
		derived_inert();
		return derived$1.v;
	}
	set_active_effect(parent);
	try {
		derived$1.f &= ~WAS_MARKED;
		destroy_derived_effects(derived$1);
		value = update_reaction(derived$1);
	} finally {
		set_active_effect(prev_active_effect);
	}
	return value;
}
function update_derived(derived$1) {
	var value = execute_derived(derived$1);
	if (!derived$1.equals(value)) {
		derived$1.wv = increment_write_version();
		if (!current_batch?.is_fork || derived$1.deps === null) {
			if (current_batch !== null) {
				current_batch.capture(derived$1, value, true);
				previous_batch?.capture(derived$1, value, true);
			} else derived$1.v = value;
			if (derived$1.deps === null) {
				set_signal_status(derived$1, CLEAN);
				return;
			}
		}
	}
	if (is_destroying_effect) return;
	if (batch_values !== null) {
		if (effect_tracking() || current_batch?.is_fork) batch_values.set(derived$1, value);
	} else update_derived_status(derived$1);
}
function freeze_derived_effects(derived$1) {
	if (derived$1.effects === null) return;
	for (const e of derived$1.effects) if (e.teardown || e.ac) {
		e.teardown?.();
		e.ac?.abort(STALE_REACTION);
		if (e.fn !== null) e.teardown = noop;
		e.ac = null;
		remove_reactions(e, 0);
		destroy_effect_children(e);
	}
}
function unfreeze_derived_effects(derived$1) {
	if (derived$1.effects === null) return;
	for (const e of derived$1.effects) if (e.teardown && e.fn !== null) update_effect(e);
}
var first_batch = null;
var last_batch = null;
let current_batch = null;
let previous_batch = null;
let batch_values = null;
var last_scheduled_effect = null;
let is_flushing_sync = false;
var is_processing = false;
let collected_effects = null;
let legacy_updates = null;
var flush_count = 0;
var uid = 1;
var Batch = class Batch {
	id = uid++;
	#started = false;
	linked = true;
	#prev = null;
	#next = null;
	async_deriveds = /* @__PURE__ */ new Map();
	current = /* @__PURE__ */ new Map();
	previous = /* @__PURE__ */ new Map();
	#commit_callbacks = /* @__PURE__ */ new Set();
	#discard_callbacks = /* @__PURE__ */ new Set();
	#pending = 0;
	#blocking_pending = /* @__PURE__ */ new Map();
	#deferred = null;
	#roots = [];
	#new_effects = [];
	#dirty_effects = /* @__PURE__ */ new Set();
	#maybe_dirty_effects = /* @__PURE__ */ new Set();
	#skipped_branches = /* @__PURE__ */ new Map();
	#unskipped_branches = /* @__PURE__ */ new Set();
	is_fork = false;
	#decrement_queued = false;
	constructor() {
		if (last_batch === null) first_batch = last_batch = this;
		else {
			last_batch.#next = this;
			this.#prev = last_batch;
		}
		last_batch = this;
	}
	#is_deferred() {
		if (this.is_fork) return true;
		for (const effect of this.#blocking_pending.keys()) {
			var e = effect;
			var skipped = false;
			while (e.parent !== null) {
				if (this.#skipped_branches.has(e)) {
					skipped = true;
					break;
				}
				e = e.parent;
			}
			if (!skipped) return true;
		}
		return false;
	}
	skip_effect(effect) {
		if (!this.#skipped_branches.has(effect)) this.#skipped_branches.set(effect, {
			d: [],
			m: []
		});
		this.#unskipped_branches.delete(effect);
	}
	unskip_effect(effect, callback = (e$1) => this.schedule(e$1)) {
		var tracked = this.#skipped_branches.get(effect);
		if (tracked) {
			this.#skipped_branches.delete(effect);
			for (var e of tracked.d) {
				set_signal_status(e, DIRTY);
				callback(e);
			}
			for (e of tracked.m) {
				set_signal_status(e, MAYBE_DIRTY);
				callback(e);
			}
		}
		this.#unskipped_branches.add(effect);
	}
	#process() {
		this.#started = true;
		if (flush_count++ > 1e3) {
			this.#unlink();
			infinite_loop_guard();
		}
		for (const e of this.#dirty_effects) {
			this.#maybe_dirty_effects.delete(e);
			set_signal_status(e, DIRTY);
			this.schedule(e);
		}
		for (const e of this.#maybe_dirty_effects) {
			set_signal_status(e, MAYBE_DIRTY);
			this.schedule(e);
		}
		const roots = this.#roots;
		this.#roots = [];
		this.apply();
		var effects = collected_effects = [];
		var render_effects = [];
		var updates = legacy_updates = [];
		for (const root of roots) try {
			this.#traverse(root, effects, render_effects);
		} catch (e) {
			reset_all(root);
			if (!this.#is_deferred()) this.discard();
			throw e;
		}
		current_batch = null;
		if (updates.length > 0) {
			var batch = Batch.ensure();
			for (const e of updates) batch.schedule(e);
		}
		collected_effects = null;
		legacy_updates = null;
		if (this.#is_deferred()) {
			this.#defer_effects(render_effects);
			this.#defer_effects(effects);
			for (const [e, t] of this.#skipped_branches) reset_branch(e, t);
			if (updates.length > 0) current_batch.#process();
			return;
		}
		const earlier_batch = this.#find_earlier_batch();
		if (earlier_batch) {
			this.#defer_effects(render_effects);
			this.#defer_effects(effects);
			earlier_batch.#merge(this);
			return;
		}
		this.#dirty_effects.clear();
		this.#maybe_dirty_effects.clear();
		for (const fn of this.#commit_callbacks) fn(this);
		this.#commit_callbacks.clear();
		previous_batch = this;
		flush_queued_effects(render_effects);
		flush_queued_effects(effects);
		previous_batch = null;
		this.#deferred?.resolve();
		var next_batch = current_batch;
		if (this.#pending === 0 && (this.#roots.length === 0 || next_batch !== null)) this.#unlink();
		if (this.#roots.length > 0) if (next_batch !== null) {
			const batch$1 = next_batch;
			batch$1.#roots.push(...this.#roots.filter((r) => !batch$1.#roots.includes(r)));
		} else next_batch = this;
		if (next_batch !== null) next_batch.#process();
	}
	#traverse(root, effects, render_effects) {
		root.f ^= CLEAN;
		var effect = root.first;
		while (effect !== null) {
			var flags$1 = effect.f;
			var is_branch = (flags$1 & 96) !== 0;
			if (!(is_branch && (flags$1 & 1024) !== 0 || (flags$1 & 8192) !== 0 || this.#skipped_branches.has(effect)) && effect.fn !== null) {
				if (is_branch) effect.f ^= CLEAN;
				else if ((flags$1 & 4) !== 0) effects.push(effect);
				else if (is_dirty(effect)) {
					if ((flags$1 & 16) !== 0) this.#maybe_dirty_effects.add(effect);
					update_effect(effect);
				}
				var child = effect.first;
				if (child !== null) {
					effect = child;
					continue;
				}
			}
			while (effect !== null) {
				var next$1 = effect.next;
				if (next$1 !== null) {
					effect = next$1;
					break;
				}
				effect = effect.parent;
			}
		}
	}
	#find_earlier_batch() {
		var batch = this.#prev;
		while (batch !== null) {
			if (!batch.is_fork) {
				for (const [value, [, is_derived]] of this.current) if (batch.current.has(value) && !is_derived) return batch;
			}
			batch = batch.#prev;
		}
		return null;
	}
	#merge(batch) {
		for (const [source$1, value] of batch.current) {
			if (!this.previous.has(source$1) && batch.previous.has(source$1)) this.previous.set(source$1, batch.previous.get(source$1));
			this.current.set(source$1, value);
		}
		for (const [effect, deferred$1] of batch.async_deriveds) {
			const d = this.async_deriveds.get(effect);
			if (d) deferred$1.promise.then(d.resolve).catch(d.reject);
		}
		batch.async_deriveds.clear();
		this.transfer_effects(batch.#dirty_effects, batch.#maybe_dirty_effects);
		const mark = (value) => {
			var reactions = value.reactions;
			if (reactions === null) return;
			for (const reaction of reactions) {
				var flags$1 = reaction.f;
				if ((flags$1 & 2) !== 0) mark(reaction);
				else {
					var effect = reaction;
					if (flags$1 & 4194320 && !this.async_deriveds.has(effect)) {
						this.#maybe_dirty_effects.delete(effect);
						set_signal_status(effect, DIRTY);
						this.schedule(effect);
					}
				}
			}
		};
		for (const source$1 of this.current.keys()) mark(source$1);
		this.oncommit(() => batch.discard());
		batch.#unlink();
		current_batch = this;
		this.#process();
	}
	#defer_effects(effects) {
		for (var i = 0; i < effects.length; i += 1) defer_effect(effects[i], this.#dirty_effects, this.#maybe_dirty_effects);
	}
	capture(source$1, value, is_derived = false) {
		if (source$1.v !== UNINITIALIZED && !this.previous.has(source$1)) this.previous.set(source$1, source$1.v);
		if ((source$1.f & 8388608) === 0) {
			this.current.set(source$1, [value, is_derived]);
			batch_values?.set(source$1, value);
		}
		if (!this.is_fork) source$1.v = value;
	}
	activate() {
		current_batch = this;
	}
	deactivate() {
		current_batch = null;
		batch_values = null;
	}
	flush() {
		try {
			is_processing = true;
			current_batch = this;
			this.#process();
		} finally {
			flush_count = 0;
			last_scheduled_effect = null;
			collected_effects = null;
			legacy_updates = null;
			is_processing = false;
			current_batch = null;
			batch_values = null;
			old_values.clear();
		}
	}
	discard() {
		for (const fn of this.#discard_callbacks) fn(this);
		this.#discard_callbacks.clear();
		for (const deferred$1 of this.async_deriveds.values()) deferred$1.reject(OBSOLETE);
		this.#unlink();
		this.#deferred?.resolve();
	}
	register_created_effect(effect) {
		this.#new_effects.push(effect);
	}
	#commit() {
		for (let batch = first_batch; batch !== null; batch = batch.#next) {
			var is_earlier = batch.id < this.id;
			var sources = [];
			for (const [source$2, [value, is_derived]] of this.current) {
				if (batch.current.has(source$2)) {
					var batch_value = batch.current.get(source$2)[0];
					if (is_earlier && value !== batch_value) batch.current.set(source$2, [value, is_derived]);
					else continue;
				}
				sources.push(source$2);
			}
			if (is_earlier) for (const [effect, deferred$1] of this.async_deriveds) {
				const d = batch.async_deriveds.get(effect);
				if (d) deferred$1.promise.then(d.resolve).catch(d.reject);
			}
			var current = [...batch.current.keys()].filter((source$2) => !batch.current.get(source$2)[1]);
			if (!batch.#started || current.length === 0) continue;
			var others = current.filter((source$2) => !this.current.has(source$2));
			if (others.length === 0) {
				if (is_earlier) batch.discard();
			} else if (sources.length > 0) {
				if (is_earlier) for (const unskipped of this.#unskipped_branches) batch.unskip_effect(unskipped, (e) => {
					if ((e.f & 4194320) !== 0) batch.schedule(e);
					else batch.#defer_effects([e]);
				});
				batch.activate();
				var marked = /* @__PURE__ */ new Set();
				var checked = /* @__PURE__ */ new Map();
				for (var source$1 of sources) mark_effects(source$1, others, marked, checked);
				checked = /* @__PURE__ */ new Map();
				var current_unequal = [...batch.current].filter(([c, v1]) => {
					const v2 = this.current.get(c);
					if (!v2) return true;
					return v2[0] !== v1[0] || v2[1] !== v1[1];
				}).map(([c]) => c);
				if (current_unequal.length > 0) {
					for (const effect of this.#new_effects) if ((effect.f & 155648) === 0 && depends_on(effect, current_unequal, checked)) if ((effect.f & 4194320) !== 0) {
						set_signal_status(effect, DIRTY);
						batch.schedule(effect);
					} else batch.#dirty_effects.add(effect);
				}
				if (batch.#roots.length > 0 && !batch.#decrement_queued) {
					batch.apply();
					for (var root of batch.#roots) batch.#traverse(root, [], []);
					batch.#roots = [];
				}
				batch.deactivate();
			}
		}
	}
	increment(blocking, effect) {
		this.#pending += 1;
		if (blocking) {
			let blocking_pending_count = this.#blocking_pending.get(effect) ?? 0;
			this.#blocking_pending.set(effect, blocking_pending_count + 1);
		}
	}
	decrement(blocking, effect) {
		this.#pending -= 1;
		if (blocking) {
			let blocking_pending_count = this.#blocking_pending.get(effect) ?? 0;
			if (blocking_pending_count === 1) this.#blocking_pending.delete(effect);
			else this.#blocking_pending.set(effect, blocking_pending_count - 1);
		}
		if (this.#decrement_queued) return;
		this.#decrement_queued = true;
		queue_micro_task(() => {
			this.#decrement_queued = false;
			if (this.linked) this.flush();
		});
	}
	transfer_effects(dirty_effects, maybe_dirty_effects) {
		for (const e of dirty_effects) this.#dirty_effects.add(e);
		for (const e of maybe_dirty_effects) this.#maybe_dirty_effects.add(e);
		dirty_effects.clear();
		maybe_dirty_effects.clear();
	}
	oncommit(fn) {
		this.#commit_callbacks.add(fn);
	}
	ondiscard(fn) {
		this.#discard_callbacks.add(fn);
	}
	settled() {
		return (this.#deferred ??= deferred()).promise;
	}
	static ensure() {
		if (current_batch === null) {
			const batch = current_batch = new Batch();
			if (!is_processing && !is_flushing_sync) queue_micro_task(() => {
				if (!batch.#started) batch.flush();
			});
		}
		return current_batch;
	}
	apply() {
		batch_values = null;
	}
	schedule(effect) {
		last_scheduled_effect = effect;
		if (effect.b?.is_pending && (effect.f & 16777228) !== 0 && (effect.f & 32768) === 0) {
			effect.b.defer_effect(effect);
			return;
		}
		var e = effect;
		while (e.parent !== null) {
			e = e.parent;
			var flags$1 = e.f;
			if (collected_effects !== null && e === active_effect) {
				if ((active_reaction === null || (active_reaction.f & 2) === 0) && true) return;
			}
			if ((flags$1 & 96) !== 0) {
				if ((flags$1 & 1024) === 0) return;
				e.f ^= CLEAN;
			}
		}
		this.#roots.push(e);
	}
	#unlink() {
		if (!this.linked) return;
		var prev = this.#prev;
		var next$1 = this.#next;
		if (prev === null) first_batch = next$1;
		else prev.#next = next$1;
		if (next$1 === null) last_batch = prev;
		else next$1.#prev = prev;
		this.linked = false;
	}
};
function flushSync(fn) {
	var was_flushing_sync = is_flushing_sync;
	is_flushing_sync = true;
	try {
		var result;
		if (fn) {
			if (current_batch !== null && !current_batch.is_fork) current_batch.flush();
			result = fn();
		}
		while (true) {
			flush_tasks();
			if (current_batch === null) return result;
			current_batch.flush();
		}
	} finally {
		is_flushing_sync = was_flushing_sync;
	}
}
function infinite_loop_guard() {
	try {
		effect_update_depth_exceeded();
	} catch (error) {
		invoke_error_boundary(error, last_scheduled_effect);
	}
}
let eager_block_effects = null;
function flush_queued_effects(effects) {
	var length = effects.length;
	if (length === 0) return;
	var i = 0;
	while (i < length) {
		var effect = effects[i++];
		if ((effect.f & 24576) === 0 && is_dirty(effect)) {
			eager_block_effects = /* @__PURE__ */ new Set();
			update_effect(effect);
			if (effect.deps === null && effect.first === null && effect.nodes === null && effect.teardown === null && effect.ac === null) unlink_effect(effect);
			if (eager_block_effects?.size > 0) {
				old_values.clear();
				for (const e of eager_block_effects) {
					if ((e.f & 24576) !== 0) continue;
					const ordered_effects = [e];
					let ancestor = e.parent;
					while (ancestor !== null) {
						if (eager_block_effects.has(ancestor)) {
							eager_block_effects.delete(ancestor);
							ordered_effects.push(ancestor);
						}
						ancestor = ancestor.parent;
					}
					for (let j = ordered_effects.length - 1; j >= 0; j--) {
						const e$1 = ordered_effects[j];
						if ((e$1.f & 24576) !== 0) continue;
						update_effect(e$1);
					}
				}
				eager_block_effects.clear();
			}
		}
	}
	eager_block_effects = null;
}
function mark_effects(value, sources, marked, checked) {
	if (marked.has(value)) return;
	marked.add(value);
	if (value.reactions !== null) for (const reaction of value.reactions) {
		const flags$1 = reaction.f;
		if ((flags$1 & 2) !== 0) mark_effects(reaction, sources, marked, checked);
		else if ((flags$1 & 4194320) !== 0 && (flags$1 & 2048) === 0 && depends_on(reaction, sources, checked)) {
			set_signal_status(reaction, DIRTY);
			schedule_effect(reaction);
		}
	}
}
function depends_on(reaction, sources, checked) {
	const depends = checked.get(reaction);
	if (depends !== void 0) return depends;
	if (reaction.deps !== null) for (const dep of reaction.deps) {
		if (includes.call(sources, dep)) return true;
		if ((dep.f & 2) !== 0 && depends_on(dep, sources, checked)) {
			checked.set(dep, true);
			return true;
		}
	}
	checked.set(reaction, false);
	return false;
}
function schedule_effect(effect) {
	current_batch.schedule(effect);
}
function reset_branch(effect, tracked) {
	if ((effect.f & 32) !== 0 && (effect.f & 1024) !== 0) return;
	if ((effect.f & 2048) !== 0) tracked.d.push(effect);
	else if ((effect.f & 4096) !== 0) tracked.m.push(effect);
	set_signal_status(effect, CLEAN);
	var e = effect.first;
	while (e !== null) {
		reset_branch(e, tracked);
		e = e.next;
	}
}
function reset_all(effect) {
	set_signal_status(effect, CLEAN);
	var e = effect.first;
	while (e !== null) {
		reset_all(e);
		e = e.next;
	}
}
let eager_effects = /* @__PURE__ */ new Set();
const old_values = /* @__PURE__ */ new Map();
var eager_effects_deferred = false;
function source(v, stack$1) {
	return {
		f: 0,
		v,
		reactions: null,
		equals,
		rv: 0,
		wv: 0
	};
}
/* @__NO_SIDE_EFFECTS__ */
function state(v, stack$1) {
	const s = source(v, stack$1);
	push_reaction_value(s);
	return s;
}
/* @__NO_SIDE_EFFECTS__ */
function mutable_source(initial_value, immutable = false, trackable = true) {
	const s = source(initial_value);
	if (!immutable) s.equals = safe_equals;
	return s;
}
function set(source$1, value, should_proxy = false) {
	if (active_reaction !== null && (!untracking || (active_reaction.f & 131072) !== 0) && is_runes() && (active_reaction.f & 4325394) !== 0 && (current_sources === null || !current_sources.has(source$1))) state_unsafe_mutation();
	return internal_set(source$1, should_proxy ? proxy(value) : value, legacy_updates);
}
function internal_set(source$1, value, updated_during_traversal = null) {
	if (!source$1.equals(value)) {
		old_values.set(source$1, is_destroying_effect ? value : source$1.v);
		var batch = Batch.ensure();
		batch.capture(source$1, value);
		if ((source$1.f & 2) !== 0) {
			const derived$1 = source$1;
			if ((source$1.f & 2048) !== 0) execute_derived(derived$1);
			if (batch_values === null) update_derived_status(derived$1);
		}
		source$1.wv = increment_write_version();
		mark_reactions(source$1, DIRTY, updated_during_traversal);
		if (is_runes() && active_effect !== null && (active_effect.f & 1024) !== 0 && (active_effect.f & 96) === 0) if (untracked_writes === null) set_untracked_writes([source$1]);
		else untracked_writes.push(source$1);
		if (!batch.is_fork && eager_effects.size > 0 && !eager_effects_deferred) flush_eager_effects();
	}
	return value;
}
function flush_eager_effects() {
	eager_effects_deferred = false;
	for (const effect of eager_effects) {
		if ((effect.f & 1024) !== 0) set_signal_status(effect, MAYBE_DIRTY);
		let dirty;
		try {
			dirty = is_dirty(effect);
		} catch {
			dirty = true;
		}
		if (dirty) update_effect(effect);
	}
	eager_effects.clear();
}
function increment(source$1) {
	set(source$1, source$1.v + 1);
}
function mark_reactions(signal, status, updated_during_traversal) {
	var reactions = signal.reactions;
	if (reactions === null) return;
	var runes = is_runes();
	var length = reactions.length;
	for (var i = 0; i < length; i++) {
		var reaction = reactions[i];
		var flags$1 = reaction.f;
		if (!runes && reaction === active_effect) continue;
		var not_dirty = (flags$1 & DIRTY) === 0;
		if (not_dirty) set_signal_status(reaction, status);
		if ((flags$1 & 131072) !== 0) eager_effects.add(reaction);
		else if ((flags$1 & 2) !== 0) {
			var derived$1 = reaction;
			batch_values?.delete(derived$1);
			if ((flags$1 & 65536) === 0) {
				if (flags$1 & 512 && (active_effect === null || (active_effect.f & 2097152) === 0)) reaction.f |= WAS_MARKED;
				mark_reactions(derived$1, MAYBE_DIRTY, updated_during_traversal);
			}
		} else if (not_dirty) {
			var effect = reaction;
			if ((flags$1 & 16) !== 0 && eager_block_effects !== null) eager_block_effects.add(effect);
			if (updated_during_traversal !== null) updated_during_traversal.push(effect);
			else schedule_effect(effect);
		}
	}
}
function proxy(value) {
	if (typeof value !== "object" || value === null || STATE_SYMBOL in value) return value;
	const prototype = get_prototype_of(value);
	if (prototype !== object_prototype && prototype !== array_prototype) return value;
	var sources = /* @__PURE__ */ new Map();
	var is_proxied_array = is_array(value);
	var version = /* @__PURE__ */ state(0);
	var stack$1 = null;
	var parent_version = update_version;
	var with_parent = (fn) => {
		if (update_version === parent_version) return fn();
		var reaction = active_reaction;
		var version$1 = update_version;
		set_active_reaction(null);
		set_update_version(parent_version);
		var result = fn();
		set_active_reaction(reaction);
		set_update_version(version$1);
		return result;
	};
	if (is_proxied_array) sources.set("length", /* @__PURE__ */ state(value.length, stack$1));
	return new Proxy(value, {
		defineProperty(_, prop, descriptor) {
			if (!("value" in descriptor) || descriptor.configurable === false || descriptor.enumerable === false || descriptor.writable === false) state_descriptors_fixed();
			var s = sources.get(prop);
			if (s === void 0) with_parent(() => {
				var s$1 = /* @__PURE__ */ state(descriptor.value, stack$1);
				sources.set(prop, s$1);
				return s$1;
			});
			else set(s, descriptor.value, true);
			return true;
		},
		deleteProperty(target, prop) {
			var s = sources.get(prop);
			if (s === void 0) {
				if (prop in target) {
					const s$1 = with_parent(() => /* @__PURE__ */ state(UNINITIALIZED, stack$1));
					sources.set(prop, s$1);
					increment(version);
				}
			} else {
				set(s, UNINITIALIZED);
				increment(version);
			}
			return true;
		},
		get(target, prop, receiver) {
			if (prop === STATE_SYMBOL) return value;
			var s = sources.get(prop);
			var exists = prop in target;
			if (s === void 0 && (!exists || get_descriptor(target, prop)?.writable)) {
				s = with_parent(() => {
					return /* @__PURE__ */ state(proxy(exists ? target[prop] : UNINITIALIZED), stack$1);
				});
				sources.set(prop, s);
			}
			if (s !== void 0) {
				var v = get(s);
				return v === UNINITIALIZED ? void 0 : v;
			}
			return Reflect.get(target, prop, receiver);
		},
		getOwnPropertyDescriptor(target, prop) {
			var descriptor = Reflect.getOwnPropertyDescriptor(target, prop);
			if (descriptor && "value" in descriptor) {
				var s = sources.get(prop);
				if (s) descriptor.value = get(s);
			} else if (descriptor === void 0) {
				var source$1 = sources.get(prop);
				var value$1 = source$1?.v;
				if (source$1 !== void 0 && value$1 !== UNINITIALIZED) return {
					enumerable: true,
					configurable: true,
					value: value$1,
					writable: true
				};
			}
			return descriptor;
		},
		has(target, prop) {
			if (prop === STATE_SYMBOL) return true;
			var s = sources.get(prop);
			var has = s !== void 0 && s.v !== UNINITIALIZED || Reflect.has(target, prop);
			if (s !== void 0 || active_effect !== null && (!has || get_descriptor(target, prop)?.writable)) {
				if (s === void 0) {
					s = with_parent(() => {
						return /* @__PURE__ */ state(has ? proxy(target[prop]) : UNINITIALIZED, stack$1);
					});
					sources.set(prop, s);
				}
				if (get(s) === UNINITIALIZED) return false;
			}
			return has;
		},
		set(target, prop, value$1, receiver) {
			var s = sources.get(prop);
			var has = prop in target;
			if (is_proxied_array && prop === "length") for (var i = value$1; i < s.v; i += 1) {
				var other_s = sources.get(i + "");
				if (other_s !== void 0) set(other_s, UNINITIALIZED);
				else if (i in target) {
					other_s = with_parent(() => /* @__PURE__ */ state(UNINITIALIZED, stack$1));
					sources.set(i + "", other_s);
				}
			}
			if (s === void 0) {
				if (!has || get_descriptor(target, prop)?.writable) {
					s = with_parent(() => /* @__PURE__ */ state(void 0, stack$1));
					set(s, proxy(value$1));
					sources.set(prop, s);
				}
			} else {
				has = s.v !== UNINITIALIZED;
				var p = with_parent(() => proxy(value$1));
				set(s, p);
			}
			var descriptor = Reflect.getOwnPropertyDescriptor(target, prop);
			if (descriptor?.set) descriptor.set.call(receiver, value$1);
			if (!has) {
				if (is_proxied_array && typeof prop === "string") {
					var ls = sources.get("length");
					var n = Number(prop);
					if (Number.isInteger(n) && n >= ls.v) set(ls, n + 1);
				}
				increment(version);
			}
			return true;
		},
		ownKeys(target) {
			get(version);
			var own_keys = Reflect.ownKeys(target).filter((key$1) => {
				var source$2 = sources.get(key$1);
				return source$2 === void 0 || source$2.v !== UNINITIALIZED;
			});
			for (var [key, source$1] of sources) if (source$1.v !== UNINITIALIZED && !(key in target)) own_keys.push(key);
			return own_keys;
		},
		setPrototypeOf() {
			state_prototype_fixed();
		}
	});
}
var $window;
var first_child_getter;
var next_sibling_getter;
function init_operations() {
	if ($window !== void 0) return;
	$window = window;
	document;
	/Firefox/.test(navigator.userAgent);
	var element_prototype = Element.prototype;
	var node_prototype = Node.prototype;
	var text_prototype = Text.prototype;
	first_child_getter = get_descriptor(node_prototype, "firstChild").get;
	next_sibling_getter = get_descriptor(node_prototype, "nextSibling").get;
	if (is_extensible(element_prototype)) {
		element_prototype[CLASS_CACHE] = void 0;
		element_prototype[ATTRIBUTES_CACHE] = null;
		element_prototype[STYLE_CACHE] = void 0;
		element_prototype.__e = void 0;
	}
	if (is_extensible(text_prototype)) text_prototype[TEXT_CACHE] = void 0;
}
function create_text(value = "") {
	return document.createTextNode(value);
}
/* @__NO_SIDE_EFFECTS__ */
function get_first_child(node) {
	return first_child_getter.call(node);
}
/* @__NO_SIDE_EFFECTS__ */
function get_next_sibling(node) {
	return next_sibling_getter.call(node);
}
function clear_text_content(node) {
	node.textContent = "";
}
function create_element(tag$1, namespace, is) {
	if (namespace == null || namespace === "http://www.w3.org/1999/xhtml") return is ? document.createElement(tag$1, { is }) : document.createElement(tag$1);
	return is ? document.createElementNS(namespace, tag$1, { is }) : document.createElementNS(namespace, tag$1);
}
function without_reactive_context(fn) {
	var previous_reaction = active_reaction;
	var previous_effect = active_effect;
	set_active_reaction(null);
	set_active_effect(null);
	try {
		return fn();
	} finally {
		set_active_reaction(previous_reaction);
		set_active_effect(previous_effect);
	}
}
function push_effect(effect, parent_effect) {
	var parent_last = parent_effect.last;
	if (parent_last === null) parent_effect.last = parent_effect.first = effect;
	else {
		parent_last.next = effect;
		effect.prev = parent_last;
		parent_effect.last = effect;
	}
}
function create_effect(type, fn) {
	var parent = active_effect;
	if (parent !== null && (parent.f & 8192) !== 0) type |= INERT;
	var effect = {
		ctx: component_context,
		deps: null,
		nodes: null,
		f: type | 2560,
		first: null,
		fn,
		last: null,
		next: null,
		parent,
		b: parent && parent.b,
		prev: null,
		teardown: null,
		wv: 0,
		ac: null
	};
	current_batch?.register_created_effect(effect);
	var e = effect;
	if ((type & 4) !== 0) if (collected_effects !== null) collected_effects.push(effect);
	else Batch.ensure().schedule(effect);
	else if (fn !== null) {
		try {
			update_effect(effect);
		} catch (e$1) {
			destroy_effect(effect);
			throw e$1;
		}
		if (e.deps === null && e.teardown === null && e.nodes === null && e.first === e.last && (e.f & 524288) === 0) {
			e = e.first;
			if ((type & 16) !== 0 && (type & 65536) !== 0 && e !== null) e.f |= EFFECT_TRANSPARENT;
		}
	}
	if (e !== null) {
		e.parent = parent;
		if (parent !== null) push_effect(e, parent);
		if (active_reaction !== null && (active_reaction.f & 2) !== 0 && (type & 64) === 0) {
			var derived$1 = active_reaction;
			(derived$1.effects ??= []).push(e);
		}
	}
	return effect;
}
function effect_tracking() {
	return active_reaction !== null && !untracking;
}
function create_user_effect(fn) {
	return create_effect(4 | USER_EFFECT, fn);
}
function effect_root(fn) {
	Batch.ensure();
	const effect = create_effect(64 | EFFECT_PRESERVED, fn);
	return () => {
		destroy_effect(effect);
	};
}
function component_root(fn) {
	Batch.ensure();
	const effect = create_effect(64 | EFFECT_PRESERVED, fn);
	return (options = {}) => {
		return new Promise((fulfil) => {
			if (options.outro) pause_effect(effect, () => {
				destroy_effect(effect);
				fulfil(void 0);
			});
			else {
				destroy_effect(effect);
				fulfil(void 0);
			}
		});
	};
}
function render_effect(fn, flags$1 = 0) {
	return create_effect(8 | flags$1, fn);
}
function block(fn, flags$1 = 0) {
	return create_effect(16 | flags$1, fn);
}
function branch(fn) {
	return create_effect(32 | EFFECT_PRESERVED, fn);
}
function execute_effect_teardown(effect) {
	var teardown$1 = effect.teardown;
	if (teardown$1 !== null) {
		const previously_destroying_effect = is_destroying_effect;
		const previous_reaction = active_reaction;
		set_is_destroying_effect(true);
		set_active_reaction(null);
		try {
			teardown$1.call(null);
		} finally {
			set_is_destroying_effect(previously_destroying_effect);
			set_active_reaction(previous_reaction);
		}
	}
}
function destroy_effect_children(signal, remove_dom = false) {
	var effect = signal.first;
	signal.first = signal.last = null;
	while (effect !== null) {
		const controller$1 = effect.ac;
		if (controller$1 !== null) without_reactive_context(() => {
			controller$1.abort(STALE_REACTION);
		});
		var next$1 = effect.next;
		if ((effect.f & 64) !== 0) effect.parent = null;
		else destroy_effect(effect, remove_dom);
		effect = next$1;
	}
}
function destroy_block_effect_children(signal) {
	var effect = signal.first;
	while (effect !== null) {
		var next$1 = effect.next;
		if ((effect.f & 32) === 0) destroy_effect(effect);
		effect = next$1;
	}
}
function destroy_effect(effect, remove_dom = true) {
	var removed = false;
	if ((remove_dom || (effect.f & 262144) !== 0) && effect.nodes !== null && effect.nodes.end !== null) {
		remove_effect_dom(effect.nodes.start, effect.nodes.end);
		removed = true;
	}
	effect.f |= DESTROYING;
	destroy_effect_children(effect, remove_dom && !removed);
	remove_reactions(effect, 0);
	var transitions = effect.nodes && effect.nodes.t;
	if (transitions !== null) for (const transition of transitions) transition.stop();
	execute_effect_teardown(effect);
	effect.f ^= DESTROYING;
	effect.f |= DESTROYED;
	var parent = effect.parent;
	if (parent !== null && parent.first !== null) unlink_effect(effect);
	effect.next = effect.prev = effect.teardown = effect.ctx = effect.deps = effect.fn = effect.nodes = effect.ac = effect.b = null;
}
function remove_effect_dom(node, end) {
	while (node !== null) {
		var next$1 = node === end ? null : /* @__PURE__ */ get_next_sibling(node);
		node.remove();
		node = next$1;
	}
}
function unlink_effect(effect) {
	var parent = effect.parent;
	var prev = effect.prev;
	var next$1 = effect.next;
	if (prev !== null) prev.next = next$1;
	if (next$1 !== null) next$1.prev = prev;
	if (parent !== null) {
		if (parent.first === effect) parent.first = next$1;
		if (parent.last === effect) parent.last = prev;
	}
}
function pause_effect(effect, callback, destroy = true) {
	var transitions = [];
	pause_children(effect, transitions, true);
	var fn = () => {
		if (destroy) destroy_effect(effect);
		if (callback) callback();
	};
	var remaining = transitions.length;
	if (remaining > 0) {
		var check = () => --remaining || fn();
		for (var transition of transitions) transition.out(check);
	} else fn();
}
function pause_children(effect, transitions, local) {
	if ((effect.f & 8192) !== 0) return;
	effect.f ^= INERT;
	var t = effect.nodes && effect.nodes.t;
	if (t !== null) {
		for (const transition of t) if (transition.is_global || local) transitions.push(transition);
	}
	var child = effect.first;
	while (child !== null) {
		var sibling = child.next;
		if ((child.f & 64) === 0) {
			var transparent = (child.f & 65536) !== 0 || (child.f & 32) !== 0 && (effect.f & 16) !== 0;
			pause_children(child, transitions, transparent ? local : false);
		}
		child = sibling;
	}
}
function move_effect(effect, fragment) {
	if (!effect.nodes) return;
	var node = effect.nodes.start;
	var end = effect.nodes.end;
	while (node !== null) {
		var next$1 = node === end ? null : /* @__PURE__ */ get_next_sibling(node);
		fragment.append(node);
		node = next$1;
	}
}
let captured_signals = null;
var is_updating_effect = false;
let is_destroying_effect = false;
function set_is_destroying_effect(value) {
	is_destroying_effect = value;
}
let active_reaction = null;
let untracking = false;
function set_active_reaction(reaction) {
	active_reaction = reaction;
}
let active_effect = null;
function set_active_effect(effect) {
	active_effect = effect;
}
let current_sources = null;
function push_reaction_value(value) {
	if (active_reaction !== null && true) (current_sources ??= /* @__PURE__ */ new Set()).add(value);
}
let new_deps = null;
let skipped_deps = 0;
let untracked_writes = null;
function set_untracked_writes(value) {
	untracked_writes = value;
}
let write_version = 1;
var read_version = 0;
let update_version = read_version;
function set_update_version(value) {
	update_version = value;
}
function increment_write_version() {
	return ++write_version;
}
function is_dirty(reaction) {
	var flags$1 = reaction.f;
	if ((flags$1 & 2048) !== 0) return true;
	if (flags$1 & 2) reaction.f &= ~WAS_MARKED;
	if ((flags$1 & 4096) !== 0) {
		var dependencies = reaction.deps;
		var length = dependencies.length;
		for (var i = 0; i < length; i++) {
			var dependency = dependencies[i];
			if (is_dirty(dependency)) update_derived(dependency);
			if (dependency.wv > reaction.wv) return true;
		}
		if ((flags$1 & 512) !== 0 && batch_values === null) set_signal_status(reaction, CLEAN);
	}
	return false;
}
function schedule_possible_effect_self_invalidation(signal, effect, root = true) {
	var reactions = signal.reactions;
	if (reactions === null) return;
	if (current_sources !== null && current_sources.has(signal)) return;
	for (var i = 0; i < reactions.length; i++) {
		var reaction = reactions[i];
		if ((reaction.f & 2) !== 0) schedule_possible_effect_self_invalidation(reaction, effect, false);
		else if (effect === reaction) {
			if (root) set_signal_status(reaction, DIRTY);
			else if ((reaction.f & 1024) !== 0) set_signal_status(reaction, MAYBE_DIRTY);
			schedule_effect(reaction);
		}
	}
}
function update_reaction(reaction) {
	var previous_deps = new_deps;
	var previous_skipped_deps = skipped_deps;
	var previous_untracked_writes = untracked_writes;
	var previous_reaction = active_reaction;
	var previous_sources = current_sources;
	var previous_component_context = component_context;
	var previous_untracking = untracking;
	var previous_update_version = update_version;
	var flags$1 = reaction.f;
	new_deps = null;
	skipped_deps = 0;
	untracked_writes = null;
	active_reaction = (flags$1 & 96) === 0 ? reaction : null;
	current_sources = null;
	set_component_context(reaction.ctx);
	untracking = false;
	update_version = ++read_version;
	if (reaction.ac !== null) {
		without_reactive_context(() => {
			reaction.ac.abort(STALE_REACTION);
		});
		reaction.ac = null;
	}
	try {
		reaction.f |= REACTION_IS_UPDATING;
		var fn = reaction.fn;
		var result = fn();
		reaction.f |= REACTION_RAN;
		var deps = reaction.deps;
		var is_fork = current_batch?.is_fork;
		if (new_deps !== null) {
			var i;
			if (!is_fork) remove_reactions(reaction, skipped_deps);
			if (deps !== null && skipped_deps > 0) {
				deps.length = skipped_deps + new_deps.length;
				for (i = 0; i < new_deps.length; i++) deps[skipped_deps + i] = new_deps[i];
			} else reaction.deps = deps = new_deps;
			if (effect_tracking() && (reaction.f & 512) !== 0) for (i = skipped_deps; i < deps.length; i++) (deps[i].reactions ??= []).push(reaction);
		} else if (!is_fork && deps !== null && skipped_deps < deps.length) {
			remove_reactions(reaction, skipped_deps);
			deps.length = skipped_deps;
		}
		if (is_runes() && untracked_writes !== null && !untracking && deps !== null && (reaction.f & 6146) === 0) for (i = 0; i < untracked_writes.length; i++) schedule_possible_effect_self_invalidation(untracked_writes[i], reaction);
		if (previous_reaction !== null && previous_reaction !== reaction) {
			read_version++;
			if (previous_reaction.deps !== null) for (let i$1 = 0; i$1 < previous_skipped_deps; i$1 += 1) previous_reaction.deps[i$1].rv = read_version;
			if (previous_deps !== null) for (const dep of previous_deps) dep.rv = read_version;
			if (untracked_writes !== null) if (previous_untracked_writes === null) previous_untracked_writes = untracked_writes;
			else previous_untracked_writes.push(...untracked_writes);
		}
		if ((reaction.f & 8388608) !== 0) reaction.f ^= ERROR_VALUE;
		return result;
	} catch (error) {
		return handle_error(error);
	} finally {
		reaction.f ^= REACTION_IS_UPDATING;
		new_deps = previous_deps;
		skipped_deps = previous_skipped_deps;
		untracked_writes = previous_untracked_writes;
		active_reaction = previous_reaction;
		current_sources = previous_sources;
		set_component_context(previous_component_context);
		untracking = previous_untracking;
		update_version = previous_update_version;
	}
}
function remove_reaction(signal, dependency) {
	let reactions = dependency.reactions;
	if (reactions !== null) {
		var index = index_of.call(reactions, signal);
		if (index !== -1) {
			var new_length = reactions.length - 1;
			if (new_length === 0) reactions = dependency.reactions = null;
			else {
				reactions[index] = reactions[new_length];
				reactions.pop();
			}
		}
	}
	if (reactions === null && (dependency.f & 2) !== 0 && (new_deps === null || !includes.call(new_deps, dependency))) {
		var derived$1 = dependency;
		if ((derived$1.f & 512) !== 0) {
			derived$1.f ^= 512;
			derived$1.f &= ~WAS_MARKED;
		}
		if (derived$1.v !== UNINITIALIZED) update_derived_status(derived$1);
		freeze_derived_effects(derived$1);
		remove_reactions(derived$1, 0);
	}
}
function remove_reactions(signal, start_index) {
	var dependencies = signal.deps;
	if (dependencies === null) return;
	for (var i = start_index; i < dependencies.length; i++) remove_reaction(signal, dependencies[i]);
}
function update_effect(effect) {
	var flags$1 = effect.f;
	if ((flags$1 & 16384) !== 0) return;
	set_signal_status(effect, CLEAN);
	var previous_effect = active_effect;
	var was_updating_effect = is_updating_effect;
	active_effect = effect;
	is_updating_effect = true;
	try {
		if ((flags$1 & 16777232) !== 0) destroy_block_effect_children(effect);
		else destroy_effect_children(effect);
		execute_effect_teardown(effect);
		var teardown$1 = update_reaction(effect);
		effect.teardown = typeof teardown$1 === "function" ? teardown$1 : null;
		effect.wv = write_version;
	} finally {
		is_updating_effect = was_updating_effect;
		active_effect = previous_effect;
	}
}
function get(signal) {
	var is_derived = (signal.f & 2) !== 0;
	captured_signals?.add(signal);
	if (active_reaction !== null && !untracking) {
		if (!(active_effect !== null && (active_effect.f & 16384) !== 0) && (current_sources === null || !current_sources.has(signal))) {
			var deps = active_reaction.deps;
			if ((active_reaction.f & 2097152) !== 0) {
				if (signal.rv < read_version) {
					signal.rv = read_version;
					if (new_deps === null && deps !== null && deps[skipped_deps] === signal) skipped_deps++;
					else if (new_deps === null) new_deps = [signal];
					else new_deps.push(signal);
				}
			} else {
				active_reaction.deps ??= [];
				if (!includes.call(active_reaction.deps, signal)) active_reaction.deps.push(signal);
				var reactions = signal.reactions;
				if (reactions === null) signal.reactions = [active_reaction];
				else if (!includes.call(reactions, active_reaction)) reactions.push(active_reaction);
			}
		}
	}
	if (is_destroying_effect && old_values.has(signal)) return old_values.get(signal);
	if (is_derived) {
		var derived$1 = signal;
		if (is_destroying_effect) {
			var value = derived$1.v;
			if ((derived$1.f & 1024) === 0 && derived$1.reactions !== null || depends_on_old_values(derived$1)) value = execute_derived(derived$1);
			old_values.set(derived$1, value);
			return value;
		}
		var should_connect = (derived$1.f & 512) === 0 && !untracking && active_reaction !== null && (is_updating_effect || (active_reaction.f & 512) !== 0);
		var is_new = (derived$1.f & REACTION_RAN) === 0;
		if (is_dirty(derived$1)) {
			if (should_connect) derived$1.f |= 512;
			update_derived(derived$1);
		}
		if (should_connect && !is_new) {
			unfreeze_derived_effects(derived$1);
			reconnect(derived$1);
		}
	}
	if (batch_values?.has(signal)) return batch_values.get(signal);
	if ((signal.f & 8388608) !== 0) throw signal.v;
	return signal.v;
}
function reconnect(derived$1) {
	derived$1.f |= 512;
	if (derived$1.deps === null) return;
	for (const dep of derived$1.deps) {
		(dep.reactions ??= []).push(derived$1);
		if ((dep.f & 2) !== 0 && (dep.f & 512) === 0) {
			unfreeze_derived_effects(dep);
			reconnect(dep);
		}
	}
}
function depends_on_old_values(derived$1) {
	if (derived$1.v === UNINITIALIZED) return true;
	if (derived$1.deps === null) return false;
	for (const dep of derived$1.deps) {
		if (old_values.has(dep)) return true;
		if ((dep.f & 2) !== 0 && depends_on_old_values(dep)) return true;
	}
	return false;
}
function untrack(fn) {
	var previous_untracking = untracking;
	try {
		untracking = true;
		return fn();
	} finally {
		untracking = previous_untracking;
	}
}
var subscriber_queue = [];
function readable(value, start) {
	return { subscribe: writable(value, start).subscribe };
}
function writable(value, start = noop) {
	let stop = null;
	const subscribers = /* @__PURE__ */ new Set();
	function set$1(new_value) {
		if (safe_not_equal(value, new_value)) {
			value = new_value;
			if (stop) {
				const run_queue = !subscriber_queue.length;
				for (const subscriber of subscribers) {
					subscriber[1]();
					subscriber_queue.push(subscriber, value);
				}
				if (run_queue) {
					for (let i = 0; i < subscriber_queue.length; i += 2) subscriber_queue[i][0](subscriber_queue[i + 1]);
					subscriber_queue.length = 0;
				}
			}
		}
	}
	function update$1(fn) {
		set$1(fn(value));
	}
	function subscribe(run$1, invalidate = noop) {
		const subscriber = [run$1, invalidate];
		subscribers.add(subscriber);
		if (subscribers.size === 1) stop = start(set$1, update$1) || noop;
		run$1(value);
		return () => {
			subscribers.delete(subscriber);
			if (subscribers.size === 0 && stop) {
				stop();
				stop = null;
			}
		};
	}
	return {
		set: set$1,
		update: update$1,
		subscribe
	};
}
const event_symbol = Symbol("events");
const all_registered_events = /* @__PURE__ */ new Set();
const root_event_handles = /* @__PURE__ */ new Set();
function create_event(event_name, dom, handler, options = {}) {
	function target_handler(event) {
		if (!options.capture) handle_event_propagation.call(dom, event);
		if (!event.cancelBubble) return without_reactive_context(() => {
			return handler?.call(this, event);
		});
	}
	if (event_name.startsWith("pointer") || event_name.startsWith("touch") || event_name === "wheel") queue_micro_task(() => {
		dom.addEventListener(event_name, target_handler, options);
	});
	else dom.addEventListener(event_name, target_handler, options);
	return target_handler;
}
function on(element$1, type, handler, options = {}) {
	var target_handler = create_event(type, element$1, handler, options);
	return () => {
		element$1.removeEventListener(type, target_handler, options);
	};
}
var last_propagated_event = null;
function handle_event_propagation(event) {
	var handler_element = this;
	var owner_document = handler_element.ownerDocument;
	var event_name = event.type;
	var path = event.composedPath?.() || [];
	var current_target = path[0] || event.target;
	last_propagated_event = event;
	var path_idx = 0;
	var handled_at = last_propagated_event === event && event[event_symbol];
	if (handled_at) {
		var at_idx = path.indexOf(handled_at);
		if (at_idx !== -1 && (handler_element === document || handler_element === window)) {
			event[event_symbol] = handler_element;
			return;
		}
		var handler_idx = path.indexOf(handler_element);
		if (handler_idx === -1) return;
		if (at_idx <= handler_idx) path_idx = at_idx;
	}
	current_target = path[path_idx] || event.target;
	if (current_target === handler_element) return;
	define_property(event, "currentTarget", {
		configurable: true,
		get() {
			return current_target || owner_document;
		}
	});
	var previous_reaction = active_reaction;
	var previous_effect = active_effect;
	set_active_reaction(null);
	set_active_effect(null);
	try {
		var throw_error;
		var other_errors = [];
		while (current_target !== null) {
			if (current_target === handler_element) break;
			try {
				var delegated = current_target[event_symbol]?.[event_name];
				if (delegated != null && (!current_target.disabled || event.target === current_target)) delegated.call(current_target, event);
			} catch (error) {
				if (throw_error) other_errors.push(error);
				else throw_error = error;
			}
			if (event.cancelBubble) break;
			path_idx++;
			current_target = path_idx < path.length ? path[path_idx] : null;
		}
		if (throw_error) {
			for (let error of other_errors) queueMicrotask(() => {
				throw error;
			});
			throw throw_error;
		}
	} finally {
		event[event_symbol] = handler_element;
		delete event.currentTarget;
		set_active_reaction(previous_reaction);
		set_active_effect(previous_effect);
	}
}
globalThis?.window?.trustedTypes;
function assign_nodes(start, end) {
	var effect = active_effect;
	if (effect.nodes === null) effect.nodes = {
		start,
		end,
		a: null,
		t: null
	};
}
function append(anchor, dom) {
	if (hydrating) {
		var effect = active_effect;
		if ((effect.f & 32768) === 0 || effect.nodes.end === null) effect.nodes.end = hydrate_node;
		hydrate_next();
		return;
	}
	if (anchor === null) return;
	anchor.before(dom);
}
var VOID_ELEMENT_NAMES = [
	"area",
	"base",
	"br",
	"col",
	"command",
	"embed",
	"hr",
	"img",
	"input",
	"keygen",
	"link",
	"meta",
	"param",
	"source",
	"track",
	"wbr"
];
function is_void(name) {
	return VOID_ELEMENT_NAMES.includes(name) || name.toLowerCase() === "!doctype";
}
var DOM_BOOLEAN_ATTRIBUTES = [
	"allowfullscreen",
	"async",
	"autofocus",
	"autoplay",
	"checked",
	"controls",
	"default",
	"disabled",
	"formnovalidate",
	"indeterminate",
	"inert",
	"ismap",
	"loop",
	"multiple",
	"muted",
	"nomodule",
	"novalidate",
	"open",
	"playsinline",
	"readonly",
	"required",
	"reversed",
	"seamless",
	"selected",
	"webkitdirectory",
	"defer",
	"disablepictureinpicture",
	"disableremoteplayback"
];
function is_boolean_attribute(name) {
	return DOM_BOOLEAN_ATTRIBUTES.includes(name);
}
[...DOM_BOOLEAN_ATTRIBUTES];
var PASSIVE_EVENTS = ["touchstart", "touchmove"];
function is_passive_event(name) {
	return PASSIVE_EVENTS.includes(name);
}
var RAW_TEXT_ELEMENTS = [
	"textarea",
	"script",
	"style",
	"title"
];
function is_raw_text_element(name) {
	return RAW_TEXT_ELEMENTS.includes(name);
}
const REGEX_VALID_TAG_NAME = /^[a-zA-Z][a-zA-Z0-9]*(-[a-zA-Z0-9.\-_\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u{10000}-\u{EFFFF}]*)?$/u;
function mount$1(component, options) {
	return _mount(component, options);
}
function hydrate$1(component, options) {
	init_operations();
	options.intro = options.intro ?? false;
	const target = options.target;
	const was_hydrating = hydrating;
	const previous_hydrate_node = hydrate_node;
	try {
		var anchor = /* @__PURE__ */ get_first_child(target);
		while (anchor && (anchor.nodeType !== 8 || anchor.data !== "[")) anchor = /* @__PURE__ */ get_next_sibling(anchor);
		if (!anchor) throw HYDRATION_ERROR;
		set_hydrating(true);
		set_hydrate_node(anchor);
		const instance = _mount(component, {
			...options,
			anchor
		});
		set_hydrating(false);
		return instance;
	} catch (error) {
		if (error instanceof Error && error.message.split("\n").some((line) => line.startsWith("https://svelte.dev/e/"))) throw error;
		if (error !== HYDRATION_ERROR) console.warn("Failed to hydrate: ", error);
		if (options.recover === false) hydration_failed();
		init_operations();
		clear_text_content(target);
		set_hydrating(false);
		return mount$1(component, options);
	} finally {
		set_hydrating(was_hydrating);
		set_hydrate_node(previous_hydrate_node);
	}
}
var listeners = /* @__PURE__ */ new Map();
function _mount(Component, { target, anchor, props = {}, events, context: context$1, intro = true, transformError }) {
	init_operations();
	var component = void 0;
	var unmount$2 = component_root(() => {
		var anchor_node = anchor ?? target.appendChild(create_text());
		boundary(anchor_node, { pending: () => {} }, (anchor_node$1) => {
			push$1({});
			var ctx = component_context;
			if (context$1) ctx.c = context$1;
			if (events) props.$$events = events;
			if (hydrating) assign_nodes(anchor_node$1, null);
			component = Component(anchor_node$1, props) || {};
			if (hydrating) {
				active_effect.nodes.end = hydrate_node;
				if (hydrate_node === null || hydrate_node.nodeType !== 8 || hydrate_node.data !== "]") {
					hydration_mismatch();
					throw HYDRATION_ERROR;
				}
			}
			pop$1();
		}, transformError);
		var registered_events = /* @__PURE__ */ new Set();
		var event_handle = (events$1) => {
			for (var i = 0; i < events$1.length; i++) {
				var event_name = events$1[i];
				if (registered_events.has(event_name)) continue;
				registered_events.add(event_name);
				var passive = is_passive_event(event_name);
				for (const node of [target, document]) {
					var counts = listeners.get(node);
					if (counts === void 0) {
						counts = /* @__PURE__ */ new Map();
						listeners.set(node, counts);
					}
					var count = counts.get(event_name);
					if (count === void 0) {
						node.addEventListener(event_name, handle_event_propagation, { passive });
						counts.set(event_name, 1);
					} else counts.set(event_name, count + 1);
				}
			}
		};
		event_handle(array_from(all_registered_events));
		root_event_handles.add(event_handle);
		return () => {
			for (var event_name of registered_events) for (const node of [target, document]) {
				var counts = listeners.get(node);
				var count = counts.get(event_name);
				if (--count == 0) {
					node.removeEventListener(event_name, handle_event_propagation);
					counts.delete(event_name);
					if (counts.size === 0) listeners.delete(node);
				} else counts.set(event_name, count);
			}
			root_event_handles.delete(event_handle);
			if (anchor_node !== anchor) anchor_node.parentNode?.removeChild(anchor_node);
		};
	});
	mounted_components.set(component, unmount$2);
	return component;
}
var mounted_components = /* @__PURE__ */ new WeakMap();
function unmount$1(component, options) {
	const fn = mounted_components.get(component);
	if (fn) {
		mounted_components.delete(component);
		return fn(options);
	}
	return Promise.resolve();
}
function createClassComponent(options) {
	return new Svelte4Component(options);
}
function asClassComponent(component) {
	return class extends Svelte4Component {
		constructor(options) {
			super({
				component,
				...options
			});
		}
	};
}
var Svelte4Component = class {
	#events;
	#instance;
	constructor(options) {
		var sources = /* @__PURE__ */ new Map();
		var add_source = (key, value) => {
			var s = /* @__PURE__ */ mutable_source(value, false, false);
			sources.set(key, s);
			return s;
		};
		const props = new Proxy({
			...options.props || {},
			$$events: {}
		}, {
			get(target, prop) {
				return get(sources.get(prop) ?? add_source(prop, Reflect.get(target, prop)));
			},
			has(target, prop) {
				if (prop === LEGACY_PROPS) return true;
				get(sources.get(prop) ?? add_source(prop, Reflect.get(target, prop)));
				return Reflect.has(target, prop);
			},
			set(target, prop, value) {
				set(sources.get(prop) ?? add_source(prop, value), value);
				return Reflect.set(target, prop, value);
			}
		});
		this.#instance = (options.hydrate ? hydrate$1 : mount$1)(options.component, {
			target: options.target,
			anchor: options.anchor,
			props,
			context: options.context,
			intro: options.intro ?? false,
			recover: options.recover,
			transformError: options.transformError
		});
		if (!options?.props?.$$host || options.sync === false) flushSync();
		this.#events = props.$$events;
		for (const key of Object.keys(this.#instance)) {
			if (key === "$set" || key === "$destroy" || key === "$on") continue;
			define_property(this, key, {
				get() {
					return this.#instance[key];
				},
				set(value) {
					this.#instance[key] = value;
				},
				enumerable: true
			});
		}
		this.#instance.$set = (next$1) => {
			Object.assign(props, next$1);
		};
		this.#instance.$destroy = () => {
			unmount$1(this.#instance);
		};
	}
	$set(props) {
		this.#instance.$set(props);
	}
	$on(event, callback) {
		this.#events[event] = this.#events[event] || [];
		const cb = (...args) => callback.call(this, ...args);
		this.#events[event].push(cb);
		return () => {
			this.#events[event] = this.#events[event].filter((fn) => fn !== cb);
		};
	}
	$destroy() {
		this.#instance.$destroy();
	}
};
var ATTR_REGEX = /[&"<]/g;
var CONTENT_REGEX = /[&<]/g;
function escape_html(value, is_attr) {
	const str = String(value ?? "");
	const pattern = is_attr ? ATTR_REGEX : CONTENT_REGEX;
	pattern.lastIndex = 0;
	let escaped = "";
	let last = 0;
	while (pattern.test(str)) {
		const i = pattern.lastIndex - 1;
		const ch = str[i];
		escaped += str.substring(last, i) + (ch === "&" ? "&amp;" : ch === "\"" ? "&quot;" : "&lt;");
		last = i + 1;
	}
	return escaped + str.substring(last);
}
var replacements = { translate: new Map([[true, "yes"], [false, "no"]]) };
function attr(name, value, is_boolean = false) {
	if (name === "hidden" && value !== "until-found") is_boolean = true;
	if (value == null || !value && is_boolean) return "";
	const normalized = has_own_property.call(replacements, name) && replacements[name].get(value) || value;
	return ` ${name}${is_boolean ? `=""` : `="${escape_html(normalized, true)}"`}`;
}
function clsx$1(value) {
	if (typeof value === "object") return clsx(value);
	else return value ?? "";
}
var whitespace = [..." 	\n\r\f\xA0\v﻿"];
function to_class(value, hash, directives) {
	var classname = value == null ? "" : "" + value;
	if (hash) classname = classname ? classname + " " + hash : hash;
	if (directives) {
		for (var key of Object.keys(directives)) if (directives[key]) classname = classname ? classname + " " + key : key;
		else if (classname.length) {
			var len = key.length;
			var a = 0;
			while ((a = classname.indexOf(key, a)) >= 0) {
				var b = a + len;
				if ((a === 0 || whitespace.includes(classname[a - 1])) && (b === classname.length || whitespace.includes(classname[b]))) classname = (a === 0 ? "" : classname.substring(0, a)) + classname.substring(b + 1);
				else a = b;
			}
		}
	}
	return classname === "" ? null : classname;
}
function append_styles(styles, important = false) {
	var separator = important ? " !important;" : ";";
	var css = "";
	for (var key of Object.keys(styles)) {
		var value = styles[key];
		if (value != null && value !== "") css += " " + key + ": " + value + separator;
	}
	return css;
}
function to_css_name(name) {
	if (name[0] !== "-" || name[1] !== "-") return name.toLowerCase();
	return name;
}
function to_style(value, styles) {
	if (styles) {
		var new_style = "";
		var normal_styles;
		var important_styles;
		if (Array.isArray(styles)) {
			normal_styles = styles[0];
			important_styles = styles[1];
		} else normal_styles = styles;
		if (value) {
			value = String(value).replaceAll(/\s*\/\*.*?\*\/\s*/g, "").trim();
			var in_str = false;
			var in_apo = 0;
			var in_comment = false;
			var reserved_names = [];
			if (normal_styles) reserved_names.push(...Object.keys(normal_styles).map(to_css_name));
			if (important_styles) reserved_names.push(...Object.keys(important_styles).map(to_css_name));
			var start_index = 0;
			var name_index = -1;
			const len = value.length;
			for (var i = 0; i < len; i++) {
				var c = value[i];
				if (in_comment) {
					if (c === "/" && value[i - 1] === "*") in_comment = false;
				} else if (in_str) {
					if (in_str === c) in_str = false;
				} else if (c === "/" && value[i + 1] === "*") in_comment = true;
				else if (c === "\"" || c === "'") in_str = c;
				else if (c === "(") in_apo++;
				else if (c === ")") in_apo--;
				if (!in_comment && in_str === false && in_apo === 0) {
					if (c === ":" && name_index === -1) name_index = i;
					else if (c === ";" || i === len - 1) {
						if (name_index !== -1) {
							var name = to_css_name(value.substring(start_index, name_index).trim());
							if (!reserved_names.includes(name)) {
								if (c !== ";") i++;
								var property = value.substring(start_index, i).trim();
								new_style += " " + property + ";";
							}
						}
						start_index = i + 1;
						name_index = -1;
					}
				}
			}
		}
		if (normal_styles) new_style += append_styles(normal_styles);
		if (important_styles) new_style += append_styles(important_styles, true);
		new_style = new_style.trim();
		return new_style === "" ? null : new_style;
	}
	return value == null ? null : String(value);
}
const BLOCK_OPEN = `<!--[-->`;
const BLOCK_CLOSE = `<!--]-->`;
const EMPTY_COMMENT = `<!---->`;
var controller = null;
function abort() {
	controller?.abort(STALE_REACTION);
	controller = null;
}
function getAbortSignal() {
	return (controller ??= new AbortController()).signal;
}
function async_local_storage_unavailable() {
	const error = /* @__PURE__ */ new Error(`async_local_storage_unavailable\nThe node API \`AsyncLocalStorage\` is not available, but is required to use async server rendering.\nhttps://svelte.dev/e/async_local_storage_unavailable`);
	error.name = "Svelte error";
	throw error;
}
function await_invalid() {
	const error = /* @__PURE__ */ new Error(`await_invalid\nEncountered asynchronous work while rendering synchronously.\nhttps://svelte.dev/e/await_invalid`);
	error.name = "Svelte error";
	throw error;
}
function dynamic_element_invalid_tag(tag$1) {
	const error = /* @__PURE__ */ new Error(`dynamic_element_invalid_tag\n\`<svelte:element this="${tag$1}">\` is not a valid element name — the element will not be rendered\nhttps://svelte.dev/e/dynamic_element_invalid_tag`);
	error.name = "Svelte error";
	throw error;
}
function html_deprecated() {
	const error = /* @__PURE__ */ new Error(`html_deprecated\nThe \`html\` property of server render results has been deprecated. Use \`body\` instead.\nhttps://svelte.dev/e/html_deprecated`);
	error.name = "Svelte error";
	throw error;
}
function hydratable_serialization_failed(key, stack$1) {
	const error = /* @__PURE__ */ new Error(`hydratable_serialization_failed\nFailed to serialize \`hydratable\` data for key \`${key}\`.

\`hydratable\` can serialize anything [\`uneval\` from \`devalue\`](https://npmjs.com/package/uneval) can, plus Promises.

Cause:
${stack$1}\nhttps://svelte.dev/e/hydratable_serialization_failed`);
	error.name = "Svelte error";
	throw error;
}
function invalid_csp() {
	const error = /* @__PURE__ */ new Error(`invalid_csp\n\`csp.nonce\` was set while \`csp.hash\` was \`true\`. These options cannot be used simultaneously.\nhttps://svelte.dev/e/invalid_csp`);
	error.name = "Svelte error";
	throw error;
}
function invalid_id_prefix() {
	const error = /* @__PURE__ */ new Error(`invalid_id_prefix\nThe \`idPrefix\` option cannot include \`--\`.\nhttps://svelte.dev/e/invalid_id_prefix`);
	error.name = "Svelte error";
	throw error;
}
function lifecycle_function_unavailable(name) {
	const error = /* @__PURE__ */ new Error(`lifecycle_function_unavailable\n\`${name}(...)\` is not available on the server\nhttps://svelte.dev/e/lifecycle_function_unavailable`);
	error.name = "Svelte error";
	throw error;
}
function server_context_required() {
	const error = /* @__PURE__ */ new Error(`server_context_required\nCould not resolve \`render\` context.\nhttps://svelte.dev/e/server_context_required`);
	error.name = "Svelte error";
	throw error;
}
var ssr_context = null;
function set_ssr_context(v) {
	ssr_context = v;
}
function createContext() {
	const key = {};
	return [() => {
		if (!hasContext(key)) missing_context();
		return getContext(key);
	}, (context$1) => setContext(key, context$1)];
}
function getContext(key) {
	return get_or_init_context_map("getContext").get(key);
}
function setContext(key, context$1) {
	get_or_init_context_map("setContext").set(key, context$1);
	return context$1;
}
function hasContext(key) {
	return get_or_init_context_map("hasContext").has(key);
}
function getAllContexts() {
	return get_or_init_context_map("getAllContexts");
}
function get_or_init_context_map(name) {
	if (ssr_context === null) lifecycle_outside_component(name);
	return ssr_context.c ??= new Map(get_parent_context(ssr_context) || void 0);
}
function push(fn) {
	ssr_context = {
		p: ssr_context,
		c: null,
		r: null
	};
}
function pop() {
	ssr_context = ssr_context.p;
}
function get_parent_context(ssr_context$1) {
	let parent = ssr_context$1.p;
	while (parent !== null) {
		const context_map = parent.c;
		if (context_map !== null) return context_map;
		parent = parent.p;
	}
	return null;
}
function unresolved_hydratable(key, stack$1) {
	console.warn(`https://svelte.dev/e/unresolved_hydratable`);
}
var current_render = null;
var context = null;
function get_render_context() {
	const store = context ?? als?.getStore();
	if (!store) server_context_required();
	return store;
}
async function with_render_context(fn) {
	context = { hydratable: {
		lookup: /* @__PURE__ */ new Map(),
		comparisons: [],
		unresolved_promises: /* @__PURE__ */ new Map()
	} };
	if (in_webcontainer()) {
		const { promise, resolve } = deferred();
		const previous_render = current_render;
		current_render = promise;
		await previous_render;
		return fn().finally(resolve);
	}
	try {
		if (als === null) async_local_storage_unavailable();
		return als.run(context, fn);
	} finally {
		context = null;
	}
}
var als = null;
var als_import = null;
function init_render_context() {
	als_import ??= import("node:async_hooks").then((hooks) => {
		als = new hooks.AsyncLocalStorage();
	}).then(noop, noop);
	return als_import;
}
function in_webcontainer() {
	return !!globalThis.process?.versions?.webcontainer;
}
var text_encoder;
var crypto;
var obfuscated_import = (module_name) => import(
	/* @vite-ignore */
	module_name
);
async function sha256(data) {
	text_encoder ??= new TextEncoder();
	crypto ??= globalThis.crypto?.subtle?.digest ? globalThis.crypto : (await obfuscated_import("node:crypto")).webcrypto;
	return base64_encode(await crypto.subtle.digest("SHA-256", text_encoder.encode(data)));
}
function base64_encode(bytes) {
	if (globalThis.Buffer) return globalThis.Buffer.from(bytes).toString("base64");
	let binary = "";
	for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
	return btoa(binary);
}
var Renderer = class Renderer {
	#out = [];
	#on_destroy = void 0;
	#is_component_body = false;
	#boundary = null;
	type;
	#parent;
	promise = void 0;
	global;
	local;
	constructor(global, parent) {
		this.#parent = parent;
		this.global = global;
		this.local = parent ? { ...parent.local } : { select_value: void 0 };
		this.type = parent ? parent.type : "body";
	}
	head(fn) {
		const head$1 = new Renderer(this.global, this);
		head$1.type = "head";
		this.#out.push(head$1);
		head$1.child(fn);
	}
	async_block(blockers, fn) {
		this.#out.push(BLOCK_OPEN);
		this.async(blockers, fn);
		this.#out.push(BLOCK_CLOSE);
	}
	async(blockers, fn) {
		let callback = fn;
		if (blockers.length > 0) {
			const context$1 = ssr_context;
			callback = (renderer) => {
				return Promise.all(blockers).then(() => {
					const previous_context = ssr_context;
					try {
						set_ssr_context(context$1);
						return fn(renderer);
					} finally {
						set_ssr_context(previous_context);
					}
				});
			};
		}
		this.child(callback);
	}
	run(thunks) {
		const context$1 = ssr_context;
		let promise = Promise.resolve(thunks[0]());
		const promises = [promise];
		for (const fn of thunks.slice(1)) {
			promise = promise.then(() => {
				const previous_context = ssr_context;
				set_ssr_context(context$1);
				try {
					return fn();
				} finally {
					set_ssr_context(previous_context);
				}
			});
			promises.push(promise);
		}
		promise.catch(noop);
		this.promise = promise;
		return promises;
	}
	child_block(fn) {
		this.#out.push(BLOCK_OPEN);
		this.child(fn);
		this.#out.push(BLOCK_CLOSE);
	}
	child(fn) {
		const child = new Renderer(this.global, this);
		this.#out.push(child);
		const parent = ssr_context;
		set_ssr_context({
			...ssr_context,
			p: parent,
			c: null,
			r: child
		});
		const result = fn(child);
		set_ssr_context(parent);
		if (result instanceof Promise) {
			result.catch(noop);
			result.finally(() => set_ssr_context(null)).catch(noop);
			if (child.global.mode === "sync") await_invalid();
			child.promise = result;
		}
		return child;
	}
	boundary(props, children_fn) {
		const child = new Renderer(this.global, this);
		this.#out.push(child);
		const parent_context = ssr_context;
		if (props.failed) child.#boundary = {
			failed: props.failed,
			transformError: this.global.transformError,
			context: parent_context
		};
		set_ssr_context({
			...ssr_context,
			p: parent_context,
			c: null,
			r: child
		});
		try {
			const result = children_fn(child);
			set_ssr_context(parent_context);
			if (result instanceof Promise) {
				if (child.global.mode === "sync") await_invalid();
				result.catch(noop);
				child.promise = result;
			}
		} catch (error) {
			set_ssr_context(parent_context);
			const failed_snippet = props.failed;
			if (!failed_snippet) throw error;
			const result = this.global.transformError(error);
			child.#out.length = 0;
			child.#boundary = null;
			if (result instanceof Promise) {
				if (this.global.mode === "sync") await_invalid();
				child.promise = result.then((transformed) => {
					set_ssr_context(parent_context);
					child.#out.push(Renderer.#serialize_failed_boundary(transformed));
					failed_snippet(child, transformed, noop);
					child.#out.push(BLOCK_CLOSE);
				});
				child.promise.catch(noop);
			} else {
				child.#out.push(Renderer.#serialize_failed_boundary(result));
				failed_snippet(child, result, noop);
				child.#out.push(BLOCK_CLOSE);
			}
		}
	}
	component(fn, component_fn) {
		push(component_fn);
		const child = this.child(fn);
		child.#is_component_body = true;
		pop();
	}
	select(attrs, fn, css_hash, classes, styles, flags$1, is_rich) {
		const { value, ...select_attrs } = attrs;
		this.push(`<select${attributes(select_attrs, css_hash, classes, styles, flags$1)}>`);
		this.child((renderer) => {
			renderer.local.select_value = value;
			fn(renderer);
		});
		this.push(`${is_rich ? "<!>" : ""}</select>`);
	}
	option(attrs, body, css_hash, classes, styles, flags$1, is_rich) {
		this.#out.push(`<option${attributes(attrs, css_hash, classes, styles, flags$1)}`);
		const close = (renderer, value, { head: head$1, body: body$1 }) => {
			if (has_own_property.call(attrs, "value")) value = attrs.value;
			if (value === this.local.select_value) renderer.#out.push(" selected=\"\"");
			renderer.#out.push(`>${body$1}${is_rich ? "<!>" : ""}</option>`);
			if (head$1) renderer.head((child) => child.push(head$1));
		};
		if (typeof body === "function") this.child((renderer) => {
			const r = new Renderer(this.global, this);
			body(r);
			if (this.global.mode === "async") return r.#collect_content_async().then((content) => {
				close(renderer, content.body.replaceAll("<!---->", ""), content);
			});
			else {
				const content = r.#collect_content();
				close(renderer, content.body.replaceAll("<!---->", ""), content);
			}
		});
		else close(this, body, { body: escape_html(body) });
	}
	title(fn) {
		const path = this.get_path();
		const close = (head$1) => {
			this.global.set_title(head$1, path);
		};
		this.child((renderer) => {
			const r = new Renderer(renderer.global, renderer);
			fn(r);
			if (renderer.global.mode === "async") return r.#collect_content_async().then((content) => {
				close(content.head);
			});
			else close(r.#collect_content().head);
		});
	}
	push(content) {
		if (typeof content === "function") this.child(async (renderer) => renderer.push(await content()));
		else this.#out.push(content);
	}
	on_destroy(fn) {
		(this.#on_destroy ??= []).push(fn);
	}
	get_path() {
		return this.#parent ? [...this.#parent.get_path(), this.#parent.#out.indexOf(this)] : [];
	}
	copy() {
		const copy = new Renderer(this.global, this.#parent);
		copy.#out = this.#out.map((item) => item instanceof Renderer ? item.copy() : item);
		copy.promise = this.promise;
		return copy;
	}
	subsume(other) {
		if (this.global.mode !== other.global.mode) throw new Error("invariant: A renderer cannot switch modes. If you're seeing this, there's a compiler bug. File an issue!");
		this.local = other.local;
		this.#out = other.#out.map((item, i) => {
			const current = this.#out[i];
			if (current instanceof Renderer && item instanceof Renderer) {
				current.subsume(item);
				return current;
			}
			return item;
		});
		this.promise = other.promise;
		this.type = other.type;
	}
	get length() {
		return this.#out.length;
	}
	static #serialize_failed_boundary(error) {
		return `<!--[?${JSON.stringify(error).replace(/>/g, "\\u003e").replace(/</g, "\\u003c")}-->`;
	}
	static render(component, options = {}) {
		let sync;
		let async;
		const result = {};
		Object.defineProperties(result, {
			html: { get: () => {
				return (sync ??= Renderer.#render(component, options)).body;
			} },
			head: { get: () => {
				return (sync ??= Renderer.#render(component, options)).head;
			} },
			body: { get: () => {
				return (sync ??= Renderer.#render(component, options)).body;
			} },
			hashes: { value: { script: "" } },
			then: { value: (onfulfilled, onrejected) => {
				{
					const result$1 = sync ??= Renderer.#render(component, options);
					const user_result = onfulfilled({
						head: result$1.head,
						body: result$1.body,
						html: result$1.body,
						hashes: { script: [] }
					});
					return Promise.resolve(user_result);
				}
				async ??= init_render_context().then(() => with_render_context(() => Renderer.#render_async(component, options)));
				return async.then((result$1) => {
					Object.defineProperty(result$1, "html", { get: () => {
						html_deprecated();
					} });
					return onfulfilled(result$1);
				}, onrejected);
			} }
		});
		return result;
	}
	*#collect_on_destroy() {
		for (const component of this.#traverse_components()) yield* component.#collect_ondestroy();
	}
	*#traverse_components() {
		for (const child of this.#out) if (typeof child !== "string") yield* child.#traverse_components();
		if (this.#is_component_body) yield this;
	}
	*#collect_ondestroy() {
		if (this.#on_destroy) for (const fn of this.#on_destroy) yield fn;
		for (const child of this.#out) if (child instanceof Renderer && !child.#is_component_body) yield* child.#collect_ondestroy();
	}
	static #render(component, options) {
		var previous_context = ssr_context;
		try {
			const renderer = Renderer.#open_render("sync", component, options);
			const content = renderer.#collect_content();
			return Renderer.#close_render(content, renderer);
		} finally {
			abort();
			set_ssr_context(previous_context);
		}
	}
	static async #render_async(component, options) {
		const previous_context = ssr_context;
		try {
			const renderer = Renderer.#open_render("async", component, options);
			const content = await renderer.#collect_content_async();
			const hydratables = await renderer.#collect_hydratables();
			if (hydratables !== null) content.head = hydratables + content.head;
			return Renderer.#close_render(content, renderer);
		} finally {
			set_ssr_context(previous_context);
			abort();
		}
	}
	#collect_content(content = {
		head: "",
		body: ""
	}) {
		for (const item of this.#out) if (typeof item === "string") content[this.type] += item;
		else if (item instanceof Renderer) item.#collect_content(content);
		return content;
	}
	async #collect_content_async(content = {
		head: "",
		body: ""
	}) {
		await this.promise;
		for (const item of this.#out) if (typeof item === "string") content[this.type] += item;
		else if (item instanceof Renderer) if (item.#boundary) {
			const boundary_content = {
				head: "",
				body: ""
			};
			try {
				await item.#collect_content_async(boundary_content);
				content.head += boundary_content.head;
				content.body += boundary_content.body;
			} catch (error) {
				const { context: context$1, failed, transformError } = item.#boundary;
				set_ssr_context(context$1);
				let promise = transformError(error);
				set_ssr_context(null);
				let transformed = await promise;
				set_ssr_context(context$1);
				const failed_renderer = new Renderer(item.global, item);
				failed_renderer.type = item.type;
				failed_renderer.#out.push(Renderer.#serialize_failed_boundary(transformed));
				failed(failed_renderer, transformed, noop);
				failed_renderer.#out.push(BLOCK_CLOSE);
				await failed_renderer.#collect_content_async(content);
			}
		} else await item.#collect_content_async(content);
		return content;
	}
	async #collect_hydratables() {
		const ctx = get_render_context().hydratable;
		for (const [_, key] of ctx.unresolved_promises) unresolved_hydratable(key, ctx.lookup.get(key)?.stack ?? "<missing stack trace>");
		for (const comparison of ctx.comparisons) await comparison;
		return await this.#hydratable_block(ctx);
	}
	static #open_render(mode, component, options) {
		if (options.idPrefix?.includes("--")) invalid_id_prefix();
		var previous_context = ssr_context;
		try {
			const renderer = new Renderer(new SSRState(mode, options.idPrefix ? options.idPrefix + "-" : "", options.csp, options.transformError));
			set_ssr_context({
				p: null,
				c: options.context ?? null,
				r: renderer
			});
			renderer.push(BLOCK_OPEN);
			component(renderer, options.props ?? {});
			renderer.push(BLOCK_CLOSE);
			return renderer;
		} finally {
			set_ssr_context(previous_context);
		}
	}
	static #close_render(content, renderer) {
		for (const cleanup of renderer.#collect_on_destroy()) cleanup();
		let head$1 = content.head + renderer.global.get_title();
		let body = content.body;
		for (const { hash, code } of renderer.global.css) head$1 += `<style id="${hash}">${code}</style>`;
		return {
			head: head$1,
			body,
			hashes: { script: renderer.global.csp.script_hashes }
		};
	}
	async #hydratable_block(ctx) {
		if (ctx.lookup.size === 0) return null;
		let entries = [];
		let has_promises = false;
		for (const [k, v] of ctx.lookup) {
			if (v.promises) {
				has_promises = true;
				for (const p of v.promises) await p;
			}
			entries.push(`[${devalue.uneval(k)},${v.serialized}]`);
		}
		let prelude = `const h = (window.__svelte ??= {}).h ??= new Map();`;
		if (has_promises) prelude = `const r = (v) => Promise.resolve(v);
				${prelude}`;
		const body = `
			{
				${prelude}

				for (const [k, v] of [
					${entries.join(",\n					")}
				]) {
					h.set(k, v);
				}
			}
		`;
		let csp_attr = "";
		if (this.global.csp.nonce) csp_attr = ` nonce="${this.global.csp.nonce}"`;
		else if (this.global.csp.hash) {
			const hash = await sha256(body);
			this.global.csp.script_hashes.push(`sha256-${hash}`);
		}
		return `\n\t\t<script${csp_attr}>${body}<\/script>`;
	}
};
var SSRState = class {
	csp;
	mode;
	uid;
	css = /* @__PURE__ */ new Set();
	transformError;
	#title = {
		path: [],
		value: ""
	};
	constructor(mode, id_prefix = "", csp = { hash: false }, transformError) {
		this.mode = mode;
		this.csp = {
			...csp,
			script_hashes: []
		};
		this.transformError = transformError ?? ((error) => {
			throw error;
		});
		let uid$1 = 1;
		this.uid = () => `${id_prefix}s${uid$1++}`;
	}
	get_title() {
		return this.#title.value;
	}
	set_title(value, path) {
		const current = this.#title.path;
		let i = 0;
		let l = Math.min(path.length, current.length);
		while (i < l && path[i] === current[i]) i += 1;
		if (path[i] === void 0) return;
		if (current[i] === void 0 || path[i] > current[i]) {
			this.#title.path = path;
			this.#title.value = value;
		}
	}
};
var INVALID_ATTR_NAME_CHAR_REGEX = /[\s'">/=\u{FDD0}-\u{FDEF}\u{FFFE}\u{FFFF}\u{1FFFE}\u{1FFFF}\u{2FFFE}\u{2FFFF}\u{3FFFE}\u{3FFFF}\u{4FFFE}\u{4FFFF}\u{5FFFE}\u{5FFFF}\u{6FFFE}\u{6FFFF}\u{7FFFE}\u{7FFFF}\u{8FFFE}\u{8FFFF}\u{9FFFE}\u{9FFFF}\u{AFFFE}\u{AFFFF}\u{BFFFE}\u{BFFFF}\u{CFFFE}\u{CFFFF}\u{DFFFE}\u{DFFFF}\u{EFFFE}\u{EFFFF}\u{FFFFE}\u{FFFFF}\u{10FFFE}\u{10FFFF}]/u;
function element(renderer, tag$1, attributes_fn = noop, children_fn = noop) {
	renderer.push("<!---->");
	if (tag$1) {
		if (!REGEX_VALID_TAG_NAME.test(tag$1)) dynamic_element_invalid_tag(tag$1);
		renderer.push(`<${tag$1}`);
		attributes_fn();
		renderer.push(`>`);
		if (!is_void(tag$1)) {
			children_fn();
			if (!is_raw_text_element(tag$1)) renderer.push(EMPTY_COMMENT);
			renderer.push(`</${tag$1}>`);
		}
	}
	renderer.push("<!---->");
}
function render(component, options = {}) {
	if (options.csp?.hash && options.csp.nonce) invalid_csp();
	return Renderer.render(component, options);
}
function head(hash, renderer, fn) {
	renderer.head((renderer$1) => {
		renderer$1.push(`<!--${hash}-->`);
		renderer$1.child(fn);
		renderer$1.push(EMPTY_COMMENT);
	});
}
function attributes(attrs, css_hash, classes, styles, flags$1 = 0) {
	if (styles) attrs.style = to_style(attrs.style, styles);
	if (attrs.class) attrs.class = clsx$1(attrs.class);
	if (css_hash || classes) attrs.class = to_class(attrs.class, css_hash, classes);
	let attr_str = "";
	let name;
	const is_html = (flags$1 & 1) === 0;
	const lowercase = (flags$1 & 2) === 0;
	const is_input = (flags$1 & 4) !== 0;
	for (name of Object.keys(attrs)) {
		if (typeof attrs[name] === "function") continue;
		if (name[0] === "$" && name[1] === "$") continue;
		if (name === "" || INVALID_ATTR_NAME_CHAR_REGEX.test(name)) continue;
		var value = attrs[name];
		var lower = name.toLowerCase();
		if (lowercase) name = lower;
		if (lower.length > 2 && lower.startsWith("on")) continue;
		if (is_input) {
			if (name === "defaultvalue" || name === "defaultchecked") {
				name = name === "defaultvalue" ? "value" : "checked";
				if (attrs[name]) continue;
			}
		}
		attr_str += attr(name, value, is_html && is_boolean_attribute(name));
	}
	return attr_str;
}
function spread_props(props) {
	const merged_props = {};
	let key;
	for (let i = 0; i < props.length; i++) {
		const obj = props[i];
		if (obj == null) continue;
		for (key of Object.keys(obj)) {
			const desc = Object.getOwnPropertyDescriptor(obj, key);
			if (desc) Object.defineProperty(merged_props, key, desc);
			else merged_props[key] = obj[key];
		}
	}
	return merged_props;
}
function attr_class(value, hash, directives) {
	var result = to_class(value, hash, directives);
	return result ? ` class="${escape_html(result, true)}"` : "";
}
function attr_style(value, directives) {
	var result = to_style(value, directives);
	return result ? ` style="${escape_html(result, true)}"` : "";
}
function slot(renderer, $$props, name, slot_props, fallback_fn) {
	var slot_fn = $$props.$$slots?.[name];
	if (slot_fn === true) slot_fn = $$props[name === "default" ? "children" : name];
	if (slot_fn !== void 0) slot_fn(renderer, slot_props);
	else fallback_fn?.();
}
function rest_props(props, rest) {
	const rest_props$1 = {};
	let key;
	for (key of Object.keys(props)) if (!rest.includes(key)) rest_props$1[key] = props[key];
	return rest_props$1;
}
function sanitize_props(props) {
	const { children, $$slots, ...sanitized } = props;
	return sanitized;
}
function bind_props(props_parent, props_now) {
	for (const key of Object.keys(props_now)) {
		const initial_value = props_parent[key];
		const value = props_now[key];
		if (initial_value === void 0 && value !== void 0 && Object.getOwnPropertyDescriptor(props_parent, key)?.set) props_parent[key] = value;
	}
}
function ensure_array_like(array_like_or_iterator) {
	if (array_like_or_iterator) return array_like_or_iterator.length !== void 0 ? array_like_or_iterator : Array.from(array_like_or_iterator);
	return [];
}
function once(get_value) {
	let value = UNINITIALIZED;
	return () => {
		if (value === UNINITIALIZED) value = get_value();
		return value;
	};
}
function props_id(renderer) {
	const uid$1 = renderer.global.uid();
	renderer.push("<!--$" + uid$1 + "-->");
	return uid$1;
}
function derived(fn) {
	const get_value = ssr_context === null ? fn : once(fn);
	let updated_value;
	return function(new_value) {
		if (arguments.length === 0) return updated_value ?? get_value();
		updated_value = new_value;
		return updated_value;
	};
}
function hydratable(key, fn) {
	experimental_async_required("hydratable");
	const { hydratable: hydratable$1 } = get_render_context();
	let entry = hydratable$1.lookup.get(key);
	if (entry !== void 0) return entry.value;
	const value = fn();
	entry = encode(key, value, hydratable$1.unresolved_promises);
	hydratable$1.lookup.set(key, entry);
	return value;
}
function encode(key, value, unresolved) {
	const entry = {
		value,
		serialized: ""
	};
	let uid$1 = 1;
	entry.serialized = devalue.uneval(entry.value, (value$1, uneval) => {
		if (is_promise(value$1)) {
			const placeholder = `"${uid$1++}"`;
			const p = value$1.then((v) => {
				entry.serialized = entry.serialized.replace(placeholder, () => `r(${uneval(v)})`);
			}).catch((devalue_error) => hydratable_serialization_failed(key, serialization_stack(entry.stack, devalue_error?.stack)));
			unresolved?.set(p, key);
			p.catch(() => {}).finally(() => unresolved?.delete(p));
			(entry.promises ??= []).push(p);
			return placeholder;
		}
	});
	return entry;
}
function is_promise(value) {
	return Object.prototype.toString.call(value) === "[object Promise]";
}
function serialization_stack(root_stack, uneval_stack) {
	let out = "";
	if (root_stack) out += root_stack + "\n";
	if (uneval_stack) out += "Caused by:\n" + uneval_stack + "\n";
	return out || "<missing stack trace>";
}
function createRawSnippet(fn) {
	return (renderer, ...args) => {
		var getters = args.map((value) => () => value);
		renderer.push(fn(...getters).render().trim());
	};
}
var index_server_exports = /* @__PURE__ */ __export({
	afterUpdate: () => noop,
	beforeUpdate: () => noop,
	createContext: () => createContext,
	createEventDispatcher: () => createEventDispatcher,
	createRawSnippet: () => createRawSnippet,
	flushSync: () => noop,
	fork: () => fork,
	getAbortSignal: () => getAbortSignal,
	getAllContexts: () => getAllContexts,
	getContext: () => getContext,
	hasContext: () => hasContext,
	hydratable: () => hydratable,
	hydrate: () => hydrate,
	mount: () => mount,
	onDestroy: () => onDestroy,
	onMount: () => noop,
	setContext: () => setContext,
	settled: () => settled,
	tick: () => tick,
	unmount: () => unmount,
	untrack: () => run
});
function onDestroy(fn) {
	ssr_context.r.on_destroy(fn);
}
function createEventDispatcher() {
	return noop;
}
function mount() {
	lifecycle_function_unavailable("mount");
}
function hydrate() {
	lifecycle_function_unavailable("hydrate");
}
function unmount() {
	lifecycle_function_unavailable("unmount");
}
function fork() {
	lifecycle_function_unavailable("fork");
}
async function tick() {}
async function settled() {}
export { on as A, noop as B, setContext as C, asClassComponent as D, escape_html as E, create_element as F, run as H, async_mode_flag as I, ATTACHMENT_KEY as L, writable as M, effect_root as N, createClassComponent as O, render_effect as P, rune_outside_svelte as R, hasContext as S, clsx$1 as T, object_keys as V, sanitize_props as _, unmount as a, getAllContexts as b, attributes as c, element as d, ensure_array_like as f, rest_props as g, render as h, tick as i, readable as j, append as k, bind_props as l, props_id as m, mount as n, attr_class as o, head as p, settled as r, attr_style as s, index_server_exports as t, derived as u, slot as v, attr as w, getContext as x, spread_props as y, fallback as z };
