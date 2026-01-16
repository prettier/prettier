import { parse as parseYaml } from "yaml-unist-parser/lib/parse.js";
import createError from "../common/parser-create-error.js";
import { locEnd, locStart } from "./loc.js";
import { hasIgnorePragma, hasPragma } from "./pragma.js";

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
  } catch (/** @type {any} */ error) {
    if (error?.position) {
      throw createError(error.message, {
        loc: error.position,
        cause: error,
      });
    }

    /* c8 ignore next */
    throw error;
  }
}

export const yaml = {
  astFormat: "yaml",
  parse,
  hasPragma,
  hasIgnorePragma,
  locStart,
  locEnd,
};
