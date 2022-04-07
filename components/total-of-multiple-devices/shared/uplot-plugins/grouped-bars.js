import { times } from 'lodash-es';
import uPlot from 'uplot';
import { stackValues } from '../utils/stack-values';

function pointWithin(px, py, rlft, rtop, rrgt, rbtm) {
  return px >= rlft && px <= rrgt && py >= rtop && py <= rbtm;
}

!(function (global) {
  const MAX_OBJECTS = 10;
  const MAX_LEVELS = 4;

  function Quadtree(x, y, w, h, l) {
    let t = this;

    t.x = x;
    t.y = y;
    t.w = w;
    t.h = h;
    t.l = l || 0;
    t.o = [];
    t.q = null;
  }

  const proto = {
    split: function () {
      let t = this,
        x = t.x,
        y = t.y,
        w = t.w / 2,
        h = t.h / 2,
        l = t.l + 1;

      t.q = [
        // top right
        new Quadtree(x + w, y, w, h, l),
        // top left
        new Quadtree(x, y, w, h, l),
        // bottom left
        new Quadtree(x, y + h, w, h, l),
        // bottom right
        new Quadtree(x + w, y + h, w, h, l),
      ];
    },

    // invokes callback with index of each overlapping quad
    quads: function (x, y, w, h, cb) {
      let t = this,
        q = t.q,
        hzMid = t.x + t.w / 2,
        vtMid = t.y + t.h / 2,
        startIsNorth = y < vtMid,
        startIsWest = x < hzMid,
        endIsEast = x + w > hzMid,
        endIsSouth = y + h > vtMid;

      // top-right quad
      startIsNorth && endIsEast && cb(q[0]);
      // top-left quad
      startIsWest && startIsNorth && cb(q[1]);
      // bottom-left quad
      startIsWest && endIsSouth && cb(q[2]);
      // bottom-right quad
      endIsEast && endIsSouth && cb(q[3]);
    },

    add: function (o) {
      let t = this;

      if (t.q != null) {
        t.quads(o.x, o.y, o.w, o.h, (q) => {
          q.add(o);
        });
      } else {
        let os = t.o;

        os.push(o);

        if (os.length > MAX_OBJECTS && t.l < MAX_LEVELS) {
          t.split();

          for (let i = 0; i < os.length; i++) {
            let oi = os[i];

            t.quads(oi.x, oi.y, oi.w, oi.h, (q) => {
              q.add(oi);
            });
          }

          t.o.length = 0;
        }
      }
    },

    get: function (x, y, w, h, cb) {
      let t = this;
      let os = t.o;

      for (let i = 0; i < os.length; i++) cb(os[i]);

      if (t.q != null) {
        t.quads(x, y, w, h, (q) => {
          q.get(x, y, w, h, cb);
        });
      }
    },

    clear: function () {
      this.o.length = 0;
      this.q = null;
    },
  };

  Object.assign(Quadtree.prototype, proto);

  global.Quadtree = Quadtree;
})(this);

function roundDec(val, dec) {
  return Math.round(val * (dec = 10 ** dec)) / dec;
}

const SPACE_BETWEEN = 1;
const SPACE_AROUND = 2;
const SPACE_EVENLY = 3;

const coord = (i, offs, iwid, gap) => roundDec(offs + i * (iwid + gap), 6);

function distr(numItems, sizeFactor, justify, onlyIdx, each) {
  let space = 1 - sizeFactor;

  let gap =
    justify == SPACE_BETWEEN
      ? space / (numItems - 1)
      : justify == SPACE_AROUND
      ? space / numItems
      : justify == SPACE_EVENLY
      ? space / (numItems + 1)
      : 0;

  if (isNaN(gap) || gap == Infinity) gap = 0;

  let offs = justify == SPACE_BETWEEN ? 0 : justify == SPACE_AROUND ? gap / 2 : justify == SPACE_EVENLY ? gap : 0;

  let iwid = sizeFactor / numItems;
  let _iwid = roundDec(iwid, 6);

  if (onlyIdx == null) {
    for (let i = 0; i < numItems; i++) each(i, coord(i, offs, iwid, gap), _iwid);
  } else each(onlyIdx, coord(onlyIdx, offs, iwid, gap), _iwid);
}

