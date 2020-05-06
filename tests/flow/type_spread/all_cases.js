//@flow

// Cannot type spread non-object
interface A {foo: number}
type B = {bar: number, ...A}; // Error
var b: B = {foo: 3};

// Cannot spread with indexer on right
type D = {[string]: number};
type E = {foo:number, ...D}; // Error
declare var z: {};
(z: E);

// Case 1: O1 exact, O2 exact
type A1 = {| p?: number |};
type B1 = {| p?: string |};
type C1 = {...A1, ...B1};
type D1 = {p?: number | string};

declare var X1: D1;
declare var Y1: C1;
(X1: C1);
(Y1: D1);

// --
type A2 = {| p?: number |};
type B2 = {| p: string |};
type C2 = {...A2, ...B2};
type D2 = {p: string};

declare var X2: D2;
declare var Y2: C2;
(X2: C2);
(Y2: D2);

// --
type A3 = {| p?: number |}
type B3 = {||};
type C3 = {...A3, ...B3};
type D3 = {p?: number};

declare var X3: D3;
declare var Y3: C3;

(X3: C3);
(Y3: D3);

//--
type A4 = {| p: number |};
type B4 = {| p?: string |};
type C4 = {...A4, ...B4};
type D4 = {p: number | string};

declare var X4: D4;
declare var Y4: C4;
(X4: C4);
(Y4: D4);

//--
type A5 = {| p: number |};
type B5 = {| p: string |};
type C5 = {...A5, ...B5};
type D5 = {p: string};

declare var X5: D5;
declare var Y5: C5;
(X5: C5);
(Y5: D5);

//--
type A6 = {| p: number |}
type B6 = {||};
type C6 = {...A6, ...B6};
type D6 = {p: number};

declare var X6: D6;
declare var Y6: C6;

(X6: C6);
(Y6: D6);

//--
type A7 = {| [string]: number |};
type B7 = {| p?: string |};
type C7 = {...A7, ...B7}; // Error, A7 has an indexer and p? is optional
type D7 = {[string]: number, p?: string | number};

declare var X7: D7;
declare var Y7: C7;

(X7: C7);
(Y7: D7);

//--
type A8 = {||};
type B8 = {| p?: number |};
type C8 = {...A8, ...B8};
type D8 = {p?: number};

declare var X8: D8;
declare var Y8: C8;

(X8: C8);
(Y8: D8);

// Case2: O1 inexact, O2 exact
type A9 = { p?: number };
type B9 = {| p?: string |};
type C9 = {...A9, ...B9};
type D9 = {p?: number | string};

declare var X9: D9;
declare var Y9: C9;
(X9: C9);
(Y9: D9);

//--
type A10 = { p?: number };
type B10 = {| p: string |};
type C10 = {...A10, ...B10};
type D10 = {p: string};

declare var X10: D10;
declare var Y10: C10;
(X10: C10);
(Y10: D10);

//--
type A11 = { p?: number };
type B11 = {||};
type C11 = {...A11, ...B11};
type D11 = {p?: number};

declare var X11: D11;
declare var Y11: C11;
(X11: C11);
(Y11: D11);

//--
type A12 = { p: number };
type B12 = {| p?: string |};
type C12 = {...A12, ...B12};
type D12 = {p: number | string};

declare var X12: D12;
declare var Y12: C12;
(X12: C12);
(Y12: D12);

//--
type A13 = { p: number };
type B13 = {| p: string |};
type C13 = {...A13, ...B13};
type D13 = {p: string};

declare var X13: D13;
declare var Y13: C13;
(X13: C13);
(Y13: D13);

//--
type A14 = { p: number };
type B14 = {||};
type C14 = {...A14, ...B14};
type D14 = {p: number};

declare var X14: D14;
declare var Y14: C14;
(X14: C14);
(Y14: D14);

//--
type A15 = { [string]: number };
type B15 = {| p?: string |};
type C15 = {...A15, ...B15}; // Error, A15 has an indexer and p? is optional
type D15 = {[string]: number, p?: string | number};

declare var X15: D15;
declare var Y15: C15;
(X15: C15);
(Y15: D15);

