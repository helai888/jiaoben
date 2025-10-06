[rewrite_local]
^https?://maoyan\.com/(my/odea|maoyansh/myshow) url script-response-body https://raw.githubusercontent.com/helai888/jiaoben/refs/heads/main/Maoyan.js

[mitm]
hostname = maoyan.com
