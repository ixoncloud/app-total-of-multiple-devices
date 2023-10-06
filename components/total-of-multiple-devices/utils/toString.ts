export function toString(
  value: number,
  decimals: number,
  unit: string,
  locale: string
) {
  const options: Intl.NumberFormatOptions = {
    style: "decimal",
    minimumFractionDigits: Math.floor(decimals),
    maximumFractionDigits: Math.floor(decimals),
  };
  const formatter = new Intl.NumberFormat(locale, options);
  return `${formatter.format(value)}${unit ? " " + unit : ""}`;
}
