"use strict";

module.exports = {
  // HTML
  get html() {
    return require("./parser-html").parsers.html;
  },
  // Vue
  get vue() {
    return require("./parser-html").parsers.vue;
  },
  // Angular
  get angular() {
    return require("./parser-html").parsers.angular;
  },
  // Lightning Web Components
  get lwc() {
    return require("./parser-html").parsers.lwc;
  },
};
