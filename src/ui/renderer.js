export const $$ = (s) =>
  typeof s === "string" ? document.querySelector(s) : s;

export function appendChild(parent, type = "div") {
  const child = document.createElement(type);
  parent.appendChild(child);
  return child;
}

export function renderInto(el, str = "") {
  el = el instanceof Element ? el : $$(el);
  str = typeof str === "function" ? str() : str;
  el.innerHTML = str;
}

export function renderComponent(el, renderFn, setupFn, data = {}) {
  renderFn(el, data);
  setupFn(el, renderFn, data);
}

export function nanoComponent(el, store, renderFn) {
  store.subscribe((data) => renderInto(el, renderFn(data)));
}
