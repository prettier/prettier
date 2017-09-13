/* eslint-env browser */
/* eslint no-var: off, strict: off, prefer-arrow-callback: off */
/* global Clipboard CodeMirror */

var prettierVersion = "?";
var inputEditor;
var docEditor;
var astEditor;
var outputEditor;

var OPTIONS = [
  "printWidth",
  "tabWidth",
  "singleQuote",
  "trailingComma",
  "bracketSpacing",
  "jsxBracketSameLine",
  "parser",
  "semi",
  "useTabs",
  "doc",
  "ast"
];

var state = (function loadState(hash) {
  try {
    return JSON.parse(hash);
  } catch (error) {
    return {
      options: undefined,
      content:
        'hello ( "world"\n);\n\n' +
        '[ "lorem", "ipsum", \'dolor\', sit("amet"), consectetur[ \'adipiscing\' ] + "elit" ].reduce(\n  (first, second) => first + second,\n  "")\n\n' +
        "const Foo = ({ bar, baz, things }) => {\n" +
        '  return <div style={{\ncolor: "papayawhip"}}>\n' +
        "    <br/>{things.map(thing => reallyLongPleaseDontPutOnOneLine(thing) ? <p>{ok}</p> : <Quax bar={bar} baz={ baz } {...thing}></Quax>)\n" +
        "  }</div>}"
    };
  }
})(decodeURIComponent(location.hash.slice(1)));

var worker = new Worker("/worker.js");

worker.onmessage = function(message) {
  if (prettierVersion === "?") {
    prettierVersion = message.data.version;
    document.getElementById("version").textContent = prettierVersion;
  }
  if (outputEditor && docEditor && astEditor) {
    outputEditor.setValue(message.data.formatted);
    docEditor.setValue(message.data.doc || "");
    astEditor.setValue(message.data.ast || "");
    document.getElementById("button-report-issue").search =
      "body=" + encodeURIComponent(createIssueTemplate());
  }
};

// Warm up the worker (load the current parser while CodeMirror loads)
worker.postMessage({ text: "", options: state.options });

window.onload = function() {
  state.options && setOptions(state.options);

  CodeMirror.modeURL =
    "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.26.0/mode/%N/%N.js";

  var theme = "neat";
  var editorOptions = {
    lineNumbers: true,
    keyMap: "sublime",
    autoCloseBrackets: true,
    matchBrackets: true,
    showCursorWhenSelecting: true,
    theme: theme,
    tabWidth: 2
  };
  inputEditor = CodeMirror.fromTextArea(
    document.getElementById("input-editor"),
    editorOptions
  );
  inputEditor.on("change", formatAsync);

  docEditor = CodeMirror.fromTextArea(document.getElementById("doc-editor"), {
    readOnly: true,
    lineNumbers: false,
    theme: theme
  });
  astEditor = CodeMirror.fromTextArea(document.getElementById("ast-editor"), {
    readOnly: true,
    lineNumbers: false,
    theme: theme
  });
  outputEditor = CodeMirror.fromTextArea(
    document.getElementById("output-editor"),
    { readOnly: true, lineNumbers: true, theme: theme }
  );

  setCodemirrorMode(docEditor, "javascript");
  setCodemirrorMode(astEditor, "javascript");

  var editors = document.querySelectorAll(".editor");
  for (var i = 0; i < editors.length; i++) {
    editors[i].classList.remove("loading");
  }

  inputEditor.setValue(state.content);
  document.querySelector(".options-container").onchange = formatAsync;

  document.getElementById("button-clear").onclick = function() {
    inputEditor.setValue("");
  };

  var clipboard = new Clipboard("#button-copy-link, #button-copy-markdown", {
    text: function(trigger) {
      switch (trigger.id) {
        case "button-copy-link":
          return window.location.href;
        case "button-copy-markdown":
          return createMarkdown();
        default:
          return "";
      }
    }
  });
  clipboard.on("success", function(e) {
    showTooltip(e.trigger, "Copied!");
  });
  clipboard.on("error", function(e) {
    showTooltip(e.trigger, "Press ctrl+c to copy");
  });
};

