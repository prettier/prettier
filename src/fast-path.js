var assert = require("assert");
var types = require("ast-types");
var util = require("./util");
var n = types.namedTypes;
var Node = n.Node;
var isArray = types.builtInTypes.array;
var isNumber = types.builtInTypes.number;

function FastPath(value) {
  assert.ok(this instanceof FastPath);
  this.stack = [value];
}

var FPp = FastPath.prototype;

// Static convenience function for coercing a value to a FastPath.
FastPath.from = function(obj) {
  if (obj instanceof FastPath) {
    // Return a defensive copy of any existing FastPath instances.
    return obj.copy();
  }

  if (obj instanceof types.NodePath) {
    // For backwards compatibility, unroll NodePath instances into
    // lightweight FastPath [..., name, value] stacks.
    var copy = Object.create(FastPath.prototype);
    var stack = [obj.value];
    for (var pp; pp = obj.parentPath; obj = pp)
      stack.push(obj.name, pp.value);
    copy.stack = stack.reverse();
    return copy;
  }

  // Otherwise use obj as the value of the new FastPath instance.
  return new FastPath(obj);
};

FPp.copy = function copy() {
  var copy = Object.create(FastPath.prototype);
  copy.stack = this.stack.slice(0);
  return copy;
};

// The name of the current property is always the penultimate element of
// this.stack, and always a String.
FPp.getName = function getName() {
  var s = this.stack;
  var len = s.length;
  if (len > 1) {
    return s[len - 2];
  }
  // Since the name is always a string, null is a safe sentinel value to
  // return if we do not know the name of the (root) value.
  return null;
};

// The value of the current property is always the final element of
// this.stack.
FPp.getValue = function getValue() {
  var s = this.stack;
  return s[s.length - 1];
};

function getNodeHelper(path, count) {
  var s = path.stack;

  for (var i = s.length - 1; i >= 0; i -= 2) {
    var value = s[i];
    if (n.Node.check(value) && --count < 0) {
      return value;
    }
  }

  return null;
}

FPp.getNode = function getNode(count) {
  return getNodeHelper(this, ~~count);
};

FPp.getParentNode = function getParentNode(count) {
  return getNodeHelper(this, ~~count + 1);
};

FPp.isLast = function isLast() {
  var s = this.stack;
  if (this.getParentNode()) {
    var idx = s[s.length - 2];
    // The name of this node should be an index
    assert.ok(typeof idx === "number");

    const arr = s[s.length - 3];
    // We should have an array as a parent node
    assert.ok(Array.isArray(arr));

    return idx === arr.length - 1;
  }
  return false;
};

// Temporarily push properties named by string arguments given after the
// callback function onto this.stack, then call the callback with a
// reference to this (modified) FastPath object. Note that the stack will
// be restored to its original state after the callback is finished, so it
// is probably a mistake to retain a reference to the path.
FPp.call = function call(callback /*, name1, name2, ... */) {
  var s = this.stack;
  var origLen = s.length;
  var value = s[origLen - 1];
  var argc = arguments.length;
  for (var i = 1; i < argc; ++i) {
    var name = arguments[i];
    value = value[name];
    s.push(name, value);
  }
  var result = callback(this);
  s.length = origLen;
  return result;
};

// Similar to FastPath.prototype.call, except that the value obtained by
// accessing this.getValue()[name1][name2]... should be array-like. The
// callback will be called with a reference to this path object for each
// element of the array.
FPp.each = function each(callback /*, name1, name2, ... */) {
  var s = this.stack;
  var origLen = s.length;
  var value = s[origLen - 1];
  var argc = arguments.length;

  for (var i = 1; i < argc; ++i) {
    var name = arguments[i];
    value = value[name];
    s.push(name, value);
  }

  for (var i = 0; i < value.length; ++i) {
    if (i in value) {
      s.push(i, value[i]);
      // If the callback needs to know the value of i, call
      // path.getName(), assuming path is the parameter name.
      callback(this);
      s.length -= 2;
    }
  }

  s.length = origLen;
};

