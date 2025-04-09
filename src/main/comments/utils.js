function describeNodeForDebugging(node) {
  const nodeType = node.type || node.kind || "(unknown type)";
  let nodeName = String(
    node.name ||
      (node.id && (typeof node.id === "object" ? node.id.name : node.id)) ||
      (node.key && (typeof node.key === "object" ? node.key.name : node.key)) ||
      (node.value &&
        (typeof node.value === "object" ? "" : String(node.value))) ||
      node.operator ||
      "",
  );
  if (nodeName.length > 20) {
    nodeName = nodeName.slice(0, 19) + "…";
  }
  return nodeType + (nodeName ? " " + nodeName : "");
}

function addCommentHelper(node, comment) {
  const comments = (node.comments ??= []);
  comments.push(comment);
  comment.printed = false;
  comment.nodeDescription = describeNodeForDebugging(node);
}

function addLeadingComment(node, comment) {
  comment.leading = true;
  comment.trailing = false;
  addCommentHelper(node, comment);
}

function addDanglingComment(node, comment, marker) {
  comment.leading = false;
  comment.trailing = false;
  if (marker) {
    comment.marker = marker;
  }
  addCommentHelper(node, comment);
}

function addTrailingComment(node, comment) {
  comment.leading = false;
  comment.trailing = true;
  addCommentHelper(node, comment);
}

export { addDanglingComment, addLeadingComment, addTrailingComment };
