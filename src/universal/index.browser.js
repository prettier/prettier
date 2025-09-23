/**
@param {string | URL} file
@returns {string}
*/
const getFileBasename = (file) => String(file).split(/[/\\]/u).pop();

const getInterpreter = undefined;

export { getFileBasename, getInterpreter };
export { default as fileURLToPath } from "deno-path-from-file-url";
