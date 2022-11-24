// Test cases from babel
//   ref: https://github.com/babel/babel/blob/614b48678095746b83bbe517c4d6b30ba8cd5c04/packages/babel-parser/test/fixtures/flow/arrows-in-ternaries/issue-13644/input.js
// `flow` cannot parse below codes
//   ref: https://github.com/facebook/flow/issues/8731

(a ? (b = c) : d => e); // a ? (b = c) : (d => e)
(a ? (b += c) : d => e); // a ? (b += c) : (d => e)

(a ? (b = c) : d => e : f); // a ? ((b = c): d => e) : f
(a ? (b += c) : d => e : f); // ((a ? (b += c) : (d => e)) : f)

(a ? b => (c = d) : e => f); // a ? (b => (c = d)) : (e => f)
(a ? b => (c += d) : e => f); // a ? (b => (c += d)) : (e => f)

(a ? b => (c = d) : e => f : g); // a ? (b => ((c = d): e => f)) : g
(a ? b => (c += d) : e => f : g); // ((a ? (b => (c += d)) : (e => f)) : g)
