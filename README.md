# selekter

![selekter](https://user-images.githubusercontent.com/136955/33146647-b38f3268-cfcd-11e7-811d-d00d208eb543.gif)

## About

Selekter is a selection model for DOM. It features both selection management and tooling. Selekter provides a set of tools, such as rectangular lasso tool, for selecting elements in the DOM. This library is particularly preeminent when it comes to selecting elements laid out in a grid.

## Install

```bash
$ npm install selekter
```

## Usage
```ts
import { Area, SelectionEvent, SELECTION_EVENT } from 'selekter';

let root = document.body;
root.addEventListener(SELECTION_EVENT, (event: SelectionEvent) =>
  console.log(`${event.target}` was ${event.detail.selected ? 'selected' : 'deselected'}));

new Area(root);
```

## License

MIT
