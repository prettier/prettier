/* eslint-env browser */
/* eslint no-var: off, strict: off, prefer-arrow-callback: off */
/* global Clipboard CodeMirror formatMarkdown LZString */

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
  "insertPragma",
  "requirePragma",
  "proseWrap",
  "arrowParens",
  "rangeStart",
  "rangeEnd",
  "doc",
  "ast",
  "output2"
];

var IDEMPOTENT_MESSAGE = "✓ Second format is unchanged.";

var worker = new Worker("/worker.js");

const DEFAULT_OPTIONS = {
  options: undefined,
  content: ""
};

function createRangeOverlay(rangeStartLocation, rangeEndLocation) {
  var rangeStartLine = rangeStartLocation.line;
  var rangeEndLine = rangeEndLocation.line;
  var rangeStartPos = rangeStartLocation.pos;
  var rangeEndPos = rangeEndLocation.pos;
  var isEndOnSameLineAsStart = rangeStartLine === rangeEndLine;
  var highlightedToken = "searching";

  return {
    token: function(stream) {
      var currentLine = stream.lineOracle.line;

      // we are on the line containing rangeStart
      if (currentLine === rangeStartLine) {
        // on the same line as, but not reached rangeStart yet,
        // jump straight to it
        if (rangeStartPos > stream.pos) {
          stream.pos = rangeStartPos;
          return;
        }
        // the rangeEnd is on the same line as the rangeStart
        if (isEndOnSameLineAsStart) {
          // we are still within the range,
          // keep iterating along the string stream,
          // marking it as highlighted
          if (stream.pos < rangeEndPos) {
            stream.pos += 1;
            return highlightedToken;
          }
          // we've moved outside of the range
          // just skip to the end
          return stream.skipToEnd();
        }
        // keep iterating along the string stream,
        // marking it as highlighted
        stream.pos += 1;
        return highlightedToken;
      }

      // we are on the line containing rangeEnd
      if (currentLine === rangeEndLine) {
        // keep iterating along the string stream,
        // marking it as highlighted
        if (rangeEndPos > stream.pos) {
          stream.pos += 1;
          return highlightedToken;
        }
        // we've moved outside of the range
        // just skip to the end
        return stream.skipToEnd();
      }

      // we are on a line which is completely included
      // within the range, mark it all as highlighted
      if (currentLine > rangeStartLine && currentLine < rangeEndLine) {
        stream.skipToEnd();
        return highlightedToken;
      }

      // no action can be required on the current line
      // as it must fall outside of the range,
      // so just skip to the end
      return stream.skipToEnd();
    }
  };
}

function indexToEditorLocation(editorContent, index) {
  var line = 0;
  var count = 0;
  var startIndex = 0;
  for (var c, i = 0; count < index && i < editorContent.length; i++) {
    count++;
    c = editorContent[i];
    if (c === "\n") {
      line++;
      startIndex = count;
    }
  }
  return {
    line: line,
    pos: count - startIndex
  };
}

