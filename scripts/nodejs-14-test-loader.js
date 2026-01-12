import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import esbuild from "esbuild";

// `@babel/code-frame` and `@babel/highlight` use syntax that is not available in Node.js 14,
// such as `??=`. When bundled into dist/ they are compiled to be compatible with Node.js 14,
// however we also need to load them at runtime from node_modules to run our tests.
// We can use an `--experimental-loader` to compile them on-the-fly with esbuild.

export async function getSource(url, context, defaultGetSource) {
  if (context.format === "module") {
    if (url.includes("/node_modules/js-tokens/")) {
      const text = await readFile(fileURLToPath(url));
      const commonJsExport = 'export { jsTokens as "module.exports" };';
      if (text.includes(commonJsExport)) {
        return { source: text.replace(commonJsExport, "") };
      }
    }

    if (
      url.includes("/node_modules/@babel/code-frame/") ||
      url.includes("/node_modules/@babel/highlight/")
    ) {
      const text = await readFile(fileURLToPath(url));
      try {
        const result = await esbuild.transform(text, { target: "node14" });
        return { source: result.code };
      } catch (error) {
        error.message += ` (in ${url})`;
        throw error;
      }
    }
  }

  return defaultGetSource(url, context, defaultGetSource);
}
