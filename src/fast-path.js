"use strict";

var assert = require("assert");
var types = require("./ast-types")
var util = require("./util");
var n = types.namedTypes;
var isArray = types.builtInTypes.array;
var isNumber = types.builtInTypes.number;
var startsWithNoLookaheadToken = util.startsWithNoLookaheadToken;

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
    for (var pp; (pp = obj.parentPath); obj = pp)
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

    if ((n.Node.check(value)) && --count < 0) {
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
FPp.needsParens = function() {
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

  if (
    (parent.type === "ArrowFunctionExpression" &&
      parent.body === node &&
      startsWithNoLookaheadToken(node, /* forbidFunctionAndClass */ false)) ||
    (parent.type === "ExpressionStatement" &&
      startsWithNoLookaheadToken(node, /* forbidFunctionAndClass */ true))
  ) {
    return true;
  }

  switch (node.type) {
    case "CallExpression":
      if (parent.type === "NewExpression" && parent.callee === node) {
        return true;
      }
      return false;

    case "SpreadElement":
    case "SpreadProperty":
      return (
        parent.type === "MemberExpression" &&
        name === "object" &&
        parent.object === node
      );

    case "UpdateExpression":
      if (parent.type === "UnaryExpression") {
        return (
          node.prefix &&
          ((node.operator === "++" && parent.operator === "+") ||
            (node.operator === "--" && parent.operator === "-"))
        );
      }
    // else fall through
    case "UnaryExpression":
      switch (parent.type) {
        case "UnaryExpression":
          return (
            node.operator === parent.operator &&
            (node.operator === "+" || node.operator === "-")
          );

        case "MemberExpression":
          return name === "object" && parent.object === node;

        case "TaggedTemplateExpression":
          return true;

        case "NewExpression":
        case "CallExpression":
          return name === "callee" && parent.callee === node;

        case "BinaryExpression":
          return parent.operator === "**" && name === "left";

        default:
          return false;
      }

    case "BinaryExpression":
      const isLeftOfAForStatement = node => {
        let i = 0;
        while (node) {
          let parent = this.getParentNode(i++);
          if (!parent) {
            return false;
          }
          if (parent.type === "ForStatement" && parent.init === node) {
            return true;
          }
          node = parent;
        }
        return false;
      };
      if (node.operator === "in" && isLeftOfAForStatement(node)) {
        return true;
      }
    // else fall through
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

          if (po === "||" && no === "&&") {
            return true;
          }

          if (pp > np) {
            return true;
          }

          if (no === "**" && po === "**") {
            return name === "left";
          }

          if (pp === np && name === "right") {
            assert.strictEqual(parent.right, node);
            return true;
          }

          // Add parenthesis when working with binary operators
          // It's not stricly needed but helps with code understanding
          if (["|", "^", "&", ">>", "<<", ">>>"].indexOf(po) !== -1) {
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
      if (parent.type === "UnaryExpression") {
        return true;
      }
    // else fall through
    case "AwaitExpression":
      switch (parent.type) {
        case "TaggedTemplateExpression":
        case "BinaryExpression":
        case "LogicalExpression":
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
      return (
        parent.type === "ArrayTypeAnnotation" ||
        parent.type === "NullableTypeAnnotation" ||
        parent.type === "IntersectionTypeAnnotation" ||
        parent.type === "UnionTypeAnnotation"
      );

    case "NullableTypeAnnotation":
      return parent.type === "ArrayTypeAnnotation";

    case "FunctionTypeAnnotation":
      return (
        parent.type === "UnionTypeAnnotation" ||
        parent.type === "IntersectionTypeAnnotation"
      );

    case "NumericLiteral":
    case "Literal":
      return (
        parent.type === "MemberExpression" &&
        isNumber.check(node.value) &&
        name === "object" &&
        parent.object === node
      );

    case "AssignmentExpression":
      if (parent.type === "ArrowFunctionExpression" && parent.body === node) {
        return true;
      } else if (
        parent.type === "ForStatement" &&
        (parent.init === node || parent.update === node)
      ) {
        return false;
      } else if (parent.type === "ExpressionStatement") {
        return node.left.type === "ObjectPattern";
      } else if (parent.type === "AssignmentExpression") {
        return false;
      }
      return true;

    case "ConditionalExpression":
      switch (parent.type) {
        case "TaggedTemplateExpression":
        case "UnaryExpression":
        case "SpreadElement":
        case "SpreadProperty":
        case "BinaryExpression":
        case "LogicalExpression":
        case "ExportDefaultDeclaration":
        case "AwaitExpression":
        case "JSXSpreadAttribute":
          return true;

        case "NewExpression":
        case "CallExpression":
          return name === "callee" && parent.callee === node;

        case "ConditionalExpression":
          return name === "test" && parent.test === node;

        case "MemberExpression":
          return name === "object" && parent.object === node;

        default:
          return false;
      }

    case "FunctionExpression":
      switch (parent.type) {
        case "CallExpression":
          return name === "callee"; // Not strictly necessary, but it's clearer to the reader if IIFEs are wrapped in parentheses.
        case "TaggedTemplateExpression":
          return true; // This is basically a kind of IIFE.
        case "ExportDefaultDeclaration":
          return true;
        default:
          return false;
      }

    case "ArrowFunctionExpression":
      switch (parent.type) {
        case "CallExpression":
          return name === "callee";

        case "NewExpression":
          return name === "callee";

        case "MemberExpression":
          return name === "object";

        case "BindExpression":
        case "TaggedTemplateExpression":
        case "UnaryExpression":
        case "LogicalExpression":
        case "BinaryExpression":
          return true;

        case "ConditionalExpression":
          return name === "test";

        default:
          return false;
      }

    case "ClassExpression":
      return parent.type === "ExportDefaultDeclaration";

    case "StringLiteral":
      return parent.type === "ExpressionStatement"; // To avoid becoming a directive
  }

  if (
    parent.type === "NewExpression" &&
    name === "callee" &&
    parent.callee === node
  ) {
    return containsCallExpression(node);
  }

  return false;
};

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

module.exports = FastPath;
