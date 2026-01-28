function isPrettierIgnoreComment(comment) {
  return comment.value.trim() === "prettier-ignore" && !comment.unignore;
}

export { isPrettierIgnoreComment };
