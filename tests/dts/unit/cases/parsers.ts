import * as prettier from "../../../../dist/prettier/index.js";

import * as prettierPluginEstree from "../../../../dist/prettier/plugins/estree.js";
import * as prettierPluginBabel from "../../../../dist/prettier/plugins/babel.js";
import * as prettierPluginFlow from "../../../../dist/prettier/plugins/flow.js";
import * as prettierPluginTypeScript from "../../../../dist/prettier/plugins/typescript.js";
import * as prettierPluginAcorn from "../../../../dist/prettier/plugins/acorn.js";
import * as prettierPluginMeriyah from "../../../../dist/prettier/plugins/meriyah.js";
import * as prettierPluginAngular from "../../../../dist/prettier/plugins/angular.js";
import * as prettierPluginPostcss from "../../../../dist/prettier/plugins/postcss.js";
import * as prettierPluginGraphql from "../../../../dist/prettier/plugins/graphql.js";
import * as prettierPluginMarkdown from "../../../../dist/prettier/plugins/markdown.js";
import * as prettierPluginGlimmer from "../../../../dist/prettier/plugins/glimmer.js";
import * as prettierPluginHtml from "../../../../dist/prettier/plugins/html.js";
import * as prettierPluginYaml from "../../../../dist/prettier/plugins/yaml.js";

const options: prettier.ParserOptions = {
  filepath: "/home/mark/prettier/bin/prettier.js",
  singleQuote: false,
  bracketSpacing: true,
  bracketSameLine: false,
  htmlWhitespaceSensitivity: "css",
  objectWrap: "preserve",
  singleAttributePerLine: false,
  vueIndentScriptAndStyle: false,
  arrowParens: "always",
  semi: true,
  experimentalOperatorPosition: "end",
  experimentalTernaries: false,
  jsxSingleQuote: false,
  quoteProps: "as-needed",
  trailingComma: "all",
  proseWrap: "preserve",
  cursorOffset: -1,
  endOfLine: "lf",
  insertPragma: false,
  parser: "meriyah",
  plugins: [
    {
      languages: [],
      options: {},
      parsers: {},
      printers: {},
    },
  ],
  printWidth: 80,
  rangeEnd: 240,
  rangeStart: 0,
  requirePragma: false,
  tabWidth: 2,
  useTabs: false,
  embeddedLanguageFormatting: "auto",
  astFormat: "estree",
  locEnd: (node) => 0,
  locStart: (node) => 0,
  printer: {
    print: (
      path: prettier.AstPath,
      options: prettier.ParserOptions,
      print: (path: prettier.AstPath) => prettier.Doc,
      args?: unknown,
    ) => [],
  },
  originalText: "bla bla bla",
};

prettierPluginBabel.parsers.babel.parse("code", options);
prettierPluginFlow.parsers.flow.parse("code", options);
prettierPluginTypeScript.parsers.typescript.parse("code", options);
prettierPluginAcorn.parsers.acorn.parse("code", options);
prettierPluginAcorn.parsers.espree.parse("code", options);
prettierPluginMeriyah.parsers.meriyah.parse("code", options);
prettierPluginAngular.parsers.__ng_action.parse("code", options);
prettierPluginPostcss.parsers.css.parse("code", options);
prettierPluginPostcss.parsers.less.parse("code", options);
prettierPluginPostcss.parsers.scss.parse("code", options);
prettierPluginGraphql.parsers.graphql.parse("code", options);
prettierPluginMarkdown.parsers.remark.parse("code", options);
prettierPluginMarkdown.parsers.markdown.parse("code", options);
prettierPluginMarkdown.parsers.mdx.parse("code", options);
prettierPluginGlimmer.parsers.glimmer.parse("code", options);
prettierPluginHtml.parsers.html.parse("code", options);
prettierPluginHtml.parsers.vue.parse("code", options);
prettierPluginHtml.parsers.lwc.parse("code", options);
prettierPluginHtml.parsers.mjml.parse("code", options);
prettierPluginHtml.parsers.angular.parse("code", options);
prettierPluginYaml.parsers.yaml.parse("code", options);

prettier.format("hello world", {
  plugins: [
    prettierPluginEstree,
    prettierPluginBabel,
    prettierPluginFlow,
    prettierPluginTypeScript,
    prettierPluginAcorn,
    prettierPluginMeriyah,
    prettierPluginAngular,
    prettierPluginPostcss,
    prettierPluginGraphql,
    prettierPluginMarkdown,
    prettierPluginGlimmer,
    prettierPluginHtml,
    prettierPluginYaml,
  ],
});
