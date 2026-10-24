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

    expect(visited).toStrictEqual([doc, doc[0], doc[0][0], doc[0][1]]);
  }

  {
    const visited = [];
    traverseDoc(doc, (doc) => {
      visited.push(doc);
      return false;
    });

    // Should skip children
    expect(visited).toStrictEqual([doc]);
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
    expect(visited).toStrictEqual([doc, doc[0], doc[0][0], doc[0][1]]);
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
    expect(visited).toStrictEqual([doc, doc[0], doc[0][0]]);
  }
});

test("skip strings in enter and exit callbacks", () => {
  const doc = ["a", ["", "b"]];
  const entered = [];
  const exited = [];

  traverseDoc(
    doc,
    (doc) => {
      entered.push(doc);
    },
    (doc) => {
      exited.push(doc);
    },
    /* shouldTraverseConditionalGroups */ false,
    /* skipStrings */ true,
  );

  expect(entered).toStrictEqual([doc, doc[1]]);
  expect(exited).toStrictEqual([doc[1], doc]);
});

test("Invalid doc", () => {
  expect(() => {
    traverseDoc({ type: "invalid-type" }, () => {});
  }).toThrow(InvalidDocError);
});
