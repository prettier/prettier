import * as React from "react";
import { Button, ClipboardButton } from "./buttons.js";
import getCodeSample from "./codeSamples.mjs";
import generateDummyId from "./dummyId.js";
import EditorState from "./EditorState.js";
import { shallowEqual } from "./helpers.js";
import formatMarkdown from "./markdown.js";
import { DebugPanel, InputPanel, OutputPanel } from "./panels.js";
import PrettierFormat from "./PrettierFormat.js";
import { Sidebar, SidebarCategory } from "./sidebar/components.js";
import { Checkbox } from "./sidebar/inputs.js";
import Option from "./sidebar/options.js";
import SidebarOptions from "./sidebar/SidebarOptions.js";
import * as urlHash from "./urlHash.js";
import * as util from "./util.js";

const CATEGORIES_ORDER = [
  "Global",
  "Common",
  "JavaScript",
  "Markdown",
  "HTML",
  "Special",
];
const ISSUES_URL = "https://github.com/prettier/prettier/issues/new?body=";
const MAX_LENGTH = 8000 - ISSUES_URL.length; // it seems that GitHub limit is 8195
const COPY_MESSAGE =
  "<!-- The issue body has been saved to the clipboard. Please paste it after this line! 👇 -->\n";

const ENABLED_OPTIONS = [
  "parser",
  "printWidth",
  "tabWidth",
  "useTabs",
  "semi",
  "singleQuote",
  "bracketSpacing",
  "jsxSingleQuote",
  "objectWrap",
  "quoteProps",
  "arrowParens",
  "trailingComma",
  "proseWrap",
  "htmlWhitespaceSensitivity",
  "insertPragma",
  "requirePragma",
  "vueIndentScriptAndStyle",
  "embeddedLanguageFormatting",
  "bracketSameLine",
  "singleAttributePerLine",
  "experimentalTernaries",
];

class Playground extends React.Component {
  constructor(props) {
    super();

    const original = urlHash.read();

    const defaultOptions = util.getDefaults(
      props.availableOptions,
      ENABLED_OPTIONS,
    );

    const options = Object.assign(defaultOptions, original.options);

    // 0.0.0 ~ 0.0.10
    if (options.parser === "babylon") {
      options.parser = "babel";
    }

    // 0.0.0 ~ 0.0.10
    if (options.useFlowParser) {
      options.parser ??= "flow";
    }

    // 1.8.2 ~ 1.9.0
    if (typeof options.proseWrap === "boolean") {
      options.proseWrap = options.proseWrap ? "always" : "never";
    }

    // 0.0.0 ~ 1.9.0
    if (typeof options.trailingComma === "boolean") {
      options.trailingComma = options.trailingComma ? "es5" : "none";
    }

    // 0.17.0 ~ 2.4.0
    if (options.jsxBracketSameLine) {
      delete options.jsxBracketSameLine;
      options.bracketSameLine ??= options.jsxBracketSameLine;
    }

    const codeSample = getCodeSample(options.parser);
    const content = original.content || codeSample;
    const needsClickForFirstRun =
      options.parser === "doc-explorer" && content !== codeSample;
    const selection = {};

    this.state = { content, options, selection, needsClickForFirstRun };

    this.handleOptionValueChange = this.handleOptionValueChange.bind(this);

    this.setContent = (content) => this.setState({ content });
    this.clearContent = this.setContent.bind(this, "");
    this.resetOptions = () => this.setState({ options: defaultOptions });
    this.setSelection = (selection) => {
      this.setState({ selection });
      if (this.state.trackCursorOffset) {
        this.handleOptionValueChange(
          this.cursorOffsetOption,
          util.convertSelectionToRange(selection, this.state.content)[0],
        );
      }
    };
    this.setSelectionAsRange = () => {
      const { selection, content, options } = this.state;
      const [rangeStart, rangeEnd] = util.convertSelectionToRange(
        selection,
        content,
      );
      const updatedOptions = { ...options, rangeStart, rangeEnd };
      if (rangeStart === rangeEnd) {
        delete updatedOptions.rangeStart;
        delete updatedOptions.rangeEnd;
      }
      this.setState({ options: updatedOptions });
    };

    this.enabledOptions = orderOptions(props.availableOptions, ENABLED_OPTIONS);
    this.rangeStartOption = props.availableOptions.find(
      (opt) => opt.name === "rangeStart",
    );
    this.rangeEndOption = props.availableOptions.find(
      (opt) => opt.name === "rangeEnd",
    );
    this.cursorOffsetOption = props.availableOptions.find(
      (opt) => opt.name === "cursorOffset",
    );

    this.formatInput = this.formatInput.bind(this);
    this.insertDummyId = this.insertDummyId.bind(this);
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
    this.setState((state) => {
      const options = { ...state.options };

      if (option.type === "int" && Number.isNaN(value)) {
        delete options[option.name];
      } else {
        options[option.name] = value;
      }

      const content =
        state.content === "" ||
        state.content === getCodeSample(state.options.parser)
          ? getCodeSample(options.parser)
          : state.content;

      if (option.name === "parser") {
        state.needsClickForFirstRun = false;
      }

      return { options, content };
    });
  }

