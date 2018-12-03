import { Selector } from './Area';

const matches = Element.prototype.matches || Element.prototype['msMatchesSelector'];

export interface MouseOptions {
  /**
   * CSS selector that specifies an element that when clicked will select
   * the closest selectable parent.
   * 
   * @default `.selekter-tick`
   */
  tick: string;
}

const defaults: MouseOptions = {
  tick: '.selekter-tick'
};

/**
 * A selector that makes it possible to select elements with mouse click.
 * 
 * By default, if selection is empty, then the first element can be selected only with
 * a tick. Otherwise, elements are selectable by clicking them directly.
 */
export function mouse(options?: Partial<MouseOptions>): Selector {
  const { tick } = { ...defaults, ...options };
  
  return ({ selection, selectable, element }) => {
    const onClick = ({ target }) => {
      const closestSelectable = (target as Element).closest(selectable);
      if (closestSelectable && (selection.size || matches.call(target, tick))) {
        selection.toggle(closestSelectable);
        event.preventDefault();
      }
    }
    element.addEventListener('click', onClick, true);
    return () => element.removeEventListener('click', onClick);
  };
}