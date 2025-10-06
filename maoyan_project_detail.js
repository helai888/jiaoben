// maoyan_fix_detail.js
(function() {
  var body = $response.body;
  try {
    var obj = JSON.parse(body);
    if (obj && obj.data && obj.data.baseProjectVO) {
      obj.data.baseProjectVO.stockOutRegister = 0;
      obj.data.baseProjectVO.ticketStatus = 3;
      obj.data.baseProjectVO.saleStatus = 3;
    }
    $done({
      body: JSON.stringify(obj),
      headers: Object.assign({}, $response.headers, {
        'X-Maoyan-Patched': '1'
      })
    });
  } catch(e) {
    $done({body});
  }
})();
