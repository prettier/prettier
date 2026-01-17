import {
  findInDoc,
  InvalidDocError,
  traverseDoc,
} from "../../src/document/index.js";

test("traverse", () => {
  const doc = [["a", "b"]];

  {
    const visited = [];
    traverseDoc(doc, (doc) => {
      visited.push(doc);
    });

    expect(visited).toEqual([doc, doc[0], doc[0][0], doc[0][1]]);
  }

  {
    const visited = [];
    traverseDoc(doc, (doc) => {
      visited.push(doc);
      return false;
    });

    // Should skip children
    expect(visited).toEqual([doc]);
  }

  {
    const visited = [];
    traverseDoc(doc, (doc) => {
      visited.push(doc);
      if (doc === "a") {
        return false;
      }
    });

    // Still visiting siblings
    expect(visited).toEqual([doc, doc[0], doc[0][0], doc[0][1]]);
  }

  {
    const visited = [];
    findInDoc(doc, (doc) => {
      visited.push(doc);
      if (doc === "a") {
        return true;
      }
    });

    // Should stop visiting siblings when found
    expect(visited).toEqual([doc, doc[0], doc[0][0]]);
  }
});

test("Invalid doc", () => {
  expect(() => {
    traverseDoc({ type: "invalid-type" }, () => {});
  }).toThrow(InvalidDocError);
});
