// 不修改 body，仅注入头 X-Maoyan-Capture / X-Maoyan-Length / X-Maoyan-Snippet
(function () {
  var url = $request && $request.url || '';
  var body = $response && $response.body || '';
  var headers = $response && $response.headers ? $response.headers : {};
  var len = 0;
  try { len = body ? body.length : 0; } catch (e) { len = 0; }
  var snippet = '';
  try { snippet = (body && typeof body === 'string') ? body.replace(/\r?\n/g,' ').slice(0,200) : ''; } catch(e){}
  try { if (typeof $notification !== 'undefined' && $notification.post) $notification.post('maoyan 诊断', '', (url.length>120?url.slice(0,120)+'...':url)+' len=' + len); } catch(e){}
  headers = Object.assign({}, headers, { 'X-Maoyan-Capture': '1', 'X-Maoyan-Length': String(len), 'X-Maoyan-Snippet': snippet || '[no-snippet]' });
  $done({ body: body, headers: headers });
})();
