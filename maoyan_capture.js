// maoyan_capture.js - 诊断脚本：不修改 body，只在 Header 注入长度与样例片段
(function () {
  var url = $request && $request.url || '';
  var body = $response && $response.body || '';
  var headers = $response && $response.headers ? $response.headers : {};
  var len = 0;
  try { len = body ? body.length : 0; } catch (e) { len = 0; }

  // 取前 200 字作为样例（去换行）
  var snippet = '';
  try {
    snippet = (body && typeof body === 'string') ? body.replace(/\r?\n/g, ' ').slice(0, 200) : '';
  } catch (e) { snippet = ''; }

  // 发送通知（便于立刻知道脚本被触发）
  try {
    if (typeof $notification !== 'undefined' && $notification.post) {
      $notification.post('maoyan 诊断触发', '', (url.length > 120 ? url.slice(0,120) + '...' : url) + '\nlen=' + len);
    }
  } catch (e) {}

  // 注入诊断头（注意 header 大小限制，snippet 最多 200 字）
  headers = Object.assign({}, headers, {
    'X-Maoyan-Capture': '1',
    'X-Maoyan-Length': String(len),
    'X-Maoyan-Snippet': snippet || '[no-snippet]'
  });

  $done({ body: body, headers: headers });
})();
