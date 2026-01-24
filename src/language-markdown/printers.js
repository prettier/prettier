import embed from "./embed.js";
import { massageAstNode } from "./massage-ast/index.js";
import { insertPragma } from "./pragma.js";
import { printMdast, printPrettierIgnored } from "./print/index.js";
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
  massageAstNode,
  hasPrettierIgnore,
  insertPragma,
  getVisitorKeys,
  printPrettierIgnored,
};

export { printer as mdast };
