function isForXStatementInitializer({ key, parent }) {
  return (
    (key === "init" && parent.type === "ForStatement") ||
    (key === "left" &&
      (parent.type === "ForInStatement" || parent.type === "ForOfStatement"))
  );
}

export { isForXStatementInitializer };
