// https://github.com/prettier/prettier/issues/18307
class C {
  /** @type {string | undefined} */
  s

  typeCastS() {
    /** @type {string} */ (this.s).length
  }
}

// https://github.com/prettier/prettier/issues/12794
;(/** @type {(token: Token)=>void} */ (onToken))(token) // comment
;/** @type {(token: Token)=>void} */ (onToken)(token) // comment

// unparenthesized
;/** @type {(token: Token)=>void} */ [onToken](token) // comment
;/** @type {(token: Token)=>void} */ onToken(token) // comment

;/* not a type cast comment */ ([])(token) // comment

;/* don't need leading semicolon */ (foo)(token) // comment
