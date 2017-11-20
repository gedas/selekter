import { Selection, SelectionEvent, SELECTION_EVENT } from './Selection';
import { Selector, SelectorDisconnector } from './Selector';
import defaultSelectors from './defaultSelectors';

/**
 * Various area options.
 */
export interface AreaOptions {

  /**
   * CSS selector that specifies an element in a subtree of root element that can be selected.
   */
  selectable: string;
  
  /**
   * A style class to be added to area root element when there are elements selected.
   */
  selectionClass: string;

  selectedClass: string;
}

const defaults: Partial<AreaOptions> = {
  selectable: '.selekter-selectable',
  selectionClass: 'selekter-selection',
  selectedClass: 'selekter-selected'
}

/**
 * Represents an area containing selectable elements.
 */
export class Area {
  private selection = new Selection();
  private filtered: Set<Element>;
  private rootDirty = true;
  private selectorDisconnectors: SelectorDisconnector[];
  private observer: MutationObserver;
  
  private onSelection = (event: SelectionEvent) => {
    this.root.classList.toggle(this.options.selectionClass, this.selection.size > 0);
    (event.target as Element).classList.toggle(this.options.selectedClass, event.detail.selected);
  }

  /**
   * Creates an `Area`.
   * 
   * @param root The root element.
   * @param options Set of area options. Direct children of a `root` element will be selectable by default.
   * @param selectors Selectors to be registered for this area. Subsequent selectors will override preceding selectors
   *   of the same type and won't be added more than once. Use this parameter to change configuration of default
   *   selectors or add new ones.
   *   ~~~
   *   [
   *     ...defaultSelectors,
   *     new RectangleSelector({ minEdge: 20 }), // will override default rectangle selector
   *     new FooSelector()
   *   ]
   *   ~~~
   */
  constructor(public root: Element, public options?: Partial<AreaOptions>, selectors = defaultSelectors) {
    this.options = { ...defaults, ...options };

    this.observer = this.observeDescendants(root, () => this.rootDirty = true);
    this.selectorDisconnectors = this.lastUniqueByConstructor(selectors).map(s => s.connect(this));

    root.addEventListener(SELECTION_EVENT, this.onSelection);
  }

  /**
   * Returns the current selection.
   * 
   * Modifying this selection will result in selection events being dispatched. Unlike `getFiltered()`, this set is
   * updated instead of being recreated when `root` DOM subtree mutates. Therefore, it is guaranteed that the same
   * `Selection` instance will be referenced during `Area` object lifetime.
   * 
   * @example
   * ~~~
   * let root = document.body;
   * root.addEventListener('selection', (event: SelectionEvent) =>
   *   console.log(`${event.target} selected: ${event.detail.selected}`));
   * 
   * let area = new Area(root);
   * area.getSelection().add([...area.getFiltered()]) // Select all
   * ~~~
   */
  getSelection() {
    if (this.rootDirty) {
      this.selection.intersect(this.getSelectables());
      this.rootDirty = false;
    }
    return this.selection;
  }

  /**
   * Returns a set of selectable elements determined by `filter` option.
   * Set is recreated each time element is added or removed from `root` DOM subtree.
   */
  getSelectables() {
    if (this.rootDirty) {
      this.filtered = new Set([...this.root.querySelectorAll(this.options.selectable)]);
      this.rootDirty = false;
    }
    return this.filtered;
  }

  /**
   * Destroys the area by disconnecting all connected selectors.
   * No option to recover other than creating new `Area`.
   */
  destroy() {
    this.observer.disconnect();
    this.selectorDisconnectors.forEach(disconnect => disconnect());
    this.root.removeEventListener(SELECTION_EVENT, this.onSelection);
  }

  private observeDescendants(root: Element, callback: MutationCallback) {
    let observer = new MutationObserver(callback);
    observer.observe(root, { childList: true, subtree: true });
    return observer;
  }

  private lastUniqueByConstructor<T>(array: T[]): T[] {
    return array.reduceRight((arr, s) => (!arr.some(x => x.constructor === s.constructor) && arr.push(s), arr), []);
  }
  
}
