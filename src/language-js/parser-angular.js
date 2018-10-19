"use strict";

const locFns = require("./loc");

function createParser(_parse) {
  const parse = (text /*, parsers, opts */) => {
    const ngEstreeParser = require("angular-estree-parser");
    return { type: "NGRoot", node: _parse(text, ngEstreeParser) };
  };
  return Object.assign({ astFormat: "estree", parse }, locFns);
}

module.exports = {
  parsers: {
    __ng_action: createParser((text, ng) => ng.parseAction(text)),
    __ng_binding: createParser((text, ng) => ng.parseBinding(text)),
    __ng_interpolation: createParser((text, ng) => ng.parseInterpolation(text)),
    __ng_directive: createParser((text, ng) => ng.parseTemplateBindings(text))
  }
};
