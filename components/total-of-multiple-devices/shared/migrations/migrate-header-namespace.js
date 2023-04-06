import { omit } from 'lodash-es';

/**
 * In the early days most widgets would only have a `title` property as the header.
 *
 * In `ixwebcomponents#55` a new implementation was proposed, in which the header could contain both a `title` and `subtitle`.
 * In `ixwebcomponents!103` this proposal was implemented introducing a new `header` namespace.
 *
 * Before:
 * ```
 * { title: 'Hello there!' }
 * ```
 * After:
 * ```
 * {
 *   header: {
 *     title: 'Hello there!',
 *     subtitle: null
 *   }
 * }
 * ```
 *
 * Affected components:
 * - DataTable
 * - Gauge
 * - LineGraph
 * - PeriodBarchart
 * - SingleValue
 * - TextNote
 *
 * @param {Object} inputs
 * @returns {Object} (possibly) migrated inputs
 */
export function migrateHeaderNamespace(inputs) {
  if (inputs && 'title' in inputs) {
    return Object.assign({}, omit(inputs, ['title']), {
      header: { title: inputs.title, subtitle: null },
    });
  }
  return inputs;
}
