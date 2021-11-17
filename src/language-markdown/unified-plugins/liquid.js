"use strict";

function liquid() {
  const proto = this.Parser.prototype;
  const methods = proto.inlineMethods;
  methods.splice(methods.indexOf("text"), 0, "liquid");
  proto.inlineTokenizers.liquid = tokenizer;

  function tokenizer(eat, value) {
    const match = value.match(/^({%.*?%}|{{.*?}})/s);

    if (match) {
      return eat(match[0])({
        type: "liquidNode",
        value: match[0],
      });
    }
  }
  tokenizer.locator = function (value, fromIndex) {
    return value.indexOf("{", fromIndex);
  };
}

module.exports = liquid;
