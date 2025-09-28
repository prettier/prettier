import { parseFrontMatter } from "../../utils/front-matter/index.js";

/** @import {Plugin, Settings} from "unified" */

/**
 * @type {Plugin<[], Settings>}
 */
const frontMatter = function () {
  const proto = this.Parser.prototype;
  proto.blockMethods = ["frontMatter", ...proto.blockMethods];
  proto.blockTokenizers.frontMatter = tokenizer;

  function tokenizer(eat, value) {
    const { frontMatter } = parseFrontMatter(value);

    if (frontMatter) {
      return eat(frontMatter.raw)(frontMatter);
    }
  }
  tokenizer.onlyAtStart = true;
};

export default frontMatter;
