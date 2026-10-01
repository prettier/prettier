const snippets = [
  {
    name: "paragraphs before another mapping item (issue 10776)",
    code: "key: >\n  first paragraph\n\n  second paragraph\nnext: value\n",
    output: "key: >\n  first paragraph\n\n  second paragraph\nnext: value\n",
  },
  {
    name: "strip chomping before another sequence item",
    code: "- >-\n  first\n  second\n- next\n",
    output: "- >-\n  first second\n- next\n",
  },
  {
    name: "keep chomping at end of document",
    code: ">+\n  first\n  second\n",
    output: ">+\n  first second\n",
  },
  {
    name: "empty scalar with keep chomping",
    code: ">+\n\n",
    output: ">+\n\n",
  },
  {
    name: "trailing content spaces before another mapping item",
    code: "key: >-\n  value  \nnext: value\n",
    output: "key: >-\n  value  \nnext: value\n",
  },
  {
    name: "empty scalar with explicit indentation",
    code: ">1\n \n \n",
    output: ">1\n",
  },
  {
    name: "empty scalar with explicit indentation and strip chomping",
    code: ">2-\n     \n",
    output: ">2-\n",
  },
];

runFormatTest({ importMeta: import.meta, snippets }, ["yaml"], {
  proseWrap: "never",
});
