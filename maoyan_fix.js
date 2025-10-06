// maoyan_fix_aggresive.js
// 更激进、更健壮的猫眼修复脚本（Loon http-response）
// 说明：优先 JSON 修改；JSON 解析失败时走全文替换（含转义 JSON）

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

  // 深度查找并修改对象中的字段（返回修改次数）
  function modifyDeep(obj, map) {
    var count = 0;
    if (!obj || typeof obj !== 'object') return 0;
    try {
      for (var k in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
        if (map.hasOwnProperty(k) && obj[k] !== map[k]) {
          obj[k] = map[k];
          count++;
        }
        if (obj[k] && typeof obj[k] === 'object') {
          count += modifyDeep(obj[k], map);
        }
      }
    } catch (e) {}
    return count;
  }

  // 对给定文本做多种正则替换（普通 / 转义 JSON / 含空格压缩 等）
  function aggressiveReplace(txt) {
    var before = txt;
    // 普通 JSON 样式替换
    txt = txt.replace(/("stockOutRegister"\s*:\s*)1\b/g, '$10')
             .replace(/("ticketStatus"\s*:\s*)2\b/g, '$13')
             .replace(/("saleStatus"\s*:\s*)4\b/g, '$13')
             .replace(/("success"\s*:\s*)false\b/g, '$1true')
             .replace(/("error"\s*:\s*)(null|"(?:[^"]*)"|[^,\}\]]+)/g, '"error":null')
             .replace(/("remainingStock"\s*:\s*)0\b/g, '$12297')
             .replace(/("showStatus"\s*:\s*)2\b/g, '$10');

    // 转义 JSON（例如："{\"stockOutRegister\":1,...}"）
    txt = txt.replace(/\\"stockOutRegister\\"\\s*:\\s*1\b/g, '\\"stockOutRegister\\"\\:0')
             .replace(/\\"ticketStatus\\"\\s*:\\s*2\b/g, '\\"ticketStatus\\"\\:3')
             .replace(/\\"saleStatus\\"\\s*:\\s*4\b/g, '\\"saleStatus\\"\\:3')
             .replace(/\\"success\\"\\s*:\\s*false\b/g, '\\"success\\"\\:true')
             .replace(/\\"error\\"\\s*:\\s*(?:\\"[^\\"]*\\"|null|[^\\},\\]]+)/g, '\\"error\\":null')
             .replace(/\\"remainingStock\\"\\s*:\\s*0\b/g, '\\"remainingStock\\"\\:2297')
             .replace(/\\"showStatus\\"\\s*:\\s*2\b/g, '\\"showStatus\\"\\:0');

    // 更宽松的数字替换（避免被格式化或无空格）
    txt = txt.replace(/stockOutRegister\s*:\s*1\b/g, 'stockOutRegister:0')
             .replace(/ticketStatus\s*:\s*2\b/g, 'ticketStatus:3')
             .replace(/saleStatus\s*:\s*4\b/g, 'saleStatus:3')
             .replace(/success\s*:\s*false\b/g, 'success:true')
             .replace(/"error"\s*:\s*[^,\}\]]+/g, '"error":null')
             .replace(/remainingStock\s*:\s*0\b/g, 'remainingStock:2297')
             .replace(/showStatus\s*:\s*2\b/g, 'showStatus:0');

    return { text: txt, changed: txt !== before };
  }

  try {
    // 优先尝试解析为 JSON 并深度修改
    var json = null;
    try { json = JSON.parse(body); } catch (e) { json = null; }

    if (json) {
      var mapProject = { stockOutRegister: 0, ticketStatus: 3, saleStatus: 3 };
      var mapValidate = { success: true, error: null };
      var mapFloor = { remainingStock: 2297, showStatus: 0 };

      var count = 0;
      if (/\/my\/odea\/project\/detail/i.test(url)) {
        count = modifyDeep(json, mapProject);
        if (count > 0) { modified = true; actions.push('project/detail JSON 修改: ' + count); }
      }
      if (/\/my\/odea\/showTickets\/validateStock/i.test(url)) {
        var c2 = modifyDeep(json, mapValidate);
        if (c2 > 0) { modified = true; actions.push('validateStock JSON 修改: ' + c2); }
      }
      if (/\/maoyansh\/myshow\/ajax\/channelPage\/floorPerfs/i.test(url) ||
          /\/channelPage\/floorPerfs/i.test(url)) {
        var c3 = modifyDeep(json, mapFloor);
        if (c3 > 0) { modified = true; actions.push('floorPerfs JSON 修改: ' + c3); }
      }

      if (modified) {
        body = JSON.stringify(json);
      } else {
        // JSON 解析成功但没修改（字段可能嵌在字符串里）—— 继续做 aggressive 替换
        var r = aggressiveReplace(JSON.stringify(json));
        if (r.changed) {
          modified = true;
          actions.push('JSON 序列化后进行全文替换');
          body = r.text;
        } else {
          // 不修改 JSON 原样返回
          body = JSON.stringify(json);
        }
      }
    } else {
      // 非 JSON 响应，走全文替换（含转义 JSON）
      var r2 = aggressiveReplace(body);
      if (r2.changed) {
        modified = true;
        actions.push('非 JSON 响应全文替换');
        body = r2.text;
      }
    }
  } catch (e) {
    actions.push('脚本异常: ' + e.message);
  }

  // 取一小段用于调试（修改前后无法直接比较，这里截取匹配字段周围的片段）
  function sampleSnippet(txt) {
    try {
      var m = txt.match(/(.{0,60}(stockOutRegister|ticketStatus|saleStatus|remainingStock|showStatus|success|error).{0,60})/i);
      if (m && m[1]) {
        var s = m[1];
        // 截短显示
        if (s.length > 200) s = s.slice(0, 200) + '...';
        return s.replace(/\n/g, ' ');
      }
    } catch (e) {}
    return '';
  }

  var snippet = sampleSnippet(body);
  if (modified) {
    actions.push('样例片段: ' + (snippet || '[未提取到片段]'));
    notify('猫眼脚本：已修改', actions.join(' | '));
  } else {
    actions.push('未检测到可修改字段 | 样例片段: ' + (snippet || '[未提取到片段]'));
    notify('猫眼脚本：已触发但未修改', actions.join(' | '));
  }

  $done({ body: body });
})();
