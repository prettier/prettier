import clean from "./clean.js";
import embed from "./embed.js";
import { insertPragma } from "./pragma.js";
import { printMdast } from "./print/index.js";
import preprocess from "./print/preprocess.js";
import getVisitorKeys from "./traverse/get-visitor-keys.js";
import { hasPrettierIgnore } from "./utilities.js";

const printer = {
  features: {
    experimental_frontMatterSupport: {
      massageAstNode: true,
      embed: true,
      print: true,
    },
  },
  preprocess,
  print: printMdast,
  embed,
  massageAstNode: clean,
  hasPrettierIgnore,
  insertPragma,
  getVisitorKeys,
};

export { printer as mdast };
