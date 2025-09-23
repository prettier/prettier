import path from "node:path";
import { toPath } from "url-or-path";

/**
@param {string | URL} file
@returns {string}
*/
const getFileBasename = (file) => path.basename(toPath(file));

export { getFileBasename };
export { default as getInterpreter } from "../utils/get-interpreter.js";
export { fileURLToPath } from "node:url";