  getMarkdown({ formatted, reformatted, full, doc }) {
    const { content, options } = this.state;
    const { availableOptions, version } = this.props;
    const orderedOptions = orderOptions(availableOptions, [
      ...ENABLED_OPTIONS,
      "rangeStart",
      "rangeEnd",
      "cursorOffset",
    ]);
    const cliOptions = util.buildCliArgs(orderedOptions, options);

    return formatMarkdown({
      input: content,
      output: formatted,
      output2: reformatted,
      doc,
      version,
      url: window.location.href,
      options,
      cliOptions,
      full,
    });
  }

  formatInput() {
    if (this.state.options.parser !== "doc-explorer") {
      return;
    }

    const { content, selection } = this.state;

    return this.props.worker
      .format(content, {
        parser: "__js_expression",
        cursorOffset: util.convertSelectionToRange(selection, content)[0],
      })
      .then(({ error, formatted, cursorOffset }) => {
        if (error) {
          return;
        }

        this.setState({
          content: formatted,
          selection: util.convertOffsetToSelection(cursorOffset, formatted),
        });
      });
  }

  insertDummyId() {
    const { content, selection } = this.state;
    const dummyId = generateDummyId();
    const range = util.convertSelectionToRange(selection, content);
    const modifiedContent =
      content.slice(0, range[0]) + dummyId + content.slice(range[1]);

    this.setState({
      content: modifiedContent,
      selection: util.convertOffsetToSelection(
        range[0] + dummyId.length,
        modifiedContent,
      ),
    });
  }

