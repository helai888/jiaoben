[Script]
# 精确接口（推荐开启）
http-response ^https?:\/\/.*\.maoyan\.com\/my\/odea\/project\/detail script-path=https://raw.githubusercontent.com/helai888/jiaoben/main/maoyan_fix.js
http-response ^https?:\/\/.*\.maoyan\.com\/my\/odea\/showTickets\/validateStock script-path=https://raw.githubusercontent.com/helai888/jiaoben/main/maoyan_fix.js
http-response ^https?:\/\/.*\.maoyan\.com\/maoyansh\/myshow\/ajax\/channelPage\/floorPerfs script-path=https://raw.githubusercontent.com/helai888/jiaoben/main/maoyan_fix.js

# 可选调试：临时捕获 maoyan 其他接口（开启过多会影响性能，调试完请关闭）
# http-response ^https?:\/\/.*\.maoyan\.com\/.* script-path=https://raw.githubusercontent.com/helai888/jiaoben/main/maoyan_capture.js

[MITM]
hostname = *.maoyan.com
