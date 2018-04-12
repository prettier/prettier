import "codemirror-graphql/mode";

import React from "react";
import ReactDOM from "react-dom";

import Playground from "./Playground";

ReactDOM.render(<Playground />, document.getElementById("root"));

/******************************************/

(function() {
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
    state: Object.assign(
      { loaded: false, formatted: "" },
      loadPersistedState()
    ),

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
                if (
                  (value && !option.inverted) ||
                  (!value && option.inverted)
                ) {
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
      content: typeof queryState.content === "string" ? queryState.content : "",
      options: queryState.options
    };
  }

  function persistState(state) {
    try {
      window.localStorage.setItem(
        "editorState",
        JSON.stringify(state.editorState)
      );
    } catch (_) {
      // noop
    }
    saveQuery({ content: state.content, options: state.options });
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

  // Parse the URL hash as a config object
  function parseQuery() {
    var hash = document.location.hash.slice(1);
    try {
      // providing backwards support for old json encoded URIComponent
      if (hash.indexOf("%7B%22") !== -1) {
        return JSON.parse(decodeURIComponent(hash));
      }
      return JSON.parse(LZString.decompressFromEncodedURIComponent(hash));
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
});
