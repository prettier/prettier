import { COPY_MESSAGE, ISSUES_URL } from "../constants/index.js";
import Button from "./ui/Button.jsx";
import ClipboardButton from "./ui/ClipboardButton.jsx";

export default function PlaygroundBottomBar({
  playgroundState,
  options,
  formatted,
  debug,
  fullReport,
  showFullReport,
  onClearContent,
  onInsertDummyId,
  onGetMarkdown,
}) {
  return (
    <div class="playground__bottom-bar">
      <div class="playground__bottom-bar-actions playground__bottom-bar-actions--left">
        <Button onClick={playgroundState.toggleSidebar}>
          {playgroundState.showSidebar ? "Hide" : "Show"} options
        </Button>
        <Button onClick={onClearContent}>Clear</Button>
        <Button
          onClick={onInsertDummyId}
          onMousedown={(event) => event.preventDefault()}
          title="Generate a nonsense variable name (Ctrl-Q)"
        >
          Insert dummy id
        </Button>
      </div>

      <div class="playground__bottom-bar-actions playground__bottom-bar-actions--right">
        <ClipboardButton copy={window.location.href} variant="primary">
          Copy link
        </ClipboardButton>
        <ClipboardButton
          copy={() =>
            onGetMarkdown({
              formatted,
              reformatted: debug.reformatted,
            })
          }
          variant="primary"
        >
          Copy markdown
        </ClipboardButton>
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
          variant="primary"
        >
          Copy config JSON
        </ClipboardButton>
        <a
          href={getReportLink(showFullReport ? fullReport : COPY_MESSAGE)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ClipboardButton
            copy={() => (showFullReport ? "" : fullReport)}
            variant="danger"
          >
            Report issue
          </ClipboardButton>
        </a>
      </div>
    </div>
  );
}

function getReportLink(reportBody) {
  return `${ISSUES_URL}${encodeURIComponent(reportBody)}`;
}
