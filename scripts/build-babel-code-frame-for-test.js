import url from "node:url";
import esbuild from "esbuild";
import { PRODUCTION_MINIMAL_NODE_JS_VERSION } from "./utilities/index.js";

const file = url.fileURLToPath(
  new URL("../vendors/babel-code-frame-for-test.js", import.meta.url),
);

async function buildBabelCodeFrameForTest() {
  await esbuild.build({
    entryPoints: ["@babel/code-frame"],
    bundle: true,
    target: [`node${PRODUCTION_MINIMAL_NODE_JS_VERSION}`],
    format: "esm",
    outfile: file,
    mainFields: ["browser"],
  });
}

export { buildBabelCodeFrameForTest };
