(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
class ObservableSet extends Set {
    constructor(values, observer) {
        super();
        this.observer = observer;
    }
    add(value) {
        let had = super.has(value);
        super.add(value);
        if (!had) {
            this.observer(value, true);
        }
        return this;
    }
    delete(value) {
        return super.delete(value) && (this.observer(value, false), true);
    }
    clear() {
        let values = Array.from(this.values());
        super.clear();
        values.forEach(value => this.observer(value, false));
    }
}

/**
 * The type of selection event.
 */
const SELECTION_EVENT = 'selection';
/**
 * Represents a set of selected elements. Selection events will be published for each element being added or removed.
 */
class Selection extends ObservableSet {
    constructor(elements) {
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
    toggle(element, force) {
        if (force === undefined) {
            return !(this.delete(element) || !this.add(element));
        }
        if (force) {
            this.add(element);
        }
        else {
            this.delete(element);
        }
        return force;
    }
    /**
     * Sets this selection to the intersection with `other` set. This selection will contain elements present in both sets.
     * @param other The set being intersected with this selection.
     */
    intersect(other) {
        this.forEach(x => !other.has(x) && this.delete(x));
    }
    dispatchSelectionEvent(element, selected) {
        element.dispatchEvent(new CustomEvent(SELECTION_EVENT, {
            bubbles: true,
            detail: { selected }
        }));
    }
}

const matches = Element.prototype.matches || Element.prototype.msMatchesSelector;
const defaults$1 = {
    tick: '.selekter-tick',
    closestSelectable: (event, area) => event.target.closest(area.options.selectable)
};
class MouseSelector {
    constructor(options) {
        this.options = options;
        this.onClick = (event) => {
            let selectable = this.options.closestSelectable(event, this.area);
            if (selectable) {
                let selection = this.area.getSelection();
                if (matches.call(event.target, this.options.tick) || selection.size > 0) {
                    selection.toggle(selectable);
                }
            }
        };
        this.options = Object.assign({}, defaults$1, options);
    }
    connect(area) {
        this.area = area;
        this.area.root.addEventListener('click', this.onClick);
        return () => this.area.root.removeEventListener('click', this.onClick);
    }
}

/**
 * Represents a mutable rectangular boundary.
 */
class Bound {
    /**
     * Creates a new boundary with specified coordinates and size.
     * @param left The X coordinate of the left side of the boundary.
     * @param top The Y coordinate of the top of the boundary.
     * @param width The width of the boundary.
     * @param height The height of the boundary.
     */
    constructor(left = 0, top = 0, width = 0, height = 0) {
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
    }
    /**
     * Creates a boundary from existing rect-like object.
     * @param rect Other rect-like object to create boundary from.
     * @example `Bound.from(element.getBoundingClientRect())`
     */
    static from(other) {
        return new Bound(other.left, other.top, other.width, other.height);
    }
    /**
     * Determines whether this boundary does intersect other rect-like object.
     * @param other The specified rect-like object.
     */
    intersects(other) {
        return this.left <= other.left + other.width
            && other.left <= this.left + this.width
            && this.top <= other.top + other.height
            && other.top <= this.top + this.height;
    }
}

const defaults$2 = {
    class: 'selekter-lasso',
    minEdge: 10,
    boundary: element => element.getBoundingClientRect(),
    appendTo: document.body
};
class Offset {
    constructor(left, top) {
        this.left = left;
        this.top = top;
    }
}
class RectangleSelector extends Bound {
    constructor(options) {
        super();
        this.options = options;
        this.onMouseDown = (event) => {
            if (event.button === 0 && (event.target === document.documentElement || event.target === this.area.root)) {
                this.origin = this.withScroll(new Offset(event.clientX, event.clientY));
                this.preserveSelection = event.ctrlKey || event.metaKey;
                document.addEventListener('mousemove', this.onMouseMove);
                document.addEventListener('mouseup', this.onMouseUp);
                event.preventDefault();
            }
        };
        this.onMouseMove = (event) => {
            event.preventDefault();
            let mouse = this.withScroll(new Offset(event.clientX, event.clientY));
            this.top = Math.min(this.origin.top, mouse.top);
            this.left = Math.min(this.origin.left, mouse.left);
            this.width = Math.abs(this.origin.left - mouse.left);
            this.height = Math.abs(this.origin.top - mouse.top);
            if (this.setVisible(this.lasso, !this.edgeShorterThan(this.options.minEdge))) {
                if (!this.lasso) {
                    this.lasso = this.options.appendTo.appendChild(this.createLassoElement());
                }
                this.requestRender();
            }
            this.update();
        };
        this.onMouseUp = () => {
            this.cancelRender();
            this.update();
            this.setVisible(this.lasso, false);
            this.width = this.height = 0;
            document.removeEventListener('mousemove', this.onMouseMove);
            document.removeEventListener('mouseup', this.onMouseUp);
        };
        this.update = () => {
            let selection = this.area.getSelection();
            this.area.getSelectables().forEach(element => {
                let bound = this.withScroll(Bound.from(this.options.boundary(element)));
                selection.toggle(element, this.preserveSelection && selection.has(element) || !this.edgeShorterThan(this.options.minEdge) && this.intersects(bound));
            });
        };
        this.render = () => {
            let style = this.lasso.style;
            style.left = this.left + 'px';
            style.top = this.top + 'px';
            style.width = this.width + 'px';
            style.height = this.height + 'px';
            this.pendingRenderID = 0;
        };
        this.options = Object.assign({}, defaults$2, options);
    }
    connect(area) {
        this.area = area;
        document.addEventListener('mousedown', this.onMouseDown);
        return () => document.removeEventListener('mousedown', this.onMouseDown);
    }
    requestRender() {
        if (!this.pendingRenderID) {
            this.pendingRenderID = requestAnimationFrame(this.render);
        }
    }
    cancelRender() {
        if (this.pendingRenderID) {
            cancelAnimationFrame(this.pendingRenderID);
            this.pendingRenderID = 0;
        }
    }
    setVisible(element, visible) {
        element && (element.style.display = visible ? '' : 'none');
        return visible;
    }
    edgeShorterThan(length) {
        return this.width < length && this.height < length;
    }
    withScroll(offset) {
        let body = document.body;
        let html = document.documentElement;
        offset.left += body.scrollLeft || html.scrollLeft;
        offset.top += body.scrollTop || html.scrollTop;
        return offset;
    }
    createLassoElement() {
        let element = document.createElement('div');
        element.classList.add(this.options.class);
        return element;
    }
}

/**
 * An array of default selectors. Intended to be used when specifying selectors for new `Area` instance.
 */
const defaultSelectors = [
    new MouseSelector(),
    new RectangleSelector()
];

const defaults = {
    selectable: '.selekter-selectable',
    selectionClass: 'selekter-selection'
};
/**
 * Represents an area containing selectable elements.
 */
class Area {
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
    constructor(root, options, selectors = defaultSelectors) {
        this.root = root;
        this.options = options;
        this.selection = new Selection();
        this.rootDirty = true;
        this.onSelection = () => this.root.classList.toggle(this.options.selectionClass, this.selection.size > 0);
        this.options = Object.assign({}, defaults, options);
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
    // private querySelectables(element: Element, selector: string) {
    //   let acceptNode = (element: Element) => element.matches(selector)
    //     ? NodeFilter.FILTER_ACCEPT
    //     : NodeFilter.FILTER_SKIP;
    //   let selectables = new Set<Element>();
    //   for (let s, it = document.createNodeIterator(element, NodeFilter.SHOW_ELEMENT, { acceptNode }); s = it.nextNode();) {
    //     selectables.add(s);
    //   }
    //   return selectables;
    // }
    observeDescendants(root, callback) {
        let observer = new MutationObserver(callback);
        observer.observe(root, { childList: true, subtree: true });
        return observer;
    }
    lastUniqueByConstructor(array) {
        return array.reduceRight((arr, s) => (!arr.some(x => x.constructor === s.constructor) && arr.push(s), arr), []);
    }
}

export { defaultSelectors, Area, Bound, MouseSelector, RectangleSelector, SELECTION_EVENT, Selection };
