"use strict";

const traverse = require("../../../src/utils/traverse");

test("Should not clone object", () => {
  const object = {};
  const result = traverse(object, (node) => {
    node.test = 1;
  });
  expect(result).toBe(object);
  expect(object.test).toBe(1);
});

test("array", () => {
  const object = {
    a: [{ v: 0 }, { v: 1 }, null, undefined, false, "string"],
  };
  const result = traverse(object, (node) => {
    if (node.v === 0) {
      return null;
    }
  });
  expect(result.a).toBe(object.a);
  expect(object.a).toEqual([{ v: 1 }, null, undefined, false, "string"]);
});

test("Should remove node", () => {
  expect(
    traverse({ a: { b: { remove: true } } }, (node) =>
      node.remove ? null : node
    )
  ).toEqual({ a: {} });
});

test("Should not traverse objects except array and object", () => {
  const result = [];
  const object = {
    a: 0,
    b: undefined,
    c: null,
    // eslint-disable-next-line unicorn/new-for-builtins
    d: new String(""),
    e: new Map(),
    f: new Set(),
    g: Buffer.alloc(0),
    h: Object.create(null),
    i: Promise.resolve(),
    j: () => {},
    k() {},
  };
  traverse(object, (node) => {
    if (node !== object) {
      result.push(node);
    }
  });
  expect(
    result.map((object) => Object.prototype.toString.call(object).slice(8, -1))
  ).toEqual(["String", "Map", "Set", "Uint8Array", "Object", "Promise"]);
});

test("Should work for simple circular reference", () => {
  const root = { type: "root" };
  const prev = { type: "prev" };
  const next = { type: "next" };
  const child = { type: "child" };
  child.prev = prev;
  child.next = next;
  child.parent = root;
  root.children = [prev, child, next];
  const result = traverse(root, (node) => {
    // Replace prev
    if (node === prev) {
      return { type: "replaced-prev" };
    }
    // Remove next
    if (node === next) {
      return null;
    }
  });
  expect(result.children.length).toBe(2);
  expect(child.prev).not.toEqual(prev);
  expect(child.prev.type).toEqual("replaced-prev");
  expect(child.next).toEqual(undefined);
});

test("Root can be replaced", () => {
  const object = { root: true };
  const result = traverse(object, (node) => {
    if (node.root) {
      return {};
    }
  });
  expect(result).not.toBe(object);
});

test("Should traverse new object and array", () => {
  const object = { children: { type: "object-child" } };
  const result = traverse(object, (node) => {
    if (node.type === "object-child") {
      return [{ type: "child-in-array" }];
    }
    if (node.type === "child-in-array") {
      node.visited = true;
    }
  });
  expect(result.children).toEqual([{ type: "child-in-array", visited: true }]);
});
