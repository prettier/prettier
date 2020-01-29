// @flow

enum E {
  A,
  B,
}

enum F {
  A,
  B,
}

const x = E.A;

///////////
// Valid //
///////////
switch (x)  {
  case E.A:
    'A';
    break;
  case E.B:
    'B';
    break;
}

switch (x)  {
  case E.A:
    'A';
    break;
  default:
    'B';
    break;
}

const e = E;
switch (x)  {
  case e.A:
    'A';
    break;
  case e.B:
    'B'
    break;
}

////////////
// Errors //
////////////

// Missing check
switch (x)  { // Error
  case E.A:
    'A';
}

// Invalid check
switch (x)  {
  case x: // Error
    'A';
}

enum G {}
function g(g: G) {
  switch (g)  {
    case g:; // Error
  }
}

// Duplicate check
switch (x)  {
  case E.A:
    'A1';
    break;
  case E.B:
    'B';
    break;
  case E.A: // Error
    'A2';
    break;
}

switch (x)  {
  case E.A:
    'A';
    break;
  case E.B:
    'B';
    break;
  default: // Error
    'default';
}

// Incompatible types
switch (x)  {
  case F.A:
    'A';
    break;
  case F.B:
    'B';
    break;
}

declare var s: string;
switch (s)  {
  case E.A:
    'A';
    break;
  case E.B:
    'B';
    break;
}

// Discriminant is union
function a(x?: E) {
  switch (x)  { // Error
    case E.A:
      'A';
    case E.B:
      'B';
  }
}

function a(x: ?E) {
  switch (x)  { // Error
    case E.A:
      'A';
    case E.B:
      'B';
  }
}

function b(x: E | F) {
  switch (x)  { // Error
    case E.A:
      'A';
    case E.B:
      'B';
  }
}

function c(x: E | string) {
  switch (x)  { // Error
    case E.A:
      'A';
    case E.B:
      'B';
  }
}

switch (x) {
  case E.A:
    'E.A';
    break;
  case F.A:
    'F.A';
    break;
}
