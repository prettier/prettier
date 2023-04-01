foo("long" + "set").bar("of" + "arguments").baz("will" + "break")
.qux(`
    template literal
`)

foo("long" + "set").bar("of" + "arguments").baz("will" + "break")
.qux(`
    template literal
`).toString()

foo().bar().baz().qux(`
  template literal
  template literal
`)
