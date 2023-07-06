export function showElementsWhen(els, store, fn) {
  els = Array.isArray(els) ? els : [els];
  store.subscribe((value) => {
    els.forEach((el) => {
      const show = fn
        ? typeof fn === "function"
          ? fn(value)
          : value === fn
        : value;
      el.style.display = show ? "" : "none";
    });
  });
}
