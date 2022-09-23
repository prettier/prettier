class UnexpectedNodeError extends Error {
  name = "UnexpectedNodeError";

  constructor(node, language, typeProperty = "type") {
    super(
      `Unexpected ${language} node ${typeProperty}: ${JSON.stringify(
        node[typeProperty]
      )}.`
    );
    this.node = node;
  }
}

export default UnexpectedNodeError;
