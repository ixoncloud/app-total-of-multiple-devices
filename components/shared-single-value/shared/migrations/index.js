export * from './add-default-color';
export * from './add-color-usage-to-rules';
export * from './add-property-to-list-item';
export * from './add-rules';
export * from './migrate-datasource-namespace';
export * from './migrate-header-namespace';

export function migrateAll(migrations) {
  return function (inputs) {
    return migrations.reduce((acc, migrateFn) => migrateFn(acc), inputs);
  };
}
