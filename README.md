# selekter [![npm](https://img.shields.io/npm/v/selekter.svg?style=flat-square)](https://www.npmjs.com/package/selekter) [![dependencies](https://david-dm.org/gzukas/selekter.svg?style=flat-square)](https://david-dm.org/gzukas/selekter) ![gzipped](http://img.badgesize.io/gzukas/selekter/master/dist/selekter.js?compression=gzip&label=gzipped&style=flat-square)

![selekter](https://user-images.githubusercontent.com/136955/33159206-747a18a8-d019-11e7-9626-9865820ecff2.jpg)


Selekter is a selection model for DOM. It features both selection management and tooling. Selekter provides convenient tools, such as rectangular lasso tool, for selecting elements in the DOM. This library is particularly preeminent when it comes to selecting rectangular  elements laid out in a grid.

## Install

```bash
npm install selekter --save
```

Selekter depends on the following modern JavaScript features:
* [`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)  (with [`values()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/values) and `new Set(iterable)` constructor)
* [`Element.closest`](https://developer.mozilla.org/en-US/docs/Web/API/Element/closest)
* [`CustomEvent`](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent) (constructor)
* [`MutationObserver`](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) (optional, but recommended)

Please use polyfills if one of those is not supported by your browser.

## Usage

Let's start with creating new `Area`.

```js
import { Area } from 'selekter';

const area = new Area();
```

The `area` will be configured with reasonable defaults. For example, elements matching `.selekter-selectable` inside `document.body` will be considered as selectable. Options can be changed via `Area` constructor.

### Selectors

Selekter already comes with mouse and lasso tools preconfigured in `defaultSelectors` array.

```js
import { defaultSelectors, lasso } from 'selekter';

const area = new Area({
  selectors: [
    ...defaultSelectors,
    lasso({ threshold: 20 })
});
```

While `defaultSelectors` already defines `lasso` tool, it won't be added twice. That's because subsequent tools of same type take precedence. 

#### Lasso

```js
import { lasso } from 'selekter';
```

It is a selector that allows selecting elements by holding mouse button down and moving it to create a rectangular region known as lasso. The elements whose boundaries intersect with the lasso will be selected.

#### Mouse

```js
import { mouse } from 'selekter';
```

The mouse selector makes it possible to select elements with a mouse click. By default, if no elements are selected, then the first element can be selected only with a tick. A tick is an element that should be a descendant of a selectable element. For example, a tick could be a button:

```html
<div class="selekter-selectable">
  <button class="selekter-tick"></button>
  <!-- the rest -->
</div>
```

The only assumption made by a tool is that tick is already in a DOM as it won't be created by the tool.  

#### Custom selector

A selector is simply a registration function returning a deregistering function. Instance of an `Area` that selector is being registered with is passed to a registration function. For example:

```js
import { Area, defaultSelectors } from 'selekter';

function custom(area) {
  const onKeyup = () => { /* ... */ };
  document.addEventListener('keyup', onKeyup);
  
  return () => document.removeEventListener('keyup', onKeyup);
}

const area = new Area({
  selectors: [custom]
});
```

### Selection event

Each time selection changes, custom `selection` event for that selectable element will be dispatched. The selection event bubbles so we can listen for it on any parent element.

```js
import { SELECTION_EVENT } from 'selekter';

document.addEventListener(SELECTION_EVENT, event => {
  console.log(`${event.target} was ${event.detail.selected}`);
});
```

The event `target` will be a selectable element whose selection state has just changed and is now `event.detail.selected`.

Selection event is useful for integrating Selekter with other libraries such as React.


## License

[MIT](LICENSE)
