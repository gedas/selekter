import { Selector } from './Selector';
import { MouseSelector } from './MouseSelector';
import { RectangleSelector } from './RectangleSelector';

/**
 * An array of default selectors. Intended to be used when specifying selectors for new `Area` instance.
 */
const defaultSelectors: Selector[] = [
  new MouseSelector(),
  new RectangleSelector()
];

export default defaultSelectors;
