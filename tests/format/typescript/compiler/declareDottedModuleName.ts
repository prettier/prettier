// @declaration: true
module M {
    module P.Q { } // This shouldn't be emitted
}

module M {
    export module R.S { }  //This should be emitted
}

module T.U { // This needs to be emitted
}