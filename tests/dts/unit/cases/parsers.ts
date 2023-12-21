import * as prettier from "../../../../dist/index.js";

import * as prettierPluginEstree from "../../../../dist/plugins/estree.js";
import * as prettierPluginBabel from "../../../../dist/plugins/babel.js";
import * as prettierPluginFlow from "../../../../dist/plugins/flow.js";
import * as prettierPluginTypeScript from "../../../../dist/plugins/typescript.js";
import * as prettierPluginAcorn from "../../../../dist/plugins/acorn.js";
import * as prettierPluginMeriyah from "../../../../dist/plugins/meriyah.js";
import * as prettierPluginAngular from "../../../../dist/plugins/angular.js";
import * as prettierPluginPostcss from "../../../../dist/plugins/postcss.js";
import * as prettierPluginGraphql from "../../../../dist/plugins/graphql.js";
import * as prettierPluginMarkdown from "../../../../dist/plugins/markdown.js";
import * as prettierPluginGlimmer from "../../../../dist/plugins/glimmer.js";
import * as prettierPluginHtml from "../../../../dist/plugins/html.js";
import * as prettierPluginYaml from "../../../../dist/plugins/yaml.js";
import * as prettierPluginIgnore from "../../../../dist/plugins/ignore.js";

prettierPluginBabel.parsers.babel.parse("code");
prettierPluginFlow.parsers.flow.parse("code");
prettierPluginTypeScript.parsers.typescript.parse("code");
prettierPluginAcorn.parsers.acorn.parse("code");
prettierPluginAcorn.parsers.espree.parse("code");
prettierPluginMeriyah.parsers.meriyah.parse("code");
prettierPluginAngular.parsers.__ng_action.parse("code");
prettierPluginPostcss.parsers.css.parse("code");
prettierPluginPostcss.parsers.less.parse("code");
prettierPluginPostcss.parsers.scss.parse("code");
prettierPluginGraphql.parsers.graphql.parse("code");
prettierPluginMarkdown.parsers.remark.parse("code");
prettierPluginMarkdown.parsers.markdown.parse("code");
prettierPluginMarkdown.parsers.mdx.parse("code");
prettierPluginGlimmer.parsers.glimmer.parse("code");
prettierPluginHtml.parsers.html.parse("code");
prettierPluginHtml.parsers.vue.parse("code");
prettierPluginHtml.parsers.lwc.parse("code");
prettierPluginHtml.parsers.angular.parse("code");
prettierPluginYaml.parsers.yaml.parse("code");
prettierPluginIgnore.parsers.ignore.parse("code");

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
    prettierPluginIgnore,
  ],
});
