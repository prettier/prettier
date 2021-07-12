"use strict";

module.exports = {
  // JS - Babel
  get babel() {
    return require("./parser-babel").parsers.babel;
  },
  get "babel-flow"() {
    return require("./parser-babel").parsers["babel-flow"];
  },
  get "babel-ts"() {
    return require("./parser-babel").parsers["babel-ts"];
  },
  get json() {
    return require("./parser-babel").parsers.json;
  },
  get json5() {
    return require("./parser-babel").parsers.json5;
  },
  get "json-stringify"() {
    return require("./parser-babel").parsers["json-stringify"];
  },
  get __js_expression() {
    return require("./parser-babel").parsers.__js_expression;
  },
  get __vue_expression() {
    return require("./parser-babel").parsers.__vue_expression;
  },
  get __vue_event_binding() {
    return require("./parser-babel").parsers.__vue_event_binding;
  },
  // JS - Flow
  get flow() {
    return require("./parser-flow").parsers.flow;
  },
  // JS - TypeScript
  get typescript() {
    return require("./parser-typescript").parsers.typescript;
  },
  // JS - Angular Action
  get __ng_action() {
    return require("./parser-angular").parsers.__ng_action;
  },
  // JS - Angular Binding
  get __ng_binding() {
    return require("./parser-angular").parsers.__ng_binding;
  },
  // JS - Angular Interpolation
  get __ng_interpolation() {
    return require("./parser-angular").parsers.__ng_interpolation;
  },
  // JS - Angular Directive
  get __ng_directive() {
    return require("./parser-angular").parsers.__ng_directive;
  },
  // JS - espree
  get espree() {
    return require("./parser-espree").parsers.espree;
  },
  // JS - meriyah
  get meriyah() {
    return require("./parser-meriyah").parsers.meriyah;
  },
  // JS - Babel Estree
  get __babel_estree() {
    return require("./parser-babel").parsers.__babel_estree;
  },
};
