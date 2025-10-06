// 猫眼修复脚本 - 增强版，兼容 Loon
(function () {
  var url = $request.url;
  var body = $response.body;
  var modified = false;
  var debugMsgs = [];

  function notify(title, msg) {
    try {
      if (typeof $notification !== 'undefined' && $notification.post) {
        $notification.post(title, '', msg);
      } else if (typeof $notify !== 'undefined') {
        $notify(title, msg);
      }
    } catch (e) {}
  }

  try {
    if (/\/my\/odea\/project\/detail/i.test(url)) {
      debugMsgs.push('匹配 project/detail');
      var before = body;
      body = body.replace(/("stockOutRegister"\s*:\s*)1\b/g, '$10')
                 .replace(/("ticketStatus"\s*:\s*)2\b/g, '$13')
                 .replace(/("saleStatus"\s*:\s*)4\b/g, '$13');
      if (body !== before) { modified = true; debugMsgs.push('已修改 project/detail'); }

    } else if (/\/my\/odea\/showTickets\/validateStock/i.test(url)) {
      debugMsgs.push('匹配 showTickets/validateStock');
      var before = body;
      body = body.replace(/("success"\s*:\s*)false\b/g, '$1true')
                 .replace(/("error"\s*:\s*)([^,\}\]]+)/g, '$1null');
      if (body !== before) { modified = true; debugMsgs.push('已修改 validateStock'); }

    } else if (/\/maoyansh\/myshow\/ajax\/channelPage\/floorPerfs/i.test(url) ||
               /\/channelPage\/floorPerfs/i.test(url)) {
      debugMsgs.push('匹配 floorPerfs');
      var before = body;
      body = body.replace(/("remainingStock"\s*:\s*)0\b/g, '$12297')
                 .replace(/("showStatus"\s*:\s*)2\b/g, '$10');
      if (body !== before) { modified = true; debugMsgs.push('已修改 floorPerfs'); }

    } else {
      debugMsgs.push('未匹配任何目标 URL');
    }
  } catch (err) {
    debugMsgs.push('脚本异常: ' + err.message);
  }

  if (modified) {
    notify('猫眼修复脚本', debugMsgs.join(' | '));
  } else {
    notify('猫眼修复脚本', '已触发但无修改 | ' + debugMsgs.join(' | '));
  }

  $done({ body: body });
})();
