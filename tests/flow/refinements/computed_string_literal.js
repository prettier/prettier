// @flow

type A = {
  b_c: ?string
};

type B = { "@type": "A", a: string } | { "@type": "B", b: string };

function stuff(str: string) {}

function testProperty(a: A) {
  if (a.b_c) {
    stuff(a.b_c);
  }
}

function testLiteralProperty(a: A, b: B) {
  if (a["b_c"]) {
    stuff(a["b_c"]);
  }

  if (b["@type"] === "A") {
    (b.a: string); // ok
    stuff(b.a);
  } else {
    (b.b: string); // ok
    stuff(b.b);
  }
}

function testSwitchLiteralProperty(b: B) {
  switch (b["@type"]) {
    case "A":
      return b.a;
    case "B":
      return b.b;
    default:
      (b["@type"]: empty);
  }
}
