#!name=猫眼测试
#!desc=测试脚本功能

[rewrite_local]
enable = true
猫眼测试 = type=http-response,pattern=^https?://maoyan\.com,script-path=https://raw.githubusercontent.com/helai888/jiaoben/refs/heads/main/maoyan.js,requires-body=true,timeout=10

[MITM]
enable = true
hostname = maoyan.com, *.maoyan.com
