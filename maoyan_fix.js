// maoyan_fix_final.js - 激进版（会注入 X-Maoyan-Patched 响应头）
// 适配 Loon http-response
(function () {
  var url = $request && $request.url || '';
  var body = $response && $response.body || '';
  var modified = false;
  var actions = [];

  function notify(title, msg) {
    try {
      if (typeof $notification !== 'undefined' && $notification.post) {
        $notification.post(title, '', msg);
      } else if (typeof $notify !== 'undefined') {
        $notify(title + ' ' + msg);
      }
    } catch (e) {}
  }

  function modifyDeep(obj, map) {
    var c = 0;
    if (!obj || typeof obj !== 'object') return 0;
    try {
      for (var k in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
        if (map.hasOwnProperty(k) && obj[k] !== map[k]) {
          obj[k] = map[k];
          c++;
        }
        if (obj[k] && typeof obj[k] === 'object') c += modifyDeep(obj[k], map);
      }
    } catch (e) {}
    return c;
  }

  function aggressiveReplace(txt) {
    var before = txt;
    // 标准 JSON 替换
    txt = txt.replace(/("stockOutRegister"\s*:\s*)1\b/g, '$10')
             .replace(/("ticketStatus"\s*:\s*)2\b/g, '$13')
             .replace(/("saleStatus"\s*:\s*)4\b/g, '$13')
             .replace(/("success"\s*:\s*)false\b/g, '$1true')
             .replace(/("error"\s*:\s*)(null|"(?:[^"]*)"|[^,\}\]]+)/g, '"error":null')
             .replace(/("remainingStock"\s*:\s*)0\b/g, '$12297')
             .replace(/("showStatus"\s*:\s*)2\b/g, '$10');

    // 转义 JSON（例如："{\"stockOutRegister\":1}"）
    txt = txt.replace(/\\?"stockOutRegister\\?"\\s*[:：]\\s*1\b/g, function(m){ return m.replace(/1\b/,'0'); })
             .replace(/\\?"ticketStatus\\?"\\s*[:：]\\s*2\b/g, function(m){ return m.replace(/2\b/,'3'); })
             .replace(/\\?"saleStatus\\?"\\s*[:：]\\s*4\b/g, function(m){ return m.replace(/4\b/,'3'); })
             .replace(/\\?"success\\?"\\s*[:：]\\s*false\b/g, function(m){ return m.replace(/false\b/,'true'); })
             .replace(/\\?"error\\?"\\s*[:：]\\s*(?:\\"[^\\"]*\\"|null|[^\\},\\]]+)/g, '"error":null')
             .replace(/\\?"remainingStock\\?"\\s*[:：]\\s*0\b/g, function(m){ return m.replace(/0\b/,'2297'); })
             .replace(/\\?"showStatus\\?"\\s*[:：]\\s*2\b/g, function(m){ return m.replace(/2\b/,'0'); });

    // 非引号、无空格的形式
    txt = txt.replace(/stockOutRegister[:：]?1\b/g, 'stockOutRegister:0')
             .replace(/ticketStatus[:：]?2\b/g, 'ticketStatus:3')
             .replace(/saleStatus[:：]?4\b/g, 'saleStatus:3')
             .replace(/success[:：]?false\b/g, 'success:true')
             .replace(/remainingStock[:：]?0\b/g, 'remainingStock:2297')
             .replace(/showStatus[:：]?2\b/g, 'showStatus:0')
             .replace(/"error"\s*:\s*[^,\}\]]+/g, '"error":null');

    return { text: txt, changed: txt !== before };
  }

  try {
    var json = null;
    try { json = JSON.parse(body); } catch (e) { json = null; }

    if (json) {
      // 优先 JSON 深度修改
      if (/\/my\/odea\/project\/detail/i.test(url)) {
        var c = modifyDeep(json, { stockOutRegister: 0, ticketStatus: 3, saleStatus: 3 });
        if (c > 0) { modified = true; actions.push('project/detail JSON 修改:' + c); }
      }
      if (/\/my\/odea\/showTickets\/validateStock/i.test(url)) {
        var c2 = modifyDeep(json, { success: true, error: null });
        if (c2 > 0) { modified = true; actions.push('validateStock JSON 修改:' + c2); }
      }
      if (/\/maoyansh\/myshow\/ajax\/channelPage\/floorPerfs/i.test(url) ||
          /\/channelPage\/floorPerfs/i.test(url)) {
        var c3 = modifyDeep(json, { remainingStock: 2297, showStatus: 0 });
        if (c3 > 0) { modified = true; actions.push('floorPerfs JSON 修改:' + c3); }
      }
      if (!modified) {
        // JSON 序列化后全文替换（处理字段被字符串化的情况）
        var r = aggressiveReplace(JSON.stringify(json));
        if (r.changed) { modified = true; actions.push('序列化后全文替换'); body = r.text; }
        else { body = JSON.stringify(json); }
      } else {
        body = JSON.stringify(json);
      }
    } else {
      // 非 JSON 响应直接全文替换
      var r2 = aggressiveReplace(body);
      if (r2.changed) { modified = true; actions.push('非 JSON 全文替换'); body = r2.text; }
    }
  } catch (e) {
    actions.push('脚本异常:' + e.message);
  }

  // 截取一段样例供调试（不暴露过长内容）
  function sample(txt) {
    try {
      var m = txt.match(/(.{0,80}(stockOutRegister|ticketStatus|saleStatus|remainingStock|showStatus|success|error).{0,80})/i);
      if (m) return m[1].slice(0,240).replace(/\n/g,' ');
    } catch(e) {}
    return '';
  }

  var snippet = sample(body);
  if (modified) actions.push('样例:' + (snippet || '[无片段]'));
  else actions.push('未检测到修改目标 | 样例:' + (snippet || '[无片段]'));

  // 发送通知（可能被系统或 App 限制），并注入响应头 X-Maoyan-Patched: 1（方便在 Loon 请求详情确认）
  notify('猫眼脚本', actions.join(' | '));

  // 返回并注入自定义头，便于在 Loon 请求详情确认脚本是否生效
  $done({ body: body, headers: Object.assign({}, $response.headers || {}, { 'X-Maoyan-Patched': modified ? '1' : '0' }) });
})();
