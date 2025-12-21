/** @import {Plugin, Settings} from "unified" */

/**
 * @type {Plugin<[], Settings>}
 */
const wikiLink = function () {
  const entityType = "wikiLink";
  const wikiLinkRegex = /^\[\[(?<linkContents>.+?)\]\]/s;
  const proto = this.Parser.prototype;
  const methods = proto.inlineMethods;
  methods.splice(methods.indexOf("link"), 0, entityType);
  proto.inlineTokenizers.wikiLink = tokenizer;

  function tokenizer(eat, value) {
    const match = wikiLinkRegex.exec(value);

    if (match) {
      const linkContents = match.groups.linkContents.trim();

      return eat(match[0])({
        type: entityType,
        value: linkContents,
      });
    }
  }

  tokenizer.locator = function (value, fromIndex) {
    return value.indexOf("[", fromIndex);
  };
};

export default wikiLink;
