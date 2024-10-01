import parseFrontMatter from "../../utils/front-matter/parse.js";

/** @import {Plugin, Settings} from "unified" */

/**
 * @type {Plugin<[], Settings>}
 */
const frontMatter = function () {
  const proto = this.Parser.prototype;
  proto.blockMethods = ["frontMatter", ...proto.blockMethods];
  proto.blockTokenizers.frontMatter = tokenizer;

  function tokenizer(eat, value) {
    const parsed = parseFrontMatter(value);

    if (parsed.frontMatter) {
      return eat(parsed.frontMatter.raw)(parsed.frontMatter);
    }
  }
  tokenizer.onlyAtStart = true;
};

export default frontMatter;
