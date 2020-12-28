import * as React from "react";
import ClipboardJS from "clipboard";

export const Button = React.forwardRef((props, ref) => (
  <button type="button" className="btn" ref={ref} {...props} />
));

export class ClipboardButton extends React.Component {
  constructor() {
    super();
    this.state = { showTooltip: false, tooltipText: "" };
    this.timer = null;
    this.ref = React.createRef();
  }

  componentDidMount() {
    this.clipboard = new ClipboardJS(this.ref.current, {
      text: () => {
        const { copy } = this.props;
        return typeof copy === "function" ? copy() : copy;
      },
    });
    this.clipboard.on("success", () => this.showTooltip("Copied!"));
    this.clipboard.on("error", () => this.showTooltip("Press ctrl+c to copy"));
  }

  showTooltip(text) {
    this.setState({ showTooltip: true, tooltipText: text }, () => {
      if (this.timer) {
        clearTimeout(this.timer);
      }
      this.timer = setTimeout(() => {
        this.timer = null;
        this.setState({ showTooltip: false });
      }, 2000);
    });
  }

  render() {
    const { children, copy, ...rest } = this.props;
    const { showTooltip, tooltipText } = this.state;

    return (
      <Button ref={this.ref} {...rest}>
        {showTooltip ? <span className="tooltip">{tooltipText}</span> : null}
        {children}
      </Button>
    );
  }
}

export function FileButton({ children, accept, onFile, ...rest }) {
  const inputRef = React.useRef();

  function handleClick() {
    inputRef.current.click();
  }

  function handleChange(e) {
    readFile(e.target.files[0])
      .then(onFile)
      .catch((err) => {
        alert(err.message);
      })
      .then(() => {
        // clear the value so the same file may be uploaded again
        inputRef.current.value = "";
      });
  }

  return (
    <>
      <Button onClick={handleClick} {...rest}>
        {children}
      </Button>
      <input
        ref={inputRef}
        onChange={handleChange}
        hidden
        type="file"
        accept={accept}
      />
    </>
  );
}

function readFile(file) {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.addEventListener("load", (e) => {
      resolve(e.target.result);
    });
    reader.addEventListener("error", (e) => {
      reject(e);
    });
    reader.readAsText(file);
  });
}
