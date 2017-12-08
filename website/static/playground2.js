/* eslint-env browser */
/* eslint no-var: off, strict: off, prefer-arrow-callback: off */
/* global Clipboard CodeMirror formatMarkdown LZString preact */

var h = preact.h;

var CATEGORIES = ["Global", "JavaScript", "Markdown", "Special"];
var OPTIONS = [
  "parser",
  "printWidth",
  "tabWidth",
  "useTabs",
  { name: "semi", inverted: true },
  "singleQuote",
  { name: "bracketSpacing", inverted: true },
  "jsxBracketSameLine",
  "arrowParens",
  "trailingComma",
  "proseWrap",
  "insertPragma",
  "requirePragma"
];
var DEFAULT_CODE = [
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

// ---------- Options components -----------

function BooleanOption(props) {
  function maybeInvert(value) {
    return props.option.inverted ? !value : value;
  }
  return h(
    "label",
    null,
    h("input", {
      type: "checkbox",
      checked: maybeInvert(props.value),
      onChange: function(ev) {
        props.onOptionChange(props.option, maybeInvert(ev.target.checked));
      }
    }),
    " ",
    props.option.cliName
  );
}

function ChoiceOption(props) {
  return h(
    "label",
    null,
    props.option.cliName,
    " ",
    h(
      "select",
      {
        onChange: function(ev) {
          props.onOptionChange(props.option, ev.target.value);
        }
      },
      props.option.choices.map(function(choice) {
        return h(
          "option",
          { value: choice.value, selected: choice.value === props.value },
          choice.value
        );
      })
    )
  );
}

function NumberOption(props) {
  return h(
    "label",
    null,
    props.option.cliName,
    " ",
    h("input", {
      type: "number",
      min: props.option.range.start,
      max: props.option.range.end,
      step: props.option.range.step,
      value: props.value,
      onChange: function(ev) {
        props.onOptionChange(props.option, parseInt(ev.target.value, 10));
      }
    })
  );
}

function Options(props) {
  var optionsByCategory = props.availableOptions.reduce(function(acc, opt) {
    acc[opt.category] = opts = acc[opt.category] || [];
    opts.push(opt);
    return acc;
  }, {});

  return h(
    "div",
    { className: "options-container" + (props.open ? " open" : "") },
    h(
      "div",
      { className: "options" },
      CATEGORIES.map(function(category) {
        return h(
          "details",
          { className: "sub-options", open: "true" },
          h("summary", null, category),
          (optionsByCategory[category] || []).map(function(opt) {
            return h(getComponentByOptionType(opt), {
              option: opt,
              value: props.options[opt.name],
              onOptionChange: props.onOptionChange
            });
          })
        );
      })
    )
  );
}

// ---------- Editor components -----------

var Editor = createClass({
  componentDidMount: function() {
    this._codeMirror = CodeMirror.fromTextArea(this._ref, this.props.options);
    this._codeMirror.on("change", this.handleChange.bind(this));
    this._codeMirror.setValue(this.props.value || "");
  },
  handleChange: function(doc, change) {
    if (change.origin !== "setValue") {
      this.props.onChange(doc.getValue());
    }
  },
  componentWillReceiveProps(nextProps) {
    if (
      nextProps.value &&
      nextProps.value !== this.props.value &&
      this._codeMirror.getValue() !== nextProps.value
    ) {
      this._codeMirror.setValue(nextProps.value);
    } else if (!nextProps.value) {
      this._codeMirror.setValue("");
    }
  },
  render: function(props) {
    return h(
      "div",
      { className: "editor input" },
      h("textarea", {
        ref: function(ref) {
          this._ref = ref;
        }.bind(this)
      })
    );
  }
});

function InputEditor(props) {
  return h(Editor, {
    options: {
      lineNumbers: true,
      keyMap: "sublime",
      autoCloseBrackets: true,
      matchBrackets: true,
      showCursorWhenSelecting: true,
      tabWidth: 2,
      mode: props.mode
    },
    value: props.value,
    onChange: props.onChange
  });
}

function OutputEditor(props) {
  return h(Editor, {
    options: {
      readOnly: true,
      lineNumbers: true,
      mode: props.mode
    },
    value: props.value
  });
}

function Button(props) {
  return h("button", Object.assign({ type: "button", class: "btn" }, props));
}

function BottomBar(props) {
  return h(
    "div",
    { class: "bottom-bar" },
    h(
      "div",
      { class: "bottom-bar-buttons" },
      h(
        Button,
        { onClick: props.onShowOptionsClick },
        props.optionsOpen ? "Hide options" : "Show options"
      ),
      h(Button, { onClick: props.onClearClick }, "Clear")
    ),
    h(
      "div",
      { class: "bottom-bar-buttons bottom-bar-buttons-right" },
      h(Button, null, "Copy Link"),
      h(Button, null, "Copy markdown"),
      h(
        "a",
        {
          href:
            "https://github.com/prettier/prettier/issues/new?body=" +
            encodeURIComponent(props.reportBody),
          target: "_blank",
          rel: "noopener",
          class: "btn"
        },
        "Report issue"
      )
    )
  );
}

var App = createClass({
  state: Object.assign({ loaded: false, formatted: "" }, loadPersistedState()),

  _format: function() {
    this._worker.postMessage(
      { type: "format", code: this.state.content, options: this.state.options },
      function(message) {
        this.setState({ formatted: message.formatted });
      }.bind(this)
    );
    persistState(this.state);
  },

  handleOptionChange: function(option, value) {
    this.setState(function(state) {
      return {
        options: Object.assign({}, state.options, { [option.name]: value })
      };
    }, this._format.bind(this));
  },
  handleOptionsOpen: function() {
    this.setState(
      function(state) {
        return {
          editorState: Object.assign({}, state.editorState, {
            optionsOpen: !state.editorState.optionsOpen
          })
        };
      },
      function() {
        persistState(this.state);
      }
    );
  },
  handleContentChange: function(value) {
    this.setState({ content: value }, this._format.bind(this));
  },

  componentDidMount: function() {
    this._worker = new WorkerApi("/worker2.js");

    this._worker.postMessage(
      { type: "meta" },
      function(message) {
        var availableOptions = getOptions(message.supportInfo.options);
        var options =
          this.state.options ||
          availableOptions.reduce(function(options, opt) {
            options[opt.name] = opt.default;
            return options;
          }, {});

        this.setState({
          loaded: true,
          version: message.version,
          availableOptions: availableOptions,
          options: options
        });
      }.bind(this)
    );

    this._format();
  },

  render: function(props, state) {
    if (!state.loaded) {
      return "Loading...";
    }
    var editorState = state.editorState;
    return h(
      "div",
      { className: "playground-container" },
      h(
        "div",
        { className: "editors-container" },
        h(Options, {
          availableOptions: state.availableOptions,
          options: state.options,
          open: editorState.optionsOpen,
          onOptionChange: this.handleOptionChange.bind(this)
        }),
        h(
          "div",
          { className: "editors" },
          h(InputEditor, {
            mode: getCodemirrorMode(state.options),
            value: state.content,
            onChange: this.handleContentChange.bind(this)
          }),
          h(OutputEditor, {
            mode: getCodemirrorMode(state.options),
            value: state.formatted
          })
        )
      ),
      h(BottomBar, {
        optionsOpen: editorState.optionsOpen,
        onShowOptionsClick: this.handleOptionsOpen.bind(this),
        onClearClick: function() {
          this.handleContentChange("");
        }.bind(this),
        reportBody: formatMarkdown(
          state.content,
          state.formatted,
          "",
          state.version,
          window.location.href,
          state.options,
          state.availableOptions.reduce(function(cliOptions, option) {
            var value = state.options[option.name];
            if (option.type === "boolean") {
              if ((value && !option.inverted) || (!value && option.inverted)) {
                cliOptions.push([option.cliName, true]);
              }
            } else if (value !== option.default) {
              cliOptions.push([option.cliName, value]);
            }
            return cliOptions;
          }, [])
        )
      })
    );
  }
});

window.onload = function() {
  preact.render(h(App), document.getElementById("root"));
};

// -------- Worker API -------------

function WorkerApi(source) {
  var worker = new Worker(source);
  var counter = 0;
  var handlers = {};

  worker.onmessage = function(event) {
    var uid = event.data.uid;
    var message = event.data.message;
    if (handlers[uid]) {
      var handler = handlers[uid];
      delete handlers[uid];

      handler(message);
    }
  };

  function postMessage(message, handler) {
    var uid = ++counter;
    handlers[uid] = handler;
    worker.postMessage({
      uid: uid,
      message: message
    });
  }

  return { postMessage: postMessage };
}

// -------- UTILITY FUNCTIONS --------

function loadPersistedState() {
  var editorState = { optionsOpen: false };
  try {
    Object.assign(
      editorState,
      JSON.parse(window.localStorage.getItem("editorState"))
    );
  } catch (error) {
    // noop
  }
  var queryState = parseQuery() || {};
  return {
    editorState: editorState,
    content:
      typeof queryState.content === "string"
        ? queryState.content
        : DEFAULT_CODE,
    options: queryState.options
  };
}

function persistState(state) {
  try {
    window.localStorage.setItem(
      "editorState",
      JSON.stringify(state.editorState)
    );
  } catch (error) {
    // noop
  }
  saveQuery({ content: state.content, options: state.options });
}

function getComponentByOptionType(option) {
  switch (option.type) {
    case "boolean":
      return BooleanOption;
    case "int":
      return NumberOption;
    case "choice":
      return ChoiceOption;
    default:
      throw new Error("unsupported type");
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

function getOptions(supportedOptions) {
  supportedOptions = supportedOptions.reduce(function(acc, opt) {
    acc[opt.name] = opt;
    return acc;
  }, {});

  return OPTIONS.reduce(function(options, opt) {
    opt = typeof opt === "string" ? { name: opt } : opt;
    if (!supportedOptions[opt.name]) return options;

    var modified = Object.assign({}, opt, supportedOptions[opt.name]);
    modified.cliName =
      "--" +
      (opt.inverted ? "no-" : "") +
      opt.name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
    if (modified.type === "boolean" && opt.inverted) {
      modified.default = !modified.default;
    }

    options.push(modified);
    return options;
  }, []);
}

// Parse the URL hash as a config object
function parseQuery() {
  var hash = document.location.hash.slice(1);
  try {
    // providing backwards support for old json encoded URIComponent
    if (hash.indexOf("%7B%22") !== -1) {
      return JSON.parse(decodeURIComponent(hash));
    } else {
      return JSON.parse(LZString.decompressFromEncodedURIComponent(hash));
    }
  } catch (error) {
    return {};
  }
}
function saveQuery(state) {
  var hash = LZString.compressToEncodedURIComponent(JSON.stringify(state));
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

// Preact without ES6 classes
function createClass(obj) {
  function F() {
    preact.Component.call(this);
  }
  var p = (F.prototype = new preact.Component());
  for (var i in obj) {
    p[i] = obj[i];
  }
  return (p.constructor = F);
}
