import path from "node:path";
import stringify from "fast-json-stable-stringify";
import { format, getFileInfo } from "../index.js";
import { printToScreen } from "./utils.js";

// Note: This does not work with `--config-precedence`
async function logFileInfoOrDie(context) {
  const {
    fileInfo: file,
    ignorePath,
    withNodeModules,
    plugins,
    config,
  } = context.argv;

  const fileInfo = await getFileInfo(path.resolve(file), {
    ignorePath,
    withNodeModules,
    plugins: plugins.length > 0 ? plugins : undefined,
    resolveConfig: config !== false,
  });

  const result = await format(stringify(fileInfo), { parser: "json" });

  printToScreen(result.trim());
}

export default logFileInfoOrDie;
