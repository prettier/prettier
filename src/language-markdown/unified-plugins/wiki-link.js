import { codes } from "micromark-util-symbol/codes";
import { markdownPlugin } from "./markdown-plugin.js";

/** @type {import('micromark-util-types').Construct} */
const wikiLinkEndConstruct = {
  name: "wikiLinkEnd",
  tokenize(effects, ok, nok) {
    return start;

    /** @type {import('micromark-util-types').State} */
    function start(code) {
      effects.consume(code);
      return end;
    }

    /** @type {import('micromark-util-types').State} */
    function end(code) {
      if (code === codes.rightSquareBracket) {
        effects.consume(code);
        return ok;
      }
      return nok(code);
    }
  },
};

/** @type {import('micromark-util-types').Construct} */
const wikiLinkConstruct = {
  name: "wikiLink",
  tokenize(effects, ok, nok) {
    return start;

    /** @type {import('micromark-util-types').State} */
    function start(code) {
      effects.consume(code);
      return openDelimiter;
    }

    /** @type {import('micromark-util-types').State} */
    function openDelimiter(code) {
      if (code === codes.leftSquareBracket) {
        effects.consume(code);
        effects.enter("wikiLink");
        return content;
      }
      return nok(code);
    }

    /** @type {import('micromark-util-types').State} */
    function content(code) {
      if (code === codes.rightSquareBracket) {
        return effects.check(
          wikiLinkEndConstruct,
          end,
          skipBracketContent
        )(code);
      }
      effects.consume(code);
      return content;
    }

    // used to skip a lone ] in the wiki link
    /** @type {import('micromark-util-types').State} */
    function skipBracketContent(code) {
      effects.consume(code);
      return content;
    }

    // code + next code === "]]"
    /** @type {import('micromark-util-types').State} */
    function end(code) {
      effects.exit("wikiLink");
      // should never fail
      return effects.attempt(wikiLinkConstruct, ok, () => {
        throw new Error("we already checked this!");
      })(code);
    }
  },
};

/** @type {import('micromark-util-types').Extension} */
const wikiLink = {
  text: {
    [codes.leftSquareBracket]: wikiLinkConstruct,
  },
};

/** @type {import('mdast-util-from-markdown').Extension} */
const wikiLinkMDAST = {
  enter: {
    liquid(token) {
      this.enter({ type: "wikiLink", value: "", children: [] }, token);
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
  this.use(markdownPlugin(wikiLink, wikiLinkMDAST));
}
