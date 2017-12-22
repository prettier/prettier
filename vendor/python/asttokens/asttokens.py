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

import ast
import bisect
import token
import tokenize
import io
import six
from six.moves import xrange      # pylint: disable=redefined-builtin
from .line_numbers import LineNumbers
from .util import Token, match_token
from .mark_tokens import MarkTokens

class ASTTokens(object):
  """
  ASTTokens maintains the text of Python code in several forms: as a string, as line numbers, and
  as tokens, and is used to mark and access token and position information.

  ``source_text`` must be a unicode or UTF8-encoded string. If you pass in UTF8 bytes, remember
  that all offsets you'll get are to the unicode text, which is available as the ``.text``
  property.

  If ``parse`` is set, the ``source_text`` will be parsed with ``ast.parse()``, and the resulting
  tree marked with token info and made available as the ``.tree`` property.

  If ``tree`` is given, it will be marked and made available as the ``.tree`` property. In
  addition to the trees produced by the ``ast`` module, ASTTokens will also mark trees produced
  using ``astroid`` library <https://www.astroid.org>.

  If only ``source_text`` is given, you may use ``.mark_tokens(tree)`` to mark the nodes of an AST
  tree created separately.
  """
  def __init__(self, source_text, parse=False, tree=None, filename='<unknown>'):
    if isinstance(source_text, six.binary_type):
      source_text = source_text.decode('utf8')

    self._filename = filename
    self._tree = ast.parse(source_text, filename) if parse else tree

    self._text = source_text
    self._line_numbers = LineNumbers(source_text)

    # Tokenize the code.
    self._tokens = list(self._generate_tokens(source_text))

    # Extract the start positions of all tokens, so that we can quickly map positions to tokens.
    self._token_offsets = [tok.startpos for tok in self._tokens]

    if self._tree:
      self.mark_tokens(self._tree)


  def mark_tokens(self, root_node):
    """
    Given the root of the AST or Astroid tree produced from source_text, visits all nodes marking
    them with token and position information by adding ``.first_token`` and
    ``.last_token``attributes. This is done automatically in the constructor when ``parse`` or
    ``tree`` arguments are set, but may be used manually with a separate AST or Astroid tree.
    """
    # The hard work of this class is done by MarkTokens
    MarkTokens(self).visit_tree(root_node)


  def _generate_tokens(self, text):
    """
    Generates tokens for the given code.
    """
    # This is technically an undocumented API for Python3, but allows us to use the same API as for
    # Python2. See http://stackoverflow.com/a/4952291/328565.
    for index, tok in enumerate(tokenize.generate_tokens(io.StringIO(text).readline)):
      tok_type, tok_str, start, end, line = tok
      yield Token(tok_type, tok_str, start, end, line, index,
                  self._line_numbers.line_to_offset(start[0], start[1]),
                  self._line_numbers.line_to_offset(end[0], end[1]))

  @property
  def text(self):
    """The source code passed into the constructor."""
    return self._text

  @property
  def tokens(self):
    """The list of tokens corresponding to the source code from the constructor."""
    return self._tokens

  @property
  def tree(self):
    """The root of the AST tree passed into the constructor or parsed from the source code."""
    return self._tree

  @property
  def filename(self):
    """The filename that was parsed"""
    return self._filename

  def get_token_from_offset(self, offset):
    """
    Returns the token containing the given character offset (0-based position in source text),
    or the preceeding token if the position is between tokens.
    """
    return self._tokens[bisect.bisect(self._token_offsets, offset) - 1]

  def get_token(self, lineno, col_offset):
    """
    Returns the token containing the given (lineno, col_offset) position, or the preceeding token
    if the position is between tokens.
    """
    # TODO: add test for multibyte unicode. We need to translate offsets from ast module (which
    # are in utf8) to offsets into the unicode text. tokenize module seems to use unicode offsets
    # but isn't explicit.
    return self.get_token_from_offset(self._line_numbers.line_to_offset(lineno, col_offset))

  def get_token_from_utf8(self, lineno, col_offset):
    """
    Same as get_token(), but interprets col_offset as a UTF8 offset, which is what `ast` uses.
    """
    return self.get_token(lineno, self._line_numbers.from_utf8_col(lineno, col_offset))

  def next_token(self, tok, include_extra=False):
    """
    Returns the next token after the given one. If include_extra is True, includes non-coding
    tokens from the tokenize module, such as NL and COMMENT.
    """
    i = tok.index + 1
    if not include_extra:
      while self._tokens[i].type >= token.N_TOKENS:
        i += 1
    return self._tokens[i]

  def prev_token(self, tok, include_extra=False):
    """
    Returns the previous token before the given one. If include_extra is True, includes non-coding
    tokens from the tokenize module, such as NL and COMMENT.
    """
    i = tok.index - 1
    if not include_extra:
      while self._tokens[i].type >= token.N_TOKENS:
        i -= 1
    return self._tokens[i]

  def find_token(self, start_token, tok_type, tok_str=None, reverse=False):
    """
    Looks for the first token, starting at start_token, that matches tok_type and, if given, the
    token string. Searches backwards if reverse is True.
    """
    t = start_token
    advance = self.prev_token if reverse else self.next_token
    while not match_token(t, tok_type, tok_str) and not token.ISEOF(t.type):
      t = advance(t)
    return t

  def token_range(self, first_token, last_token, include_extra=False):
    """
    Yields all tokens in order from first_token through and including last_token. If
    include_extra is True, includes non-coding tokens such as tokenize.NL and .COMMENT.
    """
    for i in xrange(first_token.index, last_token.index + 1):
      if include_extra or self._tokens[i].type < token.N_TOKENS:
        yield self._tokens[i]

  def get_tokens(self, node, include_extra=False):
    """
    Yields all tokens making up the given node. If include_extra is True, includes non-coding
    tokens such as tokenize.NL and .COMMENT.
    """
    return self.token_range(node.first_token, node.last_token, include_extra=include_extra)

  def get_text_range(self, node):
    """
    After mark_tokens() has been called, returns the (startpos, endpos) positions in source text
    corresponding to the given node. Returns (0, 0) for nodes (like `Load`) that don't correspond
    to any particular text.
    """
    if not hasattr(node, 'first_token'):
      return (0, 0)

    start = node.first_token.startpos
    if any(match_token(t, token.NEWLINE) for t in self.get_tokens(node)):
      # Multi-line nodes would be invalid unless we keep the indentation of the first node.
      start = self._text.rfind('\n', 0, start) + 1

    return (start, node.last_token.endpos)

  def get_text(self, node):
    """
    After mark_tokens() has been called, returns the text corresponding to the given node. Returns
    '' for nodes (like `Load`) that don't correspond to any particular text.
    """
    start, end = self.get_text_range(node)
    return self._text[start : end]
