/**
 * Adds an empty array under 'rules' to existing components.
 *
 * Affected components:
 * - LiveValue
 * - SingleValue
 *
 * @param {Object} inputs
 * @returns {Object} (possibly) migrated inputs
 */
export function addRules(inputs) {
  if (inputs && !('rules' in inputs)) {
    return Object.assign({}, inputs, { rules: [] });
  }
  return inputs;
}
