// "ArrowFunctionExpression"
class a extends (() => {}) {}

// "AssignmentExpression"
class a extends (b = c) {}

// "AwaitExpression"
async function f() {
  class a extends (await b) {}
}

// "BinaryExpression"
class a extends (b + c) {}

// "CallExpression"
class a extends b() {}

// "ClassExpression"
class a extends class {} {}

// "ConditionalExpression"
class a extends (b ? c : d) {}

// "FunctionExpression"
class a extends (function() {}) {}

// "LogicalExpression"
class a extends (b || c) {}

// "MemberExpression"
class a extends b.c {}

// "NewExpression"
class a extends (new B()) {}

// "ObjectExpression"
class a extends ({}) {}

// "SequenceExpression"
class a extends (b, c) {}

// "TaggedTemplateExpression"
class a extends `` {}

// "UnaryExpression"
class a extends (void b) {}

// "UpdateExpression"
class a extends (++b) {}

// "YieldExpression"
function* f() {
  // Flow has a bug parsing it.
  // class a extends (yield 1) {}
}

x = class extends (++b) {}
