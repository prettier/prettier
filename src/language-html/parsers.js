/* BUNDLE_REMOVE_START */
import htmlParser from "./parser-html.js";
/* BUNDLE_REMOVE_END */

const parsers = {
  // HTML
  get html() {
    return /* require("./parser-html.js") */ htmlParser.parsers.html;
  },
  // Vue
  get vue() {
    return /* require("./parser-html.js") */ htmlParser.parsers.vue;
  },
  // Angular
  get angular() {
    return /* require("./parser-html.js") */ htmlParser.parsers.angular;
  },
  // Lightning Web Components
  get lwc() {
    return /* require("./parser-html.js") */ htmlParser.parsers.lwc;
  },
};

export default parsers;
