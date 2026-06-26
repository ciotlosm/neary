import { B as noop, C as setContext, D as asClassComponent$1, E as escape_html, I as async_mode_flag, h as render, i as tick, u as derived } from "./index-server.js";
import { t as false_default } from "./false.js";
let read_implementation = null;
function set_read_implementation(fn) {
	read_implementation = fn;
}
function set_manifest(_) {}
function asClassComponent(component) {
	const component_constructor = asClassComponent$1(component);
	const _render = (props, { context, csp, transformError } = {}) => {
		const result = render(component, {
			props,
			context,
			csp,
			transformError
		});
		const munged = Object.defineProperties({}, {
			css: { value: {
				code: "",
				map: null
			} },
			head: { get: () => result.head },
			html: { get: () => result.body },
			then: { value: (onfulfilled, onrejected) => {
				if (!async_mode_flag) {
					const user_result = onfulfilled({
						css: munged.css,
						head: munged.head,
						html: munged.html
					});
					return Promise.resolve(user_result);
				}
				return result.then((result$1) => {
					return onfulfilled({
						css: munged.css,
						head: result$1.head,
						html: result$1.body,
						hashes: result$1.hashes
					});
				}, onrejected);
			} }
		});
		return munged;
	};
	component_constructor.render = _render;
	return component_constructor;
}
function Root($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		let { stores, page, constructors, components = [], form, data_0 = null, data_1 = null } = $$props;
		setContext("__svelte__", stores);
		stores.page.set(page);
		const Pyramid_1 = derived(() => constructors[1]);
		if (constructors[1]) {
			$$renderer$1.push("<!--[0-->");
			const Pyramid_0 = constructors[0];
			if (Pyramid_0) {
				$$renderer$1.push("<!--[-->");
				Pyramid_0($$renderer$1, {
					data: data_0,
					form,
					params: page.params,
					children: ($$renderer$2) => {
						if (Pyramid_1()) {
							$$renderer$2.push("<!--[-->");
							Pyramid_1()($$renderer$2, {
								data: data_1,
								form,
								params: page.params
							});
							$$renderer$2.push("<!--]-->");
						} else {
							$$renderer$2.push("<!--[!-->");
							$$renderer$2.push("<!--]-->");
						}
					},
					$$slots: { default: true }
				});
				$$renderer$1.push("<!--]-->");
			} else {
				$$renderer$1.push("<!--[!-->");
				$$renderer$1.push("<!--]-->");
			}
		} else {
			$$renderer$1.push("<!--[-1-->");
			const Pyramid_0 = constructors[0];
			if (Pyramid_0) {
				$$renderer$1.push("<!--[-->");
				Pyramid_0($$renderer$1, {
					data: data_0,
					form,
					params: page.params
				});
				$$renderer$1.push("<!--]-->");
			} else {
				$$renderer$1.push("<!--[!-->");
				$$renderer$1.push("<!--]-->");
			}
		}
		$$renderer$1.push(`<!--]--> `);
		$$renderer$1.push("<!--[-1-->");
		$$renderer$1.push(`<!--]-->`);
	});
}
var root_default = asClassComponent(Root);
var error_template_default = ({ status, message }) => "<!doctype html>\n<html lang=\"en\">\n	<head>\n		<meta charset=\"utf-8\" />\n		<title>" + message + "</title>\n\n		<style>\n			body {\n				--bg: white;\n				--fg: #222;\n				--divider: #ccc;\n				background: var(--bg);\n				color: var(--fg);\n				font-family:\n					system-ui,\n					-apple-system,\n					BlinkMacSystemFont,\n					'Segoe UI',\n					Roboto,\n					Oxygen,\n					Ubuntu,\n					Cantarell,\n					'Open Sans',\n					'Helvetica Neue',\n					sans-serif;\n				display: flex;\n				align-items: center;\n				justify-content: center;\n				height: 100vh;\n				margin: 0;\n			}\n\n			.error {\n				display: flex;\n				align-items: center;\n				max-width: 32rem;\n				margin: 0 1rem;\n			}\n\n			.status {\n				font-weight: 200;\n				font-size: 3rem;\n				line-height: 1;\n				position: relative;\n				top: -0.05rem;\n			}\n\n			.message {\n				border-left: 1px solid var(--divider);\n				padding: 0 0 0 1rem;\n				margin: 0 0 0 1rem;\n				min-height: 2.5rem;\n				display: flex;\n				align-items: center;\n			}\n\n			.message h1 {\n				font-weight: 400;\n				font-size: 1em;\n				margin: 0;\n			}\n\n			@media (prefers-color-scheme: dark) {\n				body {\n					--bg: #222;\n					--fg: #ddd;\n					--divider: #666;\n				}\n			}\n		</style>\n	</head>\n	<body>\n		<div class=\"error\">\n			<span class=\"status\">" + status + "</span>\n			<div class=\"message\">\n				<h1>" + message + "</h1>\n			</div>\n		</div>\n	</body>\n</html>\n";
const options = {
	app_template_contains_nonce: false,
	async: false,
	csp: {
		"mode": "auto",
		"directives": {
			"upgrade-insecure-requests": false,
			"block-all-mixed-content": false
		},
		"reportOnly": {
			"upgrade-insecure-requests": false,
			"block-all-mixed-content": false
		}
	},
	csrf_check_origin: true,
	csrf_trusted_origins: [],
	embedded: false,
	env_public_prefix: "PUBLIC_",
	env_private_prefix: "",
	hash_routing: false,
	hooks: null,
	preload_strategy: "modulepreload",
	root: root_default,
	service_worker: false,
	service_worker_options: void 0,
	server_error_boundaries: false,
	templates: {
		app: ({ head, body, assets, nonce, env }) => "<!doctype html>\n<html lang=\"en\" data-theme=\"auto\">\n  <head>\n    <meta charset=\"utf-8\" />\n    <link rel=\"icon\" type=\"image/svg+xml\" href=\"" + assets + "/favicon.svg\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, viewport-fit=cover\" />\n    <meta name=\"theme-color\" content=\"#1d4ed8\" />\n    <meta name=\"apple-mobile-web-app-capable\" content=\"yes\" />\n    <meta name=\"apple-mobile-web-app-status-bar-style\" content=\"black-translucent\" />\n    " + head + "\n  </head>\n  <body>\n    <div style=\"display: contents\">" + body + "</div>\n  </body>\n</html>\n",
		error: error_template_default
	},
	version_hash: "1nacml7"
};
async function get_hooks() {
	let handle;
	let handleFetch;
	let handleError;
	let handleValidationError;
	let init;
	let reroute;
	let transport;
	return {
		handle,
		handleFetch,
		handleError,
		handleValidationError,
		init,
		reroute,
		transport
	};
}
export { set_read_implementation as a, set_manifest as i, options as n, read_implementation as r, get_hooks as t };
