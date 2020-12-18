foo(reallyLongArg(), omgSoManyParameters(), IShouldRefactorThis(), isThereSeriouslyAnotherOne(),

// This template literal triggers `addAlignmentToDoc` in `src/language-js/printer-estree.js`
`
  ${foo}
    bar
    ${
            foo
                  }
    ${
              bar
      `
                      ${foo}
            ${
                  foo
}
      `
    }
    foo
`);
