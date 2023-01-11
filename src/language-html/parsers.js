const parsers = [
  {
    importPlugin: () => import("./parser-html.js"),
    parserNames: [
      // HTML
      "html",
      // Vue
      "vue",
      // Angular
      "angular",
      // Lightning Web Components
      "lwc",
    ],
  },
];

export default parsers;
