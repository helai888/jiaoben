let body = $response.body;
if (body) {
  body = body
    .replace(/"success":false/g, '"success":true')
    .replace(/"error":null/g, '"error":""');
  $done({ body });
} else {
  $done({});
}
