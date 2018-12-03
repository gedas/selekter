import { Selection, SelectionEvent, SELECTION_EVENT } from './Selection';
import { mouse } from './mouse';
import { lasso } from './lasso';

export interface Selector {
  (area: Area): () => void;
}

export interface AreaOptions {
  element: HTMLElement;

  selectors: Selector[];

  selection: Selection;

  /**
   * CSS selector that specifies an element in a subtree of root element that
   * can be selected.
   * 
   * @default `.selekter-selectable`
   */
  selectable: string;
  
  /**
   * A style class to be added to area root element when there are elements
   * selected.
   * 
   * @default `selekter-selection`
   */
  selectionClass: string;

  /**
   * A style class to be added to selected element.
   * 
   * @default `selekter-selected`
   */
  selectedClass: string;
}

const slice = Array.prototype.slice;

/**
 * Default selectors.
 */
export const defaultSelectors: Selector[] = [
  mouse(),
  lasso()
];

const defaults: Partial<AreaOptions> = {
  element: document.body,
  selectors: defaultSelectors,
  selectable: '.selekter-selectable',
  selectionClass: 'selekter-selection',
  selectedClass: 'selekter-selected'
}

function reduceRightUnique<T>(array: T[], callback: (a: T, b: T) => boolean): T[] {
  return array.reduceRight((result, s) => (!result.some(x => callback(x, s)) && result.push(s), result), []);
}

const canUseMutationObserver = 'MutationObserver' in window;

/**
 * Represents an area containing selectable elements.
 */
export class Area {
  public element: HTMLElement;
  public selectable: string;

  private _selection: Selection;
  private _selectables: Set<Element>;
  private observer: MutationObserver;
  private elementDirty = true;

  private selectorDestroyers: Array<() => void>;
  private selectionClass: string;
  private selectedClass: string;
  
  /**
   * Creates an `Area`.

   * @param root The root element.
   * @param options The area options.
   * @param selectors Selectors to be registered for this area. Subsequent
   *   selectors will override preceding selectors of the same type and won't
   *   be added more than once. Use this parameter to change the configuration
   *   of default selectors or add new ones.
   *   ~~~
   *   [
   *     ...createDefaultSelectors(),
   *     new RectSelector({ threshold: 20 }) // override default
   *   ]
   *   ~~~
   */
  constructor(options?: Partial<AreaOptions>) {
    const {
      element,
      selectors,
      selection,
      selectable,
      selectionClass,
      selectedClass
    } = { ...defaults, ...options };

    this.element = element;
    this._selection = selection || new Selection();
    this.selectable = selectable;
    this.selectionClass = selectionClass;
    this.selectedClass = selectedClass;

    this.selectorDestroyers = reduceRightUnique(selectors, (a, b) => a.constructor === b.constructor)
      .map(s => s(this));

    if (canUseMutationObserver) {
      this.observer = new MutationObserver(() => this.elementDirty = true);
      this.observer.observe(element, { childList: true, subtree: true });
    }

    element.addEventListener(SELECTION_EVENT, this.onSelection);
  }

  private onSelection = (event: SelectionEvent) => {
    this.element.classList.toggle(this.selectionClass, this.selection.size > 0);
    event.target.classList.toggle(this.selectedClass, event.detail.selected);
  }

  get selection(): Selection {
    if (this.elementDirty) {
      this._selection.intersect(this.selectables);
      this.elementDirty = !this.observer;
    }
    return this._selection;
  }

  /**
   * Returns a set of selectable elements queried by `selectable` option.
   * If `MutationObserver` is supported, then set is recreated only when `root`
   * subtree changes.
   */
  get selectables() {
    if (this.elementDirty) {
      this._selectables = new Set([...slice.call(this.element.querySelectorAll(this.selectable))]);
      this.elementDirty = !this.observer;
    }
    return this._selectables;
  }

  /**
   * Destroys the area by disconnecting all connected selectors.
   * No option to recover other than creating new `Area`.
   */
  destroy() {
    this.observer && this.observer.disconnect();
    this.selectorDestroyers.forEach(destroy => destroy());
    this.element.removeEventListener(SELECTION_EVENT, this.onSelection);
  }

}