//--
type A16 = {};
type B16 = {| p?: string |};
type C16 = {...A16, ...B16}; // Error, A16 might include p with an unknown type
type D16 = {[string]: number, p?: string | number};

declare var X16: D16;
declare var Y16: C16;
(X16: C16);
(Y16: D16);

// Case3: O1 exact, O2 inexact
type A17 = {| p?: number |};
type B17 = { p?: string };
type C17 = {...A17, ...B17};
type D17 = {p?: number | string};

declare var X17: D17;
declare var Y17: C17;
(X17: C17);
(Y17: D17);

// --
type A18 = {| p?: number |};
type B18 = { p: string };
type C18 = {...A18, ...B18};
type D18 = {p: string};

declare var X18: D18;
declare var Y18: C18;
(X18: C18);
(Y18: D18);

// --
type A19 = {| p?: number |}
type B19 = {};
type C19 = {...A19, ...B19}; // Error
type D19 = {p?: number};

declare var X19: D19;
declare var Y19: C19;

(X19: C19);
(Y19: D19);

//--
type A20 = {| p: number |};
type B20 = { p?: string };
type C20 = {...A20, ...B20};
type D20 = {p: number | string};

declare var X20: D20;
declare var Y20: C20;
(X20: C20);
(Y20: D20);

//--
type A21 = {| p: number |};
type B21 = { p: string };
type C21 = {...A21, ...B21};
type D21 = {p: string};

declare var X21: D21;
declare var Y21: C21;
(X21: C21);
(Y21: D21);

//--
type A22 = {| p: number |}
type B22 = {};
type C22 = {...A22, ...B22}; // Error
type D22 = {p: number};

declare var X22: D22;
declare var Y22: C22;

(X22: C22);
(Y22: D22);

//--
type A23 = {| [string]: number |};
type B23 = { p?: string };
type C23 = {...A23, ...B23}; // Error inexact B23 may have properties that conflict with A23's indexer
type D23 = {[string]: number, p?: string | number};

declare var X23: D23;
declare var Y23: C23;

(X23: C23);
(Y23: D23);

//--
type A24 = {||};
type B24 = { p?: number };
type C24 = {...A24, ...B24};
type D24 = {p?: number};

declare var X24: D24;
declare var Y24: C24;

(X24: C24);
(Y24: D24);

// Case4: O1 exact, O2 inexact
type A25 = { p?: number };
type B25 = { p?: string };
type C25 = {...A25, ...B25};
type D25 = {p?: number | string};

declare var X25: D25;
declare var Y25: C25;
(X25: C25);
(Y25: D25);

// --
type A26 = { p?: number };
type B26 = { p: string };
type C26 = {...A26, ...B26};
type D26 = {p: string};

declare var X26: D26;
declare var Y26: C26;
(X26: C26);
(Y26: D26);

// --
type A27 = { p?: number }
type B27 = {};
type C27 = {...A27, ...B27}; // Error
type D27 = {p?: number};

declare var X27: D27;
declare var Y27: C27;

(X27: C27);
(Y27: D27);

//--
type A28 = { p: number };
type B28 = { p?: string };
type C28 = {...A28, ...B28};
type D28 = {p: number | string};

declare var X28: D28;
declare var Y28: C28;
(X28: C28);
(Y28: D28);

//--
type A29 = { p: number };
type B29 = { p: string };
type C29 = {...A29, ...B29};
type D29 = {p: string};

declare var X29: D29;
declare var Y29: C29;
(X29: C29);
(Y29: D29);

//--
type A30 = { p: number }
type B30 = {};
type C30 = {...A30, ...B30}; // Error
type D30 = {p: number};

declare var X30: D30;
declare var Y30: C30;

(X30: C30);
(Y30: D30);

//--
type A31 = { [string]: number };
type B31 = { p?: string };
type C31 = {...A31, ...B31}; // Error B31 may have props that conflict with A31's indexer
type D31 = {[string]: number, p?: string | number};

declare var X31: D31;
declare var Y31: C31;

(X31: C31);
(Y31: D31);

//--
type A32 = {};
type B32 = { p?: number };
type C32 = {...A32, ...B32}; // Error, unknown type for p
type D32 = {p?: number};

declare var X32: D32;
declare var Y32: C32;

(X32: C32);
(Y32: D32);
