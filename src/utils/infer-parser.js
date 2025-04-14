import getInterpreter from "./get-interpreter.js";
import isNonEmptyArray from "./is-non-empty-array.js";

/** @import {Options, SupportLanguage} from "../index.js" */

/**
 * Didn't use `path.basename` since this module should work in browsers too
 * And `file` can be a `URL`
 * @param {string | URL} file
 */
const getFileBasename = (file) => String(file).split(/[/\\]/u).pop();

/**
 * @param {SupportLanguage[]} languages
 * @param {string | URL | undefined} [file]
 * @returns {SupportLanguage | undefined}
 */
function getLanguageByFileName(languages, file) {
  if (!file) {
    return;
  }

  const basename = getFileBasename(file).toLowerCase();

  return (
    languages.find(({ filenames }) =>
      filenames?.some((name) => name.toLowerCase() === basename),
    ) ??
    languages.find(({ extensions }) =>
      extensions?.some((extension) => basename.endsWith(extension)),
    )
  );
}

/**
 * @param {SupportLanguage[]} languages
 * @param {string | undefined} [languageName]
 * @returns {SupportLanguage | undefined}
 */
function getLanguageByLanguageName(languages, languageName) {
  if (!languageName) {
    return;
  }

  return (
    languages.find(({ name }) => name.toLowerCase() === languageName) ??
    languages.find(({ aliases }) => aliases?.includes(languageName)) ??
    languages.find(({ extensions }) => extensions?.includes(`.${languageName}`))
  );
}

/**
 * @param {SupportLanguage[]} languages
 * @param {string | URL | undefined} [file]
 * @returns {SupportLanguage | undefined}
 */
function getLanguageByInterpreter(languages, file) {
  if (
    process.env.PRETTIER_TARGET === "universal" ||
    !file ||
    getFileBasename(file).includes(".")
  ) {
    return;
  }

  const languagesWithInterpreters = languages.filter(({ interpreters }) =>
    isNonEmptyArray(interpreters),
  );

  /* c8 ignore next 3 */
  if (languagesWithInterpreters.length === 0) {
    return;
  }

  const interpreter = getInterpreter(file);

  if (!interpreter) {
    return;
  }

  return languagesWithInterpreters.find(({ interpreters }) =>
    interpreters.includes(interpreter),
  );
}

/**
 * @param {SupportLanguage[]} languages
 * @param {string | URL | undefined} [file]
 * @returns {SupportLanguage | undefined}
 */
function getLanguageByIsSupported(languages, file) {
  if (!file) {
    return;
  }

  /*
  We can't use `url.fileURLToPath` here since this module should work in browsers too
  `URL#pathname` won't work either since `new URL('file:///C:/path/to/file').pathname`
  equals to `/C:/path/to/file`, try to improve this part in future
  */
  file = String(file);

  return languages.find(({ isSupported }) => isSupported?.(file));
}

/**
 * @param {Options} options
 * @param {{physicalFile?: string | URL | undefined, file?: string | URL | undefined, language?: string | undefined}} fileInfo
 * @returns {string | undefined} matched parser name if found
 */
function inferParser(options, fileInfo) {
  const languages = options.plugins.flatMap(
    (plugin) =>
      // @ts-expect-error -- Safe
      plugin.languages ?? [],
  );

  // If the file has no extension, we can try to infer the language from the
  // interpreter in the shebang line, if any; but since this requires FS access,
  // do it last.
  const language =
    getLanguageByLanguageName(languages, fileInfo.language) ??
    getLanguageByFileName(languages, fileInfo.physicalFile) ??
    getLanguageByFileName(languages, fileInfo.file) ??
    getLanguageByIsSupported(languages, fileInfo.physicalFile) ??
    getLanguageByIsSupported(languages, fileInfo.file) ??
    getLanguageByInterpreter(languages, fileInfo.physicalFile);

  return language?.parsers[0];
}

export default inferParser;
