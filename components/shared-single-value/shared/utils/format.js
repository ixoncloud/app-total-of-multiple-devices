import { deburr, get, has, kebabCase } from 'lodash-es';

export function getDataExportFileName(title) {
  if (title) {
    const componentTitle = formatName(title);
    return `{{pageTitle}}_${componentTitle}_{{timeRangeFrom}}_{{timeRangeTo}}.csv`;
  }
  return 'export.csv';
}

export function formatName(name) {
  return kebabCase(deburr(name));
}

export function listFormatter(lang) {
  return function format(list, path = null) {
    if (!list) {
      return '';
    }
    if (path) {
      list = list.map(value => get(value, path));
    }
    if (list.length && typeof list[0] !== 'string') {
      return '';
    }
    if (has(Intl, 'ListFormat')) {
      const ListFormatStatic = get(Intl, 'ListFormat');
      const locales = lang;
      const lf = new ListFormatStatic(locales, {
        type: 'conjunction',
        style: 'long',
      });
      return lf.format(list);
    }
    return list.join(', ');
  };
}
