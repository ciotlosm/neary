import { x as getContext } from "./index-server.js";
import { t as false_default } from "./false.js";
import { a as updated$2, i as page$3, n as stores, r as navigating$2 } from "./client.js";
stores.updated.check;
function context() {
	return getContext("__request__");
}
const page$2 = {
	get data() {
		return context().page.data;
	},
	get error() {
		return context().page.error;
	},
	get form() {
		return context().page.form;
	},
	get params() {
		return context().page.params;
	},
	get route() {
		return context().page.route;
	},
	get state() {
		return context().page.state;
	},
	get status() {
		return context().page.status;
	},
	get url() {
		return context().page.url;
	}
};
export { page$2 as t };
