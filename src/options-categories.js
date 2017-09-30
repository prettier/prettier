"use strict";

const categories = {
  CONFIG: "Config",
  EDITOR: "Editor",
  FORMAT: "Format",
  OTHER: "Other",
  OUTPUT: "Output"
};

const categoryOrder = [
  categories.OUTPUT,
  categories.FORMAT,
  categories.CONFIG,
  categories.EDITOR,
  categories.OTHER
];

module.exports = {
  categories,
  categoryOrder
};
