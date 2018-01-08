import { Selection, SelectionEvent, SELECTION_EVENT } from './Selection';
import { Selector, Destroy } from './Selector';
import { MouseSelector } from './MouseSelector';
import { RectSelector } from './RectSelector';

export interface AreaOptions {
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

/**
 * A factory function returning an array of default selectors.
 * Intended to be used when specifying selectors for new `Area`.
 */
export const createDefaultSelectors = () => [
  new MouseSelector(),
  new RectSelector()
];

const defaults: AreaOptions = {
  selectable: '.selekter-selectable',
  selectionClass: 'selekter-selection',
  selectedClass: 'selekter-selected'
}

/**
 * Represents an area containing selectable elements.
 */
export class Area {
  private selection = new Selection();
  private selectables: Set<Element>;
  private selectorDestroyers: Destroy[];
  private observer: MutationObserver;
  private rootDirty = true;
  
  private onSelection = (event: SelectionEvent) => {
    this.root.classList.toggle(this.options.selectionClass, this.selection.size > 0);
    event.target.classList.toggle(this.options.selectedClass, event.detail.selected);
  }

  /**
   * Creates an `Area`.

   * @param root The root element.
   * @param options The area options.
   * @param selectors Selectors to be registered for this area. SubsequentG
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
  constructor(public root: HTMLElement, public options?: Partial<AreaOptions>, selectors = createDefaultSelectors()) {
    this.options = { ...defaults, ...options };
    this.selectorDestroyers = this.lastUniqueByConstructor(selectors).map(s => s.connect(this));

    if (MutationObserver) {
      this.observer = new MutationObserver(() => this.rootDirty = true);
      this.observer.observe(root, { childList: true, subtree: true });
    }

    root.addEventListener(SELECTION_EVENT, this.onSelection);
  }

  /**
   * Returns the current selection.
   * 
   * Modifying this selection will result in selection change events being
   * dispatched. If `MutationObserver` is supported, then selection is updated
   * only when `root` subtree changes. The update includes removing from
   * selection elements that are no longer in `root` subtree.
   */
  getSelection(): Selection {
    if (this.rootDirty) {
      this.selection.intersect(this.getSelectables());
      this.rootDirty = !this.observer;
    }
    return this.selection;
  }

  /**
   * Sets current selection.
   * 
   * Selection change events will be dispatched for each selectable that is not present
   * in the new selection.
   * 
   * @param selection New selection.
   */
  setSelection(selection: Selection) {
    this.selection.intersect(selection);
    this.selection = selection;
  }

  /**
   * Returns a set of selectable elements queried by `selectable` option.
   * If `MutationObserver` is supported, then set is recreated only when `root`
   * subtree changes.
   */
  getSelectables() {
    if (this.rootDirty) {
      this.selectables = new Set([...Array.prototype.slice.call(this.root.querySelectorAll(this.options.selectable))]);
      this.rootDirty = !this.observer;
    }
    return this.selectables;
  }

  /**
   * Destroys the area by disconnecting all connected selectors.
   * No option to recover other than creating new `Area`.
   */
  destroy() {
    this.observer && this.observer.disconnect();
    this.selectorDestroyers.forEach(destroy => destroy());
    this.root.removeEventListener(SELECTION_EVENT, this.onSelection);
  }

  private lastUniqueByConstructor<T>(array: T[]): T[] {
    return array.reduceRight((arr, s) => (!arr.some(x => x.constructor === s.constructor) && arr.push(s), arr), []);
  }
  
}