import CodeMirror from "codemirror";
import React from "react";

class CodeMirrorPanel extends React.Component {
  constructor() {
    super();
    this._textareaRef = React.createRef();
    this._codeMirror = null;
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    this._codeMirror = CodeMirror.fromTextArea(
      this._textareaRef.current,
      this.props.options
    );
    this._codeMirror.on("change", this.handleChange);
    this._codeMirror.setValue(this.props.value || "");
  }

  componentWillUnmount() {
    this._codeMirror && this._codeMirror.toTextArea();
  }

  componentDidUpdate() {
    if (this.props.value !== this._codeMirror.getValue()) {
      this._codeMirror.setValue(this.props.value);
    }
  }

  handleChange(doc, change) {
    if (change.origin !== "setValue") {
      this.props.onChange(doc.getValue());
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

export function InputPanel({ mode, value, onChange }) {
  return (
    <CodeMirrorPanel
      options={{
        lineNumbers: true,
        keyMap: "sublime",
        autoCloseBrackets: true,
        matchBrackets: true,
        showCursorWhenSelecting: true,
        tabWidth: 2,
        mode
      }}
      value={value}
      onChange={onChange}
    />
  );
}

export function OutputPanel({ mode, value }) {
  return (
    <CodeMirrorPanel
      options={{
        readOnly: true,
        lineNumbers: true,
        mode
      }}
      value={value}
    />
  );
}

export function DebugPanel({ value }) {
  return (
    <CodeMirrorPanel
      options={{ readOnly: true, lineNumbers: false, mode: "jsx" }}
      value={value}
    />
  );
}
