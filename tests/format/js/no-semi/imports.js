// #10870
import foo from "foo"

;/* Should preserve line before */({})

////////////////////////////////////////
export default {}

;/* Should preserve line before */({})

////////////////////////////////////////
export {foo}

;/* Should preserve line before */({})

////////////////////////////////////////
export * from 'foo'

;/* Should preserve line before */({})
