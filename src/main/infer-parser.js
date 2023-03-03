import path from "node:path";
import getInterpreter from "../utils/get-interpreter.js";

function inferParser(filepath, plugins) {
  const filename = path.basename(filepath).toLowerCase();
  const languages = plugins.flatMap((plugin) => plugin.languages ?? []);

  // If the file has no extension, we can try to infer the language from the
  // interpreter in the shebang line, if any; but since this requires FS access,
  // do it last.
  let language = languages.find(
    (language) =>
      language.extensions?.some((extension) => filename.endsWith(extension)) ||
      language.filenames?.some((name) => name.toLowerCase() === filename)
  );

  if (
    process.env.PRETTIER_TARGET !== "universal" &&
    !language &&
    !filename.includes(".")
  ) {
    const interpreter = getInterpreter(filepath);
    if (interpreter) {
      language = languages.find((language) =>
        language.interpreters?.includes(interpreter)
      );
    }
  }

  return language?.parsers[0];
}

export default inferParser;
