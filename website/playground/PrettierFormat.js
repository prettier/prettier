import * as React from "react";

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
      "debugComments",
      "reformat",
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
      debugComments: comments,
      reformat,
    } = this.props;

    worker
      .format(code, options, { ast, doc, comments, reformat })
      .then((result) => this.setState(result));
  }

  render() {
    return this.props.children(this.state);
  }
}
