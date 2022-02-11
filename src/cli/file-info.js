import stringify from "fast-json-stable-stringify";
import prettier from "../index.js";

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

  context.logger.log(prettier.format(stringify(fileInfo), { parser: "json" }));
}

export default logFileInfoOrDie;
