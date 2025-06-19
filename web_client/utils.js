export function bindEvents(element, events, handler) {
  events.forEach(event => element.addEventListener(event, handler));
}
