import React from "react";

import { Button, ClipboardButton, LinkButton } from "./buttons";
import EditorState from "./EditorState";
import { DebugPanel, InputPanel, OutputPanel } from "./panels";
import PrettierFormat from "./PrettierFormat";
import { shallowEqual } from "./helpers";
import * as urlHash from "./urlHash";
import formatMarkdown from "./markdown";
import * as util from "./util";
import getCodeSample from "./codeSamples";

import { Sidebar, SidebarCategory } from "./sidebar/components";
import SidebarOptions from "./sidebar/SidebarOptions";
import Option from "./sidebar/options";
import { Checkbox } from "./sidebar/inputs";

const CATEGORIES_ORDER = [
  "Global",
  "Common",
  "JavaScript",
  "Markdown",
  "HTML",
  "Special"
];
const ENABLED_OPTIONS = [
  "parser",
  "printWidth",
  "tabWidth",
  "useTabs",
  "semi",
  "singleQuote",
  "bracketSpacing",
  "jsxSingleQuote",
  "jsxBracketSameLine",
  "arrowParens",
  "trailingComma",
  "proseWrap",
  "htmlWhitespaceSensitivity",
  "insertPragma",
  "requirePragma"
];

class Playground extends React.Component {
  constructor(props) {
    super();

    const original = urlHash.read();

    const defaultOptions = util.getDefaults(
      props.availableOptions,
      ENABLED_OPTIONS
    );

    const options = Object.assign(defaultOptions, original.options);
    const content = original.content || getCodeSample(options.parser);

    this.state = { content, options };

    this.handleOptionValueChange = this.handleOptionValueChange.bind(this);

    this.setContent = content => this.setState({ content });
    this.clearContent = this.setContent.bind(this, "");
    this.resetOptions = () => this.setState({ options: defaultOptions });

    this.enabledOptions = orderOptions(props.availableOptions, ENABLED_OPTIONS);
    this.rangeStartOption = props.availableOptions.find(
      opt => opt.name === "rangeStart"
    );
    this.rangeEndOption = props.availableOptions.find(
      opt => opt.name === "rangeEnd"
    );
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
    this.setState(state => {
      const options = Object.assign({}, state.options);

      if (option.type === "int" && isNaN(value)) {
        delete options[option.name];
      } else {
        options[option.name] = value;
      }

      const content =
        state.content === "" ||
        state.content === getCodeSample(state.options.parser)
          ? getCodeSample(options.parser)
          : state.content;

      return { options, content };
    });
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
      util.buildCliArgs(availableOptions, options),
      full
    );
  }

  render() {
    const { worker } = this.props;
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
            reformat={editorState.showSecondFormat}
          >
            {({ formatted, debug }) => (
              <React.Fragment>
                <div className="editors-container">
                  <Sidebar visible={editorState.showSidebar}>
                    <SidebarOptions
                      categories={CATEGORIES_ORDER}
                      availableOptions={this.enabledOptions}
                      optionValues={options}
                      onOptionValueChange={this.handleOptionValueChange}
                    />
                    <SidebarCategory title="Range">
                      <label>
                        The selected range will be highlighted in yellow in the
                        input editor
                      </label>
                      <Option
                        option={this.rangeStartOption}
                        value={options.rangeStart}
                        onChange={this.handleOptionValueChange}
                      />
                      <Option
                        option={this.rangeEndOption}
                        value={options.rangeEnd}
                        overrideMax={content.length}
                        onChange={this.handleOptionValueChange}
                      />
                    </SidebarCategory>
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
                      mode={util.getCodemirrorMode(options.parser)}
                      ruler={options.printWidth}
                      value={content}
                      codeSample={getCodeSample(options.parser)}
                      overlayStart={options.rangeStart}
                      overlayEnd={options.rangeEnd}
                      onChange={this.setContent}
                    />
                    {editorState.showAst ? (
                      <DebugPanel value={debug.ast || ""} />
                    ) : null}
                    {editorState.showDoc ? (
                      <DebugPanel value={debug.doc || ""} />
                    ) : null}
                    <OutputPanel
                      mode={util.getCodemirrorMode(options.parser)}
                      value={formatted}
                      ruler={options.printWidth}
                    />
                    {editorState.showSecondFormat ? (
                      <OutputPanel
                        mode={util.getCodemirrorMode(options.parser)}
                        value={getSecondFormat(formatted, debug.reformatted)}
                        ruler={options.printWidth}
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
                    <ClipboardButton copy={JSON.stringify(options, null, 2)}>
                      Copy config JSON
                    </ClipboardButton>
                  </div>
                  <div className="bottom-bar-buttons bottom-bar-buttons-right">
                    <ClipboardButton copy={window.location.href}>
                      Copy link
                    </ClipboardButton>
                    <ClipboardButton
                      copy={() =>
                        this.getMarkdown(formatted, debug.reformatted)
                      }
                    >
                      Copy markdown
                    </ClipboardButton>
                    <LinkButton
                      href={getReportLink(
                        this.getMarkdown(formatted, debug.reformatted, true)
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

function orderOptions(availableOptions, order) {
  const optionsByName = {};
  for (const option of availableOptions) {
    optionsByName[option.name] = option;
  }

  return order.map(name => optionsByName[name]);
}

function getReportLink(reportBody) {
  return `https://github.com/prettier/prettier/issues/new?body=${encodeURIComponent(
    reportBody
  )}`;
}

function getSecondFormat(formatted, reformatted) {
  return formatted === ""
    ? ""
    : formatted === reformatted
    ? "✓ Second format is unchanged."
    : reformatted;
}

export default Playground;
