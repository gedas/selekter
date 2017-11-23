import { Selector } from './Selector';
import { MouseSelector } from './MouseSelector';
import { RectSelector } from './RectSelector';

/**
 * An array of default selectors.
 * Intended to be used when specifying selectors for new `Area`.
 */
const defaultSelectors: Selector[] = [
  new MouseSelector(),
  new RectSelector()
];

export default defaultSelectors;
