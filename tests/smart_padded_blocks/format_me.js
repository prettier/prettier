//// no nesting

// no pad
function func() {
  console.log("hello");
  console.log("world");
}

// pad
function func() {

  console.log("hello");
  console.log("world");
}

// pad
function func() {
  console.log("hello");
  console.log("world");

}

// pad
function func() {
  console.log("hello");

  console.log("world");
}

// pad
function func() {

  console.log("hello");

  console.log("world");

}


//// nesting (concerning only inner)

// no pad
function func() {
  if(true) {
    console.log("hello");
  }
}

// only pad inner
function func() {
  if(true) {

    console.log("world");
  }
}

// only pad inner
function func() {
  if(true) {
    console.log("hello");

  }
}

// only pad inner
function func() {
  if(true) {

    console.log("hello");

  }
}


//// nesting (concerning inner and outer)

// pad both
function func() {

  if(true) {

    console.log("world");
  }
}

// pad both
function func() {
  if(true) {
    console.log("hello");

  }

}

// pad both
function func() {
  if(true) {

    console.log("hello");
  }

}

// no change ( all padded )
function func() {

  if(true) {

    console.log("hello");

  }

}
