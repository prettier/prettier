"use strict";

module.exports = {
  // JS - Babel
  get babel() {
    return require("./babel").parsers.babel;
  },
  get "babel-flow"() {
    return require("./babel").parsers["babel-flow"];
  },
  get "babel-ts"() {
    return require("./babel").parsers["babel-ts"];
  },
  get json() {
    return require("./babel").parsers.json;
  },
  get json5() {
    return require("./babel").parsers.json5;
  },
  get "json-stringify"() {
    return require("./babel").parsers["json-stringify"];
  },
  get __js_expression() {
    return require("./babel").parsers.__js_expression;
  },
  get __vue_expression() {
    return require("./babel").parsers.__vue_expression;
  },
  get __vue_event_binding() {
    return require("./babel").parsers.__vue_event_binding;
  },
  // JS - Flow
  get flow() {
    return require("./flow").parsers.flow;
  },
  // JS - TypeScript
  get typescript() {
    return require("./typescript").parsers.typescript;
  },
  // JS - Angular Action
  get __ng_action() {
    return require("./angular").parsers.__ng_action;
  },
  // JS - Angular Binding
  get __ng_binding() {
    return require("./angular").parsers.__ng_binding;
  },
  // JS - Angular Interpolation
  get __ng_interpolation() {
    return require("./angular").parsers.__ng_interpolation;
  },
  // JS - Angular Directive
  get __ng_directive() {
    return require("./angular").parsers.__ng_directive;
  },
  // JS - espree
  get espree() {
    return require("./espree").parsers.espree;
  },
  // JS - meriyah
  get meriyah() {
    return require("./meriyah").parsers.meriyah;
  },
  // JS - Babel Estree
  get __babel_estree() {
    return require("./babel").parsers.__babel_estree;
  },
};
