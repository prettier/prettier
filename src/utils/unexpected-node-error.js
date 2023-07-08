class UnexpectedNodeError extends Error {
  name = "UnexpectedNodeError";

  constructor(
    /** @type {any} */ node,
    /** @type {string} */ language,
    typeProperty = "type",
  ) {
    super(
      `Unexpected ${language} node ${typeProperty}: ${JSON.stringify(
        node[typeProperty],
      )}.`,
    );
    this.node = node;
  }
}

export default UnexpectedNodeError;
