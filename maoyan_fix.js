// maoyan_fix.js

(function () {
  const url = $request.url;
  let body = $response?.body || '';
  if (!body) $done({});

  function modify(obj, map) {
    if (!obj || typeof obj !== 'object') return;
    for (let k in obj) {
      if (map.hasOwnProperty(k)) obj[k] = map[k];
      if (typeof obj[k] === 'object') modify(obj[k], map);
    }
  }

  try {
    let json = JSON.parse(body);

    if (/\/my\/odea\/project\/detail/.test(url)) {
      modify(json, { stockOutRegister: 0, ticketStatus: 3, saleStatus: 3 });
    } else if (/\/showTickets\/validateStock/.test(url)) {
      modify(json, { success: true, error: null });
    } else if (/\/floorPerfs/.test(url)) {
      modify(json, { remainingStock: 2297, showStatus: 0 });
    }

    body = JSON.stringify(json);
  } catch {
    // fallback 正则替换
    if (/\/my\/odea\/project\/detail/.test(url)) {
      body = body.replace(/"stockOutRegister"\s*:\s*1/g, '"stockOutRegister":0')
                 .replace(/"ticketStatus"\s*:\s*2/g, '"ticketStatus":3')
                 .replace(/"saleStatus"\s*:\s*4/g, '"saleStatus":3');
    } else if (/\/showTickets\/validateStock/.test(url)) {
      body = body.replace(/"success"\s*:\s*false/g, '"success":true')
                 .replace(/"error"\s*:\s*("[^"]*"|[^,\}\]]+)/g, '"error":null');
    } else if (/\/floorPerfs/.test(url)) {
      body = body.replace(/"remainingStock"\s*:\s*0/g, '"remainingStock":2297')
                 .replace(/"showStatus"\s*:\s*2/g, '"showStatus":0');
    }
  }

  $done({ body });
})();
