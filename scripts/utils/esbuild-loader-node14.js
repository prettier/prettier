import esbuild from "esbuild";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";

// @babel/code-frame and @babel/highlight use syntax that is not available in Node.js 14,
// such as ??=. When bundled into dist/ they are compiled to be compatible with Node.js 14,
// however we also need to load them at runtime from node_modules to run our tests.
// We can use an --experimental-loader to compile them on-the-fly with esbuild.

export async function getSource(url, context, defaultGetSource) {
  if (!/node_modules\/@babel\/(?:code-frame|highlight)/.test(url) || context.format !== "module") {
    return defaultGetSource(url, context, defaultGetSource);
  }

  const raw = await readFile(fileURLToPath(url));
  try {
  const result = await esbuild.transform(raw, { target: "node14" });
  return { source: result.code };
  } catch (e) {
    e.message += ` (in ${url})`;
    throw e;
  }
}