window.onload = function() {
  var state = (function loadState(hash) {
    var parsed;
    try {
      // providing backwards support for old json encoded URIComponent
      if (hash.indexOf("%7B%22") !== -1) {
        parsed = JSON.parse(decodeURIComponent(hash));
      } else {
        parsed = JSON.parse(LZString.decompressFromEncodedURIComponent(hash));
      }
    } catch (error) {
      return DEFAULT_OPTIONS;
    }
    // Support old links with the deprecated "postcss" value for the parser option.
    if (parsed && parsed.options && parsed.options.parser === "postcss") {
      parsed.options.parser = "css";
    }

    return parsed || DEFAULT_OPTIONS;
  })(location.hash.slice(1));

  worker.onmessage = function(message) {
    if (prettierVersion === "?") {
      prettierVersion = message.data.version;

      var link = document.createElement("a");
      var match = prettierVersion.match(/^\d+\.\d+\.\d+-pr.(\d+)$/);
      if (match) {
        link.href = "https://github.com/prettier/prettier/pull/" + match[1];
        link.textContent = "PR #" + match[1];
        prettierVersion = "pr-" + match[1];
      } else {
        if (prettierVersion.match(/\.0$/)) {
          link.href =
            "https://github.com/prettier/prettier/releases/tag/" +
            prettierVersion;
        } else {
          link.href =
            "https://github.com/prettier/prettier/blob/master/CHANGELOG.md#" +
            prettierVersion.replace(/\./g, "");
        }
        link.textContent = "v" + prettierVersion;
      }
      document.getElementById("version").appendChild(link);
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

  state.options && setOptions(state.options);

  var editorOptions = {
    lineNumbers: true,
    keyMap: "sublime",
    autoCloseBrackets: true,
    matchBrackets: true,
    showCursorWhenSelecting: true,
    tabWidth: 2,
    mode: "jsx"
  };
  inputEditor = CodeMirror.fromTextArea(
    document.getElementById("input-editor"),
    editorOptions
  );
  docEditor = CodeMirror.fromTextArea(document.getElementById("doc-editor"), {
    readOnly: true,
    lineNumbers: false,
    mode: "jsx"
  });
  astEditor = CodeMirror.fromTextArea(document.getElementById("ast-editor"), {
    readOnly: true,
    lineNumbers: false,
    mode: "jsx"
  });
  outputEditor = CodeMirror.fromTextArea(
    document.getElementById("output-editor"),
    {
      readOnly: true,
      lineNumbers: true,
      mode: "jsx"
    }
  );
  output2Editor = CodeMirror.fromTextArea(
    document.getElementById("output2-editor"),
    {
      readOnly: true,
      lineNumbers: true,
      mode: "jsx"
    }
  );

  var editors = document.querySelectorAll(".editor");
  for (var i = 0; i < editors.length; i++) {
    editors[i].classList.remove("loading");
  }

  setEditorStyles();

  inputEditor.setValue(state.content);
  inputEditor.on("change", formatAsync);
  formatAsync();

  document.querySelector(".options-container").onchange = formatAsync;

  document.getElementById("button-clear").onclick = function() {
    inputEditor.setValue("");
  };

  var optionsElement = document.getElementById("options-details");
  document.getElementById("button-options").onclick = function() {
    var classes = optionsElement.classList;
    if (classes.contains("open")) {
      classes.remove("open");
      this.innerHTML = "Show options";
    } else {
      classes.add("open");
      this.innerHTML = "Hide options";
    }
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
      if (elem.value !== "") {
        options[option] = Number(elem.value);
      }
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

function getCodemirrorMode(options) {
  switch (options.parser) {
    case "css":
    case "less":
    case "scss":
      return "css";
    case "markdown":
      return "markdown";
    default:
      return "jsx";
  }
}

var inputEditorOverlay;

function formatAsync() {
  var options = getOptions();
  setEditorStyles();

  var value = LZString.compressToEncodedURIComponent(
    JSON.stringify(
      Object.assign({ content: inputEditor.getValue(), options: options })
    )
  );
  replaceHash(value);

  if (
    typeof options.rangeStart === "number" &&
    typeof options.rangeEnd === "number"
  ) {
    var rangeStartLocation = indexToEditorLocation(
      inputEditor.getValue(),
      options.rangeStart
    );
    var rangeEndLocation = indexToEditorLocation(
      inputEditor.getValue(),
      options.rangeEnd
    );
    inputEditor.removeOverlay(inputEditorOverlay);
    inputEditorOverlay = createRangeOverlay(
      rangeStartLocation,
      rangeEndLocation
    );
    inputEditor.addOverlay(inputEditorOverlay);
  }

  worker.postMessage({
    text: inputEditor.getValue() || getExample(options.parser),
    options: options,
    ast: options.ast,
    doc: options.doc,
    formatted2: options.output2
  });
}

function setEditorStyles() {
  var options = getOptions();

  inputEditor.setOption("placeholder", getExample(options.parser));

  var mode = getCodemirrorMode(options);
  inputEditor.setOption("mode", mode);
  outputEditor.setOption("mode", mode);
  output2Editor.setOption("mode", mode);

  inputEditor.setOption("rulers", [
    { column: options.printWidth, color: "#eeeeee" }
  ]);

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
}

function createMarkdown(full) {
  var output = outputEditor.getValue();
  var output2 = output2Editor.getValue();
  var options = getOptions();
  var input = inputEditor.getValue() || getExample(options.parser);
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

function getExample(parser) {
  switch (parser) {
    case "babylon":
      return [
        'function HelloWorld({greeting = "hello", greeted = \'"World"\', silent = false, onMouseOver,}) {',
        "",
        "  if(!greeting){return null};",
        "",
        "     // TODO: Don't use random in render",
        '  let num = Math.floor (Math.random() * 1E+7).toString().replace(/\\.\\d+/ig, "")',
        "",
        "  return <div className='HelloWorld' title={`You are visitor number ${ num }`} onMouseOver={onMouseOver}>",
        "",
        "    <strong>{ greeting.slice( 0, 1 ).toUpperCase() + greeting.slice(1).toLowerCase() }</strong>",
        '    {greeting.endsWith(",") ? " " : <span style={{color: \'\\grey\'}}>", "</span> }',
        "    <em>",
        "\t{ greeted }",
        "\t</em>",
        "    { (silent)",
        '      ? "."',
        '      : "!"}',
        "",
        "    </div>;",
        "",
        "}"
      ].join("\n");
    case "flow":
      return [
        "declare export function graphql<Props, Variables, Component: React$ComponentType<Props>>",
        "  (query: GQLDocument, config?: Config<Props, QueryConfigOptions<Variables>>):",
        "  (Component: Component) => React$ComponentType<$Diff<React$ElementConfig<Component>, {",
        "    data: Object|void,",
        "    mutate: Function|void",
        "  }>>",
        "",
        'declare type FetchPolicy = "cache-first" | "cache-and-network" | "network-only" | "cache-only"'
      ].join("\n");
    case "typescript":
      return [
        "interface MyInterface {",
        "  foo(): string,",
        "  bar: Array<number>,",
        "}",
        "",
        "export abstract class Foo implements MyInterface {",
        "  foo() {",
        "            // TODO: return an actual value here",
        "        return 'hello'",
        "      }",
        "  get bar() {",
        "    return [  1,",
        "",
        "      2, 3,",
        "    ]",
        "  }",
        "}",
        "",
        "type RequestType = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'OPTIONS' | 'CONNECT' | 'DELETE' | 'TRACE'"
      ].join("\n");
    case "css":
      // Excerpted from the Bootstrap source, which is licensed under the MIT license:
      // https://github.com/twbs/bootstrap/blob/v4.0.0-beta.3/LICENSE
      return [
        "@media (max-width: 480px) {",
        "  .bd-examples {margin-right: -.75rem;margin-left: -.75rem",
        "  }",
        "  ",
        ' .bd-examples>[class^="col-"]  {',
        "    padding-right: .75rem;",
        "    padding-left: .75rem;",
        "  ",
        "  }",
        "}"
      ].join("\n");
    case "scss":
      // Excerpted from the Bootstrap source, which is licensed under the MIT license:
      // https://github.com/twbs/bootstrap/blob/v4.0.0-beta.3/LICENSE
      return [
        "@function color-yiq($color) {",
        "  $r: red($color);$g: green($color);$b: blue($color);",
        "",
        "  $yiq: (($r * 299) + ($g * 587) + ($b * 114)) / 1000;",
        "",
        "  @if ($yiq >= $yiq-contrasted-threshold) {",
        "    @return $yiq-text-dark;",
        "} @else {",
        "    @return $yiq-text-light;",
        "  }",
        "}",
        "",
        "@each $color, $value in $colors {",
        "  .swatch-#{$color} {",
        "    color: color-yiq($value);",
        "    background-color: #{$value};",
        "  }",
        "}"
      ].join("\n");
    case "less":
      // Copied from http://lesscss.org/features/#detached-rulesets-feature
      return [
        "@my-ruleset: {",
        "    .my-selector {",
        "      @media tv {",
        "        background-color: black;",
        "      }",
        "    }",
        "  };",
        "@media (orientation:portrait) {",
        "    @my-ruleset();",
        "}"
      ].join("\n");
    case "json":
      // Excerpted & adapted from Wikipedia, under the Creative Commons Attribution-ShareAlike License
      // https://en.wikipedia.org/wiki/JSON#Example
      return [
        '{"allOn": "Single", "Line": "example",',
        '"noSpace":true,',
        '  "quote": {',
        "    'singleQuote': 'example',",
        '                  "indented": true,',
        "  },",
        '  "phoneNumbers": [',
        '    {"type": "home",',
        '      "number": "212 555-1234"},',
        '    {"type": "office",',
        '      "trailing": "commas by accident"},',
        "  ],",
        "}"
      ].join("\n");
    case "graphql":
      return [
        "query Browse($offset: Int, $limit: Int, $categories: [String!], $search: String) {",
        "  browse(limit: $limit, offset: $offset, categories: $categories, search: $search) {",
        "    total,",
        "    results {",
        "        title",
        "        price",
        "    }",
        "  }",
        "}"
      ].join("\n");
    case "markdown":
      return [
        "Header",
        "======",
        "",
        "_Look,_ code blocks are formatted *too!*",
        "",
        "``` js",
        "function identity(x) { return x }",
        "```",
        "",
        "Pilot|Airport|Hours",
        "--|:--:|--:",
        "John Doe|SKG|1338",
        "Jane Roe|JFK|314",
        "",
        "- - - - - - - - - - - - - - -",
        "",
        "+ List",
        " + with a [link] (/to/somewhere)",
        "+ and [another one]",
        "",
        "",
        "  [another one]:  http://example.com 'Example title'",
        "",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        "Curabitur consectetur maximus risus, sed maximus tellus tincidunt et."
      ].join("\n");
    case "vue":
      return [
        "<template>",
        "  <p>Templates are not formatted yet ...",
        "    </p>",
        "</template>",
        "",
        "<script>",
        "let Prettier = format => { your.js('though') }",
        "</script>",
        "",
        "<style>",
        ".and { css: too! important }",
        "</style>"
      ].join("\n");
    default:
      return "";
  }
}
