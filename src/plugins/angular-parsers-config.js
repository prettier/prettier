export default [
  {
    importParsers: () => import("../language-js/parse/angular.js"),
    parserNames: [
      "__ng_action",
      "__ng_binding",
      "__ng_interpolation",
      "__ng_directive",
    ],
  },
];
