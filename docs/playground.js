/* eslint-env browser */
/* eslint no-var: off, strict: off, prefer-arrow-callback: off */
/* global CodeMirror prettierVersion */

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

var worker = new Worker("./worker.js");
// Warm up the worker (load the current parser while CodeMirror loads)
worker.postMessage({ text: "", options: state.options });

window.onload = function() {
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
  state.options && setOptions(state.options);

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

  function formatAsync() {
    var options = getOptions();

    outputEditor.setOption("rulers", [
      { column: options.printWidth, color: "#444444" }
    ]);
    document.querySelector(".ast").style.display = options.ast
      ? "flex"
      : "none";
    document.querySelector(".doc").style.display = options.doc
      ? "flex"
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
      doc: options.doc
    });
  }

  var editorOptions = {
    lineNumbers: true,
    keyMap: "sublime",
    autoCloseBrackets: true,
    matchBrackets: true,
    showCursorWhenSelecting: true,
    theme: "neat",
    tabWidth: 2
  };
  var inputEditor = CodeMirror.fromTextArea(
    document.getElementById("input-editor"),
    editorOptions
  );
  inputEditor.on("change", formatAsync);

  var docEditor = CodeMirror.fromTextArea(
    document.getElementById("doc-editor"),
    { readOnly: true, lineNumbers: false, theme: "neat" }
  );
  var astEditor = CodeMirror.fromTextArea(
    document.getElementById("ast-editor"),
    { readOnly: true, lineNumbers: false, theme: "neat" }
  );
  var outputEditor = CodeMirror.fromTextArea(
    document.getElementById("output-editor"),
    { readOnly: true, lineNumbers: true, theme: "neat" }
  );

  Array.from(document.querySelectorAll("textarea")).forEach(function(element) {
    element.classList.remove("loading");
  });

  worker.onmessage = function(message) {
    outputEditor.setValue(message.data.formatted);
    docEditor.setValue(message.data.doc || "");
    astEditor.setValue(message.data.ast || "");
  };

  inputEditor.setValue(state.content);
  document.querySelector(".options-container").onchange = formatAsync;
  document.querySelector(".version").innerText = prettierVersion;
};
