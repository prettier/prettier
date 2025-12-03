import { parse as parseYaml, YAMLSyntaxError } from "yaml-unist-parser";
import createError from "../common/parser-create-error.js";
import { locEnd, locStart } from "./loc.js";
import { hasIgnorePragma, hasPragma } from "./pragma.js";

/**
@import {ParseOptions} from "yaml-unist-parser";
*/

/** @type {ParseOptions} */
const parseOptions = { uniqueKeys: false };

function parse(text) {
  let root;
  try {
    root = parseYaml(text, parseOptions);
  } catch (error) {
    if (error instanceof YAMLSyntaxError) {
      throw createError(error.message, {
        loc: error.position,
        cause: error,
      });
    }

    /* c8 ignore next */
    throw error;
  }

  /**
   * suppress `comment not printed` error
   *
   * comments are handled in printer-yaml.js without using `printComment`
   * so that it'll always throw errors even if we printed it correctly
   */
  delete root.comments;

  return root;
}

export const yaml = {
  astFormat: "yaml",
  parse,
  hasPragma,
  hasIgnorePragma,
  locStart,
  locEnd,
};
