import tinycolor from 'tinycolor2';

export function referenceLinePlugin(opts) {
  const lines = opts.lines();

  function readableColor(bgColor) {
    const wcag2 = { level: 'AA', size: 'small' };
    return tinycolor.mostReadable(bgColor, ['#fff', '#ddd', '#bbb', '#999', '#777', '#555', '#333', '#111'], wcag2);
  }

  return {
    hooks: {
      draw(self) {
        const left = self.bbox.left;
        const width = self.bbox.width;
        const padding = 3;
        const alpha = 0.66;
        const lineDash = [1, 2];

        const resetStrokeStyle = self.ctx.strokeStyle;
        const resetFillStyle = self.ctx.fillStyle;

        opts.lines().forEach((line) => {
          const scaleKey = line.scaleKey;
          const pos = self.valToPos(line.value, scaleKey, true);
          const color = tinycolor(line.color);
          const alignRight = scaleKey === 'right';

          self.ctx.beginPath();
          self.ctx.setLineDash(lineDash);
          self.ctx.strokeStyle = color.toRgbString();
          self.ctx.moveTo(left, pos);
          self.ctx.lineTo(left + width, pos);
          self.ctx.stroke();

          if (line.label) {
            self.ctx.textAlign = scaleKey;
            self.ctx.textBaseline = 'bottom';
            const text = self.ctx.measureText(line.label);

            self.ctx.fillStyle = tinycolor(color).setAlpha(alpha).toRgbString();
            self.ctx.fillRect(
              left + (alignRight ? width - text.width - 2 * padding : 0),
              pos,
              text.width + 2 * padding,
              -text.actualBoundingBoxAscent - padding,
            );

            self.ctx.fillStyle = readableColor(color);
            self.ctx.fillText(line.label, left + (alignRight ? width - padding : padding), pos);
          }
        });

        self.ctx.strokeStyle = resetStrokeStyle;
        self.ctx.fillStyle = resetFillStyle;
      },
    },
  };
}
