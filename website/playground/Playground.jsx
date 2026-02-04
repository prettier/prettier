import { reactive, watch } from "vue";
import { Button, ClipboardButton } from "./buttons.jsx";
import getCodeSample from "./codeSamples.mjs";
import { settings, togglers } from "./composables/playground-settings.js";
import { worker } from "./composables/prettier-worker.js";
import generateDummyId from "./dummyId.js";
import formatMarkdown from "./markdown.js";
import { getCodemirrorMode } from "./panel/language.js";
import { DebugPanel, InputPanel, OutputPanel } from "./panels.jsx";
import PrettierFormat from "./PrettierFormat.js";
import { Sidebar, SidebarCategory } from "./sidebar/components.jsx";
import { Checkbox } from "./sidebar/inputs.jsx";
import Option from "./sidebar/options.jsx";
import SidebarOptions from "./sidebar/SidebarOptions.jsx";
import * as urlHash from "./urlHash.js";
import { buildCliArgs, getAstAutoFold, getDefaults } from "./utilities.js";

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
  "endOfLine",
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
  // TODO: Enable this after release 3.6
  // "checkIgnorePragma",
  "vueIndentScriptAndStyle",
  "embeddedLanguageFormatting",
  "bracketSameLine",
  "singleAttributePerLine",
  "experimentalTernaries",
  "experimentalOperatorPosition",
];

