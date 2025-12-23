import { reactive, watch } from "vue";
import { ENABLED_OPTIONS } from "../constants/index.js";
import { generateDummyId, getCodeSample, getDefaults } from "../utils";
import * as urlHash from "../utils/url-hash.js";

export function useOptions(availableOptions) {
  const rangeStartOption = availableOptions.find(
    (opt) => opt.name === "rangeStart",
  );
  const rangeEndOption = availableOptions.find(
    (opt) => opt.name === "rangeEnd",
  );
  const cursorOffsetOption = availableOptions.find(
    (opt) => opt.name === "cursorOffset",
  );

  const original = urlHash.read();
  const defaultOptions = getDefaults(availableOptions, ENABLED_OPTIONS);
  const options = Object.assign(defaultOptions, original.options);

  applyLegacyMigrations(options);

  const codeSample = getCodeSample(options.parser);
  const content = original.content || codeSample;

  const state = reactive({
    content,
    options,
    selection: undefined,
    trackCursorOffset: false,
  });

  const setContent = (content) => {
    state.content = content;
  };

  const clearContent = () => {
    state.content = "";
    state.selection = undefined;
  };

  const insertDummyId = () => {
    const { content, selection } = state;
    if (!selection) {
      return;
    }
    const dummyId = generateDummyId();
    const modifiedContent =
      content.slice(0, selection.main.from) +
      dummyId +
      content.slice(selection.main.to);

    Object.assign(state, {
      content: modifiedContent,
      selection: {
        ...selection,
        main: {
          ...selection.main,
          from: selection.main.from + dummyId.length,
          to: selection.main.from + dummyId.length,
        },
      },
    });
  };

  const setSelection = (selection) => {
    if (!selection) {
      return;
    }

    Object.assign(state, { selection });

    if (state.trackCursorOffset && selection.main) {
      handleOptionValueChange(cursorOffsetOption, selection.main.head);
    }
  };

  const setSelectionAsRange = () => {
    const { selection, options } = state;

    if (!(selection && selection.main)) {
      return;
    }

    const rangeStart = selection.main.from;
    const rangeEnd = selection.main.to;

    const updatedOptions = { ...options, rangeStart, rangeEnd };
    if (rangeStart === rangeEnd) {
      delete updatedOptions.rangeStart;
      delete updatedOptions.rangeEnd;
    }
    Object.assign(state, { options: updatedOptions });
  };

  const handleOptionValueChange = (option, value) => {
    const options = { ...state.options };

    if (option.name === "parser" && value !== options.parser) {
      // Clear range options when changing parser
      delete options.rangeStart;
      delete options.rangeEnd;
    }

    if (option.type === "int" && Number.isNaN(value)) {
      delete options[option.name];
    } else {
      options[option.name] = value;
    }

    const content =
      state.content === "" || state.content !== getCodeSample(options.parser)
        ? getCodeSample(options.parser)
        : state.content;

    return Object.assign(state, { options, content });
  };

  const resetOptions = () => {
    const content = getCodeSample(defaultOptions.parser);
    Object.assign(state, { options: { ...defaultOptions }, content });
  };

  watch(
    () => [state.content, state.options],
    () => {
      urlHash.replace({ content: state.content, options: state.options });
    },
    { deep: true },
  );

  return {
    state,

    rangeStartOption,
    rangeEndOption,
    cursorOffsetOption,

    setContent,
    clearContent,
    setSelection,
    insertDummyId,
    setSelectionAsRange,
    handleOptionValueChange,
    resetOptions,
  };
}

function applyLegacyMigrations(options) {
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
}

export function orderOptions(availableOptions, order) {
  const optionsByName = {};
  for (const option of availableOptions) {
    optionsByName[option.name] = option;
  }
  return order.map((name) => optionsByName[name]);
}
