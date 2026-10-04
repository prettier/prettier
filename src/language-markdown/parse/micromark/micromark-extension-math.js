import { math as originalMath } from "micromark-extension-math";
import { markdownLineEnding } from "micromark-util-character";

function mathText(options) {
  const options_ = options || {};
  let single = options_.singleDollarTextMath;
  single ??= true;
  return {
    tokenize: tokenizeMathText,
    resolve: resolveMathText,
    previous,
    name: "mathText",
  };

  function tokenizeMathText(effects, ok, nok) {
    let sizeOpen = 0;
    let size;
    let token;
    return start;

    function start(code) {
      effects.enter("mathText");
      effects.enter("mathTextSequence");
      return sequenceOpen(code);
    }

    function sequenceOpen(code) {
      if (code === 36) {
        effects.consume(code);
        sizeOpen++;
        return sequenceOpen;
      }

      if (sizeOpen < 2 && !single) {
        return nok(code);
      }
      // Single dollar cannot be followed by a digit (currency like $10, $14)
      if (sizeOpen === 1 && code !== null && code >= 48 && code <= 57) {
        return nok(code);
      }
      effects.exit("mathTextSequence");
      return between(code);
    }

    function between(code) {
      if (code === null) {
        return nok(code);
      }
      if (code === 36) {
        token = effects.enter("mathTextSequence");
        size = 0;
        return sequenceClose(code);
      }

      // Single dollar math cannot span across lines or contain backticks
      if (sizeOpen === 1 && (markdownLineEnding(code) || code === 96)) {
        return nok(code);
      }

      if (code === 32) {
        effects.enter("space");
        effects.consume(code);
        effects.exit("space");
        return between;
      }
      if (markdownLineEnding(code)) {
        effects.enter("lineEnding");
        effects.consume(code);
        effects.exit("lineEnding");
        return between;
      }

      effects.enter("mathTextData");
      return data(code);
    }

    function data(code) {
      if (
        code === null ||
        code === 32 ||
        code === 36 ||
        markdownLineEnding(code)
      ) {
        effects.exit("mathTextData");
        return between(code);
      }
      if (sizeOpen === 1 && code === 96) {
        effects.exit("mathTextData");
        return nok(code);
      }
      effects.consume(code);
      return data;
    }

    function sequenceClose(code) {
      if (code === 36) {
        effects.consume(code);
        size++;
        return sequenceClose;
      }

      if (size === sizeOpen) {
        // Closing single dollar cannot be followed by an alphanumeric character
        // (e.g. `$FOO ... $BAR` where $BAR is a shell variable, or `$x$y`)
        if (
          sizeOpen === 1 &&
          code !== null &&
          ((code >= 65 && code <= 90) ||
            (code >= 97 && code <= 122) ||
            (code >= 48 && code <= 57) ||
            code === 95)
        ) {
          token.type = "mathTextData";
          return data(code);
        }
        effects.exit("mathTextSequence");
        effects.exit("mathText");
        return ok(code);
      }

      token.type = "mathTextData";
      return data(code);
    }
  }
}

function resolveMathText(events) {
  let tailExitIndex = events.length - 4;
  let headEnterIndex = 3;
  let index;
  let enter;

  if (
    (events[headEnterIndex][1].type === "lineEnding" ||
      events[headEnterIndex][1].type === "space") &&
    (events[tailExitIndex][1].type === "lineEnding" ||
      events[tailExitIndex][1].type === "space")
  ) {
    index = headEnterIndex;
    while (++index < tailExitIndex) {
      if (events[index][1].type === "mathTextData") {
        events[tailExitIndex][1].type = "mathTextPadding";
        events[headEnterIndex][1].type = "mathTextPadding";
        headEnterIndex += 2;
        tailExitIndex -= 2;
        break;
      }
    }
  }

  index = headEnterIndex - 1;
  tailExitIndex++;
  while (++index <= tailExitIndex) {
    if (enter === undefined) {
      if (index !== tailExitIndex && events[index][1].type !== "lineEnding") {
        enter = index;
      }
    } else if (
      index === tailExitIndex ||
      events[index][1].type === "lineEnding"
    ) {
      events[enter][1].type = "mathTextData";
      if (index !== enter + 2) {
        events[enter][1].end = events[index - 1][1].end;
        events.splice(enter + 2, index - enter - 2);
        tailExitIndex -= index - enter - 2;
        index = enter + 2;
      }
      enter = undefined;
    }
  }
  return events;
}

/**
 * @this {import('micromark-util-types').TokenizeContext}
 * @param {import('micromark-util-types').Code} code
 */
function previous(code) {
  return code !== 36 || this.events.at(-1)[1].type === "characterEscape";
}

function mathSyntax(options) {
  const { flow } = originalMath();
  return {
    flow,
    text: {
      36: mathText(options),
    },
  };
}

export { mathSyntax, mathText };
