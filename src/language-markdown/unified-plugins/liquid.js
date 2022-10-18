import { markdownLineEnding } from "micromark-util-character";
import { codes } from "micromark-util-symbol/codes";
import { markdownPlugin } from "./markdown-plugin.js";

/** @type {import('micromark-util-types').Construct} */
const liquidConstruct = {
  name: "liquid",
  concrete: true,
  tokenize(effects, ok, nok) {
    let type;
    return start;

    /** @type {import('micromark-util-types').State} */
    function start(code) {
      effects.enter("liquid");
      effects.consume(code);
      return openDelimiter;
    }

    /** @type {import('micromark-util-types').State} */
    function openDelimiter(code) {
      if (code === codes.percentSign) {
        type = "tag";
        effects.consume(code);
        return content;
      }
      if (code === codes.leftCurlyBrace) {
        type = "variable";
        effects.consume(code);
        return content;
      }
      return nok(code);
    }

    /** @type {import('micromark-util-types').State} */
    function content(code) {
      if (type === "tag" && code === codes.percentSign) {
        effects.consume(code);
        return closeDelimiter;
      }
      if (type === "variable" && code === codes.rightCurlyBrace) {
        effects.consume(code);
        return closeDelimiter;
      }
      effects.consume(code);
      return content;
    }

    /** @type {import('micromark-util-types').State} */
    function closeDelimiter(code) {
      if (code === codes.rightCurlyBrace) {
        effects.consume(code);
        effects.exit("liquid");
        return ok;
      }
      if (code === codes.eof) {
        return nok(code);
      }
      effects.consume(code);
      return content;
    }
  },
};

/** @type {import('micromark-util-types').Extension} */
const liquid = {
  flow: {
    [codes.leftCurlyBrace]: liquidConstruct,
  },
  text: {
    [codes.leftCurlyBrace]: liquidConstruct,
  },
};

/** @type {import('mdast-util-from-markdown').Extension} */
const liquidMDAST = {
  enter: {
    liquid(token) {
      this.enter({ type: "liquidNode", value: "", children: [] }, token);
    },
  },
  exit: {
    liquid(token) {
      const node = this.exit(token);
      node.value = this.sliceSerialize(token);
    },
  },
};

/** @type {import('unified').Plugin<[]>} */
export default function liquidPlugin() {
  this.use(markdownPlugin(liquid, liquidMDAST));
}
