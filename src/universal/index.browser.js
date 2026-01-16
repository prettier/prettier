/**
@param {string | URL} file
@returns {string}
*/
const getFileBasename = (file) => String(file).split(/[/\\]/u).pop();

// Ideally, we should only allow `URL` with `file:` protocol and
// string starts with `file:`, but `URL` is missing in some environments
// eg: `node:vm`
const isUrl = (file) => String(file).startsWith("file:");
const getInterpreter = undefined;

export { getFileBasename, getInterpreter, isUrl };
export { default as fileURLToPath } from "deno-path-from-file-url";
