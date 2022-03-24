import babel from "./babel.js";
import flow from "./flow.js";
import typescript from "./typescript.js";
import angular from "./angular.js";
import acornAndEspree from "./acorn-and-espree.js";
import meriyah from "./meriyah.js";

const parsers = {
  // JS - Babel
  get babel() {
    return babel.parsers.babel;
  },
  get "babel-flow"() {
    return babel.parsers["babel-flow"];
  },
  get "babel-ts"() {
    return babel.parsers["babel-ts"];
  },
  get json() {
    return babel.parsers.json;
  },
  get json5() {
    return babel.parsers.json5;
  },
  get "json-stringify"() {
    return babel.parsers["json-stringify"];
  },
  get __js_expression() {
    return babel.parsers.__js_expression;
  },
  get __vue_expression() {
    return babel.parsers.__vue_expression;
  },
  get __vue_event_binding() {
    return babel.parsers.__vue_event_binding;
  },
  // JS - Flow
  get flow() {
    return flow.parsers.flow;
  },
  // JS - TypeScript
  get typescript() {
    return typescript.parsers.typescript;
  },
  // JS - Angular Action
  get __ng_action() {
    return angular.parsers.__ng_action;
  },
  // JS - Angular Binding
  get __ng_binding() {
    return angular.parsers.__ng_binding;
  },
  // JS - Angular Interpolation
  get __ng_interpolation() {
    return angular.parsers.__ng_interpolation;
  },
  // JS - Angular Directive
  get __ng_directive() {
    return angular.parsers.__ng_directive;
  },
  // JS - acorn
  get acorn() {
    return acornAndEspree.parsers.acorn;
  },
  // JS - espree
  get espree() {
    return acornAndEspree.parsers.espree;
  },
  // JS - meriyah
  get meriyah() {
    return meriyah.parsers.meriyah;
  },
  // JS - Babel Estree
  get __babel_estree() {
    return babel.parsers.__babel_estree;
  },
};

export default parsers;
