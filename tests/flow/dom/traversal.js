// @flow

const document_body = document.body;
if (document_body == null) throw new Error("document.body == null");

let tests = [
  // basic functionality
  function() {
    const i: NodeIterator<*,*> = document.createNodeIterator(document_body);
    const filter: NodeFilter = i.filter;
    const response:
      typeof NodeFilter.FILTER_ACCEPT |
      typeof NodeFilter.FILTER_REJECT |
      typeof NodeFilter.FILTER_SKIP =
      filter.acceptNode(document_body);
  },
  function() {
    const w: TreeWalker<*,*> = document.createTreeWalker(document_body);
    const filter: NodeFilter = w.filter;
    const response:
      typeof NodeFilter.FILTER_ACCEPT |
      typeof NodeFilter.FILTER_REJECT |
      typeof NodeFilter.FILTER_SKIP =
      filter.acceptNode(document_body);
  },
  // rootNode must be a Node
  function() {
    document.createNodeIterator(document_body); // valid
    document.createNodeIterator({}); // invalid
  },
  function() {
    document.createTreeWalker(document_body);
    document.createTreeWalker({}); // invalid
  },
  // Type Parameters
  function() {
    const _root = document_body;
    const i = document.createNodeIterator(_root, NodeFilter.SHOW_ELEMENT);
    const root: typeof _root = i.root;
    const referenceNode: typeof _root | Element = i.referenceNode;
    const previousNode: Element | null = i.previousNode();
    const nextNode: Element | null = i.nextNode();
  },
  function() {
    const _root = document_body.attributes[0];
    const i = document.createNodeIterator(_root, NodeFilter.SHOW_ATTRIBUTE);
    const root: typeof _root = i.root;
    const referenceNode: typeof _root | Attr = i.referenceNode
    const previousNode: Attr | null = i.previousNode();
    const nextNode: Attr | null = i.nextNode();
  },
  function() {
    const _root = document_body;
    const i = document.createNodeIterator(_root, NodeFilter.SHOW_TEXT);
    const root: typeof _root = i.root;
    const referenceNode: typeof _root | Text = i.referenceNode;
    const previousNode: Text | null = i.previousNode();
    const nextNode: Text | null = i.nextNode();
  },
  function() {
    const _root = document;
    const i = document.createNodeIterator(_root, NodeFilter.SHOW_DOCUMENT);
    const root: typeof _root = i.root;
    const referenceNode: typeof _root | Document = i.referenceNode;
    const previousNode: Document | null = i.previousNode();
    const nextNode: Document | null = i.nextNode();
  },
  function() {
    const _root = document;
    const i = document.createNodeIterator(_root, NodeFilter.SHOW_DOCUMENT_TYPE);
    const root: typeof _root = i.root;
    const referenceNode: typeof _root | DocumentType = i.referenceNode;
    const previousNode: DocumentType | null = i.previousNode();
    const nextNode: DocumentType | null = i.nextNode();
  },
  function() {
    const _root = document.createDocumentFragment();
    const i = document.createNodeIterator(_root, NodeFilter.SHOW_DOCUMENT_FRAGMENT);
    const root: typeof _root = i.root;
    const referenceNode: typeof _root | DocumentFragment = i.referenceNode;
    const previousNode: DocumentFragment | null = i.previousNode();
    const nextNode: DocumentFragment | null = i.nextNode();
  },
  function() {
    const _root = document_body;
    const i = document.createNodeIterator(_root, NodeFilter.SHOW_ALL);
    const root: typeof _root = i.root;
    const referenceNode: typeof _root | Node = i.referenceNode;
    const previousNode: Node | null = i.previousNode();
    const nextNode: Node | null = i.nextNode();
  },
  function() {
    const _root = document_body;
    const w = document.createTreeWalker(_root, NodeFilter.SHOW_ELEMENT);
    const root: typeof _root = w.root;
    const currentNode: typeof _root | Element = w.currentNode;
    const parentNode: Element | null = w.parentNode();
    const firstChild: Element | null = w.firstChild();
    const lastChild: Element | null = w.lastChild();
    const previousSibling: Element | null = w.previousSibling();
    const nextSibling: Element | null = w.nextSibling();
    const previousNode: Element | null = w.previousNode();
    const nextNode: Element | null = w.nextNode();
  },
  function() {
    const _root = document_body.attributes[0];
    const w = document.createTreeWalker(_root, NodeFilter.SHOW_ATTRIBUTE);
    const root: typeof _root = w.root;
    const currentNode: typeof _root | Attr = w.currentNode;
    const parentNode: Attr | null = w.parentNode();
    const firstChild: Attr | null = w.firstChild();
    const lastChild: Attr | null = w.lastChild();
    const previousSibling: Attr | null = w.previousSibling();
    const nextSibling: Attr | null = w.nextSibling();
    const previousNode: Attr | null = w.previousNode();
    const nextNode: Attr | null = w.nextNode();
  },
  function() {
    const _root = document_body;
    const w = document.createTreeWalker(_root, NodeFilter.SHOW_TEXT);
    const root: typeof _root = w.root;
    const currentNode: typeof _root | Text = w.currentNode;
    const parentNode: Text | null = w.parentNode();
    const firstChild: Text | null = w.firstChild();
    const lastChild: Text | null = w.lastChild();
    const previousSibling: Text | null = w.previousSibling();
    const nextSibling: Text | null = w.nextSibling();
    const previousNode: Text | null = w.previousNode();
    const nextNode: Text | null = w.nextNode();
  },
  function() {
    const _root = document;
    const w = document.createTreeWalker(_root, NodeFilter.SHOW_DOCUMENT);
    const root: typeof _root = w.root;
    const currentNode: typeof _root | Document = w.currentNode;
    const parentNode: Document | null = w.parentNode();
    const firstChild: Document | null = w.firstChild();
    const lastChild: Document | null = w.lastChild();
    const previousSibling: Document | null = w.previousSibling();
    const nextSibling: Document | null = w.nextSibling();
    const previousNode: Document | null = w.previousNode();
    const nextNode: Document | null = w.nextNode();
  },
  function() {
    const _root = document;
    const w = document.createTreeWalker(_root, NodeFilter.SHOW_DOCUMENT_TYPE);
    const root: typeof _root = w.root;
    const currentNode: typeof _root | DocumentType = w.currentNode;
    const parentNode: DocumentType | null = w.parentNode();
    const firstChild: DocumentType | null = w.firstChild();
    const lastChild: DocumentType | null = w.lastChild();
    const previousSibling: DocumentType | null = w.previousSibling();
    const nextSibling: DocumentType | null = w.nextSibling();
    const previousNode: DocumentType | null = w.previousNode();
    const nextNode: DocumentType | null = w.nextNode();
  },
  function() {
    const _root = document.createDocumentFragment();
    const w = document.createTreeWalker(_root, NodeFilter.SHOW_DOCUMENT_FRAGMENT);
    const root: typeof _root = w.root;
    const currentNode: typeof _root | DocumentFragment = w.currentNode;
    const parentNode: DocumentFragment | null = w.parentNode();
    const firstChild: DocumentFragment | null = w.firstChild();
    const lastChild: DocumentFragment | null = w.lastChild();
    const previousSibling: DocumentFragment | null = w.previousSibling();
    const nextSibling: DocumentFragment | null = w.nextSibling();
    const previousNode: DocumentFragment | null = w.previousNode();
    const nextNode: DocumentFragment | null = w.nextNode();
  },
  function() {
    const _root = document_body;
    const w = document.createTreeWalker(_root, NodeFilter.SHOW_ALL);
    const root: typeof _root = w.root;
    const currentNode: typeof _root | Node = w.currentNode;
    const parentNode: Node | null = w.parentNode();
    const firstChild: Node | null = w.firstChild();
    const lastChild: Node | null = w.lastChild();
    const previousSibling: Node | null = w.previousSibling();
    const nextSibling: Node | null = w.nextSibling();
    const previousNode: Node | null = w.previousNode();
    const nextNode: Node | null = w.nextNode();
  },
  // NodeFilterInterface
  function() {
    document.createNodeIterator(document_body, -1, node => NodeFilter.FILTER_ACCEPT); // valid
    document.createNodeIterator(document_body, -1, node => 'accept'); // invalid
    document.createNodeIterator(document_body, -1, { acceptNode: node => NodeFilter.FILTER_ACCEPT }); // valid
    document.createNodeIterator(document_body, -1, { acceptNode: node => 'accept' }); // invalid
    document.createNodeIterator(document_body, -1, {}); // invalid
  },
  function() {
    document.createTreeWalker(document_body, -1, node => NodeFilter.FILTER_ACCEPT); // valid
    document.createTreeWalker(document_body, -1, node => 'accept'); // invalid
    document.createTreeWalker(document_body, -1, { acceptNode: node => NodeFilter.FILTER_ACCEPT }); // valid
    document.createTreeWalker(document_body, -1, { acceptNode: node => 'accept' }); // invalid
    document.createTreeWalker(document_body, -1, {}); // invalid
  },
];
