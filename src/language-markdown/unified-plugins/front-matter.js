import { parseFrontMatter } from "../../main/front-matter/index.js";

/** @import {Plugin, Settings} from "unified" */

/**
<<<<<<< HEAD
 * @type {import('unified-v9').Plugin<[], import('unified-v9').Settings>}
=======
 * @type {Plugin<[], Settings>}
>>>>>>> main
 */
const frontMatter = function () {
  const proto = this.Parser.prototype;
  proto.blockMethods = ["frontMatter", ...proto.blockMethods];
  proto.blockTokenizers.frontMatter = tokenizer;

  function tokenizer(eat, value) {
    const { frontMatter } = parseFrontMatter(value);

    if (frontMatter) {
      return eat(frontMatter.raw)({ ...frontMatter, type: "frontMatter" });
    }
  }
  tokenizer.onlyAtStart = true;
};

export default frontMatter;
