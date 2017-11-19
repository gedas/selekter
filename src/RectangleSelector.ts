import { Area } from './Area';
import { Selector, SelectorDisconnector } from './Selector';
import { Bound, RectLike } from './Bound';

export interface RectangleOptions {
  class: string;
  minEdge: number;
  appendTo: Element;
  boundary(element: Element): RectLike;
}

const defaults: RectangleOptions = {
  class: 'selekter-lasso',
  minEdge: 10,
  boundary: element => element.getBoundingClientRect(),
  appendTo: document.body
}

class Offset {
  constructor(public left: number, public top: number) {}
}

export class RectangleSelector extends Bound implements Selector {
  private area: Area;
  private lasso: HTMLElement;

  private origin: Offset;
  private pendingRenderID: number;
  private preserveSelection: boolean;
  
  constructor(private options?: Partial<RectangleOptions>) {
    super();
    this.options = {...defaults, ...options};
  }

  connect(area: Area): SelectorDisconnector {
    this.area = area;
    document.addEventListener('mousedown', this.onMouseDown);
    return () => document.removeEventListener('mousedown', this.onMouseDown);
  }

  private onMouseDown = (event: MouseEvent) => {
    if (event.button === 0 && (event.target === document.documentElement || event.target === this.area.root)) {
      this.origin = this.withScroll(new Offset(event.clientX, event.clientY));
      this.preserveSelection = event.ctrlKey || event.metaKey;
      document.addEventListener('mousemove', this.onMouseMove);
      document.addEventListener('mouseup', this.onMouseUp);
      event.preventDefault();
    }
  }

  private onMouseMove = (event: MouseEvent) => {
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
  }

  private onMouseUp = () => {
    this.cancelRender();
    this.update();
    this.setVisible(this.lasso, false);

    this.width = this.height = 0;

    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  }

  private update = () => {
    let selection = this.area.getSelection();
    this.area.getSelectables().forEach(element => {
      let bound = this.withScroll(Bound.from(this.options.boundary(element)));
      selection.toggle(element, this.preserveSelection && selection.has(element) || !this.edgeShorterThan(this.options.minEdge) && this.intersects(bound));
    });
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
    style.left = this.left + 'px';
    style.top = this.top + 'px';
    style.width = this.width  + 'px';
    style.height = this.height  + 'px';
    this.pendingRenderID = 0;
  }

  private setVisible(element: HTMLElement, visible: boolean) {
    element && (element.style.display = visible ? '' : 'none');
    return visible;
  }

  private edgeShorterThan(length: number): boolean {
    return this.width < length && this.height < length;
  }

  private withScroll<T extends Offset | Bound>(offset: T): T {
    let body = document.body;
    let html = document.documentElement;
    offset.left += body.scrollLeft || html.scrollLeft;
    offset.top += body.scrollTop || html.scrollTop;
    return offset;
  }

  private createLassoElement() {
    let element = document.createElement('div');
    element.classList.add(this.options.class);
    return element;
  }

}