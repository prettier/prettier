/* eslint-env browser */
/* eslint no-var: off, strict: off, prefer-arrow-callback: off */
/* global Clipboard CodeMirror formatMarkdown */

var prettierVersion = "?";
var inputEditor;
var docEditor;
var astEditor;
var outputEditor;
var output2Editor;

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
  "ast",
  "output2"
];

var IDEMPOTENT_MESSAGE = "✓ Second format is unchanged.";

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
    output2Editor.setValue(
      message.data.formatted === ""
        ? ""
        : message.data.formatted2 === message.data.formatted
          ? IDEMPOTENT_MESSAGE
          : message.data.formatted2 || ""
    );
    document.getElementById("button-report-issue").search =
      "body=" + encodeURIComponent(createMarkdown(true));
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
  output2Editor = CodeMirror.fromTextArea(
    document.getElementById("output2-editor"),
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

function getCodemirrorMode(options) {
  switch (options.parser) {
    case "postcss":
      return "css";
    default:
      return "javascript";
  }
}

function formatAsync() {
  var options = getOptions();

  var mode = getCodemirrorMode(options);
  setCodemirrorMode(inputEditor, mode);
  setCodemirrorMode(outputEditor, mode);
  setCodemirrorMode(output2Editor, mode);

  [outputEditor, output2Editor].forEach(function(editor) {
    editor.setOption("rulers", [
      { column: options.printWidth, color: "#444444" }
    ]);
  });
  document.querySelector(".ast").style.display = options.ast ? "" : "none";
  document.querySelector(".doc").style.display = options.doc ? "" : "none";
  document.querySelector(".output2").style.display = options.output2
    ? ""
    : "none";

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
    doc: options.doc,
    formatted2: options.output2
  });
}

function createMarkdown(full) {
  var input = inputEditor.getValue();
  var output = outputEditor.getValue();
  var output2 = output2Editor.getValue();
  var options = getOptions();
  var cliOptions = getCLIOptions();
  var markdown = formatMarkdown(
    input,
    output,
    output2 === IDEMPOTENT_MESSAGE ? "" : output2,
    prettierVersion,
    window.location.href,
    options,
    cliOptions,
    full
  );
  return markdown;
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
