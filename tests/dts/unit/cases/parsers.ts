import * as prettier from "../../../../scripts/build/dts-files/index";

import acornEspreeParser from "../../../../scripts/build/dts-files/plugins/acorn-and-espree";
import angularParser from "../../../../scripts/build/dts-files/plugins/angular";
import babelParser from "../../../../scripts/build/dts-files/plugins/babel";
import flowParser from "../../../../scripts/build/dts-files/plugins/flow";
import glimmerParser from "../../../../scripts/build/dts-files/plugins/glimmer";
import graphqlParser from "../../../../scripts/build/dts-files/plugins/graphql";
import htmlParser from "../../../../scripts/build/dts-files/plugins/html";
import markdownParser from "../../../../scripts/build/dts-files/plugins/markdown";
import meriyahParser from "../../../../scripts/build/dts-files/plugins/meriyah";
import postcssParser from "../../../../scripts/build/dts-files/plugins/postcss";
import typescriptParser from "../../../../scripts/build/dts-files/plugins/typescript";
import yamlParser from "../../../../scripts/build/dts-files/plugins/yaml";

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
