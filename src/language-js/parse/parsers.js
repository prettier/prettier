/* BUNDLE_REMOVE_START */
import babel from "./babel.js";
import flow from "./flow.js";
import typescript from "./typescript.js";
import angular from "./angular.js";
import acornAndEspree from "./acorn-and-espree.js";
import meriyah from "./meriyah.js";
/* BUNDLE_REMOVE_END */

const parsers = {
  // JS - Babel
  get babel() {
    return /* require("./parser-babel.js") */ babel.parsers.babel;
  },
  get "babel-flow"() {
    return /* require("./parser-babel.js") */ babel.parsers["babel-flow"];
  },
  get "babel-ts"() {
    return /* require("./parser-babel.js") */ babel.parsers["babel-ts"];
  },
  get json() {
    return /* require("./parser-babel.js") */ babel.parsers.json;
  },
  get json5() {
    return /* require("./parser-babel.js") */ babel.parsers.json5;
  },
  get "json-stringify"() {
    return /* require("./parser-babel.js") */ babel.parsers["json-stringify"];
  },
  get __js_expression() {
    return /* require("./parser-babel.js") */ babel.parsers.__js_expression;
  },
  get __vue_expression() {
    return /* require("./parser-babel.js") */ babel.parsers.__vue_expression;
  },
  get __vue_event_binding() {
    return /* require("./parser-babel.js") */ babel.parsers.__vue_event_binding;
  },
  // JS - Flow
  get flow() {
    return /* require("./parser-flow.js") */ flow.parsers.flow;
  },
  // JS - TypeScript
  get typescript() {
    return /* require("./parser-typescript.js") */ typescript.parsers
      .typescript;
  },
  // JS - Angular Action
  get __ng_action() {
    return /* require("./parser-angular.js") */ angular.parsers.__ng_action;
  },
  // JS - Angular Binding
  get __ng_binding() {
    return /* require("./parser-angular.js") */ angular.parsers.__ng_binding;
  },
  // JS - Angular Interpolation
  get __ng_interpolation() {
    return /* require("./parser-angular.js") */ angular.parsers
      .__ng_interpolation;
  },
  // JS - Angular Directive
  get __ng_directive() {
    return /* require("./parser-angular.js") */ angular.parsers.__ng_directive;
  },
  // JS - acorn
  get acorn() {
    return /* require("./parser-espree.js") */ acornAndEspree.parsers.acorn;
  },
  // JS - espree
  get espree() {
    return /* require("./parser-espree.js") */ acornAndEspree.parsers.espree;
  },
  // JS - meriyah
  get meriyah() {
    return /* require("./parser-meriyah.js") */ meriyah.parsers.meriyah;
  },
  // JS - Babel Estree
  get __babel_estree() {
    return /* require("./parser-babel.js") */ babel.parsers.__babel_estree;
  },
};

export default parsers;
