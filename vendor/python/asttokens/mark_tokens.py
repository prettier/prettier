# Copyright 2016 Grist Labs, Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import six
import numbers
import token
from . import util


# Mapping of matching braces. To find a token here, look up token[:2].
_matching_pairs_left = {
  (token.OP, '('): (token.OP, ')'),
  (token.OP, '['): (token.OP, ']'),
  (token.OP, '{'): (token.OP, '}'),
}

_matching_pairs_right = {
  (token.OP, ')'): (token.OP, '('),
  (token.OP, ']'): (token.OP, '['),
  (token.OP, '}'): (token.OP, '{'),
}


class MarkTokens(object):
  """
  Helper that visits all nodes in the AST tree and assigns .first_token and .last_token attributes
  to each of them. This is the heart of the token-marking logic.
  """
  def __init__(self, code):
    self._code = code
    self._methods = util.NodeMethods()
    self._iter_children = None

  def visit_tree(self, node):
    self._iter_children = util.iter_children_func(node)
    util.visit_tree(node, self._visit_before_children, self._visit_after_children)

  def _visit_before_children(self, node, parent_token):
    col = getattr(node, 'col_offset', None)
    token = self._code.get_token_from_utf8(node.lineno, col) if col is not None else None

    if not token and util.is_module(node):
      # We'll assume that a Module node starts at the start of the source code.
      token = self._code.get_token(1, 0)

    # Use our own token, or our parent's if we don't have one, to pass to child calls as
    # parent_token argument. The second value becomes the token argument of _visit_after_children.
    return (token or parent_token, token)

  def _visit_after_children(self, node, parent_token, token):
    # This processes the node generically first, after all children have been processed.

    # Get the first and last tokens that belong to children. Note how this doesn't assume that we
    # iterate through children in order that corresponds to occurrence in source code. This
    # assumption can fail (e.g. with return annotations).
    first = token
    last = None
    for child in self._iter_children(node):
      if not first or child.first_token.index < first.index:
        first = child.first_token
      if not last or child.last_token.index > last.index:
        last = child.last_token

    # If we don't have a first token from _visit_before_children, and there were no children, then
    # use the parent's token as the first token.
    first = first or parent_token

    # If no children, set last token to the first one.
    last = last or first

    # Statements continue to before NEWLINE. This helps cover a few different cases at once.
    if util.is_stmt(node):
      last = self._find_last_in_line(last)

    # Capture any unmatched brackets.
    first, last = self._expand_to_matching_pairs(first, last, node)

    # Give a chance to node-specific methods to adjust.
    nfirst, nlast = self._methods.get(self, node.__class__)(node, first, last)

    if (nfirst, nlast) != (first, last):
      # If anything changed, expand again to capture any unmatched brackets.
      nfirst, nlast = self._expand_to_matching_pairs(nfirst, nlast, node)

    node.first_token = nfirst
    node.last_token = nlast

  def _find_last_in_line(self, start_token):
    try:
      newline = self._code.find_token(start_token, token.NEWLINE)
    except IndexError:
      newline = self._code.find_token(start_token, token.ENDMARKER)
    return self._code.prev_token(newline)

  def _iter_non_child_tokens(self, first_token, last_token, node):
    """
    Generates all tokens in [first_token, last_token] range that do not belong to any children of
    node. E.g. `foo(bar)` has children `foo` and `bar`, but we would yield the `(`.
    """
    tok = first_token
    for n in self._iter_children(node):
      for t in self._code.token_range(tok, self._code.prev_token(n.first_token)):
        yield t
      if n.last_token.index >= last_token.index:
        return
      tok = self._code.next_token(n.last_token)

    for t in self._code.token_range(tok, last_token):
      yield t

  def _expand_to_matching_pairs(self, first_token, last_token, node):
    """
    Scan tokens in [first_token, last_token] range that are between node's children, and for any
    unmatched brackets, adjust first/last tokens to include the closing pair.
    """
    # We look for opening parens/braces among non-child tokens (i.e. tokens between our actual
    # child nodes). If we find any closing ones, we match them to the opens.
    to_match_right = []
    to_match_left = []
    for tok in self._iter_non_child_tokens(first_token, last_token, node):
      tok_info = tok[:2]
      if to_match_right and tok_info == to_match_right[-1]:
        to_match_right.pop()
      elif tok_info in _matching_pairs_left:
        to_match_right.append(_matching_pairs_left[tok_info])
      elif tok_info in _matching_pairs_right:
        to_match_left.append(_matching_pairs_right[tok_info])

    # Once done, extend `last_token` to match any unclosed parens/braces.
    for match in reversed(to_match_right):
      last = self._code.next_token(last_token)
      # Allow for a trailing comma before the closing delimiter.
      if util.match_token(last, token.OP, ','):
        last = self._code.next_token(last)
      # Now check for the actual closing delimiter.
      if util.match_token(last, *match):
        last_token = last

    # And extend `first_token` to match any unclosed opening parens/braces.
    for match in to_match_left:
      first = self._code.prev_token(first_token)
      if util.match_token(first, *match):
        first_token = first

    return (first_token, last_token)

  #----------------------------------------------------------------------
  # Node visitors. Each takes a preliminary first and last tokens, and returns the adjusted pair
  # that will actually be assigned.

  def visit_default(self, node, first_token, last_token):
    # pylint: disable=no-self-use
    # By default, we don't need to adjust the token we computed earlier.
    return (first_token, last_token)

  def handle_comp(self, open_brace, node, first_token, last_token):
    # For list/set/dict comprehensions, we only get the token of the first child, so adjust it to
    # include the opening brace (the closing brace will be matched automatically).
    before = self._code.prev_token(first_token)
    util.expect_token(before, token.OP, open_brace)
    return (before, last_token)

  def visit_listcomp(self, node, first_token, last_token):
    return self.handle_comp('[', node, first_token, last_token)

  if six.PY2:
    # We shouldn't do this on PY3 because its SetComp/DictComp already have a correct start.
    def visit_setcomp(self, node, first_token, last_token):
      return self.handle_comp('{', node, first_token, last_token)

    def visit_dictcomp(self, node, first_token, last_token):
      return self.handle_comp('{', node, first_token, last_token)

  def visit_comprehension(self, node, first_token, last_token):
    # The 'comprehension' node starts with 'for' but we only get first child; we search backwards
    # to find the 'for' keyword.
    first = self._code.find_token(first_token, token.NAME, 'for', reverse=True)
    return (first, last_token)

  def handle_attr(self, node, first_token, last_token):
    # Attribute node has ".attr" (2 tokens) after the last child.
    dot = self._code.find_token(last_token, token.OP, '.')
    name = self._code.next_token(dot)
    util.expect_token(name, token.NAME)
    return (first_token, name)

  visit_attribute = handle_attr
  visit_assignattr = handle_attr
  visit_delattr = handle_attr

  def handle_doc(self, node, first_token, last_token):
    # With astroid, nodes that start with a doc-string can have an empty body, in which case we
    # need to adjust the last token to include the doc string.
    if not node.body and getattr(node, 'doc', None):
      last_token = self._code.find_token(last_token, token.STRING)
    return (first_token, last_token)

  visit_classdef = handle_doc
  visit_funcdef = handle_doc

  def visit_call(self, node, first_token, last_token):
    # A function call isn't over until we see a closing paren. Remember that last_token is at the
    # end of all children, so we are not worried about encountering a paren that belongs to a
    # child.
    return (first_token, self._code.find_token(last_token, token.OP, ')'))

  def visit_subscript(self, node, first_token, last_token):
    # A subscript operations isn't over until we see a closing bracket. Similar to function calls.
    return (first_token, self._code.find_token(last_token, token.OP, ']'))

  def visit_tuple(self, node, first_token, last_token):
    # A tuple doesn't include parens; if there is a trailing comma, make it part of the tuple.
    try:
      maybe_comma = self._code.next_token(last_token)
      if util.match_token(maybe_comma, token.OP, ','):
        last_token = maybe_comma
    except IndexError:
      pass
    return (first_token, last_token)

  def visit_str(self, node, first_token, last_token):
    # Multiple adjacent STRING tokens form a single string.
    last = self._code.next_token(last_token)
    while util.match_token(last, token.STRING):
      last_token = last
      last = self._code.next_token(last_token)
    return (first_token, last_token)

  def visit_num(self, node, first_token, last_token):
    # A constant like '-1' gets turned into two tokens; this will skip the '-'.
    while util.match_token(last_token, token.OP):
      last_token = self._code.next_token(last_token)
    return (first_token, last_token)

  # In Astroid, the Num and Str nodes are replaced by Const.
  def visit_const(self, node, first_token, last_token):
    if isinstance(node.value, numbers.Number):
      return self.visit_num(node, first_token, last_token)
    elif isinstance(node.value, six.string_types):
      return self.visit_str(node, first_token, last_token)
    return (first_token, last_token)

  def visit_keyword(self, node, first_token, last_token):
    if node.arg is not None:
      equals = self._code.find_token(first_token, token.OP, '=', reverse=True)
      name = self._code.prev_token(equals)
      util.expect_token(name, token.NAME, node.arg)
      first_token = name
    return (first_token, last_token)

  def visit_starred(self, node, first_token, last_token):
    # Astroid has 'Starred' nodes (for "foo(*bar)" type args), but they need to be adjusted.
    if not util.match_token(first_token, token.OP, '*'):
      star = self._code.prev_token(first_token)
      if util.match_token(star, token.OP, '*'):
        first_token = star
    return (first_token, last_token)

  def visit_assignname(self, node, first_token, last_token):
    # Astroid may turn 'except' clause into AssignName, but we need to adjust it.
    if util.match_token(first_token, token.NAME, 'except'):
      colon = self._code.find_token(last_token, token.OP, ':')
      first_token = last_token = self._code.prev_token(colon)
    return (first_token, last_token)