export function groupedBarsPlugin(opts) {
  let pxRatio;

  let radius = opts.radius ?? 0;

  function setPxRatio() {
    pxRatio = devicePixelRatio;
  }

  setPxRatio();

  window.addEventListener('dppxchange', setPxRatio);

  const ori = opts.ori;
  const dir = opts.dir;
  const stacked = opts.stacked;

  const groupWidth = 0.8;
  const groupDistr = SPACE_AROUND;

  const barWidth = 0.85;
  const barDistr = SPACE_AROUND;

  function distrTwo(groupCount, barCount, _groupWidth = groupWidth) {
    let out = Array.from({ length: barCount }, () => ({
      offs: Array(groupCount).fill(0),
      size: Array(groupCount).fill(0),
    }));

    distr(groupCount, _groupWidth, groupDistr, null, (groupIdx, groupOffPct, groupDimPct) => {
      distr(barCount, barWidth, barDistr, null, (barIdx, barOffPct, barDimPct) => {
        out[barIdx].offs[groupIdx] = groupOffPct + groupDimPct * barOffPct;
        out[barIdx].size[groupIdx] = groupDimPct * barDimPct;
      });
    });

    return out;
  }

  function distrOne(groupCount, barCount) {
    let out = Array.from({ length: barCount }, () => ({
      offs: Array(groupCount).fill(0),
      size: Array(groupCount).fill(0),
    }));

    distr(groupCount, groupWidth, groupDistr, null, (groupIdx, groupOffPct, groupDimPct) => {
      distr(barCount, barWidth, barDistr, null, (barIdx, barOffPct, barDimPct) => {
        out[barIdx].offs[groupIdx] = groupOffPct;
        out[barIdx].size[groupIdx] = groupDimPct;
      });
    });

    return out;
  }

  let barsPctLayout;
  let stackedBarsOffsets;

  let barsBuilder = uPlot.paths.bars({
    radius,
    disp: {
      x0: {
        unit: 2,
        //	discr: false, (unary, discrete, continuous)
        values: (u, seriesIdx, idx0, idx1) => barsPctLayout[seriesIdx].offs,
      },
      ...(stacked
        ? {
            y0: {
              values: (u, seriesIdx) => stackedBarsOffsets[seriesIdx].y0,
            },
            y1: {
              values: (u, seriesIdx) => stackedBarsOffsets[seriesIdx].y1,
            },
          }
        : {}),
      size: {
        unit: 2,
        //	discr: true,
        values: (u, seriesIdx, idx0, idx1) => barsPctLayout[seriesIdx].size,
      },
      ...opts.disp,
      /*
        // e.g. variable size via scale (will compute offsets from known values)
        x1: {
          units: 1,
          values: (u, seriesIdx, idx0, idx1) => bucketEnds[idx],
        },
      */
    },
  });

  function range(u, dataMin, dataMax) {
    if (stacked) {
      const [min, max] = times(u.data[0].length, (didx) =>
        u.data
          .map((d) => d[didx] || 0)
          .slice(1) // skip timestamp
          .reduce((acc, value) => (value > 0 ? { ...acc, pos: acc.pos + value } : { ...acc, neg: acc.neg + value }), {
            neg: 0,
            pos: 0,
          }),
      ).reduce((acc, minMax) => [Math.min(acc[0], minMax.neg), Math.max(acc[1], minMax.pos)], [0, 0]);

      return uPlot.rangeNum(min, max, 0.05, true);
    }

    return uPlot.rangeNum(dataMin, dataMax, 0.05, true);
  }

  let qt;

  return {
    hooks: {
      drawClear: (u) => {
        qt = qt || new Quadtree(0, 0, u.bbox.width, u.bbox.height);

        qt.clear();

        // force-clear the path cache to cause drawBars() to rebuild new quadtree
        u.series.forEach((s) => {
          s._paths = null;
        });

        const dataPointCount = u.data[0].length;
        const seriesCount = u.data.length - 1;
        if (stacked) {
          barsPctLayout = [null].concat(distrOne(dataPointCount, seriesCount));
          stackedBarsOffsets = [null].concat(stackValues(u.data, dataPointCount, seriesCount));
        } else if (u.series.length == 2) barsPctLayout = [null].concat(distrOne(dataPointCount, 1));
        else barsPctLayout = [null].concat(distrTwo(dataPointCount, seriesCount, dataPointCount == 1 ? 1 : groupWidth));

        if (ori == 0) {
          const dim = u.bbox.width / dataPointCount;
          times(dataPointCount, (i) =>
            qt.add({
              x: i * dim,
              y: 0,
              w: dim,
              h: u.bbox.height,
              didx: i,
            }),
          );
        } else {
          const dim = u.bbox.height / dataPointCount;
          times(dataPointCount, (i) =>
            qt.add({
              x: 0,
              y: i * dim,
              w: u.bbox.width,
              h: dim,
              didx: i,
            }),
          );
        }
      },
    },
    opts: (u, opts) => {
      const yScaleOpts = {
        range,
        ori: ori == 0 ? 1 : 0,
      };

      // hovered
      let hRect;

      uPlot.assign(opts, {
        cursor: {
          dataIdx: (u, seriesIdx) => {
            if (seriesIdx == 1) {
              hRect = null;

              let cx = u.cursor.left * pxRatio;
              let cy = u.cursor.top * pxRatio;

              qt.get(cx, cy, 1, 1, (o) => {
                if (pointWithin(cx, cy, o.x, o.y, o.x + o.w, o.y + o.h)) hRect = o;
              });
            }

            return hRect != null ? hRect?.didx : null;
          },
          points: {
            fill: 'rgba(255,255,255, 0.3)',
            bbox: () =>
              !!hRect
                ? {
                    left: hRect.x / devicePixelRatio,
                    top: hRect.y / devicePixelRatio,
                    width: hRect.w / devicePixelRatio,
                    height: hRect.h / devicePixelRatio,
                  }
                : { left: -10, top: -10, width: 0, height: 0 },
          },
        },
        scales: {
          x: {
            time: false,
            distr: 2,
            ori,
            dir,
          },
          left: yScaleOpts,
        },
      });

      if (ori == 1) {
        opts.padding = [0, null, 0, null];
      }

      const origValuesFn = opts.axes[0].values;
      const splitsWithIndices = (u) => {
        const dim = ori == 0 ? u.bbox.width : u.bbox.height;
        const _dir = dir * (ori == 0 ? 1 : -1);

        let splits = [];

        distr(u.data[0].length, groupWidth, groupDistr, null, (di, lftPct, widPct) => {
          let groupLftPx = (dim * lftPct) / pxRatio;
          let groupWidPx = (dim * widPct) / pxRatio;

          let groupCenterPx = groupLftPx + groupWidPx / 2;

          splits.push({ index: splits.length, val: u.posToVal(groupCenterPx, 'x') });
        });

        const result = _dir == 1 ? splits : splits.reverse();
        if (result.length < 6) {
          return result;
        }

        const avgLabelLength = origValuesFn(u).reduce((acc, v, _, arr) => acc + v.length / arr.length, 0);
        const labelSize = avgLabelLength * 15;
        const howMany = dim / labelSize;
        const mod = result.length / howMany;

        /**
         * Nice recursive function that calculates indices with a set separation.
         * Distributes more evenly than simply iterating.
         *
         * @param min the minimum index
         * @param max the maximum index
         * @param separation the minimal separation between two label indices
         * @return {*[]}
         */
        function indices(min, max, separation) {
          if (max <= min || max - min <= separation) {
            return [];
          }
          const halfway = min + (max - min) / 2;
          return [...indices(min, halfway, separation), Math.round(halfway), ...indices(halfway, max, separation)];
        }

        return [0, ...indices(0, result.length - 1, mod * 2), result.length - 1].map((i) => result[i]);
      };

      uPlot.assign(opts.axes[0], {
        splits: (u) => splitsWithIndices(u).map((s) => s.val),
        values: (u) => splitsWithIndices(u).map((s) => origValuesFn(u)[s.index]),
        gap: 15,
        size: ori == 0 ? 40 : 150,
        labelSize: 20,
        side: ori == 0 ? 2 : 3,
      });

      opts.series.forEach((s, i) => {
        if (i > 0) {
          uPlot.assign(s, {
            paths: barsBuilder,
          });
        }
      });
    },
  };
}
