"use strict";

module.exports = {
  // JS - Babel
  get babel() {
    return require("./babel.js").parsers.babel;
  },
  get "babel-flow"() {
    return require("./babel.js").parsers["babel-flow"];
  },
  get "babel-ts"() {
    return require("./babel.js").parsers["babel-ts"];
  },
  get json() {
    return require("./babel.js").parsers.json;
  },
  get json5() {
    return require("./babel.js").parsers.json5;
  },
  get "json-stringify"() {
    return require("./babel.js").parsers["json-stringify"];
  },
  get __js_expression() {
    return require("./babel.js").parsers.__js_expression;
  },
  get __vue_expression() {
    return require("./babel.js").parsers.__vue_expression;
  },
  get __vue_ts_expression() {
    return require("./babel.js").parsers.__vue_ts_expression;
  },
  get __vue_event_binding() {
    return require("./babel.js").parsers.__vue_event_binding;
  },
  get __vue_ts_event_binding() {
    return require("./babel.js").parsers.__vue_ts_event_binding;
  },
  // JS - Flow
  get flow() {
    return require("./flow.js").parsers.flow;
  },
  // JS - TypeScript
  get typescript() {
    return require("./typescript.js").parsers.typescript;
  },
  // JS - Angular Action
  get __ng_action() {
    return require("./angular.js").parsers.__ng_action;
  },
  // JS - Angular Binding
  get __ng_binding() {
    return require("./angular.js").parsers.__ng_binding;
  },
  // JS - Angular Interpolation
  get __ng_interpolation() {
    return require("./angular.js").parsers.__ng_interpolation;
  },
  // JS - Angular Directive
  get __ng_directive() {
    return require("./angular.js").parsers.__ng_directive;
  },
  // JS - acorn
  get acorn() {
    return require("./acorn-and-espree.js").parsers.acorn;
  },
  // JS - espree
  get espree() {
    return require("./acorn-and-espree.js").parsers.espree;
  },
  // JS - meriyah
  get meriyah() {
    return require("./meriyah.js").parsers.meriyah;
  },
  // JS - Babel Estree
  get __babel_estree() {
    return require("./babel.js").parsers.__babel_estree;
  },
};
