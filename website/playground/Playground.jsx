import PlaygroundBottomBar from "./components/BottomBar.jsx";
import {
  DebugPanel,
  InputPanel,
  OutputPanel,
} from "./components/editor/Panels.jsx";
import PrettierFormat from "./components/PrettierFormat.jsx";
import PlaygroundSidebar from "./components/Sidebar.jsx";
import PlaygroundStateProvider from "./components/StateProvider.jsx";
import { orderOptions, useOptions } from "./composables/use-options.js";
import { ENABLED_OPTIONS, MAX_LENGTH } from "./constants";
import {
  buildCliArgs,
  convertOffsetToSelection,
  formatMarkdown,
  generateDummyId,
  getAstAutoFold,
  getCodemirrorMode,
  getCodeSample,
} from "./utils";

function setup(props) {
  const optionsState = useOptions(props.availableOptions);
  const { state, setContent, clearContent, setSelection } = optionsState;

  const getMarkdown = ({ formatted, reformatted, full, doc }) => {
    const { content, options } = state;
    const { availableOptions, version } = props;
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
      version,
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

    return props.worker
      .format(content, {
        parser: "__js_expression",
        cursorOffset: selection?.main?.head ?? 0,
      })
      .then(({ error, formatted, cursorOffset }) => {
        if (error) {
          return;
        }

        Object.assign(state, {
          content: formatted,
          selection: convertOffsetToSelection(cursorOffset, formatted),
        });
      });
  };

  const insertDummyId = () => {
    const { content, selection } = state;
    const dummyId = generateDummyId();

    const rangeStart = selection?.main?.from ?? 0;
    const rangeEnd = selection?.main?.to ?? 0;

    const modifiedContent =
      content.slice(0, rangeStart) + dummyId + content.slice(rangeEnd);

    Object.assign(state, {
      content: modifiedContent,
      selection: convertOffsetToSelection(
        rangeStart + dummyId.length,
        modifiedContent,
      ),
    });
  };

  const render = () => {
    const { worker } = props;
    const { content, options } = state;

    return (
      <PlaygroundStateProvider>
        {(playgroundState) => (
          <PrettierFormat
            worker={worker}
            code={content}
            options={options}
            debugAst={playgroundState.showAst}
            debugPreprocessedAst={playgroundState.showPreprocessedAst}
            debugDoc={playgroundState.showDoc}
            debugComments={playgroundState.showComments}
            reformat={playgroundState.showSecondFormat}
            rethrowEmbedErrors={playgroundState.rethrowEmbedErrors}
          >
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
                  <div class="playground__editors-container">
                    <PlaygroundSidebar
                      visible={playgroundState.showSidebar}
                      availableOptions={props.availableOptions}
                      optionsState={optionsState}
                      playgroundState={playgroundState}
                      debug={{ ...debug, cursorOffset }}
                      onGetMarkdown={getMarkdown}
                    />
                    <div class="playground__editors">
                      {playgroundState.showInput ? (
                        <InputPanel
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
                            "Shift-Alt-F": formatInput,
                            "Ctrl-Q": insertDummyId,
                          }}
                          foldGutter={options.parser === "doc-explorer"}
                        />
                      ) : null}
                      {playgroundState.showAst ? (
                        <DebugPanel
                          value={debug.ast || ""}
                          autoFold={getAstAutoFold(options.parser)}
                        />
                      ) : null}
                      {playgroundState.showPreprocessedAst && !isDocExplorer ? (
                        <DebugPanel
                          value={debug.preprocessedAst || ""}
                          autoFold={getAstAutoFold(options.parser)}
                        />
                      ) : null}
                      {playgroundState.showDoc && !isDocExplorer ? (
                        <DebugPanel value={debug.doc || ""} />
                      ) : null}
                      {playgroundState.showComments && !isDocExplorer ? (
                        <DebugPanel
                          value={debug.comments || ""}
                          autoFold={getAstAutoFold(options.parser)}
                        />
                      ) : null}
                      {playgroundState.showOutput ? (
                        <OutputPanel
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
                      {playgroundState.showSecondFormat && !isDocExplorer ? (
                        <OutputPanel
                          mode={getCodemirrorMode(options.parser)}
                          value={getSecondFormat(formatted, debug.reformatted)}
                          ruler={options.printWidth}
                        />
                      ) : null}
                    </div>
                  </div>
                  <PlaygroundBottomBar
                    playgroundState={playgroundState}
                    options={options}
                    formatted={formatted}
                    debug={debug}
                    fullReport={fullReport}
                    showFullReport={showFullReport}
                    onClearContent={clearContent}
                    onInsertDummyId={insertDummyId}
                    onGetMarkdown={getMarkdown}
                  />
                </>
              );
            }}
          </PrettierFormat>
        )}
      </PlaygroundStateProvider>
    );
  };

  return render;
}
const Playground = {
  name: "Playground",
  props: {
    worker: { type: Object, required: true },
    availableOptions: { type: Array, required: true },
    version: { type: String, required: true },
  },
  setup,
};

function getSecondFormat(formatted, reformatted) {
  return formatted === ""
    ? ""
    : formatted === reformatted
      ? "✓ Second format is unchanged."
      : (reformatted ?? "");
}

export default Playground;
