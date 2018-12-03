/**
 * An alias for object having left and right coordinates, width and height.
 * For example, other `Rect` object or
 * [`DOMRect`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect).
 */
export type RectLike = {
  left: number,
  top: number,
  width: number,
  height: number
};

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
   * Determines whether this rectangle intersects other rect-like object.
   * 
   * @param r The specified rect-like object.
   */
  intersects(r: RectLike, left = 0, top = 0) {
    return this.left <= r.left + left + r.width
      && r.left + left <= this.left + this.width
      && this.top <= r.top + top + r.height
      && r.top + top <= this.top + this.height;
  }

  setRect(left: number, top: number, width: number, height: number) {
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
  }

}