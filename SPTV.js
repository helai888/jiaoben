#!name=屏蔽视频TV广告并替换
#!desc=屏蔽广告并替换播放链接
# 屏蔽指定广告视频链接，自动替换为自定义播放链接

[Script]
# 屏蔽广告视频链接，适配任意文件名
^https:\/\/oss\.yingshi\.tv\/videos\/vod\/vi\/.*\.mp4 url reject-dict

# 替换为自定义播放链接，适配任意文件名
^https:\/\/oss\.yingshi\.tv\/videos\/vod\/vi\/.*\.mp4 url replace https://m3u8.hmrvideo.com/play/yourcustomhash.m3u8

[MITM]
hostname = oss.yingshi.tv
