# Loon 规则配置

[Rewrite]
# 屏蔽广告 - 去除以 .mp4 结尾的广告链接
^https:\/\/.*\/videos\/.*\.mp4$ reject

# 匹配任意域名的 m3u8 视频链接
^https:\/\/.*\/play\/[a-z0-9]{32}\.m3u8$ url script-request-header https://example.com/replace-m3u8.js

[MITM]
hostname = *
