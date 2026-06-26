import { E as escape_html } from "../../chunks/index-server.js";
import "../../chunks/shared.js";
import "../../chunks/false.js";
import "../../chunks/internal.js";
import "../../chunks/exports.js";
import "../../chunks/internal2.js";
import "../../chunks/client.js";
import { t as page } from "../../chunks/state.js";
function Error($$renderer, $$props) {
	$$renderer.component(($$renderer$1) => {
		$$renderer$1.push(`<h1>${escape_html(page.status)}</h1> <p>${escape_html(page.error?.message)}</p>`);
	});
}
export { Error as default };
