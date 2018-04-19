import React from "react";

import { shallowEqual } from "./helpers";

export default class PrettierFormat extends React.Component {
  constructor() {
    super();
    this.state = { formatted: "", debug: {} };
  }

  componentDidMount() {
    this.format();
  }

  componentDidUpdate(prevProps) {
    for (const key of [
      "code",
      "options",
      "debugAst",
      "debugDoc",
      "secondFormat"
    ]) {
      if (prevProps[key] !== this.props[key]) {
        this.format();
        break;
      }
    }
  }

  format() {
    const {
      worker,
      code,
      options,
      debugAst: ast,
      debugDoc: doc,
      secondFormat: reformat
    } = this.props;

    worker
      .format(code, options, { ast, doc, reformat })
      .then(result => this.setState(result));
  }

  render() {
    return this.props.children(this.state);
  }
}
