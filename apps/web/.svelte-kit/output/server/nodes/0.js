import * as universal from '../entries/pages/_layout.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.BWa-StG4.js","_app/immutable/chunks/CGYbF6iX.js","_app/immutable/chunks/CbBmutCz.js","_app/immutable/chunks/BLrRnYcM.js","_app/immutable/chunks/C2IYLphb.js","_app/immutable/chunks/7333aKLD.js","_app/immutable/chunks/C44IEWYb.js","_app/immutable/chunks/DqxyGLxc.js","_app/immutable/chunks/C-ceHJOP.js","_app/immutable/chunks/Bs12w37I.js","_app/immutable/chunks/C6CJalKn.js"];
export const stylesheets = ["_app/immutable/assets/ui.DmJJEHDe.css","_app/immutable/assets/0.Y4esBhYf.css"];
export const fonts = [];
