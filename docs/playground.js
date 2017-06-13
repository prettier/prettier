/* eslint-env browser */
/* eslint no-var: off, strict: off, prefer-arrow-callback: off */
/* global CodeMirror prettierVersion */

(function() {
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
    "doc"
  ];
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

  function omitNonFormatterOptions(options) {
    var optionsClone = Object.assign({}, options);
    delete optionsClone.doc;
    return optionsClone;
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

    [docEditor, outputEditor].forEach(function(editor) {
      editor.setOption("rulers", [
        { column: options.printWidth, color: "#444444" }
      ]);
    });
    document.getElementsByClassName("doc")[0].style.display = options.doc
      ? "flex"
      : "none";

    var value = encodeURIComponent(
      JSON.stringify(
        Object.assign({ content: inputEditor.getValue(), options: options })
      )
    );
    replaceHash(value);
    var formatterOptions = omitNonFormatterOptions(options);
    worker.postMessage({
      text: inputEditor.getValue(),
      options: formatterOptions,
      doc: options.doc
    });
  }

  document.querySelector(".options-container").onchange = formatAsync;

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

  var outputEditor = CodeMirror.fromTextArea(
    document.getElementById("output-editor"),
    { readOnly: true, lineNumbers: true, theme: "neat" }
  );

  var worker = new Worker("./worker.js");
  worker.onmessage = function(message) {
    outputEditor.setValue(message.data.formatted);
    docEditor.setValue(message.data.doc || "");
  };

  document.getElementsByClassName("version")[0].innerText = prettierVersion;

  try {
    var json = JSON.parse(decodeURIComponent(location.hash.slice(1)));
    setOptions(json.options);
    inputEditor.setValue(json.content);
  } catch (e) {
    inputEditor.setValue(
      'hello ( "world"\n);\n\n' +
        '[ "lorem", "ipsum", \'dolor\', sit("amet"), consectetur[ \'adipiscing\' ] + "elit" ].reduce(\n  (first, second) => first + second,\n  "")\n\n' +
        "const Foo = ({ bar, baz, things }) => {\n" +
        '  return <div style={{\ncolor: "papayawhip"}}>\n' +
        "    <br/>{things.map(thing => reallyLongPleaseDontPutOnOneLine(thing) ? <p>{ok}</p> : <Quax bar={bar} baz={ baz } {...thing}></Quax>)\n" +
        "  }</div>}"
    );
  }
})();
