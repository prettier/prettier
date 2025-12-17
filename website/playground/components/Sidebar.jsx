import { orderOptions } from "../composables/use-options.js";
import { CATEGORIES_ORDER, ENABLED_OPTIONS } from "../constants/index.js";
import Option from "./sidebar/Options.jsx";
import SidebarCategory from "./sidebar/SidebarCategory.jsx";
import SidebarOptions from "./sidebar/SidebarOptions.jsx";
import SidebarWrapper from "./sidebar/SidebarWrapper.jsx";
import Button from "./ui/Button.jsx";
import Checkbox from "./ui/Checkbox.jsx";
import ClipboardButton from "./ui/ClipboardButton.jsx";

export default function PlaygroundSidebar({
  visible,
  availableOptions,
  optionsState,
  playgroundState,
  debug,
  onGetMarkdown,
}) {
  const {
    state,
    rangeStartOption,
    rangeEndOption,
    cursorOffsetOption,
    setSelectionAsRange,
    handleOptionValueChange,
    resetOptions,
  } = optionsState;

  const enabledOptions = orderOptions(availableOptions, ENABLED_OPTIONS);
  const isDocExplorer = state.options.parser === "doc-explorer";

  return (
    <SidebarWrapper visible={visible}>
      <SidebarOptions
        categories={CATEGORIES_ORDER}
        availableOptions={enabledOptions}
        optionValues={state.options}
        onOption-value-change={handleOptionValueChange}
      />

      {!isDocExplorer && (
        <SidebarCategory title="Range">
          <label>
            The selected range will be highlighted in yellow in the input editor
          </label>
          <Option
            option={rangeStartOption}
            value={
              typeof state.options.rangeStart === "number"
                ? state.options.rangeStart
                : undefined
            }
            onChange={handleOptionValueChange}
          />
          <Option
            option={rangeEndOption}
            value={
              typeof state.options.rangeEnd === "number"
                ? state.options.rangeEnd
                : undefined
            }
            overrideMax={state.content.length}
            onChange={handleOptionValueChange}
          />
          <Button variant={"primary"} onClick={setSelectionAsRange}>
            Set selected text as range
          </Button>
        </SidebarCategory>
      )}

      {!isDocExplorer && (
        <SidebarCategory title="Cursor">
          <Option
            option={cursorOffsetOption}
            value={
              state.options.cursorOffset >= 0
                ? state.options.cursorOffset
                : undefined
            }
            onChange={handleOptionValueChange}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
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
            {state.options.cursorOffset >= 0 ? (
              <div class="playground__cursor-tracking">
                <label>Result: {debug.cursorOffset}</label>
                <Button
                  variant="primary"
                  onClick={() => {
                    handleOptionValueChange(cursorOffsetOption, -1);
                  }}
                >
                  Reset
                </Button>
              </div>
            ) : null}
          </div>
        </SidebarCategory>
      )}

      <SidebarCategory title="Debug">
        <Checkbox
          label="show input"
          checked={playgroundState.showInput}
          onChange={playgroundState.toggleInput}
        />
        <Checkbox
          label="show AST"
          checked={playgroundState.showAst}
          onChange={playgroundState.toggleAst}
        />
        {!isDocExplorer && (
          <Checkbox
            label="show preprocessed AST"
            checked={playgroundState.showPreprocessedAst}
            onChange={playgroundState.togglePreprocessedAst}
          />
        )}
        {!isDocExplorer && (
          <Checkbox
            label="show doc"
            checked={playgroundState.showDoc}
            onChange={playgroundState.toggleDoc}
          />
        )}
        {!isDocExplorer && (
          <Checkbox
            label="show comments"
            checked={playgroundState.showComments}
            onChange={playgroundState.toggleComments}
          />
        )}
        <Checkbox
          label="show output"
          checked={playgroundState.showOutput}
          onChange={playgroundState.toggleOutput}
        />
        {!isDocExplorer && (
          <Checkbox
            label="show second format"
            checked={playgroundState.showSecondFormat}
            onChange={playgroundState.toggleSecondFormat}
          />
        )}
        {!isDocExplorer && (
          <Checkbox
            label="rethrow embed errors"
            checked={playgroundState.rethrowEmbedErrors}
            onChange={playgroundState.toggleEmbedErrors}
          />
        )}
        {playgroundState.showDoc && !isDocExplorer ? (
          <ClipboardButton
            copy={() => onGetMarkdown({ doc: debug.doc })}
            disabled={!debug.doc}
          >
            Copy doc
          </ClipboardButton>
        ) : null}
      </SidebarCategory>

      <div class="playground__sidebar-section">
        <Button onClick={resetOptions}>Reset to defaults</Button>
      </div>
    </SidebarWrapper>
  );
}
