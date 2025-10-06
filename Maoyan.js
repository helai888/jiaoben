[Script]
# 修改 project/detail 响应体（必须放在 Script 区）
script-response-body ^https?:\/\/.*\.maoyan\.com\/my\/odea\/project\/detail script-path=https://raw.githubusercontent.com/helai888/jiaoben/main/maoyan_fix_detail.js, requires-body=true

[MITM]
hostname = *.maoyan.com
