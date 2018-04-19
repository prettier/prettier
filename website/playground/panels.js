import CodeMirror from "codemirror";
import React from "react";

class CodeMirrorPanel extends React.Component {
  constructor() {
    super();
    this._textareaRef = React.createRef();
    this._codeMirror = null;
    this._cached = "";
    this._overlay = null;
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    const options = Object.assign({}, this.props);
    delete options.ruler;
    delete options.rulerColor;
    delete options.value;
    delete options.onChange;

    options.rulers = [makeRuler(this.props)];

    this._codeMirror = CodeMirror.fromTextArea(
      this._textareaRef.current,
      options
    );
    this._codeMirror.on("change", this.handleChange);

    this.updateValue(this.props.value || "");
    this.updateOverlay();
  }

  componentWillUnmount() {
    this._codeMirror && this._codeMirror.toTextArea();
  }

  componentDidUpdate(prevProps) {
    if (this.props.readOnly && this.props.value !== this._cached) {
      this.updateValue(this.props.value);
      this.updateOverlay();
    }
    if (
      this.props.overlayStart !== prevProps.overlayStart ||
      this.props.overlayEnd !== this.props.overlayEnd
    ) {
      this.updateOverlay();
    }
    if (this.props.mode !== prevProps.mode) {
      this._codeMirror.setOption("mode", this.props.mode);
    }
    if (this.props.placeholder !== prevProps.placeholder) {
      this._codeMirror.setOption("placeholder", this.props.placeholder);
    }
    if (this.props.ruler !== prevProps.ruler) {
      this._codeMirror.setOption("rulers", [makeRuler(this.props)]);
    }
  }

  updateValue(value) {
    this._cached = value;
    this._codeMirror.setValue(value);
  }

  updateOverlay() {
    if (!this.props.readOnly) {
      if (this._overlay) {
        this._codeMirror.removeOverlay(this._overlay);
      }
      const [start, end] = getIndexPosition(this.props.value, [
        this.props.overlayStart,
        this.props.overlayEnd
      ]);
      this._overlay = createOverlay(start, end);
      this._codeMirror.addOverlay(this._overlay);
    }
  }

  handleChange(doc, change) {
    if (change.origin !== "setValue") {
      this._cached = doc.getValue();
      this.props.onChange(this._cached);
    }
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
  indexes = indexes.slice().sort();
  let line = 0;
  let count = 0;
  let lineStart = 0;
  const result = [];

  while (indexes.length) {
    const index = indexes.shift();

    while (count < index && count < text.length) {
      count++;
      if (text[count] === "\n") {
        line++;
        lineStart = count;
      }
    }

    result.push({ line, pos: count - lineStart });
  }

  return result;
}

function createOverlay(start, end) {
  return {
    token(stream) {
      const line = stream.lineOracle.line;

      if (line < start.line || line > end.line) {
        stream.skipToEnd();
      } else if (line === start.line && stream.pos < start.pos) {
        stream.pos = start.pos;
      } else if (line === end.line) {
        if (stream.pos < end.pos) {
          stream.pos = end.pos;
          return "searching";
        } else {
          stream.skipToEnd();
        }
      } else {
        stream.skipToEnd();
        return "searching";
      }
    }
  };
}

function makeRuler(props) {
  return { column: props.ruler, color: props.rulerColor };
}

export function InputPanel(props) {
  return (
    <CodeMirrorPanel
      lineNumbers={true}
      keyMap="sublime"
      autoCloseBrackets={true}
      matchBrackets={true}
      showCursorWhenSelecting={true}
      tabWidth={2}
      rulerColor="#eeeeee"
      rangeStart={5}
      rangeEnd={25}
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

export function DebugPanel({ value }) {
  return (
    <CodeMirrorPanel
      readOnly={true}
      lineNumbers={false}
      mode="jsx"
      value={value}
    />
  );
}

function stringify(obj, replacer, spaces, cycleReplacer) {
  return JSON.stringify(obj, serializer(replacer, cycleReplacer), spaces);
}

function serializer(replacer, cycleReplacer) {
  var stack = [],
    keys = [];

  if (cycleReplacer == null)
    cycleReplacer = function(key, value) {
      if (stack[0] === value) return "[Circular ~]";
      return (
        "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]"
      );
    };

  return function(key, value) {
    if (stack.length > 0) {
      var thisPos = stack.indexOf(this);
      ~thisPos ? stack.splice(thisPos + 1) : stack.push(this);
      ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key);
      if (~stack.indexOf(value)) value = cycleReplacer.call(this, key, value);
    } else stack.push(value);

    return replacer == null ? value : replacer.call(this, key, value);
  };
}
