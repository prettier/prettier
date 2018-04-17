import React from "react";

import { Button, ClipboardButton, LinkButton } from "./buttons";
import EditorState from "./EditorState";
import { DebugPanel, InputPanel, OutputPanel } from "./panels";
import PrettierFormat from "./PrettierFormat";
import { shallowEqual } from "./helpers";
import * as urlHash from "./urlHash";
import formatMarkdown from "./markdown";

import { Sidebar, SidebarCategory } from "./sidebar/components";
import SidebarOptions from "./sidebar/SidebarOptions";
import { Checkbox } from "./sidebar/inputs";

const CATEGORIES_ORDER = ["Global", "JavaScript", "Markdown", "Special"];

class Playground extends React.Component {
  constructor(props) {
    super();

    const { content, options } = urlHash.read();

    const defaultOptions = getDefaultOptions(props.availableOptions);

    this.state = {
      content: content || "",
      options: Object.assign(defaultOptions, options)
    };

    this.handleOptionValueChange = this.handleOptionValueChange.bind(this);

    this.setContent = content => this.setState({ content });
    this.clearContent = this.setContent.bind(this, "");
    this.resetOptions = () => this.setState({ options: defaultOptions });
  }

  componentDidUpdate(_, prevState) {
    const { content, options } = this.state;
    if (
      !shallowEqual(prevState.options, this.state.options) ||
      prevState.content !== content
    ) {
      urlHash.replace({ content, options });
    }
  }

  handleOptionValueChange(option, value) {
    this.setState(state => ({
      options: Object.assign({}, state.options, { [option.name]: value })
    }));
  }

  getMarkdown(formatted, reformatted, full) {
    const { content, options } = this.state;
    const { availableOptions, version } = this.props;

    return formatMarkdown(
      content,
      formatted,
      reformatted || "",
      version,
      window.location.href,
      options,
      getCliOptions(availableOptions, options),
      full
    );
  }

  render() {
    const { availableOptions, worker } = this.props;
    const { content, options } = this.state;

    return (
      <EditorState>
        {editorState => (
          <PrettierFormat
            worker={worker}
            code={content}
            options={options}
            debugAst={editorState.showAst}
            debugDoc={editorState.showDoc}
            secondFormat={editorState.showSecondFormat}
          >
            {({ formatted, debugAst, debugDoc, reformatted }) => (
              <React.Fragment>
                <div className="editors-container">
                  <Sidebar visible={editorState.showSidebar}>
                    <SidebarOptions
                      categories={CATEGORIES_ORDER}
                      availableOptions={availableOptions}
                      optionValues={options}
                      onOptionValueChange={this.handleOptionValueChange}
                    />
                    <SidebarCategory title="Debug">
                      <Checkbox
                        label="show AST"
                        checked={editorState.showAst}
                        onChange={editorState.toggleAst}
                      />
                      <Checkbox
                        label="show doc"
                        checked={editorState.showDoc}
                        onChange={editorState.toggleDoc}
                      />
                      <Checkbox
                        label="show second format"
                        checked={editorState.showSecondFormat}
                        onChange={editorState.toggleSecondFormat}
                      />
                    </SidebarCategory>
                    <div className="sub-options">
                      <Button onClick={this.resetOptions}>
                        Reset to defaults
                      </Button>
                    </div>
                  </Sidebar>
                  <div className="editors">
                    <InputPanel
                      mode={getCodemirrorMode(options.parser)}
                      rulerColumn={options.printWidth}
                      value={content}
                      onChange={this.setContent}
                    />
                    {editorState.showAst ? (
                      <DebugPanel value={debugAst || ""} />
                    ) : null}
                    {editorState.showDoc ? (
                      <DebugPanel value={debugDoc || ""} />
                    ) : null}
                    <OutputPanel
                      mode={getCodemirrorMode(options.parser)}
                      value={formatted}
                      rulerColumn={options.printWidth}
                    />
                    {editorState.showSecondFormat ? (
                      <OutputPanel
                        mode={getCodemirrorMode(options.parser)}
                        value={getSecondFormat(formatted, reformatted)}
                        rulerColumn={options.printWidth}
                      />
                    ) : null}
                  </div>
                </div>
                <div className="bottom-bar">
                  <div className="bottom-bar-buttons">
                    <Button onClick={editorState.toggleSidebar}>
                      {editorState.showSidebar ? "Hide" : "Show"} options
                    </Button>
                    <Button onClick={this.clearContent}>Clear</Button>
                  </div>
                  <div className="bottom-bar-buttons bottom-bar-buttons-right">
                    <ClipboardButton copy={window.location.href}>
                      Copy link
                    </ClipboardButton>
                    <ClipboardButton
                      copy={() => this.getMarkdown(formatted, reformatted)}
                    >
                      Copy markdown
                    </ClipboardButton>
                    <LinkButton
                      href={getReportLink(
                        this.getMarkdown(formatted, reformatted, true)
                      )}
                      target="_blank"
                      rel="noopener"
                    >
                      Report issue
                    </LinkButton>
                  </div>
                </div>
              </React.Fragment>
            )}
          </PrettierFormat>
        )}
      </EditorState>
    );
  }
}

function getReportLink(reportBody) {
  return `https://github.com/prettier/prettier/issues/new?body=${encodeURIComponent(
    reportBody
  )}`;
}

function getCliOptions(availableOptions, options) {
  const cliOptions = [];
  for (let i = 0; i < availableOptions.length; i++) {
    const option = availableOptions[i];
    const value = options[option.name];

    if (option.type === "boolean") {
      if ((value && !option.inverted) || (!value && option.inverted)) {
        cliOptions.push([option.cliName, true]);
      }
    } else if (value !== option.default) {
      cliOptions.push([option.cliName, value]);
    }
  }
  return cliOptions;
}

function getSecondFormat(formatted, reformatted) {
  return formatted === ""
    ? ""
    : formatted === reformatted
      ? "✓ Second format is unchanged."
      : reformatted;
}

function getDefaultOptions(availableOptions) {
  return availableOptions.reduce((acc, option) => {
    acc[option.name] = option.default;
    return acc;
  }, {});
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

export default Playground;
