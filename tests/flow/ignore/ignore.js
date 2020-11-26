function a() {
  // Incorrectly indented on purpose
      function f</* prettier-ignore */ T    :    B>(
        a : Array  <   number   > // prettier-ignore
      ) {

        call(
          f(         1          )
          // prettier-ignore
        )
      }
}
