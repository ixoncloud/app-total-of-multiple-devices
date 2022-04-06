import { addPropertyToListItem } from './add-property-to-list-item';

describe('addPropertyToListItem', () => {
  it('adds a property to all items in a list', () => {
    const migration = addPropertyToListItem('lijst', 'element', 'field', 'waarde');
    const inputs = { lijst: [{ element: {} }] };

    const expected = { lijst: [{ element: { field: 'waarde' } }] };

    expect(migration(inputs)).toEqual(expected);
  });

  it('does not crash for unexpected inputs', () => {
    const migration = addPropertyToListItem('rows', 'row', 'color', 'black');

    const inputs1 = { list: [{ item: { field: 'value' } }] };
    expect(migration(inputs1)).toEqual(inputs1);

    const inputs2 = { rows: { object: true } };
    expect(migration(inputs2)).toEqual(inputs2);

    const inputs3 = { rows: [{ row: true }] };
    expect(migration(inputs3)).toEqual(inputs3);

    const inputs4 = { rows: [{ row: [] }] };
    expect(migration(inputs4)).toEqual(inputs4);
  });

  it('adds `{ axis: left }` to `line` objects in the `lines` list', () => {
    const migration = addPropertyToListItem('lines', 'line', 'axis', 'left');
    const inputs = {
      lines: [
        { nonLine: { name: 'Line #1' } },
        { nonObject: 3 },
        { line: { name: 'Line #2' } },
        { line: { name: 'Line #3', axis: 'right' } },
        { line: { name: 'Line #4' } },
      ],
      others: 'hello',
    };

    const expected = {
      lines: [
        { nonLine: { name: 'Line #1' } },
        { nonObject: 3 },
        { line: { name: 'Line #2', axis: 'left' } },
        { line: { name: 'Line #3', axis: 'right' } },
        { line: { name: 'Line #4', axis: 'left' } },
      ],
      others: 'hello',
    };

    expect(migration(inputs)).toEqual(expected);
  });
});
