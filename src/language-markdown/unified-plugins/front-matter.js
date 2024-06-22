import parseFrontMatter from "../../utils/front-matter/parse.js";

/**
 * @type {import('unified-v9').Plugin<[], import('unified-v9').Settings>}
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
