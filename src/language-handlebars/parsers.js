/* BUNDLE_REMOVE_START */
import glimmerParser from "./parser-glimmer.js";
/* BUNDLE_REMOVE_END */

const parsers = {
  get glimmer() {
    return /* require("./parser-glimmer.js") */ glimmerParser.parsers.glimmer;
  },
};

export default parsers;
