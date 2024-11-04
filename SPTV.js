#!name=屏蔽视频TV广告
#!desc=屏蔽并动态替换特定视频广告

[Rewrite]
^https:\/\/oss\.yingshi\.tv\/videos\/vod\/vi\/(.*)\.mp4 url 302 https://m3u8.hmrvideo.com/play/$1.m3u8

[MITM]
hostname = oss.yingshi.tv, m3u8.hmrvideo.com
