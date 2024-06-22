import { codes } from "micromark-util-symbol";

import { markdownPlugin } from "./markdown-plugin.js";

/** @type {(type: string) => import('micromark-util-types').Construct} */
const liquidConstruct = (type) => ({
  name: type,
  concrete: true,
  tokenize(effects, ok, nok) {
    let kind;
    return start;

    /** @type {import('micromark-util-types').State} */
    function start(code) {
      effects.enter(type);
      effects.consume(code);
      return openDelimiter;
    }

    /** @type {import('micromark-util-types').State} */
    function openDelimiter(code) {
      if (code === codes.percentSign) {
        kind = "tag";
        effects.consume(code);
        return content;
      }
      if (code === codes.leftCurlyBrace) {
        kind = "variable";
        effects.consume(code);
        return content;
      }
      return nok(code);
    }

    /** @type {import('micromark-util-types').State} */
    function content(code) {
      if (kind === "tag" && code === codes.percentSign) {
        effects.consume(code);
        return closeDelimiter;
      }
      if (kind === "variable" && code === codes.rightCurlyBrace) {
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
        effects.exit(type);
        return ok;
      }
      if (code === codes.eof) {
        return nok(code);
      }
      effects.consume(code);
      return content;
    }
  },
});

/** @type {import('micromark-util-types').Extension} */
const liquid = {
  text: {
    [codes.leftCurlyBrace]: liquidConstruct("liquid"),
  },
  flow: {
    [codes.leftCurlyBrace]: liquidConstruct("liquidFlow"),
  },
};

/** @type {import('mdast-util-from-markdown').Extension} */
const liquidMDAST = {
  enter: {
    liquid(token) {
      this.enter({ type: "liquidNode", value: "", children: [] }, token);
    },
    liquidFlow(token) {
      this.enter({ type: "liquidBlock", value: "", children: [] }, token);
    },
  },
  exit: {
    liquid(token) {
      this.exit(token);
      this.stack.at(-1).value = this.sliceSerialize(token);
    },
    liquidFlow(token) {
      this.exit(token);
      this.stack.at(-1).value = this.sliceSerialize(token);
    },
  },
};

/** @type {import('unified').Plugin<[]>} */
export default function liquidPlugin() {
  this.use(markdownPlugin(liquid, liquidMDAST));
}
