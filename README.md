# selekter

[![dependencies](https://david-dm.org/gzukas/selekter.svg?style=flat-square)](https://david-dm.org/gzukas/selekter)
[![license](https://img.shields.io/github/license/gzukas/selekter.svg?style=flat-square)](https://github.com/gzukas/selekter/blob/master/LICENSE)
![size](http://img.badgesize.io/gzukas/selekter/master/dist/selekter.js?style=flat-square)
![gzipped](http://img.badgesize.io/gzukas/selekter/master/dist/selekter.js?compression=gzip&label=gzipped&style=flat-square)

![selekter](https://user-images.githubusercontent.com/136955/33159206-747a18a8-d019-11e7-9626-9865820ecff2.jpg)

## About

Selekter is a selection model for DOM. It features both selection management and tooling. Selekter provides a set of tools, such as rectangular lasso tool, for selecting elements in the DOM. This library is particularly preeminent when it comes to selecting elements laid out in a grid.

## Install

```bash
$ npm install selekter --save
```

Selekter depends on the following modern JavaScript features:
* [`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)  (with [`values()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/values) and `new Set(iterable)` constructor)
* [`MutationObserver`](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)
* [`Element.closest`](https://developer.mozilla.org/en-US/docs/Web/API/Element/closest)
* [`CustomEvent`](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent) (constructor)

Please use polyfills if one of those is not supported by your browser.

## Usage

Let's start with creating new `Area`.

```ts
import { Area } from 'selekter';

let root = document.querySelector('.area');
new Area(root);
```

This will make all `.selekter-selectable` inside `.area` selectable. The `.selekter-selectable` is the default CSS selector and can be changed in options. Each time selection changes, custom `selection` event for that selectable element will be dispatched. The selection event bubbles so we can listen for it directly from the root element:

```ts
import { SelectionEvent, SELECTION_EVENT } from 'selekter';

root.addEventListener(SELECTION_EVENT, (event: SelectionEvent) =>
  console.log(`${event.target} was ${event.detail.selected}`));
```

If default selection tool options are unfavorable or custom selectors are needed, pass them to `Area` constructor as a third parameter. For example:

```ts
import { defaultSelectors, RectSelector } from 'selekter';

new Area(root, { /* options */ }, [
  ...defaultSelectors,
  new RectSelector({ threshold: 20 })
]);  
```

This will result in rectangular selector with new threshold taking precedence over default selector.

## License

[MIT](LICENSE)
