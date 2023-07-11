import * as prettier from "../../../../src/index.js";
import { expectType } from "ts-expect";

type NestedAst = Nested1 | Nested2 | Nested3;
interface Nested1 {
  kind: "1";
  item2: Nested2;
  list2: Nested2[];
  list4?: Nested2[];
}
interface Nested2 {
  kind: "2";
  item3: Nested3;
  list3: Nested3[];
}
interface Nested3 {
  kind: "3";
  item1: Nested1;
  list1: Nested1[];
}

function print(
  // Using Nested1 because we're assuming you've already determined the kind
  // of node based on some discriminated union. If you're determining the kind
  // of node within the same place that you need access to the path, it's
  // easiest to do something the to effect of:
  //
  //     if (node.kind === "1") {
  //       const nodePath = path as AstPath<typeof node>;
  //     }
  //
  // In the example above, nodePath will then be a type-narrowed version of
  // the path variable that you can then use to correctly type the tree-walk
  // functions.
  path: prettier.AstPath<Nested1>,
  options: prettier.ParserOptions<NestedAst>,
  print: (path: prettier.AstPath<NestedAst>) => prettier.doc.builders.Doc,
): prettier.doc.builders.Doc {
  path.call((child) => {
    expectType<prettier.AstPath<Nested1>>(child);
  });

  path.call((child) => {
    expectType<prettier.AstPath<Nested2>>(child);
  }, "item2");

  path.call(
    (child) => {
      expectType<prettier.AstPath<Nested3>>(child);
    },
    "item2",
    "item3",
  );

  path.call(
    (child) => {
      expectType<prettier.AstPath<Nested1>>(child);
    },
    "item2",
    "item3",
    "item1",
  );

  path.call(
    (child) => {
      expectType<prettier.AstPath<Nested2>>(child);
    },
    "item2",
    "item3",
    "item1",
    "item2",
  );

  path.call(
    (child) => {
      expectType<prettier.AstPath<any>>(child);
    },
    "item2",
    "item3",
    "item1",
    "item2",
    "item3",
  );

  path.each((child) => {
    expectType<prettier.AstPath<Nested2>>(child);
  }, "list2");

  path.each((child) => {
    expectType<prettier.AstPath<Nested2>>(child);
  }, "list4");

  path.each(
    (child) => {
      expectType<prettier.AstPath<Nested3>>(child);
    },
    "list2",
    0,
    "list3",
  );

  path.each(
    (child) => {
      expectType<prettier.AstPath<any>>(child);
    },
    "list2",
    0,
    "list3",
    0,
    "list1",
  );

  path.map((child) => {
    expectType<prettier.AstPath<Nested2>>(child);
  }, "list2");

  path.map((child) => {
    expectType<prettier.AstPath<Nested2>>(child);
  }, "list4");

  path.map(
    (child) => {
      expectType<prettier.AstPath<Nested3>>(child);
    },
    "list2",
    0,
    "list3",
  );

  path.map(
    (child) => {
      expectType<prettier.AstPath<any>>(child);
    },
    "list2",
    0,
    "list3",
    0,
    "list1",
  );

  // @ts-expect-error
  path.call(print, "list2");
  // @ts-expect-error
  path.call(print, "list4");
  // @ts-expect-error
  path.call(print, "item2", "list3");

  // @ts-expect-error
  path.each(print, "item2");
  // @ts-expect-error
  path.each(print, "item2", "item3");

  // @ts-expect-error
  path.map(print, "item2");
  // @ts-expect-error
  path.map(print, "item2", "item3");

  return "";
}
