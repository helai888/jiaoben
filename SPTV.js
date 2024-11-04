#!name=屏蔽视频TV广告替换
#!desc=检测广告视频并替换为自定义m3u8链接
# 本模块检测指定广告视频链接并将其替换为自定义内容

[Script]
# 使用正则表达式检测并替换广告视频链接
^https:\/\/(?:m3u8\.hmrvideo\.com|api\.heimuer\.app)\/play\/[a-z0-9]{32}\.m3u8$ url replace https://m3u8.hmrvideo.com/play/yourcustomhash.m3u8

[MITM]
hostname = m3u8.hmrvideo.com, api.heimuer.app
