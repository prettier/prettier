function deleteMember(window) {
  delete (/** @type {any} */ window).__pwned;
  delete (/** @type {any} */ window)?.__pwned;
}
