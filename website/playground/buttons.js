import React from "react";
import ClipboardJS from "clipboard";

export const Button = React.forwardRef((props, ref) => (
  <button type="button" className="btn" ref={ref} {...props} />
));

export function LinkButton(props) {
  return <a className="btn" {...props} />;
}

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
      }
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
    const rest = Object.assign({}, this.props);
    delete rest.children;
    delete rest.copy;

    return (
      <Button ref={this.ref} {...rest}>
        {this.state.showTooltip ? (
          <span className="tooltip">{this.state.tooltipText}</span>
        ) : null}
        {this.props.children}
      </Button>
    );
  }
}