function setup(props) {
  const original = urlHash.read();

  const defaultOptions = getDefaults(props.availableOptions, ENABLED_OPTIONS);

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

  const state = reactive({ content, options, selection: {} });

  const setContent = (content) => {
    state.content = content;
  };

  const clearContent = () => {
    state.content = "";
  };

  const resetOptions = () => {
    Object.assign(state, { options: { ...defaultOptions } });
  };

  const setSelection = (selection) => {
    Object.assign(state, { selection });
    if (state.trackCursorOffset) {
      handleOptionValueChange(cursorOffsetOption, selection?.anchor ?? -1);
    }
  };

  const setSelectionAsRange = () => {
    const { selection, options } = state;
    if (!selection) {
      return;
    }
    const anchor = selection.anchor ?? 0;
    const head = selection.head ?? anchor;

    const rangeStart = Math.min(anchor, head);
    const rangeEnd = Math.max(anchor, head);

    const updatedOptions = { ...options, rangeStart, rangeEnd };
    if (rangeStart === rangeEnd) {
      delete updatedOptions.rangeStart;
      delete updatedOptions.rangeEnd;
    }
    Object.assign(state, { options: updatedOptions });
  };
  const enabledOptions = orderOptions(props.availableOptions, ENABLED_OPTIONS);
  const rangeStartOption = props.availableOptions.find(
    (opt) => opt.name === "rangeStart",
  );
  const rangeEndOption = props.availableOptions.find(
    (opt) => opt.name === "rangeEnd",
  );
  const cursorOffsetOption = props.availableOptions.find(
    (opt) => opt.name === "cursorOffset",
  );

  const handleOptionValueChange = (option, value) => {
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

    return Object.assign(state, { options, content });
  };

  const getMarkdown = ({ formatted, reformatted, full, doc }) => {
    const { content, options } = state;
    const { availableOptions } = props;
    const orderedOptions = orderOptions(availableOptions, [
      ...ENABLED_OPTIONS,
      "rangeStart",
      "rangeEnd",
      "cursorOffset",
    ]);
    const cliOptions = buildCliArgs(orderedOptions, options);

    return formatMarkdown({
      input: content,
      output: formatted,
      output2: reformatted,
      doc,
      url: window.location.href,
      options,
      cliOptions,
      full,
    });
  };

  const formatInput = () => {
    if (state.options.parser !== "doc-explorer") {
      return;
    }

    const { content, selection } = state;

    return worker
      .format(content, {
        parser: "__js_expression",
        cursorOffset: selection?.anchor ?? -1,
      })
      .then(({ error, formatted, cursorOffset }) => {
        if (error) {
          return;
        }

        Object.assign(state, {
          content: formatted,
          selection:
            cursorOffset >= 0
              ? { anchor: cursorOffset, head: cursorOffset }
              : {},
        });
      });
  };

  const insertDummyId = () => {
    const { content, selection } = state;
    if (!selection) {
      return;
    }
    const anchor = selection.anchor ?? 0;
    const head = selection.head ?? anchor;
    const start = Math.min(anchor, head);
    const end = Math.max(anchor, head);

    const dummyId = generateDummyId();
    const modifiedContent =
      content.slice(0, start) + dummyId + content.slice(end);

    Object.assign(state, {
      content: modifiedContent,
      selection: {
        anchor: start + dummyId.length,
        head: start + dummyId.length,
      },
    });
  };

  const render = () => {
    const { content, options } = state;

    return (
      <PrettierFormat code={content} options={options}>
        {({ formatted, debug, cursorOffset }) => {
          const { content, options } = state;
          const fullReport = getMarkdown({
            formatted,
            reformatted: debug.reformatted,
            full: true,
          });
          const showFullReport =
            encodeURIComponent(fullReport).length < MAX_LENGTH;
          const isDocExplorer = options.parser === "doc-explorer";

          return (
            <>
              <div class="editors-container">
                <Sidebar visible={settings.showSidebar}>
                  <SidebarOptions
                    categories={CATEGORIES_ORDER}
                    availableOptions={enabledOptions}
                    optionValues={options}
                    onOption-value-change={handleOptionValueChange}
                  />
                  {isDocExplorer ? null : (
                    <SidebarCategory title="Range">
                      <label>
                        The selected range will be highlighted in yellow in the
                        input editor
                      </label>
                      <Option
                        option={rangeStartOption}
                        value={
                          typeof options.rangeStart === "number"
                            ? options.rangeStart
                            : undefined
                        }
                        onChange={handleOptionValueChange}
                      />
                      <Option
                        option={rangeEndOption}
                        value={
                          typeof options.rangeEnd === "number"
                            ? options.rangeEnd
                            : undefined
                        }
                        overrideMax={content.length}
                        onChange={handleOptionValueChange}
                      />

                      <Button onClick={setSelectionAsRange}>
                        Set selected text as range
                      </Button>
                    </SidebarCategory>
                  )}
                  {isDocExplorer ? null : (
                    <SidebarCategory title="Cursor">
                      <Option
                        option={cursorOffsetOption}
                        value={
                          options.cursorOffset >= 0
                            ? options.cursorOffset
                            : undefined
                        }
                        onChange={handleOptionValueChange}
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
                          checked={Boolean(state.trackCursorOffset)}
                          onChange={() => {
                            state.trackCursorOffset = !state.trackCursorOffset;
                          }}
                        />
                        {options.cursorOffset >= 0 ? (
                          <>
                            <Button
                              onClick={() => {
                                handleOptionValueChange(cursorOffsetOption, -1);
                              }}
                            >
                              Reset
                            </Button>
                            <label>Result: {cursorOffset}</label>
                          </>
                        ) : null}
                      </div>
                    </SidebarCategory>
                  )}
                  <SidebarCategory title="Debug">
                    <Checkbox
                      label="show input"
                      checked={settings.showInput}
                      onChange={togglers.showInput}
                    />
                    <Checkbox
                      label="show AST"
                      checked={settings.showAst}
                      onChange={togglers.showAst}
                    />
                    {isDocExplorer ? null : (
                      <Checkbox
                        label="show preprocessed AST"
                        checked={settings.showPreprocessedAst}
                        onChange={togglers.showPreprocessedAst}
                      />
                    )}
                    {isDocExplorer ? null : (
                      <Checkbox
                        label="show doc"
                        checked={settings.showDoc}
                        onChange={togglers.showDoc}
                      />
                    )}
                    {isDocExplorer ? null : (
                      <Checkbox
                        label="show comments"
                        checked={settings.showComments}
                        onChange={togglers.showComments}
                      />
                    )}
                    <Checkbox
                      label="show output"
                      checked={settings.showOutput}
                      onChange={togglers.showOutput}
                    />
                    {isDocExplorer ? null : (
                      <Checkbox
                        label="show second format"
                        checked={settings.showSecondFormat}
                        onChange={togglers.showSecondFormat}
                      />
                    )}
                    {isDocExplorer ? null : (
                      <Checkbox
                        label="rethrow embed errors"
                        checked={settings.rethrowEmbedErrors}
                        onChange={togglers.rethrowEmbedErrors}
                      />
                    )}
                    {settings.showDoc && !isDocExplorer ? (
                      <ClipboardButton
                        copy={() => getMarkdown({ doc: debug.doc })}
                        disabled={!debug.doc}
                      >
                        Copy doc
                      </ClipboardButton>
                    ) : null}
                  </SidebarCategory>
                  <div class="sub-options">
                    <Button onClick={resetOptions}>Reset to defaults</Button>
                  </div>
                </Sidebar>
                <div class="editors">
                  {settings.showInput ? (
                    <InputPanel
                      name="Input"
                      mode={getCodemirrorMode(options.parser)}
                      ruler={options.printWidth}
                      value={content}
                      selection={state.selection}
                      codeSample={getCodeSample(options.parser)}
                      overlayStart={options.rangeStart}
                      overlayEnd={options.rangeEnd}
                      onChange={setContent}
                      onSelectionChange={setSelection}
                      extraKeys={{
                        "Shift-Alt-f": formatInput,
                        "Ctrl-q": insertDummyId,
                      }}
                      foldGutter={options.parser === "doc-explorer"}
                    />
                  ) : null}
                  {settings.showAst ? (
                    <DebugPanel
                      name="AST"
                      mode="JSON"
                      value={debug.ast || ""}
                      autoFold={getAstAutoFold(options.parser)}
                    />
                  ) : null}
                  {settings.showPreprocessedAst && !isDocExplorer ? (
                    <DebugPanel
                      name="Preprocessed AST"
                      mode="JSON"
                      value={debug.preprocessedAst || ""}
                      autoFold={getAstAutoFold(options.parser)}
                    />
                  ) : null}
                  {settings.showDoc && !isDocExplorer ? (
                    <DebugPanel
                      name="Doc"
                      mode="JavaScript"
                      value={debug.doc || ""}
                    />
                  ) : null}
                  {settings.showComments && !isDocExplorer ? (
                    <DebugPanel
                      name="Comments"
                      mode="JSON"
                      value={debug.comments || ""}
                      autoFold={getAstAutoFold(options.parser)}
                    />
                  ) : null}
                  {settings.showOutput ? (
                    <OutputPanel
                      name="Output"
                      mode={getCodemirrorMode(options.parser)}
                      value={formatted}
                      ruler={options.printWidth}
                      overlayStart={
                        cursorOffset === -1 ? undefined : cursorOffset
                      }
                      overlayEnd={
                        cursorOffset === -1 ? undefined : cursorOffset + 1
                      }
                    />
                  ) : null}
                  {settings.showSecondFormat && !isDocExplorer ? (
                    <OutputPanel
                      name="Output (Second format)"
                      mode={getCodemirrorMode(options.parser)}
                      value={getSecondFormat(formatted, debug.reformatted)}
                      ruler={options.printWidth}
                    />
                  ) : null}
                </div>
              </div>
              <div class="bottom-bar">
                <div class="bottom-bar-buttons">
                  <Button onClick={togglers.showSidebar}>
                    {settings.showSidebar ? "Hide" : "Show"} options
                  </Button>
                  <Button onClick={clearContent}>Clear</Button>
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
                    onClick={insertDummyId}
                    onMousedown={(event) => event.preventDefault()} // prevent button from focusing
                    title="Generate a nonsense variable name (Ctrl-Q)"
                  >
                    Insert dummy id
                  </Button>
                </div>
                <div class="bottom-bar-buttons bottom-bar-buttons-right">
                  <ClipboardButton copy={window.location.href}>
                    Copy link
                  </ClipboardButton>
                  <ClipboardButton
                    copy={() =>
                      getMarkdown({
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
            </>
          );
        }}
      </PrettierFormat>
    );
  };

  watch(
    () => [state.content, state.options],
    () => {
      urlHash.replace({ content: state.content, options: state.options });
    },
    { deep: true },
  );
  return render;
}
const Playground = {
  name: "Playground",
  props: {
    availableOptions: { type: Array, required: true },
  },
  setup,
};

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
  if (formatted === "") {
    return "";
  }

  if (formatted === reformatted) {
    return "✓ Second format is unchanged.";
  }

  return reformatted ?? "";
}

export default Playground;
