/**
 * The type of selection event.
 */
export const SELECTION_EVENT = 'selection';

/**
 * Represents a selection event published when element has been selected or deselected. 
 */
export interface SelectionEvent extends CustomEvent {
  readonly target: Element;
  readonly detail: { selected: boolean };
}

/**
 * Represents a set of selected elements. Selection events will be published for each element being added or removed.
 * Selection event does bubble.
 */
export class Selection {

  private elements: Set<Element>;

  constructor(elements?: Iterable<Element>) {
    this.elements = new Set<Element>(elements);
  }

  get size() {
    return this.elements.size;
  }

  add(element: Element) {
    let had = this.elements.has(element);
    this.elements.add(element);
    if (!had) {
      this.notify(element, true);
    }
    return this;
  }

  delete(element: Element) {
    return this.elements.delete(element) && !this.notify(element, false);
  }

  has(element: Element) {
    return this.elements.has(element);
  }

  clear() {
    this.elements.forEach(x => this.delete(x));
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
      return !this.delete(element) && !!this.add(element);
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
    this.elements.forEach(x => !other.has(x) && this.delete(x));
  }

  private notify(element: Element, selected: boolean) {
    element.dispatchEvent(new CustomEvent(SELECTION_EVENT, {
      bubbles: true,
      detail: { selected }
    }));
  }

}