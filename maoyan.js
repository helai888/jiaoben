// 猫眼影票修复脚本
const url = $request.url;
const body = $response.body;

console.log('🐱 猫眼脚本已加载');

if (!body) {
    console.log('❌ 响应体为空');
    $done({body: body});
    return;
}

try {
    let obj = JSON.parse(body);
    let modified = false;

    // 项目详情接口
    if (url.includes('/my/odea/project/detail')) {
        if (obj.stockOutRegister === 1) {
            obj.stockOutRegister = 0;
            modified = true;
        }
        if (obj.ticketStatus === 2) {
            obj.ticketStatus = 3;
            modified = true;
        }
        if (obj.saleStatus === 4) {
            obj.saleStatus = 3;
            modified = true;
        }
    }
    
    // 库存验证接口
    else if (url.includes('/my/odea/showTickets/validateStock')) {
        if (obj.success === false) {
            obj.success = true;
            modified = true;
        }
        if (obj.error) {
            obj.error = null;
            modified = true;
        }
    }
    
    // 场次信息接口
    else if (url.includes('/maoyansh/myshow/ajax/channelPage/floorPerfs')) {
        if (obj.remainingStock === 0) {
            obj.remainingStock = 2297;
            modified = true;
        }
        if (obj.showStatus === 2) {
            obj.showStatus = 0;
            modified = true;
        }
    }

    if (modified) {
        console.log('✅ 响应修改完成');
        $done({body: JSON.stringify(obj)});
    } else {
        console.log('ℹ️ 无需修改');
        $done({body: body});
    }
    
} catch (error) {
    console.log('❌ 脚本错误: ' + error);
    $done({body: body});
}
