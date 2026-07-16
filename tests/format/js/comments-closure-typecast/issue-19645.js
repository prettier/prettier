var target = /** @type {ShadowRoot} */ (root).host
  ? /** @type {ShadowRoot} */ (root)
  : /** @type {Document} */ (root).head ?? /** @type {Document} */ (root.ownerDocument).head;
