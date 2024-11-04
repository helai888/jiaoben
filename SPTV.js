/*
91系列视频

[rewrite_local]

# 添加新的链接规则，适配 `https://api.heimuer.app/play` 的链接
https:\/\/(hjll\.rmanf\.cn|api\.heimuer\.app)\/api\/app\/vid\/h5\/m3u8\/\S+\.m3u8\?token=[^&]+&c=https:\/\/haijiaode\.zgtcpt\.shop url script-request-header https://raw.githubusercontent.com/Yu9191/Rewrite/main/m3u8/91anwang.js

[mitm]
hostname = *.cloudfront.net, *.ninghaixin.club, *.wbwxe.com, wbapi.wbwxe.com, d13dw8kzjnavm.cloudfront.net, hxnd.*.vip, hjll.rmanf.cn, haijiaode.zgtcpt.shop, api.heimuer.app
*/
