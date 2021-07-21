"use strict";

module.exports = {
  // HTML
  get html() {
    return require("./parser-html.js").parsers.html;
  },
  // Vue
  get vue() {
    return require("./parser-html.js").parsers.vue;
  },
  // Angular
  get angular() {
    return require("./parser-html.js").parsers.angular;
  },
  // Lightning Web Components
  get lwc() {
    return require("./parser-html.js").parsers.lwc;
  },
};
