/* eslint-env browser */
/* eslint no-var: off, strict: off, prefer-arrow-callback: off */

// NOTE: This file must work both in the playground, and in the build scripts to
// generate the issue template.

(function() {
  function formatMarkdown(
    input,
    output,
    output2,
    version,
    url,
    options,
    cliOptions,
    full
  ) {
    var syntax = getMarkdownSyntax(options);
    var optionsString = formatCLIOptions(cliOptions);
    var isIdempotent = output2 === "" || output === output2;

    return [
      "**Prettier " + version + "**",
      "[Playground link](" + url + ")",
      optionsString === "" ? null : codeBlock(optionsString, "sh"),
      "",
      "**Input:**",
      codeBlock(input, syntax),
      "",
      "**Output:**",
      codeBlock(output, syntax)
    ]
      .concat(
        isIdempotent
          ? []
          : ["", "**Second Output:**", codeBlock(output2, syntax)]
      )
      .concat(full ? ["", "**Expected behavior:**", ""] : [])
      .filter(function(part) {
        return part != null;
      })
      .join("\n");
  }

  function getMarkdownSyntax(options) {
    switch (options.parser) {
      case "babylon":
      case "flow":
        return "jsx";
      case "typescript":
        return "tsx";
      default:
        return options.parser;
    }
  }

  function formatCLIOptions(cliOptions) {
    return cliOptions
      .map(function(option) {
        var name = option[0];
        var value = option[1];
        return value === true ? name : name + " " + value;
      })
      .join("\n");
  }

  function codeBlock(content, syntax) {
    var backtickSequences = content.match(/`+/g) || [];
    var longestBacktickSequenceLength = Math.max.apply(
      null,
      backtickSequences.map(function(backticks) {
        return backticks.length;
      })
    );
    var fenceLength = Math.max(3, longestBacktickSequenceLength + 1);
    var fence = Array(fenceLength + 1).join("`");
    return [fence + (syntax || ""), content, fence].join("\n");
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = formatMarkdown;
  } else {
    window.formatMarkdown = formatMarkdown;
  }
})();
