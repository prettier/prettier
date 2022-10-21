// https://github.com/tc39/proposal-regexp-unicode-property-escapes#other-examples
function isEs5IdentifierName(id) {
  return /^(?:[$_\p{ID_Start}])(?:[$_\u200C\u200D\p{ID_Continue}])*$/u.test(id)
}

export default isEs5IdentifierName
