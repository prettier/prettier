import React from "react";

import Button from "./Button";
import EditorState from "./EditorState";
import { Checkbox } from "./inputs";
import { DebugPanel, InputPanel, OutputPanel } from "./panels";
import PrettierFormat from "./PrettierFormat";
import SidebarOptions from "./SidebarOptions";
import WorkerApi from "./WorkerApi";

const ENABLED_OPTIONS = [
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
].map(option => (typeof option === "string" ? { name: option } : option));

function Sidebar({ visible, children }) {
  return (
    <div className={`options-container ${visible ? "open" : ""}`}>
      <div className="options">{children}</div>
    </div>
  );
}

function SidebarCategory({ title, children }) {
  return (
    <details className="sub-options" open="true">
      <summary>{title}</summary>
      {children}
    </details>
  );
}

class Playground extends React.Component {
  constructor() {
    super();
    this.state = {
      content: "",
      loaded: false,
      options: null
    };
    this.handleOptionValueChange = this.handleOptionValueChange.bind(this);

    this.setContent = content => this.setState({ content });
    this.clearContent = () => this.setState({ content: "" });
  }

  componentDidMount() {
    this._worker = new WorkerApi("/worker.js");

    this._worker
      .postMessage({ type: "meta" })
      .then(({ supportInfo, version }) => {
        const availableOptions = parsePrettierOptions(supportInfo);
        const options =
          this.state.options ||
          availableOptions.reduce((acc, option) => {
            acc[option.name] = option.default;
            return acc;
          }, {});

        this.setState({ loaded: true, availableOptions, options, version });
      });
  }

  handleOptionValueChange(option, value) {
    this.setState(state => ({
      options: Object.assign({}, state.options, { [option.name]: value })
    }));
  }

  render() {
    const {
      availableOptions,
      content,
      loaded,
      options,
      showSidebar
    } = this.state;

    if (!loaded) return "Loading...";

    return (
      <EditorState>
        {editorState => (
          <div className="playground-container">
            <div className="editors-container">
              <Sidebar visible={editorState.showSidebar}>
                <SidebarOptions
                  availableOptions={availableOptions}
                  prettierOptions={options}
                  onOptionValueChange={this.handleOptionValueChange}
                />
                <SidebarCategory title="Debug">
                  <Checkbox
                    label="show AST"
                    checked={editorState.showAst}
                    onChange={editorState.toggleAst}
                  />
                </SidebarCategory>
              </Sidebar>
              <PrettierFormat
                worker={this._worker}
                code={content}
                options={options}
                ast={editorState.showAst}
              >
                {({ ast: codeAst, formatted }) => (
                  <div className="editors">
                    <InputPanel
                      mode={getCodemirrorMode(options.parser)}
                      rulerColumn={options.printWidth}
                      value={content}
                      onChange={this.setContent}
                    />
                    {editorState.showAst ? (
                      <DebugPanel value={codeAst} />
                    ) : null}
                    {editorState.showDoc ? (
                      <DebugPanel value={"doc here"} />
                    ) : null}
                    <OutputPanel
                      mode={getCodemirrorMode(options.parser)}
                      value={formatted}
                      rulerColumn={options.printWidth}
                    />
                  </div>
                )}
              </PrettierFormat>
            </div>
            <div className="bottom-bar">
              <div className="bottom-bar-buttons">
                <Button onClick={editorState.toggleSidebar}>
                  {editorState.showSidebar ? "Hide" : "Show"} options
                </Button>
                <Button onClick={this.clearContent}>Clear</Button>
              </div>
              <div className="bottom-bar-buttons bottom-bar-buttons-right">
                <Button>Copy link</Button>
                <Button>Copy markdown</Button>
                <Button>Report issue</Button>
              </div>
            </div>
          </div>
        )}
      </EditorState>
    );
  }
}

function getCodemirrorMode(parser) {
  switch (parser) {
    case "css":
    case "less":
    case "scss":
      return "css";
    case "graphql":
      return "graphql";
    case "markdown":
      return "markdown";
    default:
      return "jsx";
  }
}

function parsePrettierOptions(supportInfo) {
  const supportedOptions = supportInfo.options.reduce((acc, option) => {
    acc[option.name] = option;
    return acc;
  }, {});

  return ENABLED_OPTIONS.reduce((optionsList, optionConfig) => {
    if (!supportedOptions[optionConfig.name]) return optionsList;

    const option = Object.assign(
      {},
      optionConfig,
      supportedOptions[optionConfig.name]
    );
    option.cliName =
      "--" +
      (option.inverted ? "no-" : "") +
      option.name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

    optionsList.push(option);
    return optionsList;
  }, []);
}

export default Playground;
