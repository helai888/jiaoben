#!name=屏蔽视频TV广告
#!desc=屏蔽并替换特定视频广告

[Rewrite]
^https:\/\/oss\.yingshi\.tv\/videos\/vod\/vi\/.*\.mp4 url 302 https://m3u8.hmrvideo.com/play/32a93186ea8a4629b5fcb542c0881cd6.m3u8

[MITM]
hostname = oss.yingshi.tv
