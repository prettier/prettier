import { traverseDoc } from "../../src/document/utils.js";

test("Should not traverse children when `onEnter` returns false", () => {
  const doc = [["a"]];

  {
    const traversed = [];
    traverseDoc(doc, (doc) => {
      traversed.push(doc);
    });

    expect(traversed).toEqual([doc, doc[0], doc[0][0]]);
  }

  {
    const traversed = [];
    traverseDoc(doc, (doc) => {
      traversed.push(doc);
      return false;
    });

    expect(traversed).toEqual([doc]);
  }
});
