import { ObservableSet, Observer } from './ObservableSet';

/**
 * The type of selection event.
 */
export const SELECTION_EVENT = 'selection';

/**
 * Represents a selection event published when element has been selected or deselected. 
 */
export interface SelectionEvent extends CustomEvent {
  readonly detail: { selected: boolean };
}

/**
 * Represents a set of selected elements. Selection events will be published for each element being added or removed.
 */
export class Selection extends ObservableSet<Element> {
  constructor(elements?: Iterable<Element>) {
    super(elements, (element, selected) => this.dispatchSelectionEvent(element, selected));
  }

  /**
   * Toggles selection state of the `element`.
   * If `element` is selected then removes it and returns `false`, if not, then adds it and returns `true`.
   * 
   * The selection state of the `element` can be forced using `force` argument. If `force` is true, adds the element,
   * otherwise - removes. 
   * 
   * @param element The element which selection state should be toggled.
   * @param force Determines whether `element` should be selected or not.
   */
  toggle(element: Element, force?: boolean) {
    if (force === undefined) {
      return !(this.delete(element) || !this.add(element));
    }
    if (force) {
      this.add(element);
    } else {
      this.delete(element);
    }
    return force;
  }

  /**
   * Sets this selection to the intersection with `other` set. This selection will contain elements present in both sets.
   * @param other The set being intersected with this selection.
   */
  intersect(other: Set<Element>) {
    this.forEach(x => !other.has(x) && this.delete(x));
  }

  private dispatchSelectionEvent(element: Element, selected: boolean) {
    element.dispatchEvent(new CustomEvent(SELECTION_EVENT, {
      bubbles: true,
      detail: { selected }
    }));
  }

}