const { React, CodeMirror } = window;

class CodeMirrorPanel extends React.Component {
  constructor() {
    super();
    this._textareaRef = React.createRef();
    this._codeMirror = null;
    this._cached = "";
    this._overlay = null;
    this.handleChange = this.handleChange.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleSelectionChange = this.handleSelectionChange.bind(this);
  }

  componentDidMount() {
    const options = { ...this.props };
    delete options.ruler;
    delete options.rulerColor;
    delete options.value;
    delete options.selection;
    delete options.onChange;

    options.rulers = [makeRuler(this.props)];
    options.gutters = makeGutters(this.props);

    this._codeMirror = CodeMirror.fromTextArea(
      this._textareaRef.current,
      options,
    );
    this._codeMirror.on("change", this.handleChange);
    this._codeMirror.on("focus", this.handleFocus);
    this._codeMirror.on("beforeSelectionChange", this.handleSelectionChange);

    window.CodeMirror.keyMap.pcSublime["Ctrl-L"] = false;
    window.CodeMirror.keyMap.sublime["Ctrl-L"] = false;

    this.updateValue(this.props.value || "");
    this.updateSelection();
    this.updateOverlay();
  }

  componentWillUnmount() {
    this._codeMirror && this._codeMirror.toTextArea();
  }

  componentDidUpdate(prevProps) {
    if (this.props.value !== this._cached) {
      this.updateValue(this.props.value);
    }
    if (
      !isEqualSelection(this.props.selection, prevProps.selection) &&
      !isEqualSelection(
        this.props.selection,
        this._codeMirror.listSelections()[0],
      )
    ) {
      this.updateSelection();
    }
    if (
      this.props.overlayStart !== prevProps.overlayStart ||
      this.props.overlayEnd !== prevProps.overlayEnd
    ) {
      this.updateOverlay();
    }
    if (this.props.mode !== prevProps.mode) {
      this._codeMirror.setOption("mode", this.props.mode);
    }
    if (this.props.ruler !== prevProps.ruler) {
      this._codeMirror.setOption("rulers", [makeRuler(this.props)]);
    }
    if (this.props.foldGutter !== prevProps.foldGutter) {
      this._codeMirror.setOption("gutters", makeGutters(this.props));
    }
  }

  updateValue(value) {
    this._cached = value;
    this._codeMirror.setValue(value);

    if (this.props.autoFold instanceof RegExp) {
      const lines = value.split("\n");
      // going backwards to prevent unfolding folds created earlier
      for (let i = lines.length - 1; i >= 0; i--) {
        if (this.props.autoFold.test(lines[i])) {
          this._codeMirror.foldCode(i);
        }
      }
    }
  }

  updateSelection() {
    this._codeMirror.setSelection(
      this.props.selection?.anchor ?? { line: 0, ch: 0 },
      this.props.selection?.head,
    );
  }

  updateOverlay() {
    if (this._overlay) {
      this._codeMirror.removeOverlay(this._overlay);
    }
    if (this.props.overlayStart !== undefined) {
      const [start, end] = getIndexPosition(this.props.value, [
        this.props.overlayStart,
        this.props.overlayEnd,
      ]);
      this._overlay = createOverlay(start, end);
      this._codeMirror.addOverlay(this._overlay);
    }
  }

  handleFocus(/* codeMirror, event */) {
    if (this._codeMirror.getValue() === this.props.codeSample) {
      this._codeMirror.execCommand("selectAll");
    }
  }

  handleChange(doc, change) {
    if (change.origin !== "setValue") {
      this._cached = doc.getValue();
      this.props.onChange(this._cached);
      this.updateOverlay();
    }
  }

  handleSelectionChange(doc, change) {
    this.props.onSelectionChange?.(change.ranges[0]);
  }

  render() {
    return (
      <div className="editor input">
        <textarea ref={this._textareaRef} />
      </div>
    );
  }
}

function getIndexPosition(text, indexes) {
  indexes = [...indexes];
  let line = 0;
  let count = 0;
  let lineStart = 0;
  const result = [];

  while (indexes.length > 0) {
    const index = indexes.shift();

    while (count < index && count < text.length) {
      if (text[count] === "\n") {
        line++;
        lineStart = count + 1;
      }
      count++;
    }

    result.push({ line, pos: count - lineStart });
  }

  return result;
}

function createOverlay(start, end) {
  return {
    token(stream) {
      const { line } = stream.lineOracle;

      if (line < start.line || line > end.line) {
        stream.skipToEnd();
      } else if (line === start.line && stream.pos < start.pos) {
        stream.pos = start.pos;
      } else if (line === end.line) {
        if (stream.pos < end.pos) {
          stream.pos = end.pos;
          return "searching";
        }
        stream.skipToEnd();
      } else {
        stream.skipToEnd();
        return "searching";
      }
    },
  };
}

function makeRuler(props) {
  return { column: props.ruler, color: props.rulerColor };
}

function makeGutters(props) {
  return props.foldGutter
    ? ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
    : [];
}

function isEqualSelection(selection1, selection2) {
  const anchor1 = selection1?.anchor ?? { line: 0, ch: 0 };
  const head1 = selection1?.head ?? anchor1;
  const anchor2 = selection2?.anchor ?? { line: 0, ch: 0 };
  const head2 = selection2?.head ?? anchor2;
  return (
    head1.line === head2.line &&
    head1.ch === head2.ch &&
    anchor1.line === anchor2.line &&
    anchor1.ch === anchor2.ch
  );
}

export function InputPanel(props) {
  return (
    <CodeMirrorPanel
      lineNumbers={true}
      keyMap="sublime"
      autoCloseBrackets={true}
      matchBrackets={true}
      showCursorWhenSelecting={true}
      tabSize={4}
      rulerColor="#eeeeee"
      {...props}
    />
  );
}

export function OutputPanel(props) {
  return (
    <CodeMirrorPanel
      readOnly={true}
      lineNumbers={true}
      rulerColor="#444444"
      {...props}
    />
  );
}

export function DebugPanel({ value, autoFold }) {
  return (
    <CodeMirrorPanel
      readOnly={true}
      lineNumbers={false}
      foldGutter={true}
      autoFold={autoFold}
      mode="jsx"
      value={value}
    />
  );
}
