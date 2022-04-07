export function whileMoreAfter(doFn) {
  let _type;
  const _fetcher = (moreAfter, seed = []) => {
    return doFn(moreAfter).then(res => {
      if (_type === undefined) {
        _type = res.type;
      }
      const data = [...seed, ...res.data];
      return res.moreAfter
        ? _fetcher(res.moreAfter, data)
        : Promise.resolve(data);
    });
  };
  return _fetcher().then(data => ({
    type: _type,
    data,
    moreAfter: null,
    status: 'success',
  }));
}
