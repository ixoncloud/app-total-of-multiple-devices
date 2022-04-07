import { omit } from 'lodash-es';

/**
 * In the early days most widgets would only have a `metric` property at the top level.
 *
 * In `ixwebcomponents!106` the `metric` properties were moved into a `dataSource` group in order to accommodate
 * additional related fields such as `min` and `max` which were added at the time.
 *
 * Before:
 * ```
 * { metric: 'Agent#selected:uint16' }
 * ```
 * After:
 * ```
 * {
 *   dataSource: {
 *     metric: 'Agent#selected:uint16',
 *   }
 * }
 * ```
 *
 * Affected components:
 * - Gauge
 * - SingleValue
 * - Statusbar
 * - Tank (introduced as LiquidTank)
 *
 * Components which were initially released with `dataSource` and therefore unaffected:
 * - LiveGauge
 * - LiveStatus
 * - LiveTank
 * - LiveValue
 * - MultiValue
 *
 * @param {Object} inputs
 * @returns {Object} (possibly) migrated inputs
 */
export function migrateDatasourceNamespace(inputs) {
  if (inputs && 'metric' in inputs && !('dataSource' in inputs)) {
    const dataSource = {
      dataSource: {
        ...(inputs.metric ? { metric: inputs.metric } : {}),
        ...(inputs.min ? { min: inputs.min } : {}),
        ...(inputs.max ? { max: inputs.max } : {}),
      },
    };
    return Object.assign({}, omit(inputs, ['metric', 'min', 'max']), dataSource);
  }
  return inputs;
}
