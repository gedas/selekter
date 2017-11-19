/**
 * An alias for object having left and right coordinates, width and height.
 * For example, other `Bound` object or [`DOMRect`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect).
 */
export type RectLike = {left: number, top: number, width: number, height: number};

/**
 * Represents a mutable rectangular boundary.
 */
export class Bound {
  
  /**
   * Creates a new boundary with specified coordinates and size.
   * @param left The X coordinate of the left side of the boundary.
   * @param top The Y coordinate of the top of the boundary.
   * @param width The width of the boundary.
   * @param height The height of the boundary.
   */
  constructor(public left = 0, public top = 0, public width = 0, public height = 0) { }

  /**
   * Creates a boundary from existing rect-like object.
   * @param rect Other rect-like object to create boundary from.
   * @example `Bound.from(element.getBoundingClientRect())`
   */
  static from(other: RectLike): Bound {
    return new Bound(other.left, other.top, other.width, other.height);
  }

  /**
   * Determines whether this boundary does intersect other rect-like object.
   * @param other The specified rect-like object.
   */
  intersects(other: RectLike) {
    return this.left <= other.left + other.width
      && other.left <= this.left + this.width
      && this.top <= other.top + other.height
      && other.top <= this.top + this.height;
  }
}