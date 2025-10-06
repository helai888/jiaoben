// maoyan_fix_debug.js
// 兼容 Loon / Quantumult X / Surge
// 增强版：更宽松的 URL 匹配、JSON 与字符串双路处理、调试通知

(function () {
  var url = ($request && $request.url) || '';
  var body = ($response && $response.body) || '';
  var modified = false;
  var debugMsgs = [];

  function notify(title, sub, msg) {
    // 兼容多平台通知方法（优先使用 $notification）
    try {
      if (typeof $notification !== 'undefined' && $notification.post) {
        $notification.post(title, sub, msg);
      } else if (typeof $notify !== 'undefined') {
        $notify(title + ' ' + sub + '\n' + msg);
      }
    } catch (e) {}
  }

  function safeParse(s) {
    try { return JSON.parse(s); } catch (e) { return null; }
  }

  function modifyKeys(target, changes) {
    if (!target || typeof target !== 'object') return 0;
    var count = 0;
    for (var k in target) {
      if (!Object.prototype.hasOwnProperty.call(target, k)) continue;
      if (changes.hasOwnProperty(k) && target[k] !== changes[k]) {
        target[k] = changes[k];
        count++;
      }
      if (typeof target[k] === 'object' && target[k] !== null) {
        count += modifyKeys(target[k], changes);
      }
    }
    return count;
  }

  try {
    var json = safeParse(body);

    // 统一 URL 判断（忽略 query）
    if (/\/my\/odea\/project\/detail/i.test(url)) {
      debugMsgs.push('匹配接口: project/detail');
      if (json) {
        var c = modifyKeys(json, { stockOutRegister: 0, ticketStatus: 3, saleStatus: 3 });
        if (c > 0) { modified = true; debugMsgs.push('已修改 JSON 字段数量: ' + c); }
        body = JSON.stringify(json);
      } else {
        // 兜底字符串替换（更严格的正则，避免误替换）
        var before = body;
        body = body.replace(/("stockOutRegister"\s*:\s*)1\b/g, '$10')
                   .replace(/("ticketStatus"\s*:\s*)2\b/g, '$13')
                   .replace(/("saleStatus"\s*:\s*)4\b/g, '$13');
        if (body !== before) { modified = true; debugMsgs.push('已通过字符串替换修改项目响应'); }
      }
    } else if (/\/my\/odea\/showTickets\/validateStock/i.test(url)) {
      debugMsgs.push('匹配接口: showTickets/validateStock');
      if (json) {
        var c2 = modifyKeys(json, { success: true, error: null });
        if (c2 > 0) { modified = true; debugMsgs.push('已修改 JSON 字段数量: ' + c2); }
        body = JSON.stringify(json);
      } else {
        var before2 = body;
        body = body.replace(/("success"\s*:\s*)false\b/g, '$1true')
                   .replace(/("error"\s*:\s*)([^,\}\]]+)/g, '$1null');
        if (body !== before2) { modified = true; debugMsgs.push('已通过字符串替换修改 validateStock 响应'); }
      }
    } else if (/\/maoyansh\/myshow\/ajax\/channelPage\/floorPerfs/i.test(url) ||
               /\/channelPage\/floorPerfs/i.test(url)) {
      debugMsgs.push('匹配接口: floorPerfs');
      if (json) {
        var c3 = modifyKeys(json, { remainingStock: 2297, showStatus: 0 });
        if (c3 > 0) { modified = true; debugMsgs.push('已修改 JSON 字段数量: ' + c3); }
        body = JSON.stringify(json);
      } else {
        var before3 = body;
        body = body.replace(/("remainingStock"\s*:\s*)0\b/g, '$12297')
                   .replace(/("showStatus"\s*:\s*)2\b/g, '$10');
        if (body !== before3) { modified = true; debugMsgs.push('已通过字符串替换修改 floorPerfs 响应'); }
      }
    } else {
      debugMsgs.push('未匹配任何目标 URL（' + url + '）');
    }
  } catch (err) {
    debugMsgs.push('脚本内部异常：' + err.message);
  }

  // 发送简短通知（便于你立刻看见是否被触发）
  if (modified) {
    notify('猫眼修复脚本', '已修改响应', debugMsgs.join(' | '));
  } else {
    // 若脚本被触发但未修改，发送轻量提示以便排查
    notify('猫眼修复脚本', '已触发但无修改', debugMsgs.join(' | '));
  }

  $done({ body: body });
})();
