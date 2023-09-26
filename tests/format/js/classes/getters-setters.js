class Foo {
  set name(name) { this._name = name; }
  get name() { return this._name; }

  get model() { return super.model }
  get data() { return super.data }

  get [expr]() { return 'bar'; }
  set [expr](stuff) { return stuff; }

  get pageHeader() { return $('#pageHeader'); }
  get dialogHeader() { return $('#dialogHeader'); }
  get errorMessage() { return $('span.error-message'); }
  get addButtonDialog() { return $('#addButton'); }
  get yesDialogButton() { return $('#yesDialogButton'); }
  get noDialogButton() { return $('#noDialog'); }

  set value(v) { this.value$.next(v) }
  get value() { return this.value$.value }
}


class AstPath {
  constructor(value) {
    this.stack = [value];
  }

  /** @type {string | null} */
  get key() {
    const { stack, siblings } = this;
    return stack.at(siblings === null ? -2 : -4) ?? null;
  }

  /** @type {number | null} */
  get index() {
    return this.siblings === null ? null : this.stack.at(-2);
  }

  /** @type {object} */
  get node() {
    return this.stack.at(-1);
  }

  /** @type {object | null} */
  get parent() {
    return this.getNode(1);
  }

  /** @type {object | null} */
  get grandparent() {
    return this.getNode(2);
  }

  /** @type {boolean} */
  get isInArray() {
    return this.siblings !== null;
  }

  /** @type {object[] | null} */
  get siblings() {
    const { stack } = this;
    const maybeArray = stack.at(-3);
    return Array.isArray(maybeArray) ? maybeArray : null;
  }

  /** @type {object | null} */
  get next() {
    const { siblings } = this;
    return siblings === null ? null : siblings[this.index + 1];
  }

  /** @type {object | null} */
  get previous() {
    const { siblings } = this;
    return siblings === null ? null : siblings[this.index - 1];
  }

  /** @type {boolean} */
  get isFirst() {
    return this.index === 0;
  }

  /** @type {boolean} */
  get isLast() {
    const { siblings, index } = this;
    return siblings !== null && index === siblings.length - 1;
  }

  /** @type {boolean} */
  get isRoot() {
    return this.stack.length === 1;
  }

  /** @type {object} */
  get root() {
    return this.stack[0];
  }

  /** @type {object[]} */
  get ancestors() {
    return [...this.#getAncestors()];
  }

  #getAncestors() {
    // …
  }

}
