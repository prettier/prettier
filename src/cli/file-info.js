import stringify from "fast-json-stable-stringify";
import * as prettier from "../index.js";
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

  const fileInfo = await prettier.getFileInfo(file, {
    ignorePath,
    withNodeModules,
    plugins,
    pluginSearchDirs,
    resolveConfig: config !== false,
  });

  printToScreen(prettier.format(stringify(fileInfo), { parser: "json" }));
}

export default logFileInfoOrDie;
