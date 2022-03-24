
import { createRequire } from "node:module";
import createError from "../common/parser-create-error.js";
import { hasPragma } from "./pragma.js";
import { locStart, locEnd } from "./loc.js";

const require = createRequire(import.meta.url);

function parse(text) {
  const { parse: parseYaml } = require("yaml-unist-parser");

  try {
    const root = parseYaml(text);

    /**
     * suppress `comment not printed` error
     *
     * comments are handled in printer-yaml.js without using `printComment`
     * so that it'll always throw errors even if we printed it correctly
     */
    delete root.comments;

    return root;
  } catch (error) {
    if (error && error.position) {
      throw createError(error.message, error.position);
    }

    /* istanbul ignore next */
    throw error;
  }
}

const parser = {
  astFormat: "yaml",
  parse,
  hasPragma,
  locStart,
  locEnd,
};

const yaml = {
  parsers: {
    yaml: parser,
  },
};

export default yaml;
