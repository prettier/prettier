import * as builders from "./doc-builders.js";
import * as printer from "./doc-printer.js";
import * as utils from "./doc-utils.js";
import * as debug from "./doc-debug.js";

/**
 * @typedef {import("./doc-builders").Doc} Doc
 */

const doc = {
  builders,
  printer,
  utils,
  debug,
};

export default doc;
