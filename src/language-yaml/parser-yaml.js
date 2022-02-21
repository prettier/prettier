// TODO[@fisker]: try inline import this module
// Inline the require to avoid loading all the JS if we don't use it
import { parse as parseYaml } from "yaml-unist-parser";
import createError from "../common/parser-create-error.js";
import { hasPragma } from "./pragma.js";
import { locStart, locEnd } from "./loc.js";

function parse(text) {
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
