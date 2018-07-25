"use strict";

function isPragma(text) {
  return /^\s*@(prettier|format)\s*$/.test(text);
}

function hasPragma(text) {
  return /^\s*#[^\n\S]*@(prettier|format)\s*?(\n|$)/.test(text);
}

function insertPragma(text) {
  return `# @format\n\n${text}`;
}

module.exports = {
  isPragma,
  hasPragma,
  insertPragma
};
