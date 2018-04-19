import CodeMirror from "codemirror";
import React from "react";

class CodeMirrorPanel extends React.Component {
  constructor() {
    super();
    this._textareaRef = React.createRef();
    this._codeMirror = null;
    this._cached = "";
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    const options = Object.assign({}, this.props);
    delete options.rulerColumn;
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
  }

  componentWillUnmount() {
    this._codeMirror && this._codeMirror.toTextArea();
  }

  componentDidUpdate(prevProps) {
    if (this.props.readOnly && this.props.value !== this._cached) {
      this.updateValue(this.props.value);
    }
    if (this.props.mode !== prevProps.mode) {
      this._codeMirror.setOption("mode", this.props.mode);
    }
    if (this.props.placeholder !== prevProps.placeholder) {
      this._codeMirror.setOption("placeholder", this.props.placeholder);
    }
    if (this.props.rulerColumn !== prevProps.rulerColumn) {
      this._codeMirror.setOption("rulers", [makeRuler(this.props)]);
    }
  }

  updateValue(value) {
    this._cached = value;
    this._codeMirror.setValue(value);
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

function makeRuler(props) {
  return { column: props.rulerColumn, color: props.rulerColor };
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