// Similar to FastPath.prototype.each, except that the results of the
// callback function invocations are stored in an array and returned at
// the end of the iteration.
FPp.map = function map(callback /*, name1, name2, ... */) {
  var s = this.stack;
  var origLen = s.length;
  var value = s[origLen - 1];
  var argc = arguments.length;

  for (var i = 1; i < argc; ++i) {
    var name = arguments[i];
    value = value[name];
    s.push(name, value);
  }

  var result = new Array(value.length);

  for (var i = 0; i < value.length; ++i) {
    if (i in value) {
      s.push(i, value[i]);
      result[i] = callback(this, i);
      s.length -= 2;
    }
  }

  s.length = origLen;

  return result;
};

// Inspired by require("ast-types").NodePath.prototype.needsParens, but
// more efficient because we're iterating backwards through a stack.
FPp.needsParens = function(assumeExpressionContext) {
  var parent = this.getParentNode();
  if (!parent) {
    return false;
  }

  var name = this.getName();
  var node = this.getNode();

  // If the value of this path is some child of a Node and not a Node
  // itself, then it doesn't need parentheses. Only Node objects (in
  // fact, only Expression nodes) need parentheses.
  if (this.getValue() !== node) {
    return false;
  }

  // Only statements don't need parentheses.
  if (n.Statement.check(node)) {
    return false;
  }

  // Identifiers never need parentheses.
  if (node.type === "Identifier") {
    return false;
  }

  if (parent.type === "ParenthesizedExpression") {
    return false;
  }

  // Add parens around the extends clause of a class. It is needed for almost
  // all expressions.
  if (
    (parent.type === "ClassDeclaration" || parent.type === "ClassExpression") &&
    parent.superClass === node &&
    (node.type === "ArrowFunctionExpression" ||
      node.type === "AssignmentExpression" ||
      node.type === "AwaitExpression" ||
      node.type === "BinaryExpression" ||
      node.type === "ConditionalExpression" ||
      node.type === "LogicalExpression" ||
      node.type === "NewExpression" ||
      node.type === "ObjectExpression" ||
      node.type === "ParenthesizedExpression" ||
      node.type === "SequenceExpression" ||
      node.type === "TaggedTemplateExpression" ||
      node.type === "UnaryExpression" ||
      node.type === "UpdateExpression" ||
      node.type === "YieldExpression")
  ) {
    return true;
  }

  // The left-hand side of the ** exponentiation operator must always
  // be parenthesized unless it's an ident or literal
  if (
    parent.type === "BinaryExpression" &&
    parent.operator === "**" &&
    parent.left === node &&
    node.type !== "Identifier" &&
    node.type !== "Literal" &&
    node.type !== "NumericLiteral"
  ) {
    return true;
  }

  switch (node.type) {
    case "SpreadElement":
    case "SpreadProperty":
      return parent.type === "MemberExpression" &&
        name === "object" &&
        parent.object === node;

    case "UpdateExpression":
      switch (parent.type) {
        case "MemberExpression":
          return name === "object" && parent.object === node;

        case "TaggedTemplateExpression":
        case "CallExpression":
        case "NewExpression":
          return true;

        case "UnaryExpression":
          if (
            node.prefix &&
            (node.operator === "++" && parent.operator === "+" ||
              node.operator === "--" && parent.operator === "-")
          ) {
            return true;
          }

          return false;
      }

    case "UnaryExpression":
      switch (parent.type) {
        case "UnaryExpression":
          return node.operator === parent.operator &&
            (node.operator === "+" || node.operator === "-");

        case "MemberExpression":
          return name === "object" && parent.object === node;
      }

    case "BinaryExpression":
      if (
        node.operator === "in" &&
        parent.type === "ForStatement" &&
        parent.init === node
      ) {
        return true;
      }

      if (node.operator === "in" && parent.type === "AssignmentExpression") {
        return true;
      }

    case "LogicalExpression":
      switch (parent.type) {
        case "CallExpression":
        case "NewExpression":
          return name === "callee" && parent.callee === node;

        case "TaggedTemplateExpression":
        case "UnaryExpression":
        case "SpreadElement":
        case "SpreadProperty":
          return true;

        case "MemberExpression":
          return name === "object" && parent.object === node;

        case "BinaryExpression":
        case "LogicalExpression":
          var po = parent.operator;
          var pp = util.getPrecedence(po);
          var no = node.operator;
          var np = util.getPrecedence(no);

          if (pp > np) {
            return true;
          }

          if (pp === np && name === "right") {
            assert.strictEqual(parent.right, node);
            return true;
          }

        default:
          return false;
      }

    case "SequenceExpression":
      switch (parent.type) {
        case "ReturnStatement":
          return false;

        case "ForStatement":
          // Although parentheses wouldn't hurt around sequence
          // expressions in the head of for loops, traditional style
          // dictates that e.g. i++, j++ should not be wrapped with
          // parentheses.
          return false;

        case "ExpressionStatement":
          return name !== "expression";

        default:
          // Otherwise err on the side of overparenthesization, adding
          // explicit exceptions above if this proves overzealous.
          return true;
      }

    case "YieldExpression":
    case "AwaitExpression":
      switch (parent.type) {
        case "TaggedTemplateExpression":
        case "BinaryExpression":
        case "LogicalExpression":
        case "UnaryExpression":
        case "SpreadElement":
        case "SpreadProperty":
        case "NewExpression":
        case "MemberExpression":
          return true;

        case "CallExpression":
          return parent.callee === node;

        case "ConditionalExpression":
          return parent.test === node;

        default:
          return false;
      }

    case "ArrayTypeAnnotation":
      return parent.type === "NullableTypeAnnotation";

    case "IntersectionTypeAnnotation":
    case "UnionTypeAnnotation":
      return parent.type === "NullableTypeAnnotation" ||
        parent.type === "IntersectionTypeAnnotation" ||
        parent.type === "UnionTypeAnnotation";

    case "NullableTypeAnnotation":
      return parent.type === "ArrayTypeAnnotation";

    case "FunctionTypeAnnotation":
      return parent.type === "UnionTypeAnnotation" ||
        parent.type === "IntersectionTypeAnnotation";

    case "NumericLiteral":
    case "Literal":
      return parent.type === "MemberExpression" &&
        isNumber.check(node.value) &&
        name === "object" &&
        parent.object === node;

    case "AssignmentExpression":
      if (
        parent.type === "ArrowFunctionExpression" &&
        parent.body === node &&
        node.left.type === "ObjectPattern"
      ) {
        return true;
      }

    case "ConditionalExpression":
      switch (parent.type) {
        case "TaggedTemplateExpression":
        case "UnaryExpression":
        case "SpreadElement":
        case "SpreadProperty":
        case "BinaryExpression":
        case "LogicalExpression":
        case "LogicalExpression":
        case "NewExpression":
        case "ExportDefaultDeclaration":
          return true;

        case "CallExpression":
          return name === "callee" && parent.callee === node;

        case "ConditionalExpression":
          return name === "test" && parent.test === node;

        case "MemberExpression":
          return name === "object" && parent.object === node;

        default:
          return n.ObjectPattern.check(node.left) && this.firstInStatement();
      }

    case "FunctionExpression":
    case "ArrowFunctionExpression":
      if (parent.type === "CallExpression" && name === "callee") {
        return true;
      }

      switch (parent.type) {
        case "ConditionalExpression":
          if (parent.test === node) {
            return true;
          }

        case "ExportDefaultDeclaration":
          return node.type !== "ArrowFunctionExpression";

        case "ExpressionStatement":
        case "MemberExpression":
        case "TaggedTemplateExpression":
        case "UnaryExpression":
          return true;

        case "NewExpression":
          return name === "callee";

        case "LogicalExpression":
          return node.type === "ArrowFunctionExpression";

        default:
          return isBinary(parent);
      }

    case "ClassExpression":
      switch (parent.type) {
        case "TaggedTemplateExpression":
        case "BinaryExpression":
        case "ExportDefaultDeclaration":
        case "ExpressionStatement":
          return true;
        case "CallExpression":
          if (parent.callee === node) {
            return true;
          }
        case "MemberExpression":
          return name === "object" && parent.object === node;
        case "ConditionalExpression":
          if (parent.test === node) {
            return true;
          }
      }

      return false;

    case "ObjectExpression":
      if (parent.type === "ArrowFunctionExpression" && name === "body") {
        return true;
      }
      if (parent.type === "TaggedTemplateExpression") {
        return true;
      }
      if (parent.type === "MemberExpression") {
        return name === "object" && parent.object === node;
      }

    case "StringLiteral":
      if (parent.type === "ExpressionStatement") {
        return true;
      }

    default:
      if (
        parent.type === "NewExpression" &&
        name === "callee" &&
        parent.callee === node
      ) {
        return containsCallExpression(node);
      }
  }

  if (
    assumeExpressionContext !== true &&
    !this.canBeFirstInStatement() &&
    this.firstInStatement()
  )
    return true;

  return false;
};

