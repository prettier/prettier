import htmlParser from "./parser-html.js";

const parsers = {
  // HTML
  get html() {
    return htmlParser.parsers.html;
  },
  // Vue
  get vue() {
    return htmlParser.parsers.vue;
  },
  // Angular
  get angular() {
    return htmlParser.parsers.angular;
  },
  // Lightning Web Components
  get lwc() {
    return htmlParser.parsers.lwc;
  },
};

export default parsers;
