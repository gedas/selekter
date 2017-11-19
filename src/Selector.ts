import { Area } from './Area';

/**
 * An alias for a function that disconnects the selector.
 */
export type SelectorDisconnector = () => void;

/**
 * Provides the way of selecting elements within the area.
 */
export interface Selector {

  /**
   * Registers this selector on the specified `area`. Performs any initialization logic required by the selector, e.g.
   * adds respective event listeners. Changes can be revoked through returned function.
   * @param area The area on which to register.
   * @returns A function that disconnects registered selector.
   */
  connect(area: Area): SelectorDisconnector;
}