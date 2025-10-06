let body = $response.body;
if (body) {
  body = body
    .replace(/"remainingStock":0/g, '"remainingStock":2297')
    .replace(/"showStatus":2/g, '"showStatus":0');
  $done({ body });
} else {
  $done({});
}
