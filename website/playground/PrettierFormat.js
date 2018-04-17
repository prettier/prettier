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
    const { code, options, debugAst, debugDoc, secondFormat } = this.props;
    if (
      prevProps.code !== code ||
      prevProps.options !== options ||
      prevProps.debugAst !== debugAst ||
      prevProps.debugDoc !== debugDoc ||
      prevProps.secondFormat !== secondFormat
    ) {
      this.format();
    }
  }

  format() {
    const {
      code,
      options,
      worker,
      debugAst,
      debugDoc,
      secondFormat
    } = this.props;
    worker
      .postMessage({
        type: "format",
        code,
        options,
        debugAst,
        debugDoc,
        secondFormat
      })
      .then(result => this.setState(result));
  }

  render() {
    return this.props.children(this.state);
  }
}
