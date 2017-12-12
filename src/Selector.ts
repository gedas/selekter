import { Area } from './Area';

/**
 * An alias for a function that destroys the selector.
 */
export type Destroy = () => void;

/**
 * Provides the way of selecting elements within the area.
 */
export interface Selector {

  /**
   * Registers this selector on the specified `area`.
   * 
   * Performs any initialization logic required by the selector, e.g. adds
   * respective event listeners. Changes can be revoked through returned
   * function.
   * 
   * @param area The area to register this selector to.
   * @returns A function that destroys registered selector.
   */
  connect(area: Area): Destroy;
}