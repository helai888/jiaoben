/******************************************
 * 猫眼影票响应修改脚本
 * 修改缺货状态，允许进入付款页面
******************************************/

const url = $request.url;
const body = $response.body;

try {
    let obj = JSON.parse(body);
    let modified = false;

    // 项目详情接口修改
    if (url.includes('/my/odea/project/detail')) {
        // 修改缺货登记状态
        if (obj.stockOutRegister === 1) {
            obj.stockOutRegister = 0;
            console.log('✅ 修改 stockOutRegister: 1 → 0');
            modified = true;
        }
        
        // 修改票务状态
        if (obj.ticketStatus === 2) {
            obj.ticketStatus = 3;
            console.log('✅ 修改 ticketStatus: 2 → 3');
            modified = true;
        }
        
        // 修改销售状态
        if (obj.saleStatus === 4) {
            obj.saleStatus = 3;
            console.log('✅ 修改 saleStatus: 4 → 3');
            modified = true;
        }
        
        // 深度搜索修改嵌套字段
        modified = modified || deepModify(obj, 'stockOutRegister', 1, 0);
        modified = modified || deepModify(obj, 'ticketStatus', 2, 3);
        modified = modified || deepModify(obj, 'saleStatus', 4, 3);
    }
    
    // 库存验证接口修改
    else if (url.includes('/my/odea/showTickets/validateStock')) {
        if (obj.success === false) {
            obj.success = true;
            console.log('✅ 修改 success: false → true');
            modified = true;
        }
        
        if (obj.error !== null && obj.error !== undefined) {
            obj.error = null;
            console.log('✅ 修改 error: ' + obj.error + ' → null');
            modified = true;
        }
        
        // 深度搜索修改
        modified = modified || deepModify(obj, 'success', false, true);
    }
    
    // 场次信息接口修改
    else if (url.includes('/maoyansh/myshow/ajax/channelPage/floorPerfs')) {
        // 修改剩余库存
        if (obj.remainingStock === 0) {
            obj.remainingStock = 2297;
            console.log('✅ 修改 remainingStock: 0 → 2297');
            modified = true;
        }
        
        // 修改场次状态
        if (obj.showStatus === 2) {
            obj.showStatus = 0;
            console.log('✅ 修改 showStatus: 2 → 0');
            modified = true;
        }
        
        // 深度搜索修改
        modified = modified || deepModify(obj, 'remainingStock', 0, 2297);
        modified = modified || deepModify(obj, 'showStatus', 2, 0);
        
        // 处理数组情况
        if (Array.isArray(obj)) {
            obj.forEach(item => {
                if (item.remainingStock === 0) {
                    item.remainingStock = 2297;
                    modified = true;
                }
                if (item.showStatus === 2) {
                    item.showStatus = 0;
                    modified = true;
                }
            });
        }
    }

    if (modified) {
        console.log('🎯 猫眼响应修改完成: ' + url);
        $done({ body: JSON.stringify(obj) });
    } else {
        console.log('ℹ️ 无需修改: ' + url);
        $done({ body: body });
    }
    
} catch (error) {
    console.log('❌ 脚本执行错误: ' + error);
    $done({ body: body });
}

// 深度修改函数 - 递归搜索并修改对象属性
function deepModify(obj, key, oldValue, newValue) {
    let modified = false;
    
    if (Array.isArray(obj)) {
        // 如果是数组，遍历每个元素
        obj.forEach(item => {
            if (deepModify(item, key, oldValue, newValue)) {
                modified = true;
            }
        });
    } else if (typeof obj === 'object' && obj !== null) {
        // 如果是对象，检查当前层级
        if (obj[key] === oldValue) {
            obj[key] = newValue;
            modified = true;
        }
        
        // 递归检查所有属性
        for (let prop in obj) {
            if (obj.hasOwnProperty(prop) && typeof obj[prop] === 'object') {
                if (deepModify(obj[prop], key, oldValue, newValue)) {
                    modified = true;
                }
            }
        }
    }
    
    return modified;
}

// 工具函数 - 生成随机库存数
function generateRandomStock() {
    return Math.floor(Math.random() * 2000) + 500;
}

// 工具函数 - 检查是否为有效JSON
function isValidJSON(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}

console.log('🐱 猫眼影票脚本已加载');