  render() {
    const { worker } = this.props;
    const { content, options } = this.state;

    return (
      <EditorState>
        {(editorState) => (
          <PrettierFormat
            enabled={!this.state.needsClickForFirstRun}
            worker={worker}
            code={content}
            options={options}
            debugAst={editorState.showAst}
            debugPreprocessedAst={editorState.showPreprocessedAst}
            debugDoc={editorState.showDoc}
            debugComments={editorState.showComments}
            reformat={editorState.showSecondFormat}
            rethrowEmbedErrors={editorState.rethrowEmbedErrors}
          >
            {({ formatted, debug, cursorOffset }) => {
              const fullReport = this.getMarkdown({
                formatted,
                reformatted: debug.reformatted,
                full: true,
              });
              const showFullReport =
                encodeURIComponent(fullReport).length < MAX_LENGTH;
              return (
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
                          The selected range will be highlighted in yellow in
                          the input editor
                        </label>
                        <Option
                          option={this.rangeStartOption}
                          value={
                            typeof options.rangeStart === "number"
                              ? options.rangeStart
                              : ""
                          }
                          onChange={this.handleOptionValueChange}
                        />
                        <Option
                          option={this.rangeEndOption}
                          value={
                            typeof options.rangeEnd === "number"
                              ? options.rangeEnd
                              : ""
                          }
                          overrideMax={content.length}
                          onChange={this.handleOptionValueChange}
                        />

                        <Button onClick={this.setSelectionAsRange}>
                          Set selected text as range
                        </Button>
                      </SidebarCategory>
                      <SidebarCategory title="Cursor">
                        <Option
                          option={this.cursorOffsetOption}
                          value={
                            options.cursorOffset >= 0
                              ? options.cursorOffset
                              : ""
                          }
                          onChange={this.handleOptionValueChange}
                        />
                        <div
                          style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: "10px",
                          }}
                        >
                          <Checkbox
                            label="track"
                            checked={Boolean(this.state.trackCursorOffset)}
                            onChange={() =>
                              this.setState((state) => ({
                                trackCursorOffset: !state.trackCursorOffset,
                              }))
                            }
                          />
                          {options.cursorOffset >= 0 && (
                            <>
                              <Button
                                onClick={() => {
                                  this.handleOptionValueChange(
                                    this.cursorOffsetOption,
                                    -1,
                                  );
                                }}
                              >
                                Reset
                              </Button>
                              <label>Result: {cursorOffset}</label>
                            </>
                          )}
                        </div>
                      </SidebarCategory>
                      <SidebarCategory title="Debug">
                        <Checkbox
                          label="show input"
                          checked={editorState.showInput}
                          onChange={editorState.toggleInput}
                        />
                        <Checkbox
                          label="show AST"
                          checked={editorState.showAst}
                          onChange={editorState.toggleAst}
                        />
                        <Checkbox
                          label="show preprocessed AST"
                          checked={editorState.showPreprocessedAst}
                          onChange={editorState.togglePreprocessedAst}
                        />
                        <Checkbox
                          label="show doc"
                          checked={editorState.showDoc}
                          onChange={editorState.toggleDoc}
                        />
                        <Checkbox
                          label="show comments"
                          checked={editorState.showComments}
                          onChange={editorState.toggleComments}
                        />
                        <Checkbox
                          label="show output"
                          checked={editorState.showOutput}
                          onChange={editorState.toggleOutput}
                        />
                        <Checkbox
                          label="show second format"
                          checked={editorState.showSecondFormat}
                          onChange={editorState.toggleSecondFormat}
                        />
                        <Checkbox
                          label="rethrow embed errors"
                          checked={editorState.rethrowEmbedErrors}
                          onChange={editorState.toggleEmbedErrors}
                        />
                        {editorState.showDoc && (
                          <ClipboardButton
                            copy={() => this.getMarkdown({ doc: debug.doc })}
                            disabled={!debug.doc}
                          >
                            Copy doc
                          </ClipboardButton>
                        )}
                      </SidebarCategory>
                      <div className="sub-options">
                        <Button onClick={this.resetOptions}>
                          Reset to defaults
                        </Button>
                      </div>
                    </Sidebar>
                    <div className="editors">
                      {editorState.showInput ? (
                        <InputPanel
                          mode={util.getCodemirrorMode(options.parser)}
                          ruler={options.printWidth}
                          value={content}
                          selection={this.state.selection}
                          codeSample={getCodeSample(options.parser)}
                          overlayStart={options.rangeStart}
                          overlayEnd={options.rangeEnd}
                          onChange={this.setContent}
                          onSelectionChange={this.setSelection}
                          extraKeys={{
                            "Shift-Alt-F": this.formatInput,
                            "Ctrl-Q": this.insertDummyId,
                          }}
                          foldGutter={options.parser === "doc-explorer"}
                        />
                      ) : null}
                      {editorState.showAst ? (
                        <DebugPanel
                          value={debug.ast || ""}
                          autoFold={util.getAstAutoFold(options.parser)}
                        />
                      ) : null}
                      {editorState.showPreprocessedAst ? (
                        <DebugPanel
                          value={debug.preprocessedAst || ""}
                          autoFold={util.getAstAutoFold(options.parser)}
                        />
                      ) : null}
                      {editorState.showDoc ? (
                        <DebugPanel value={debug.doc || ""} />
                      ) : null}
                      {editorState.showComments ? (
                        <DebugPanel
                          value={debug.comments || ""}
                          autoFold={util.getAstAutoFold(options.parser)}
                        />
                      ) : null}
                      {editorState.showOutput ? (
                        this.state.needsClickForFirstRun ? (
                          <div className="editor disabled-output-panel">
                            <div className="explanation">
                              <code>doc-explorer</code> involves running code
                              provided by users.
                            </div>
                            <div className="explanation">
                              To stay on the safe side and prevent abuse, an
                              explicit user action is required when a direct
                              link to a <code>doc-explorer</code> playground is
                              opened.
                            </div>
                            <div className="explanation">
                              Click the button below to start the playground.
                            </div>
                            <Button
                              onClick={() =>
                                this.setState({ needsClickForFirstRun: false })
                              }
                            >
                              Start
                            </Button>
                          </div>
                        ) : (
                          <OutputPanel
                            mode={util.getCodemirrorMode(options.parser)}
                            value={formatted}
                            ruler={options.printWidth}
                            overlayStart={
                              cursorOffset === -1 ? undefined : cursorOffset
                            }
                            overlayEnd={
                              cursorOffset === -1 ? undefined : cursorOffset + 1
                            }
                          />
                        )
                      ) : null}
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
                      <ClipboardButton
                        copy={JSON.stringify(
                          // Remove `parser` since people usually paste this
                          // into their .prettierrc and specifying a top-level
                          // parser there is an anti-pattern. Note:
                          // `JSON.stringify` omits keys whose values are
                          // `undefined`.
                          { ...options, parser: undefined },
                          null,
                          2,
                        )}
                      >
                        Copy config JSON
                      </ClipboardButton>
                      <Button
                        onClick={this.insertDummyId}
                        onMouseDown={(event) => event.preventDefault()} // prevent button from focusing
                        title="Generate a nonsense variable name (Ctrl-Q)"
                      >
                        Insert dummy id
                      </Button>
                    </div>
                    <div className="bottom-bar-buttons bottom-bar-buttons-right">
                      <ClipboardButton copy={window.location.href}>
                        Copy link
                      </ClipboardButton>
                      <ClipboardButton
                        copy={() =>
                          this.getMarkdown({
                            formatted,
                            reformatted: debug.reformatted,
                          })
                        }
                      >
                        Copy markdown
                      </ClipboardButton>
                      <a
                        href={getReportLink(
                          showFullReport ? fullReport : COPY_MESSAGE,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ClipboardButton
                          copy={() => (showFullReport ? "" : fullReport)}
                        >
                          Report issue
                        </ClipboardButton>
                      </a>
                    </div>
                  </div>
                </React.Fragment>
              );
            }}
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

  return order.map((name) => optionsByName[name]);
}

function getReportLink(reportBody) {
  return `${ISSUES_URL}${encodeURIComponent(reportBody)}`;
}

function getSecondFormat(formatted, reformatted) {
  return formatted === ""
    ? ""
    : formatted === reformatted
      ? "✓ Second format is unchanged."
      : reformatted;
}

export default Playground;
