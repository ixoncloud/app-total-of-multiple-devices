/**
 * Calculates yAxis space according to chart height. This has influence on the amount of labels that are drawn.
 */
export function calcYAxisSpace(uplot, axisIdx, scaleMin, scaleMax, plotDim) {
  if (plotDim < 250) {
    return 25;
  }
  if (plotDim < 500) {
    return 45;
  }
  return 65;
}
