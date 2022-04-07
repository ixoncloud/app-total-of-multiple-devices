export function touchSelectPlugin(opts) {
  const _threshold =
    opts && opts.threshold && typeof opts.threshold === 'number'
      ? opts.threshold
      : 10;

  function init(u) {
    let startX = null;
    let endX = null;
    let rect;

    u.over.addEventListener('touchstart', function(e) {
      rect = u.over.getBoundingClientRect();
      rememberStartPosition(e);
      document.addEventListener('touchmove', handleTouchmove, {
        passive: true,
      });
    });

    u.over.addEventListener('touchend', function(e) {
      rememberEndPosition(e);
      processSelection();
      document.removeEventListener('touchmove', handleTouchmove, {
        passive: true,
      });
    });

    function handleTouchmove(e) {
      rememberEndPosition(e);
      renderSelection();
    }

    /**
     * Renders visually selected region.
     */
    function renderSelection() {
      if (startX !== null && endX !== null) {
        const min = Math.min(startX, endX);
        const max = Math.max(startX, endX);
        const range = max - min;
        if (range >= _threshold) {
          const left = min;
          const top = 0;
          const width = range;
          const height = rect.height;
          u.setSelect({ left, top, width, height }, false);
        } else {
          u.setSelect({ left: 0, top: 0, width: 0, height: 0 }, false);
        }
      }
    }

    /**
     * Processes selection by zooming in and firing the 'setSelect" hook.
     */
    function processSelection() {
      if (startX !== null && endX !== null) {
        const min = Math.min(startX, endX);
        const max = Math.max(startX, endX);
        const range = max - min;
        if (range >= _threshold) {
          u.setScale('x', {
            min: u.posToVal(min, 'x'),
            max: u.posToVal(max, 'x'),
          });
          const left = min;
          const top = 0;
          const width = range;
          const height = rect.height;
          u.setSelect({ left, top, width, height });
        }
      }
      u.setSelect({ left: 0, top: 0, width: 0, height: 0 }, false);
      forgetPositions();
    }

    function forgetPositions() {
      startX = null;
      endX = null;
    }

    function rememberStartPosition(e) {
      const pageX = e.pageX ? e.pageX : e.touches[0].pageX
      startX = pageX - rect.left;
    }

    function rememberEndPosition(e) {
      let pageX = 0;
      if(e.pageX) {
        pageX = e.pageX;
      } else if(e.changedTouches.length > 0) {
        pageX = e.changedTouches[0].pageX;
      } else if(e.touches.length > 0) {
        pageX = e.touches[0].pageX;
      }

      let x = pageX - rect.left;
      if (x < 0) {
        x = 0;
      }
      if (x > rect.width) {
        x = rect.width;
      }
      endX = x;
    }
  }

  return {
    hooks: {
      init,
    },
  };
}
