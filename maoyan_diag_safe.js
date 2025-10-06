(function () {
  var url = $request && $request.url || '';
  var body = $response && $response.body || '';
  var headers = $response && $response.headers ? $response.headers : {};
  var len = 0;
  try { len = body ? body.length : 0; } catch (e) { len = 0; }

  try {
    if (typeof $notification !== 'undefined' && $notification.post) {
      $notification.post('maoyan 诊断已触发', '', (url.length > 140 ? url.slice(0,140) + '...' : url) + '\nlen=' + len);
    }
  } catch (e) {}

  headers = Object.assign({}, headers, {
    'X-Maoyan-Diag': '1',
    'X-Maoyan-Length': String(len)
  });

  $done({ body: body, headers: headers });
})();
