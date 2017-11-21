import { Area } from './Area';
import { Selector, SelectorDisconnector } from './Selector';

const matches = Element.prototype.matches || Element.prototype.msMatchesSelector;

export interface MouseSelectorOptions {
  /**
   * CSS selector that specifies an element that when clicked will select closest selectable.
   */
  tick: string;
}

const defaults: MouseSelectorOptions = {
  tick: '.selekter-tick'
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
    let selectable = (event.target as Element).closest(this.area.options.selectable);
    if (selectable) {
      let selection = this.area.getSelection();
      if (matches.call(event.target, this.options.tick) || selection.size > 0) {
        selection.toggle(selectable);
      }
    }
  }

}