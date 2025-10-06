// maoyan_fix.js
// 兼容 Quantumult X / Loon / Surge 的 http-response 脚本
// 优先 JSON 深度修改，解析失败时用正则兜底
(function () {
  var url = $request && $request.url || '';
  var resHeaders = $response && $response.headers ? $response.headers : {};
  var body = $response && $response.body ? $response.body : '';
  var modified = false;
  var notes = [];

  function safeNotify(title, msg) {
    try {
      if (typeof $notification !== 'undefined' && $notification.post) {
        $notification.post(title, '', msg);
      } else if (typeof $notify !== 'undefined') {
        $notify(title + ' ' + msg);
      }
    } catch (e) {}
  }

  // 深度修改对象中的字段，返回修改次数
  function modifyDeep(obj, map) {
    var cnt = 0;
    if (!obj || typeof obj !== 'object') return 0;
    try {
      for (var k in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
        if (map.hasOwnProperty(k) && obj[k] !== map[k]) {
          obj[k] = map[k];
          cnt++;
        }
        if (obj[k] && typeof obj[k] === 'object') {
          cnt += modifyDeep(obj[k], map);
        }
      }
    } catch (e) {}
    return cnt;
  }

  // 正则/转义替换兜底
  function fallbackReplace(text) {
    var before = text;
    try {
      // 标准 JSON 样式替换
      text = text.replace(/("stockOutRegister"\s*:\s*)1\b/g, '$10')
                 .replace(/("ticketStatus"\s*:\s*)2\b/g, '$13')
                 .replace(/("saleStatus"\s*:\s*)4\b/g, '$13')
                 .replace(/("success"\s*:\s*)false\b/g, '$1true')
                 .replace(/("error"\s*:\s*)(null|"(?:[^"]*)"|[^,\}\]]+)/g, '"error":null')
                 .replace(/("remainingStock"\s*:\s*)0\b/g, '$12297')
                 .replace(/("showStatus"\s*:\s*)2\b/g, '$10');

      // 转义 JSON（字符串内带 JSON）
      text = text.replace(/\\"stockOutRegister\\"\\s*:\\s*1\b/g, '\\"stockOutRegister\\":0')
                 .replace(/\\"ticketStatus\\"\\s*:\\s*2\b/g, '\\"ticketStatus\\":3')
                 .replace(/\\"saleStatus\\"\\s*:\\s*4\b/g, '\\"saleStatus\\":3')
                 .replace(/\\"success\\"\\s*:\\s*false\b/g, '\\"success\\":true')
                 .replace(/\\"error\\"\\s*:\\s*(?:\\"[^\\"]*\\"|null|[^\\},\\]]+)/g, '\\"error\\":null')
                 .replace(/\\"remainingStock\\"\\s*:\\s*0\b/g, '\\"remainingStock\\":2297')
                 .replace(/\\"showStatus\\"\\s*:\\s*2\b/g, '\\"showStatus\\":0');

      // 无引号或压缩无空格的形式
      text = text.replace(/stockOutRegister[:：]?1\b/g, 'stockOutRegister:0')
                 .replace(/ticketStatus[:：]?2\b/g, 'ticketStatus:3')
                 .replace(/saleStatus[:：]?4\b/g, 'saleStatus:3')
                 .replace(/success[:：]?false\b/g, 'success:true')
                 .replace(/remainingStock[:：]?0\b/g, 'remainingStock:2297')
                 .replace(/showStatus[:：]?2\b/g, 'showStatus:0')
                 .replace(/"error"\s*:\s*[^,\}\]]+/g, '"error":null');
    } catch (e) {}
    return { text: text, changed: text !== before };
  }

  try {
    var len = 0;
    try { len = body ? body.length : 0; } catch (e) { len = 0; }

    if (len === 0) {
      notes.push('空响应，未修改');
    } else {
      // 尝试 JSON 解析并深度修改
      var obj = null;
      try { obj = JSON.parse(body); } catch (e) { obj = null; }

      if (obj) {
        var totalChanges = 0;
        if (/\/my\/odea\/project\/detail/i.test(url)) {
          totalChanges += modifyDeep(obj, { stockOutRegister: 0, ticketStatus: 3, saleStatus: 3 });
          if (totalChanges > 0) notes.push('project/detail JSON 修改:' + totalChanges);
        }
        if (/\/my\/odea\/showTickets\/validateStock/i.test(url)) {
          var c2 = modifyDeep(obj, { success: true, error: null });
          if (c2 > 0) { totalChanges += c2; notes.push('validateStock JSON 修改:' + c2); }
        }
        if (/\/maoyansh\/myshow\/ajax\/channelPage\/floorPerfs/i.test(url) ||
            /\/channelPage\/floorPerfs/i.test(url)) {
          var c3 = modifyDeep(obj, { remainingStock: 2297, showStatus: 0 });
          if (c3 > 0) { totalChanges += c3; notes.push('floorPerfs JSON 修改:' + c3); }
        }

        if (totalChanges > 0) {
          modified = true;
          body = JSON.stringify(obj);
        } else {
          // 字段可能在字符串里，序列化后全文替换
          var r = fallbackReplace(JSON.stringify(obj));
          if (r.changed) { modified = true; notes.push('序列化后全文替换'); body = r.text; }
          else { body = JSON.stringify(obj); }
        }
      } else {
        // 非 JSON 响应走正则兜底
        var r2 = fallbackReplace(body);
        if (r2.changed) { modified = true; notes.push('非JSON 全文替换'); body = r2.text; }
      }
    }
  } catch (e) {
    notes.push('脚本异常:' + e.message);
  }

  // 取一个简短片段放 header 用于快速验证（不暴露太长）
  function sampleTxt(txt) {
    try {
      var m = txt.match(/(.{0,80}(stockOutRegister|ticketStatus|saleStatus|remainingStock|showStatus|success|error).{0,80})/i);
      if (m && m[1]) return m[1].slice(0,180).replace(/\n/g,' ');
    } catch (e) {}
    return '';
  }

  var snippet = sampleTxt(body) || '[no-snippet]';
  notes.push('片段:' + (snippet.length > 0 ? snippet : '[no-snippet]'));
  safeNotify('maoyan 修复', notes.join(' | '));

  // 注入响应头，方便 QX/Loon 验证
  var outHeaders = Object.assign({}, resHeaders);
  outHeaders['X-Maoyan-Patched'] = modified ? '1' : '0';
  outHeaders['X-Maoyan-Snippet'] = snippet;

  $done({
    body: body,
    headers: outHeaders
  });
})();
