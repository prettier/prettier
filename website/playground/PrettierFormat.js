import React from "react";

export default class extends React.Component {
  constructor() {
    super();
    this.state = { formatted: "" };
  }

  componentDidMount() {
    this.format();
  }

  componentDidUpdate(prevProps) {
    const { code, options, ast } = this.props;
    if (
      prevProps.code !== code ||
      prevProps.options !== options ||
      prevProps.ast !== ast
    ) {
      this.format();
    }
  }

  format() {
    const { code, options, worker, ast } = this.props;
    worker
      .postMessage({ type: "format", code, options, ast })
      .then(result => this.setState(result));
  }

  render() {
    return this.props.children(this.state);
  }
}