function setOptions(options) {
  OPTIONS.forEach(function(option) {
    var elem = document.getElementById(option);
    if (elem.tagName === "SELECT") {
      elem.value = options[option];
    } else if (elem.type === "number") {
      elem.value = options[option];
    } else {
      var isInverted = elem.hasAttribute("data-inverted");
      elem.checked = isInverted ? !options[option] : options[option];
    }
  });
}

function getOptions() {
  var options = {};
  OPTIONS.forEach(function(option) {
    var elem = document.getElementById(option);
    if (elem.tagName === "SELECT") {
      options[option] = elem.value;
    } else if (elem.type === "number") {
      options[option] = Number(elem.value);
    } else {
      var isInverted = elem.hasAttribute("data-inverted");
      options[option] = isInverted ? !elem.checked : elem.checked;
    }
  });
  return options;
}

function getCLIOptions() {
  return OPTIONS.sort()
    .map(function(option) {
      var elem = document.getElementById(option);
      var match = elem.parentNode.textContent.match(/--\S+/);
      if (!match) {
        return null;
      }
      var name = match[0];
      if (elem.tagName === "SELECT") {
        if (elem.value === elem.options[0].value) {
          return null;
        }
        return [name, elem.value];
      } else if (elem.type === "number") {
        if (elem.value === elem.getAttribute("value")) {
          return null;
        }
        return [name, elem.value];
      } else if (elem.type === "checkbox") {
        if (!elem.checked) {
          return null;
        }
        return [name, true];
      }
      return null;
    })
    .filter(Boolean);
}

function replaceHash(hash) {
  if (
    typeof URL === "function" &&
    typeof history === "object" &&
    typeof history.replaceState === "function"
  ) {
    var url = new URL(location);
    url.hash = hash;
    history.replaceState(null, null, url);
  } else {
    location.hash = hash;
  }
}

function setCodemirrorMode(editor, mode) {
  editor.setOption("mode", mode);
  CodeMirror.autoLoadMode(editor, mode);
}

function formatAsync() {
  var options = getOptions();

  var mode = util.getCodemirrorMode(options);
  setCodemirrorMode(inputEditor, mode);
  setCodemirrorMode(outputEditor, mode);

  outputEditor.setOption("rulers", [
    { column: options.printWidth, color: "#444444" }
  ]);
  document.querySelector(".ast").style.display = options.ast ? "" : "none";
  document.querySelector(".doc").style.display = options.doc ? "" : "none";

  var value = encodeURIComponent(
    JSON.stringify(
      Object.assign({ content: inputEditor.getValue(), options: options })
    )
  );
  replaceHash(value);
  worker.postMessage({
    text: inputEditor.getValue(),
    options: options,
    ast: options.ast,
    doc: options.doc
  });
}

function createMarkdown() {
  var input = inputEditor.getValue();
  var output = outputEditor.getValue();
  var options = getOptions();
  var cliOptions = getCLIOptions();
  var markdown = util.formatMarkdown(
    input,
    output,
    prettierVersion,
    window.location.href,
    options,
    cliOptions
  );
  return markdown;
}

function createIssueTemplate() {
  return [createMarkdown(), "", "**Expected behavior:**", ""].join("\n");
}

function showTooltip(elem, text) {
  var tooltip = document.createElement("span");
  tooltip.className = "tooltip";
  tooltip.textContent = text;
  elem.appendChild(tooltip);
  window.setTimeout(function() {
    elem.removeChild(tooltip);
  }, 2000);
}

var util = (function() {
  function formatMarkdown(input, output, version, url, options, cliOptions) {
    var syntax = getMarkdownSyntax(options);
    var optionsString = formatCLIOptions(cliOptions);

    return [
      "**Prettier " + version + "**",
      "[Playground link](" + url + ")",
      optionsString === "" ? null : codeBlock(optionsString),
      "",
      "**Input:**",
      codeBlock(input, syntax),
      "",
      "**Output:**",
      codeBlock(output, syntax)
    ]
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
      case "postcss":
        return "scss";
      default:
        return options.parser;
    }
  }

  function getCodemirrorMode(options) {
    switch (options.parser) {
      case "postcss":
        return "css";
      default:
        return "javascript";
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

  return {
    formatMarkdown: formatMarkdown,
    getMarkdownSyntax: getMarkdownSyntax,
    getCodemirrorMode: getCodemirrorMode
  };
})();
