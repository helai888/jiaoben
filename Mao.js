/******************************************
 * @name 猫眼影票抢票
 * @description 修改猫眼影票响应，绕过缺货限制进入付款页面
 * @version 1.0.0
 * @update 2024-11-21
******************************************
脚本声明:
1. 本脚本仅用于学习研究，禁止用于商业用途
2. 本脚本不保证准确性、可靠性、完整性和及时性
3. 任何个人或组织均可无需经过通知而自由使用
4. 作者对任何脚本问题概不负责，包括由此产生的任何损失
5. 如果任何单位或个人认为该脚本可能涉嫌侵犯其权利，应及时通知并提供身份证明、所有权证明，我将在收到认证文件确认后删除
6. 请勿将本脚本用于商业用途，由此引起的问题与作者无关
7. 本脚本及其更新版权归作者所有
******************************************/

hostname = maoyan.com

# ========== 主要接口修改 ==========

# 项目详情接口 - 修改缺货状态
^https?://maoyan\.com/my/odea/project/detail url script-response-body https://raw.githubusercontent.com/helai888/jiaoben/main/maoyan.js

# 库存验证接口 - 修改验证结果  
^https?://maoyan\.com/my/odea/showTickets/validateStock url script-response-body https://raw.githubusercontent.com/helai888/jiaoben/main/maoyan.js

# 场次信息接口 - 修改剩余库存和状态
^https?://maoyan\.com/maoyansh/myshow/ajax/channelPage/floorPerfs url script-response-body https://raw.githubusercontent.com/helai888/jiaoben/main/maoyan.js

# ========== 备用接口修改 ==========

# 其他可能的相关接口
^https?://maoyan\.com/my/odea/order/create url script-response-body https://raw.githubusercontent.com/helai888/jiaoben/main/maoyan.js
^https?://maoyan\.com/my/odea/seats/check url script-response-body https://raw.githubusercontent.com/helai888/jiaoben/main/maoyan.js
^https?://maoyan\.com/my/odea/show/info url script-response-body https://raw.githubusercontent.com/helai888/jiaoben/main/maoyan.js

# ========== 阻止干扰请求 ==========

# 阻止错误弹窗
^https?://maoyan\.com/my/odea/error/popup url reject-200

# 阻止广告请求
^https?://maoyan\.com/ads/ url reject-200

# 阻止统计请求
^https?://maoyan\.com/analytics/ url reject-200
