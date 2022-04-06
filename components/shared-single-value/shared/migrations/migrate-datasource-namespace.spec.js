import { migrateDatasourceNamespace } from '@/shared/migrations/migrate-datasource-namespace';

describe('migrateDatasourceNamespace', () => {
  it('does not do any migration for empty inputs', () => {
    expect(migrateDatasourceNamespace({})).toEqual({});
  });

  it('does not do any migration if inputs does not contain `metric` field', () => {
    expect(migrateDatasourceNamespace({ name: 'Name' })).toEqual({ name: 'Name' });
  });

  it('moves `metric` field into `dataSource` namespace', () => {
    expect(migrateDatasourceNamespace({ metric: 'theMetric' })).toEqual({ dataSource: { metric: 'theMetric' } });
  });

  it('moves `min` and `max` fields into `dataSource` namespace if `metric` field is present', () => {
    expect(migrateDatasourceNamespace({ metric: 'theMetric', min: 1, max: 5 })).toEqual({
      dataSource: { metric: 'theMetric', min: 1, max: 5 },
    });
  });

  it('does not move `min` and `max` fields into `dataSource` namespace if `metric` field is not present', () => {
    expect(migrateDatasourceNamespace({ min: 1, max: 5 })).toEqual({ min: 1, max: 5 });
  });

  it('does not overwrite existing `dataSource` ', () => {
    expect(migrateDatasourceNamespace({ metric: 'theMetric' })).toEqual({ dataSource: { metric: 'theMetric' } });
  });
});
