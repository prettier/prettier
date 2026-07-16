target = a
  ?
    b
  : (
    /** @type {A} */ (c)
    ?? d
  )

target =  a
  ?  b
  : (/** @type A*/ (root).head ?? root.ownerDocument.head);

// https://github.com/sveltejs/svelte/blob/602a873b6b82bba4e6edc91b039e2f6defbe3fc4/packages/svelte/src/internal/client/dom/css.js#L15-L17
target = /** @type {ShadowRoot} */ (root).host
  ? /** @type {ShadowRoot} */ (root)
  : (/** @type {Document} */ (root).head ?? /** @type {Document} */ (root.ownerDocument).head);
