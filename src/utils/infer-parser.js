import path from "node:path";
import getInterpreter from "./get-interpreter.js";

/**
 * @typedef {import("../index.js").Plugin} PrettierPlugin
 * @param {{plugins: PrettierPlugin[]}} options
 * @param {{physicalFile?: string, file?: string, language?: string}} fileInfo
 * @returns {string | void} matched parser name if found
 */
function inferParser(options, fileInfo) {
  const languages = options.plugins.flatMap((plugin) => plugin.languages ?? []);

  // If the file has no extension, we can try to infer the language from the
  // interpreter in the shebang line, if any; but since this requires FS access,
  // do it last.
  const filename = fileInfo.physicalFile ?? fileInfo.file;
  const basename = path.basename(filename).toLowerCase();
  let language = languages.find(
    (language) =>
      language.extensions?.some((extension) => basename.endsWith(extension)) ||
      language.filenames?.some((name) => name.toLowerCase() === basename)
  );

  if (
    process.env.PRETTIER_TARGET !== "universal" &&
    !language &&
    fileInfo.physicalFile &&
    !basename.includes(".")
  ) {
    const interpreter = getInterpreter(fileInfo.physicalFile);
    if (interpreter) {
      language = languages.find((language) =>
        language.interpreters?.includes(interpreter)
      );
    }
  }

  return language?.parsers[0];
}

export default inferParser;
