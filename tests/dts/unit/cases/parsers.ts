import * as prettier from "../../../../src/index";

import acornEspreeParser from "../../../../src/language-js/parse/acorn-and-espree";
import angularParser from "../../../../src/language-js/parse/angular";
import babelParser from "../../../../src/language-js/parse/babel";
import flowParser from "../../../../src/language-js/parse/flow";
import glimmerParser from "../../../../src/language-handlebars/parser-glimmer";
import graphqlParser from "../../../../src/language-graphql/parser-graphql";
import htmlParser from "../../../../src/language-html/parser-html";
import markdownParser from "../../../../src/language-markdown/parser-markdown";
import meriyahParser from "../../../../src/language-js/parse/meriyah";
import postcssParser from "../../../../src/language-css/parser-postcss";
import typescriptParser from "../../../../src/language-js/parse/typescript";
import yamlParser from "../../../../src/language-yaml/parser-yaml";

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
