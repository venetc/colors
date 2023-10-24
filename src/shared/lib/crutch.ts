export function beforeLeaveWorkaround(el: Element) {
  /* TODO костыль, убрать */
  if (!(el instanceof HTMLElement)) return;
  const {
    marginLeft,
    marginTop,
    width,
    height,
  } = window.getComputedStyle(el);

  el.style.left = `${el.offsetLeft - Number.parseFloat(marginLeft)}px`;
  el.style.top = `${el.offsetTop - Number.parseFloat(marginTop)}px`;
  el.style.width = width;
  el.style.height = height;
}
