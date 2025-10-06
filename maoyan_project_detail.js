let body = $response.body;
if (body) {
  body = body
    .replace(/"stockOutRegister":1/g, '"stockOutRegister":0')
    .replace(/"ticketStatus":2/g, '"ticketStatus":3')
    .replace(/"saleStatus":4/g, '"saleStatus":3');
  $done({ body });
} else {
  $done({});
}
