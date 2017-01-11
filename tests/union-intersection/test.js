type A = {a: number};
type B = {b: number};
type C = {c: number};

type T1 = (A | B) & C;
function f1(x: T1): T1 { return x; }

type T2 = (A & B) | C;
function f2(x: T2): T2 { return x; }

type T3 = (A & C) | (B & C);
function f3(x: T3): T3 { return x; }

type T4 = (A | C) & (B | C);
function f4(x: T4): T4 { return x; }

type T5 = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "13";

type T6 = "a-long-string" | "another-long-string" | "yet-another-long-string" | "one-more-for-good-measure";

type T7 =
  { eventName: "these", a: number } |
  { eventName: "will", b: number } |
  { eventName: "not", c: number } |
  { eventName: "fit", d: number } |
  { eventName: "on", e: number } |
  { eventName: "one", f: number } |
  { eventName: "line", g: number };

type Comment = {
  type: 'CommentLine';
  _CommentLine: void;
  value: string;
  end: number;
  loc: {
    end: {column: number, line: number},
    start: {column: number, line: number},
  };
  start: number;
} | {
  type: 'CommentBlock';
  _CommentBlock: void;
  value: string;
  end: number;
  loc: {
    end: {column: number, line: number},
    start: {column: number, line: number},
  };
  start: number;
};
