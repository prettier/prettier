// https://github.com/prettier/prettier/issues/18307
class C {
  /** @type {string | undefined} */
  s

  typeCastS() {
    /** @type {string} */ (this.s).length
  }
}

// https://github.com/prettier/prettier/issues/12794
;(/** @type {(token: Token)=>void} */ (onToken))(token)
;(/* not a type cast comment */ (onToken))(token)
