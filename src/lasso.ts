import { Selector } from './Area';
import { Rect, RectLike } from './Rect';

export interface LassoOptions {
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
   * The element to append lasso to.
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

const defaults: Partial<LassoOptions> = {
  lassoClass: 'selekter-lasso',
  threshold: 10,
  appendTo: document.body,
  boundary: element => element.getBoundingClientRect()
}

function relativeTo<T extends { x: number, y: number }>(element: Element, xy: T): T {
  const bounds = element.getBoundingClientRect();
  xy.x += element.scrollLeft - bounds.left;
  xy.y += element.scrollTop - bounds.top;
  return xy;
}

/**
 * A selector that makes it possible to select elements while pressing and
 * moving the mouse cursor creating a region known as rectangular lasso.
 * The elements whose boundaries intersect with the lasso will be selected.
 */
export function lasso(options?: Partial<LassoOptions>): Selector {
  const { boundary, appendTo, threshold, lassoClass } = { ...defaults, ...options };
  return ({ element, selection, selectables }) => {

    let lassoElement: HTMLElement;
    let lassoRect = new Rect();
    let origin: { x: number, y: number };
    let pendingRenderRequest: number;
    let selectionSnapshot: Set<Element>

    const onMouseDown = (event: MouseEvent) => {
      if (event.button === 0 && (event.target === element || event.target === document.documentElement)) {
        event.preventDefault();
        origin = relativeTo(appendTo, { x: event.clientX, y: event.clientY });
        selectionSnapshot = event.ctrlKey || event.metaKey
          ? new Set(selection.values())
          : null;
  
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      }
    }

    const onMouseMove = (event: MouseEvent) => {
      event.preventDefault();
      const { x: ox, y: oy } = origin;
      const { x, y } = relativeTo(appendTo, { x: event.clientX, y: event.clientY });
  
      lassoRect.setRect(
        Math.min(ox, x),
        Math.min(oy, y),
        Math.abs(ox - x),
        Math.abs(oy - y));

      requestRender();
      update();
    }

    const onMouseUp = () => {
      cancelRender();
      update();
    
      lassoRect.width = lassoRect.height = 0;
      render();

      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    const update = () => {
      const { x, y } = relativeTo(appendTo, { x: 0, y: 0 });
      const passes = passesThreshold();
  
      selectables.forEach(s =>
        selection.toggle(s,
          (selectionSnapshot && selectionSnapshot.has(s)) ||
          (passes && lassoRect.intersects(boundary(s), x, y))));
    }

    const render = () => {
      const passes = passesThreshold();
      if (passes || !pendingRenderRequest) {
        if (!lassoElement) {
          lassoElement = document.createElement('div');
          lassoElement.className = lassoClass;
          appendTo.appendChild(lassoElement);
        }
        const { style } = lassoElement;
        const { top, left, width, height } = lassoRect;
        style.top = top + 'px';
        style.left = left + 'px';
        style.width = width + 'px';
        style.height = height + 'px';
      }
      if (lassoElement) {
        lassoElement.style.display = passes ? 'block' : 'none';
      }
      pendingRenderRequest = 0;
    }

    const requestRender = () => {
      if (!pendingRenderRequest) {
        pendingRenderRequest = requestAnimationFrame(render);
      }
    }

    const cancelRender = () => {
      if (pendingRenderRequest) {
        cancelAnimationFrame(pendingRenderRequest);
        pendingRenderRequest = 0;
      }
    }

    const passesThreshold = () => lassoRect.width >= threshold || lassoRect.height >= threshold;

    document.addEventListener('mousedown', onMouseDown);

    return () => {
      cancelRender();
      if (lassoElement) {
        appendTo.removeChild(lassoElement);
      }
      document.removeEventListener('mousedown', onMouseDown);
    };
  }
}
