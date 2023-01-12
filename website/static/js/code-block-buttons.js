/* global ClipboardJS */

"use strict";

(function () {
  const CONTAINER_CLASS_NAME = "code-block-with-actions";
  const ACTIONS_CONTAINER_CLASS_NAME = "code-block-actions";
  const COPY_BUTTON_CLASS_NAME = "code-block-copy-button";
  const COPY_BUTTON_COPIED_CLASS_NAME = `${COPY_BUTTON_CLASS_NAME}--copied`;
  const COPY_BUTTON_ICON_CLASS_NAME = `${COPY_BUTTON_CLASS_NAME}__icon`;
  const COPY_BUTTON_COPY_ICON_CLASS_NAME = `${COPY_BUTTON_ICON_CLASS_NAME}--copy`;
  const COPY_BUTTON_COPIED_ICON_CLASS_NAME = `${COPY_BUTTON_ICON_CLASS_NAME}--copied`;
  const ARIA_LABEL = "Copy code to clipboard";
  const ARIA_LABEL_COPIED = "Copied";

  function init(codeBlock) {
    const container = codeBlock.parentNode;
    container.classList.add(CONTAINER_CLASS_NAME);

    const actionsContainer = Object.assign(document.createElement("div"), {
      className: ACTIONS_CONTAINER_CLASS_NAME,
    });
    const copyButton = Object.assign(document.createElement("button"), {
      className: COPY_BUTTON_CLASS_NAME,
      type: "button",
      innerHTML:
        `<svg class="${COPY_BUTTON_ICON_CLASS_NAME} ${COPY_BUTTON_COPY_ICON_CLASS_NAME}" viewBox="0 0 24 24"><path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"></path></svg>` +
        `<svg class="${COPY_BUTTON_ICON_CLASS_NAME} ${COPY_BUTTON_COPIED_ICON_CLASS_NAME}" viewBox="0 0 24 24"><path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"></path></svg>`,
    });
    copyButton.setAttribute("aria-label", ARIA_LABEL);

    new ClipboardJS(copyButton, { target: () => codeBlock }).on(
      "success",
      (event) => {
        event.clearSelection();
        copyButton.classList.add(COPY_BUTTON_COPIED_CLASS_NAME);
        copyButton.setAttribute("aria-label", ARIA_LABEL_COPIED);
        copyButton.disabled = true;

        setTimeout(() => {
          copyButton.classList.remove(COPY_BUTTON_COPIED_CLASS_NAME);
          copyButton.setAttribute("aria-label", ARIA_LABEL);
          copyButton.disabled = false;
        }, 2000);
      }
    );

    actionsContainer.appendChild(copyButton);
    container.appendChild(actionsContainer);
  }

  window.addEventListener("load", () => {
    for (const codeBlock of document.querySelectorAll("pre > code.hljs")) {
      init(codeBlock);
    }
  });
})();