function isBinary(node) {
  return n.BinaryExpression.check(node) || n.LogicalExpression.check(node);
}

function containsCallExpression(node) {
  if (n.CallExpression.check(node)) {
    return true;
  }

  if (isArray.check(node)) {
    return node.some(containsCallExpression);
  }

  if (n.Node.check(node)) {
    return types.someField(node, function(name, child) {
      return containsCallExpression(child);
    });
  }

  return false;
}

FPp.canBeFirstInStatement = function() {
  var node = this.getNode();
  return !n.FunctionExpression.check(node) &&
    !n.ObjectExpression.check(node) &&
    !n.ClassExpression.check(node) &&
    !(n.AssignmentExpression.check(node) && n.ObjectPattern.check(node.left));
};

FPp.firstInStatement = function() {
  var s = this.stack;
  var parentName, parent;
  var childName, child;

  for (var i = s.length - 1; i >= 0; i -= 2) {
    if (n.Node.check(s[i])) {
      childName = parentName;
      child = parent;
      parentName = s[i - 1];
      parent = s[i];
    }

    if (!parent || !child) {
      continue;
    }

    if (
      n.BlockStatement.check(parent) && parentName === "body" && childName === 0
    ) {
      assert.strictEqual(parent.body[0], child);
      return true;
    }

    if (n.ExpressionStatement.check(parent) && childName === "expression") {
      assert.strictEqual(parent.expression, child);
      return true;
    }

    if (
      n.SequenceExpression.check(parent) &&
      parentName === "expressions" &&
      childName === 0
    ) {
      assert.strictEqual(parent.expressions[0], child);
      continue;
    }

    if (n.CallExpression.check(parent) && childName === "callee") {
      assert.strictEqual(parent.callee, child);
      continue;
    }

    if (n.MemberExpression.check(parent) && childName === "object") {
      assert.strictEqual(parent.object, child);
      continue;
    }

    if (n.ConditionalExpression.check(parent) && childName === "test") {
      assert.strictEqual(parent.test, child);
      continue;
    }

    if (isBinary(parent) && childName === "left") {
      assert.strictEqual(parent.left, child);
      continue;
    }

    if (
      n.UnaryExpression.check(parent) &&
      !parent.prefix &&
      childName === "argument"
    ) {
      assert.strictEqual(parent.argument, child);
      continue;
    }

    return false;
  }

  return true;
};

module.exports = FastPath;
