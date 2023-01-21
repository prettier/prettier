import * as prettier from "../../../../scripts/build/dts-files/index";

import acornEspreeParser from "../../../../scripts/build/dts-files/plugins/acorn-and-espree";
import angularParser from "../../../../scripts/build/dts-files/plugins/parser-angular";
import babelParser from "../../../../scripts/build/dts-files/plugins//parser-babel";
import flowParser from "../../../../scripts/build/dts-files/plugins/parser-flow";
import glimmerParser from "../../../../scripts/build/dts-files/plugins/parser-glimmer";
import graphqlParser from "../../../../scripts/build/dts-files/plugins/parser-graphql";
import htmlParser from "../../../../scripts/build/dts-files/plugins//parser-html";
import markdownParser from "../../../../scripts/build/dts-files/plugins/parser-markdown";
import meriyahParser from "../../../../scripts/build/dts-files/plugins/parser-meriyah";
import postcssParser from "../../../../scripts/build/dts-files/plugins/parser-postcss";
import typescriptParser from "../../../../scripts/build/dts-files/plugins/parser-typescript";
import yamlParser from "../../../../scripts/build/dts-files/plugins/parser-yaml";

acornEspreeParser.parsers.acorn.parse;
acornEspreeParser.parsers.espree.parse;
angularParser.parsers.__ng_action.parse;
babelParser.parsers.babel.parse;
flowParser.parsers.flow.parse;
glimmerParser.parsers.glimmer.parse;
graphqlParser.parsers.graphql.parse;
htmlParser.parsers.html.parse;
htmlParser.parsers.vue.parse;
htmlParser.parsers.lwc.parse;
htmlParser.parsers.angular.parse;
markdownParser.parsers.markdown.parse;
markdownParser.parsers.mdx.parse;
meriyahParser.parsers.meriyah.parse;
postcssParser.parsers.css.parse;
postcssParser.parsers.less.parse;
postcssParser.parsers.scss.parse;
typescriptParser.parsers.typescript.parse;
yamlParser.parsers.yaml.parse;

prettier.format("hello world", {
  plugins: [
    acornEspreeParser,
    angularParser,
    babelParser,
    flowParser,
    glimmerParser,
    htmlParser,
    markdownParser,
    meriyahParser,
    postcssParser,
    typescriptParser,
    yamlParser,
  ],
});
