const { React } = window;

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
      "debugPreprocessedAst",
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

  async format() {
    const {
      worker,
      code,
      options,
      debugAst: ast,
      debugPreprocessedAst: preprocessedAst,
      debugDoc: doc,
      debugComments: comments,
      reformat,
      rethrowEmbedErrors,
    } = this.props;

    const result = await worker.format(code, options, {
      ast,
      preprocessedAst,
      doc,
      comments,
      reformat,
      rethrowEmbedErrors,
    });

    this.setState(result);
  }

  render() {
    return this.props.children(this.state);
  }
}
