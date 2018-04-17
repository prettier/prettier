import React from "react";

import { shallowEqual } from "./helpers";

function getFormatProps(props) {
  const { code, options, debugAst, debugDoc, secondFormat } = props;
  return { code, options, debugAst, debugDoc, secondFormat };
}

export default class PrettierFormat extends React.Component {
  constructor() {
    super();
    this.state = { formatted: "" };
  }

  componentDidMount() {
    this.format();
  }

  componentDidUpdate(prevProps) {
    if (!shallowEqual(getFormatProps(prevProps), getFormatProps(this.props))) {
      this.format();
    }
  }

  format() {
    const { worker } = this.props;

    worker
      .postMessage(
        Object.assign({ type: "format" }, getFormatProps(this.props))
      )
      .then(result => this.setState(result));
  }

  render() {
    return this.props.children(this.state);
  }
}
