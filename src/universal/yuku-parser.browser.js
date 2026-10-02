import { loadSync } from "@yuku-core/wasm";
import wasm from "@yuku-core/wasm/yuku-core.wasm" with { type: "bytes" };
import { parse as yukuParse } from "yuku-parser";

const core = loadSync(wasm);
const parse = (source, options) => yukuParse(source, { ...options, core });

export { parse };
