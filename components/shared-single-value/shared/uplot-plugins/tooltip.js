export function tooltipPlugin(opts) {
  let touchMoveAbortController = null;
  const _tooltip = document.createElement('div');
  _tooltip.classList.add('u-tooltip');
  _tooltip.style.setProperty('position', 'absolute');
  _tooltip.style.setProperty('top', '0');
  _tooltip.style.setProperty('left', '0');
  _tooltip.style.setProperty('display', 'flex');
  _tooltip.style.setProperty('flex-direction', 'column');
  _tooltip.style.setProperty('align-items', 'flex-start');
  _tooltip.style.setProperty('pointer-events', 'none');
  _tooltip.style.setProperty('background-color', '#EEE');
  _tooltip.style.setProperty('box-shadow', '0 2px 4px rgba(0,0,0,.2)');
  _tooltip.style.setProperty('border-radius', '4px');

  function closeTooltip() {
    touchMoveAbortController?.abort();
    touchMoveAbortController = null;
    _tooltip.innerText = '';
  }

  const _fmtDate =
    opts && opts.fmtDate && typeof opts.fmtDate === 'function' ? opts.fmtDate : (ts) => new Date(ts).toLocaleString();
  const _stroke =
    opts && opts.stroke && typeof opts.stroke === 'function'
      ? opts.stroke
      : (u, seriesIdx, dataIdx) => u.series[seriesIdx]._stroke;
  const _label =
    opts && opts.label && typeof opts.label === 'function'
      ? opts.label
      : (u, seriesIdx, dataIdx) => u.series[seriesIdx].label;
  const _value =
    opts && opts.value && typeof opts.value === 'function'
      ? opts.value
      : (u, seriesIdx, dataIdx) => u.legend.values[seriesIdx]['_'];

  let currIndex;

  return {
    hooks: {
      destroy() {
        touchMoveAbortController?.abort();
        _tooltip.remove();
      },
      ready: () => {
        document.body.appendChild(_tooltip);
      },
      setCursor: (u) => {
        _tooltip.innerText = '';
        const didx = u.cursor.idxs[0];
        const xValue = u.data[0][didx];

        if (xValue) {
          const timeHeader = document.createElement('div');
          timeHeader.style.setProperty('padding', '8px');
          timeHeader.style.setProperty('font-size', '12px');
          timeHeader.style.setProperty('font-weight', '600');
          timeHeader.style.setProperty('text-align', 'center');
          const seriesTable = document.createElement('table');
          seriesTable.style.setProperty('font-size', '12px');
          seriesTable.style.setProperty('padding', '0 4px 4px 4px');
          u.series.forEach((series, i) => {
            if (series.scale === 'x') {
              const value = u.legend.values[i]['_'];
              if (value != null) {
                const currTs = u.data[0][didx];
                timeHeader.innerText = _fmtDate(currTs);
              }
            } else if (series.show) {
              const value = _value(u, i, u.cursor.idx);
              if (value != null) {
                const tr = document.createElement('tr');
                const tdLabel = document.createElement('td');
                tdLabel.style.setProperty('padding-right', '4px');
                const tdValue = document.createElement('td');
                tdValue.style.setProperty('text-align', 'right');
                const indicator = document.createElement('div');
                indicator.style.setProperty('display', 'inline-block');
                indicator.style.setProperty('height', '2px');
                indicator.style.setProperty('width', '12px');
                indicator.style.setProperty('margin', '0 4px 3px 0');
                indicator.style.setProperty('background-color', _stroke(u, i, u.cursor.idx));
                const label = document.createElement('span');
                label.style.setProperty('font-weight', '600');
                label.innerText = _label(u, i, u.cursor.idx);
                tdLabel.appendChild(indicator);
                tdLabel.appendChild(label);
                tdValue.innerText = value;
                tr.appendChild(tdLabel);
                tr.appendChild(tdValue);
                seriesTable.appendChild(tr);
              }
            }
          });

          if (seriesTable.querySelectorAll('tr').length) {
            _tooltip.appendChild(timeHeader);
            _tooltip.appendChild(seriesTable);
          }

          /**
           * Positions the tooltip.
           */
          if (currIndex !== didx) {
            currIndex = didx;
            const xPos = u.cursor.left;
            const left = xPos !== undefined ? xPos : 0;
            const rootRect = u.root.getBoundingClientRect();
            const height = _tooltip.clientHeight;
            const width = _tooltip.clientWidth;
            let translateX = rootRect.left + (Math.round(left) + u.bbox.left + 8);
            let translateY = rootRect.top + u.cursor.top + 4;
            if (translateY + height > window.innerHeight) {
              translateY = window.innerHeight - height - 4;
            }
            if (translateX + width > window.innerWidth - 4) {
              translateX = translateX - width - 16;
            }
            _tooltip.style.setProperty('transform', 'translate(' + translateX + 'px, ' + translateY + 'px)');

            if (!touchMoveAbortController) {
              touchMoveAbortController = new AbortController();
              window.addEventListener('touchmove', closeTooltip, {
                signal: touchMoveAbortController.signal,
              });
            }
          }
        }
      },
    },
  };
}
