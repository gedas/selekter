/**
 * An alias for object having left and right coordinates, width and height.
 * For example, other `Rect` object or
 * [`DOMRect`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect).
 */
export type RectLike = {left: number, top: number, width: number, height: number};

/**
 * Represents a mutable rectangular boundary.
 */
export class Rect {
  
  /**
   * Creates a new rectangle with specified coordinates and size.
   * 
   * @param left The X coordinate of the left side of the rectangle.
   * @param top  The Y coordinate of the top of the rectangle.
   * @param width The width of the rectangle.
   * @param height The height of the rectangle.
   */
  constructor(public left = 0, public top = 0, public width = 0, public height = 0) { }

  /**
   * Creates a rectangle from existing rect-like object.
   * 
   * @param r Other rect-like object to create rectangle from.
   * @example `Rect.from(element.getBoundingClientRect())`
   */
  static from(r: RectLike): Rect {
    return new Rect(r.left, r.top, r.width, r.height);
  }

  /**
   * Determines whether this rectangle intersects other rect-like object.
   * 
   * @param r The specified rect-like object.
   */
  intersects(r: RectLike) {
    return this.left <= r.left + r.width
      && r.left <= this.left + this.width
      && this.top <= r.top + r.height
      && r.top <= this.top + this.height;
  }
}