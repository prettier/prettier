import createParsers from "../utils/create-parsers.js";

const parsers = createParsers([
  [
    () => import("./parser-html.js"),
    [
      // HTML
      "html",
      // Vue
      "vue",
      // Angular
      "angular",
      // Lightning Web Components
      "lwc",
    ],
  ],
]);

export default parsers;
