import createError from "../common/parser-create-error.js";
import { hasPragma } from "./pragma.js";
import { locStart, locEnd } from "./loc.js";

async function parse(text) {
  const { parse: parseYaml } = await import("yaml-unist-parser/lib/parse.js");

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
    if (error?.position) {
      throw createError(error.message, {
        loc: error.position,
        cause: error,
      });
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
