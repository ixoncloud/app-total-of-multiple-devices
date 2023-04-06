export function tapToActivatePlugin(tapTimeout) {
  let _active = false;
  let _ms = typeof tapTimeout === 'number' ? tapTimeout : 3000;
  let _timeout;

  const _blockLayer = document.createElement('div');
  _blockLayer.style.setProperty('position', 'absolute');
  _blockLayer.style.setProperty('top', '0');
  _blockLayer.style.setProperty('right', '0');
  _blockLayer.style.setProperty('bottom', '0');
  _blockLayer.style.setProperty('left', '0');
  _blockLayer.style.setProperty('z-index', '10');
  _blockLayer.style.setProperty('opacity', '0');

  function extendTapTimeout() {
    if (_active) {
      runTapTimeout();
    }
  }

  function runTapTimeout() {
    if (_timeout) {
      clearTimeout(_timeout);
    }
    _timeout = setTimeout(() => handleDeactivation(), _ms);
  }

  function handleTap() {
    if (!_active) {
      _active = true;
      _blockLayer.style.setProperty('pointer-events', 'none');
      runTapTimeout();
    }
  }

  function handleDeactivation() {
    if (_active) {
      _active = false;
      _blockLayer.style.removeProperty('pointer-events');
    }
  }

  function isTouchEnabled() {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0
    );
  }

  if (isTouchEnabled()) {
    return {
      hooks: {
        init: u => {
          const wrap = u.root.querySelector('.u-wrap');
          _blockLayer.addEventListener('click', handleTap);
          wrap.addEventListener('touchstart', extendTapTimeout);
          wrap.addEventListener('touchend', extendTapTimeout);
          wrap.addEventListener('touchmove', extendTapTimeout);
          wrap.appendChild(_blockLayer);
        },
        destroy: u => {
          const wrap = u.root.querySelector('.u-wrap');
          _blockLayer.removeEventListener('click', handleTap);
          wrap.removeEventListener('touchstart', extendTapTimeout);
          wrap.removeEventListener('touchend', extendTapTimeout);
          wrap.removeEventListener('touchmove', extendTapTimeout);
          wrap.removeChild(_blockLayer);
        },
      },
    };
  }

  return {};
}
