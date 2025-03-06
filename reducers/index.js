/**
 * Root reducer.
 * @module reducers/root
 */

import flags from './flags';
import query from './query';
/**
 * Root reducer.
 * @function
 * @param {Object} state Current state.
 * @param {Object} action Action to be handled.
 * @returns {Object} New state.
 */
const reducers = {
  flags,
  query,
};

export default reducers;
