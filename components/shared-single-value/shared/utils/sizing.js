export function calculateStringSizeFactory(fontSize) {
  const cache = new Map();

  return function calculator(string) {
    let width = 0;

    if (cache.has(string)) {
      return cache.get(string);
    }

    // create temporary element
    const ruler = document.createElement('div');
    ruler.style.width = 'auto';
    ruler.style.position = 'absolute';
    ruler.style.zIndex = -1;
    ruler.style.whiteSpace = 'nowrap';
    ruler.style.fontSize = fontSize + 'px';
    ruler.style.opacity = 0;
    ruler.style.pointerEvents = 'none';

    ruler.innerHTML = string;

    // inject into DOM
    document.body.appendChild(ruler);

    // retrieve width
    width = ruler.clientWidth;

    // clean up
    document.body.removeChild(ruler);

    // add to cache
    cache.set(string, width);

    return width;
  };
}
