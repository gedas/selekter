import { Area } from './Area';
import { Selector, Destroy } from './Selector';

const matches = Element.prototype.matches || Element.prototype.msMatchesSelector;

export interface MouseSelectorOptions {
  /**
   * CSS selector that specifies an element that when clicked will select
   * the closest selectable parent.
   * 
   * @default `.selekter-tick`
   */
  tick: string;
}

const defaults: MouseSelectorOptions = {
  tick: '.selekter-tick'
};

/**
 * A selector that makes it possible to select elements with mouse right click.
 * 
 * If selection is empty, then the first element can be selected only with
 * a tick. Otherwise, elements are selectable by clicking them directly.
 */
export class MouseSelector implements Selector {
  private area: Area;

  constructor(private options?: Partial<MouseSelectorOptions>) {
    this.options = { ...defaults, ...options };
  }

  connect(area: Area): Destroy {
    this.area = area;
    this.area.root.addEventListener('click', this.onClick);
    return () => this.area.root.removeEventListener('click', this.onClick);
  }

  private onClick = (event: MouseEvent) => {
    let selectable = (event.target as Element).closest(this.area.options.selectable);
    if (selectable) {
      let selection = this.area.getSelection();
      if (selection.size > 0 || matches.call(event.target, this.options.tick)) {
        selection.toggle(selectable);
      }
    }
  }

}