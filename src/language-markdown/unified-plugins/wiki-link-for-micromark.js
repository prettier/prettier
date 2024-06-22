import { codes } from "micromark-util-symbol";

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
      effects.enter("wikiLinkStart");
      effects.consume(code);
      return openDelimiter;
    }

    /** @type {import('micromark-util-types').State} */
    function openDelimiter(code) {
      if (code === codes.leftSquareBracket) {
        effects.consume(code);
        effects.exit("wikiLinkStart");
        effects.enter("wikiLinkContent");
        return content;
      }
      return nok(code);
    }

    /** @type {import('micromark-util-types').State} */
    function content(code) {
      if (code === codes.rightSquareBracket) {
        return effects.check(
          wikiLinkEndConstruct,
          startEnd,
          skipBracketContent,
        )(code);
      }
      if (code === codes.eof) {
        return nok(code);
      }
      effects.consume(code);
      return content;
    }

    // used to skip a lone ] in the wiki link
    /** @type {import('micromark-util-types').State} */
    function skipBracketContent(code) {
      if (code === codes.eof) {
        return nok(code);
      }
      effects.consume(code);
      return content;
    }

    // code + next code === "]]"
    /** @type {import('micromark-util-types').State} */
    function startEnd(code) {
      effects.exit("wikiLinkContent");
      effects.enter("wikiLinkEnd");
      effects.consume(code);
      return end;
    }

    /** @type {import('micromark-util-types').State} */
    function end(code) {
      effects.consume(code);
      effects.exit("wikiLinkEnd");
      return ok;
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
    wikiLinkContent(token) {
      this.enter({ type: "wikiLink", value: "", children: [] }, token);
    },
  },
  exit: {
    wikiLinkContent(token) {
      const node = this.exit(token);
      node.value = this.sliceSerialize(token).trim();
    },
  },
};

/** @type {import('unified').Plugin<[]>} */
export default function liquidPlugin() {
  this.use(markdownPlugin(wikiLink, wikiLinkMDAST));
}
