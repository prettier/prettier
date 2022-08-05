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
      "enabled",
      "code",
      "options",
      "debugAst",
      "debugDoc",
      "debugComments",
      "reformat",
      "rethrowEmbedErrors",
    ]) {
      if (prevProps[key] !== this.props[key]) {
        this.format();
        break;
      }
    }
  }

  format() {
    const {
      enabled,
      worker,
      code,
      options,
      debugAst: ast,
      debugDoc: doc,
      debugComments: comments,
      reformat,
      rethrowEmbedErrors,
    } = this.props;

    if (!enabled) {
      return;
    }

    worker
      .format(code, options, {
        ast,
        doc,
        comments,
        reformat,
        rethrowEmbedErrors,
      })
      .then((result) => this.setState(result));
  }

  render() {
    return this.props.children(this.state);
  }
}
