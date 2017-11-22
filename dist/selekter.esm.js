(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
/**
 * The type of selection event.
 */
const SELECTION_EVENT = 'selection';
/**
 * Represents a set of selected elements. Selection events will be published for each element being added or removed.
 * Selection event does bubble.
 */
class Selection {
    constructor(elements) {
        this.elements = new Set(elements);
    }
    get size() {
        return this.elements.size;
    }
    values() {
        return this.elements.values();
    }
    add(element) {
        let had = this.elements.has(element);
        this.elements.add(element);
        if (!had) {
            this.notify(element, true);
        }
        return this;
    }
    delete(element) {
        return this.elements.delete(element) && !this.notify(element, false);
    }
    has(element) {
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
    toggle(element, force) {
        if (force === undefined) {
            return !this.delete(element) && !!this.add(element);
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
        this.elements.forEach(x => !other.has(x) && this.delete(x));
    }
    notify(element, selected) {
        element.dispatchEvent(new CustomEvent(SELECTION_EVENT, {
            bubbles: true,
            detail: { selected }
        }));
    }
}

const matches = Element.prototype.matches || Element.prototype.msMatchesSelector;
const defaults$1 = {
    tick: '.selekter-tick'
};
class MouseSelector {
    constructor(options) {
        this.options = options;
        this.onClick = (event) => {
            let selectable = event.target.closest(this.area.options.selectable);
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
class Rect {
    /**
     * Creates a new rectangle with specified coordinates and size.
     * @param left The X coordinate of the left side of the rectangle.
     * @param top The Y coordinate of the top of the rectangle.
     * @param width The width of the rectangle.
     * @param height The height of the rectangle.
     */
    constructor(left = 0, top = 0, width = 0, height = 0) {
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
    }
    /**
     * Creates a rectangle from existing rect-like object.
     * @param r Other rect-like object to create rectangle from.
     * @example `Rect.from(element.getBoundingClientRect())`
     */
    static from(r) {
        return new Rect(r.left, r.top, r.width, r.height);
    }
    /**
     * Determines whether this rectangle intersects other rect-like object.
     * @param r The specified rect-like object.
     */
    intersects(r) {
        return this.left <= r.left + r.width
            && r.left <= this.left + this.width
            && this.top <= r.top + r.height
            && r.top <= this.top + this.height;
    }
}

const defaults$2 = {
    lassoClass: 'selekter-lasso',
    minEdge: 10,
    boundary: element => element.getBoundingClientRect(),
    appendTo: document.body
};
class RectSelector extends Rect {
    constructor(options) {
        super();
        this.options = options;
        this.onMouseDown = (event) => {
            if (event.button === 0 && (event.target === document.documentElement || event.target === this.area.root)) {
                this.origin = this.getPageCoordinates(event);
                this.preservedSelection = event.ctrlKey || event.metaKey
                    ? new Set(this.area.getSelection().values())
                    : null;
                document.addEventListener('mousemove', this.onMouseMove);
                document.addEventListener('mouseup', this.onMouseUp);
                event.preventDefault();
            }
        };
        this.onMouseMove = (event) => {
            event.preventDefault();
            let mouse = this.getPageCoordinates(event);
            this.top = Math.min(this.origin.top, mouse.top);
            this.left = Math.min(this.origin.left, mouse.left);
            this.width = Math.abs(this.origin.left - mouse.left);
            this.height = Math.abs(this.origin.top - mouse.top);
            if (this.setVisible(this.lasso, this.edgeLongerThan(this.options.minEdge))) {
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
            this.width = this.height = 0;
            this.setVisible(this.lasso, false);
            document.removeEventListener('mousemove', this.onMouseMove);
            document.removeEventListener('mouseup', this.onMouseUp);
        };
        this.update = () => {
            let selection = this.area.getSelection();
            this.area.getSelectables().forEach(s => {
                selection.toggle(s, (this.preservedSelection && this.preservedSelection.has(s))
                    || (this.edgeLongerThan(this.options.minEdge) && this.intersects(this.translateByScroll(Rect.from(this.options.boundary(s))))));
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
    edgeLongerThan(length) {
        return this.width >= length || this.height >= length;
    }
    translateByScroll(offset) {
        let body = document.body;
        let html = document.documentElement;
        offset.left += body.scrollLeft || html.scrollLeft;
        offset.top += body.scrollTop || html.scrollTop;
        return offset;
    }
    getPageCoordinates(event) {
        return this.translateByScroll({ left: event.clientX, top: event.clientY });
    }
    createLassoElement() {
        let element = document.createElement('div');
        element.classList.add(this.options.lassoClass);
        return element;
    }
}

const defaultSelectors = [
    new MouseSelector(),
    new RectSelector()
];

const defaults = {
    selectable: '.selekter-selectable',
    selectionClass: 'selekter-selection',
    selectedClass: 'selekter-selected'
};
/**
 * Represents an area containing selectable elements.
 */
class Area {
    /**
     * Creates an `Area`.
     *
     * @param root The root element.
     * @param options The area options.
     * @param selectors Selectors to be registered for this area. Subsequent selectors will override preceding selectors
     *   of the same type and won't be added more than once. Use this parameter to change configuration of default
     *   selectors or add new ones.
     *   ~~~
     *   [
     *     ...defaultSelectors,
     *     new RectSelector({ minEdge: 20 }), // will override default rect selector
     *     new FooSelector()
     *   ]
     *   ~~~
     */
    constructor(root, options, selectors = defaultSelectors) {
        this.root = root;
        this.options = options;
        this.selection = new Selection();
        this.rootDirty = true;
        this.onSelection = (event) => {
            this.root.classList.toggle(this.options.selectionClass, this.selection.size > 0);
            event.target.classList.toggle(this.options.selectedClass, event.detail.selected);
        };
        this.options = Object.assign({}, defaults, options);
        this.observer = this.observeDescendants(root, () => this.rootDirty = true);
        this.selectorDisconnectors = this.lastUniqueByConstructor(selectors).map(s => s.connect(this));
        root.addEventListener(SELECTION_EVENT, this.onSelection);
    }
    /**
     * Returns the current selection.
     *
     * Modifying this selection will result in selection events being dispatched. Unlike `getSelectables()`, selection is
     * updated instead of being recreated when `root` subtree changes. Therefore, it is guaranteed that the same
     * `Selection` instance will be referenced during `Area` object lifetime.
     */
    getSelection() {
        if (this.rootDirty) {
            this.selection.intersect(this.getSelectables());
            this.rootDirty = false;
        }
        return this.selection;
    }
    /**
     * Returns a set of selectable elements queried by `selectable` option.
     * Set is recreated each time `root` subtree changes.
     */
    getSelectables() {
        if (this.rootDirty) {
            this.selectables = new Set([...this.root.querySelectorAll(this.options.selectable)]);
            this.rootDirty = false;
        }
        return this.selectables;
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
    observeDescendants(root, callback) {
        let observer = new MutationObserver(callback);
        observer.observe(root, { childList: true, subtree: true });
        return observer;
    }
    lastUniqueByConstructor(array) {
        return array.reduceRight((arr, s) => (!arr.some(x => x.constructor === s.constructor) && arr.push(s), arr), []);
    }
}

export { defaultSelectors, Area, Rect, MouseSelector, RectSelector, SELECTION_EVENT, Selection };
