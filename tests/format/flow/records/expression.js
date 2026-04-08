const empty = R {};

const basic = R {a: 1, b: 2};

const keysString = R {"one-key": 1, "another-key": 2};

const keysNumber = R {1: "one", 2: "two", 3: "three"};

const shorthand = R {a, b, c: 3};

const spread = R {...x, b: 2};

const typeArgsEmpty = R<> {a: 1};

const typeArgs = R<T, S> {a: 1};

function contextFunc() {
  return R {a: 1, b: 2};
}

const contextCall = foo(R {c: 3});

const contextArr = [R {d: 4}, R {e: 5}];

const contextObj = {nested: R {f: 6}};

class C extends not_parsed_as_a_record_expression {}

const memberIdent = Foo.Bart {a: 1};

const memberStr = Foo["one-two"] {a: 1};

const memberNum = Foo[0] {a: 1};
