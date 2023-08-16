import { getDescendants } from "../../src/utils/ast-utils.js";

const tree = {
  id: "tree",
  list: [
    { id: "tree.list.1", leaf: { id: "tree.list.1.leaf" } },
    { id: "tree.list.2", list: [{ id: "tree.list.2.list.1" }], leaf: null },
    "not-an-object",
  ],
  leaf: { id: "tree.leaf" },
};
const getVisitorKeys = () => ["list", "leaf"];

test("Breadth-first", () => {
  expect([...getDescendants(tree, { getVisitorKeys })].map((node) => node.id))
    .toMatchInlineSnapshot(`
      [
        "tree.list.1",
        "tree.list.2",
        "tree.leaf",
        "tree.list.1.leaf",
        "tree.list.2.list.1",
      ]
    `);
});

test("options.filter", () => {
  expect(
    [
      ...getDescendants(tree, {
        getVisitorKeys,
        filter: (node) => node.id.includes("2"),
      }),
    ].map((node) => node.id),
  ).toMatchInlineSnapshot(`
    [
      "tree.list.2",
      "tree.list.2.list.1",
    ]
  `);
});
