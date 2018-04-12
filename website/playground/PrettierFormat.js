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
    const { code, options, debugAst, debugDoc } = this.props;
    if (
      prevProps.code !== code ||
      prevProps.options !== options ||
      prevProps.debugAst !== debugAst ||
      prevProps.debugDoc !== debugDoc
    ) {
      this.format();
    }
  }

  format() {
    const { code, options, worker, debugAst, debugDoc } = this.props;
    worker
      .postMessage({ type: "format", code, options, debugAst, debugDoc })
      .then(result => this.setState(result));
  }

  render() {
    return this.props.children(this.state);
  }
}
