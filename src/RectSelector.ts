import { Area } from './Area';
import { Selector, Destroy } from './Selector';
import { Rect, RectLike } from './Rect';

export interface RectSelectorOptions {
  /**
   * A style class to be added to lasso element.
   * 
   * @default `selekter-lasso`
   */
  lassoClass: string;

  /**
   * The minimum length of lasso edge in pixels for lasso to be visible.
   * 
   * @default `10`
   */
  threshold: number;

  /**
   * The element to append lasso to. If not specified, then lasso will be
   * appended to area `root` element.
   */
  appendTo: Element;

  /**
   * Returns rectangular boundary of the selectable element. Invoked for each
   * selectable element in order to test whether element intersects the lasso.
   * 
   * Defaults to `element.getBoundingClientRect()`.
   * 
   * @param element The selectable element.
   */
  boundary(element: Element): RectLike;
}

const defaults: Partial<RectSelectorOptions> = {
  lassoClass: 'selekter-lasso',
  threshold: 10,
  boundary: element => element.getBoundingClientRect()
}

/**
 * A selector that makes it possible to select elements while pressing and
 * moving the mouse creating a region. This rectangular region is known as
 * lasso. The elements whose boundaries intersect with the lasso will be
 * selected.
 */
export class RectSelector extends Rect implements Selector {
  private area: Area;
  private lasso: HTMLElement;

  private origin: {top: number, left: number};
  private pendingRenderID: number;
  private preservedSelection: Set<Element>;

  constructor(private options?: Partial<RectSelectorOptions>) {
    super();
    this.options = { ...defaults, ...options };
  }

  connect(area: Area): Destroy {
    this.area = area;
    document.addEventListener('mousedown', this.onMouseDown);
    return this.destroy;
  }

  private onMouseDown = (event: MouseEvent) => {
    if (event.button === 0 && event.target === this.area.root) {
      this.origin = this.offset({ left: event.clientX, top: event.clientY }, this.area.root);
      this.preservedSelection = event.ctrlKey || event.metaKey
        ? new Set(this.area.getSelection().values())
        : null;

      document.addEventListener('mousemove', this.onMouseMove);
      document.addEventListener('mouseup', this.onMouseUp);
      event.preventDefault();
    }
  }

  private onMouseMove = (event: MouseEvent) => {
    event.preventDefault();
    let mouse = this.offset({ left: event.clientX, top: event.clientY }, this.area.root);

    this.top = Math.min(this.origin.top, mouse.top);
    this.left = Math.min(this.origin.left, mouse.left);
    this.width = Math.abs(this.origin.left - mouse.left);
    this.height = Math.abs(this.origin.top - mouse.top);

    if (this.setVisible(this.lasso, this.doesEdgePassThreshold())) {
      if (!this.lasso) {
        this.lasso = (this.options.appendTo || this.area.root).appendChild(this.createLassoElement());
      }
      this.requestRender();
    }
    this.update();
  }

  private onMouseUp = (event: MouseEvent) => {
    this.cancelRender();
    this.update();
    
    this.width = this.height = 0;
    this.setVisible(this.lasso, false);

    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  }

  private update = () => {
    let selection = this.area.getSelection();
    this.area.getSelectables().forEach(s =>
      selection.toggle(s,
        (this.preservedSelection && this.preservedSelection.has(s)) ||
        (this.doesEdgePassThreshold() && this.intersects(this.boundary(s)))));
  }

  private boundary(element: Element) {
    return this.offset(Rect.from(this.options.boundary(element)), this.area.root);
  }

  private requestRender() {
    if (!this.pendingRenderID) {
      this.pendingRenderID = requestAnimationFrame(this.render);
    }
  }

  private cancelRender() {
    if (this.pendingRenderID) {
      cancelAnimationFrame(this.pendingRenderID);
      this.pendingRenderID = 0;
    }
  }

  private render = () => {
    let style = this.lasso.style;
    style.top = this.top + 'px';
    style.left = this.left + 'px';
    style.width = this.width + 'px';
    style.height = this.height + 'px';
    this.pendingRenderID = 0;
  }

  private setVisible(element: HTMLElement, visible: boolean) {
    element && (element.style.display = visible ? '' : 'none');
    return visible;
  }

  private doesEdgePassThreshold() {
    return this.width >= this.options.threshold || this.height >= this.options.threshold;
  }

  private offset<T extends {top: number, left: number}>(x: T, element: HTMLElement) {
    x.top += element.scrollTop - element.offsetTop + (pageYOffset || document.documentElement.scrollTop),
    x.left += element.scrollLeft - element.offsetLeft + (pageXOffset || document.documentElement.scrollLeft)
    return x;
  }

  private createLassoElement() {
    let element = document.createElement('div');
    element.className = this.options.lassoClass;
    return element;
  }
  
  private destroy = () => {
    this.cancelRender();
    if (this.lasso) {
      this.lasso.parentElement.removeChild(this.lasso);
      this.lasso = null;
    }
    document.removeEventListener('mousedown', this.onMouseDown);
  }

}