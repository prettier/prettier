import stringify from "fast-json-stable-stringify";
import { format, getFileInfo } from "../index.js";
import { printToScreen } from "./utils.js";

async function logFileInfoOrDie(context) {
  const {
    fileInfo: file,
    ignorePath,
    withNodeModules,
    plugins,
    pluginSearchDirs,
    config,
  } = context.argv;

  const fileInfo = await getFileInfo(file, {
    ignorePath,
    withNodeModules,
    plugins,
    pluginSearchDirs,
    resolveConfig: config !== false,
  });

  printToScreen(await format(stringify(fileInfo), { parser: "json" }));
}

export default logFileInfoOrDie;
