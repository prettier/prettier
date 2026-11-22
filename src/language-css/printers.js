import embed from "./embed.js";
import getVisitorKeys from "./get-visitor-keys.js";
import { massageAstNode } from "./massage-ast/index.js";
import { insertPragma } from "./pragma.js";
import { print } from "./print/print.js";

const features = {
  experimental_frontMatterSupport: {
    massageAstNode: true,
    embed: true,
    print: true,
  },
};

const postcss = {
  features,
  print,
  embed,
  insertPragma,
  massageAstNode,
  getVisitorKeys,
};

export { postcss };
