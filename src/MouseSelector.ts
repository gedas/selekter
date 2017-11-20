import { Area } from './Area';
import { Selector, SelectorDisconnector } from './Selector';

const matches = Element.prototype.matches || Element.prototype.msMatchesSelector;

export interface MouseSelectorOptions {
  tick: string;
  closestSelectable(event: MouseEvent, area: Area);
}

const defaults: MouseSelectorOptions = {
  tick: '.selekter-tick',
  closestSelectable: (event, area) =>
    (event.target as Element).closest(area.options.selectable)
};

export class MouseSelector implements Selector {
  private area: Area;

  constructor(private options?: Partial<MouseSelectorOptions>) {
    this.options = { ...defaults, ...options };
  }

  connect(area: Area): SelectorDisconnector {
    this.area = area;
    this.area.root.addEventListener('click', this.onClick);
    return () => this.area.root.removeEventListener('click', this.onClick);
  }

  private onClick = (event: MouseEvent) => {
    let selectable = this.options.closestSelectable(event, this.area);
    if (selectable) {
      let selection = this.area.getSelection();
      if (matches.call(event.target, this.options.tick) || selection.size > 0) {
        selection.toggle(selectable);
      }
    }
  }

}