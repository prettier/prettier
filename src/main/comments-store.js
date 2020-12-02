"use strict";

const {
  addLeadingComment,
  addDanglingComment,
  addTrailingComment,
} = require("../common/util");

class CommentsStore {
  constructor() {
    this.map = new WeakMap();
  }
  addComment(node, comment, type) {
    if (!this.map.has(node)) {
      this.map.set(node, {
        leading: [],
        trailing: [],
        dangling: [],
        ignore: [],
        all: [],
      });
    }
    const comments = this.map.get(node);
    comments[type].push(comment);
    // TODO: remove this
    if (type === "leading") {
      addLeadingComment(node, comment);
    } else if (type === "trailing") {
      addTrailingComment(node, comment);
    } else if (type === "dangling") {
      addDanglingComment(node, comment);
    }
    comments.all.push(comment);
  }
  addLeadingComment(node, comment) {
    return this.addComment(node, comment, "leading");
  }
  addTrailingComment(node, comment) {
    return this.addComment(node, comment, "trailing");
  }
  addDanglingComment(node, comment) {
    return this.addComment(node, comment, "dangling");
  }
  get(node, type = "all") {
    if (!this.map.has(node)) {
      return [];
    }
    const comments = this.map.get(node);
    return comments[type];
  }
}

module.exports = CommentsStore;
