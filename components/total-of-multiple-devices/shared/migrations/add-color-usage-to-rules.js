import { isArray } from 'lodash-es';

/**
 * Adds the field 'colorUsage' with value 'text' to all entries in the 'rules' array.
 *
 * Affected components:
 * - LiveStatus
 * - Status
 *
 * @param {Object} inputs
 * @returns {Object} (possibly) migrated inputs
 */
export function addColorUsageToRules(inputs) {
  if (inputs && 'rules' in inputs && isArray(inputs.rules)) {
    return Object.assign({}, inputs, { rules: inputs.rules.map(addColorUsageToRule) });
  }
  return inputs;
}

function addColorUsageToRule(item) {
  if (item && 'rule' in item && !('colorUsage' in item.rule)) {
    const ruleItem = Object.assign({}, item);
    ruleItem.rule.colorUsage = 'text';
    return ruleItem;
  }
  return item;
}
