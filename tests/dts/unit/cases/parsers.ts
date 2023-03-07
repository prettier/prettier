import * as prettier from "../../../../dist/index.js";

import acornEspreePlugin from "../../../../dist/plugins/acorn-and-espree.js";
import angularPlugin from "../../../../dist/plugins/angular.js";
import babelPlugin from "../../../../dist/plugins/babel.js";
import flowPlugin from "../../../../dist/plugins/flow.js";
import glimmerPlugin from "../../../../dist/plugins/glimmer.js";
import graphqlPlugin from "../../../../dist/plugins/graphql.js";
import htmlPlugin from "../../../../dist/plugins/html.js";
import markdownPlugin from "../../../../dist/plugins/markdown.js";
import typescriptPlugin from "../../../../dist/plugins/typescript.js";
import meriyahPlugin from "../../../../dist/plugins/meriyah.js";
import postcssPlugin from "../../../../dist/plugins/postcss.js";
import yamlPlugin from "../../../../dist/plugins/yaml.js";

acornEspreePlugin.parsers.acorn.parse;
acornEspreePlugin.parsers.espree.parse;
angularPlugin.parsers.__ng_action.parse;
babelPlugin.parsers.babel.parse;
flowPlugin.parsers.flow.parse;
glimmerPlugin.parsers.glimmer.parse;
graphqlPlugin.parsers.graphql.parse;
htmlPlugin.parsers.html.parse;
htmlPlugin.parsers.vue.parse;
htmlPlugin.parsers.lwc.parse;
htmlPlugin.parsers.angular.parse;
markdownPlugin.parsers.markdown.parse;
markdownPlugin.parsers.mdx.parse;
typescriptPlugin.parsers.typescript.parse;
meriyahPlugin.parsers.meriyah.parse;
postcssPlugin.parsers.css.parse;
postcssPlugin.parsers.less.parse;
postcssPlugin.parsers.scss.parse;
yamlPlugin.parsers.yaml.parse;

prettier.format("hello world", {
  plugins: [
    acornEspreePlugin,
    angularPlugin,
    babelPlugin,
    flowPlugin,
    glimmerPlugin,
    htmlPlugin,
    markdownPlugin,
    meriyahPlugin,
    postcssPlugin,
    typescriptPlugin,
    yamlPlugin,
  ],
});
