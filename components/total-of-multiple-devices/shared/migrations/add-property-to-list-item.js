import { isArray } from 'lodash-es';

export function addPropertyToListItem(list, item, property, value) {
  return (inputs) => {
    if (!inputs[list]) {
      return inputs;
    }

    const theList = JSON.parse(JSON.stringify(inputs[list]));
    if (!isArray(theList)) {
      return inputs;
    }

    for (const listItem of theList) {
      const listItemElement = listItem[item];
      if (
        listItemElement &&
        typeof listItemElement === 'object' &&
        !isArray(listItemElement) &&
        !listItemElement[property]
      ) {
        listItemElement[property] = value;
      }
    }

    return Object.assign({}, inputs, { [list]: theList });
  };
}
