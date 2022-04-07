export function encodeTableCell(value) {
  value = typeof value === 'string' ? value : String(value);
  if (
    value.includes(',') ||
    value.includes('\n') ||
    (value.startsWith('"') && value.endsWith('"'))
  ) {
    value = `"${value.replace(new RegExp('"', 'g'), '""')}"`;
  }
  return value;
}
