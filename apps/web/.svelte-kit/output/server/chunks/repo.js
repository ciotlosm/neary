import * as Comlink from "comlink";
var cached = null;
function getGtfsRepo() {
	if (cached) return cached;
	const GtfsWorker = new Worker(new URL("../../workers/gtfs.worker.ts", import.meta.url), { type: "module" });
	cached = Comlink.wrap(GtfsWorker);
	return cached;
}
export { getGtfsRepo as t };
